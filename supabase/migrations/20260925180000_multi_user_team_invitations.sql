-- =====================================================================
-- Migration: 20260925180000_multi_user_team_invitations.sql
-- Descrição: Otimização de índices e suporte robusto para multiusuários,
--            convites de equipe e auto-vínculo de instâncias.
-- =====================================================================

-- 1. Índice case-insensitive para busca de convites pendentes por e-mail
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_lower_email
  ON public.tenant_invitations (lower(email), status);

-- 2. Índice em team_contacts para busca rápida e unicidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_contacts_tenant_email
  ON public.team_contacts (tenant_id, lower(email))
  WHERE email IS NOT NULL;

-- 3. Atualizar função de aceite de convite no banco (RPC pública para fallback)
CREATE OR REPLACE FUNCTION public.accept_invitation(_token TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _inv tenant_invitations%ROWTYPE;
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _inv FROM tenant_invitations WHERE token = _token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado ou inválido';
  END IF;

  IF _inv.status = 'revoked' THEN
    RAISE EXCEPTION 'Este convite foi revogado';
  END IF;

  IF _inv.status = 'accepted' THEN
    -- Se o usuário já é membro do tenant, apenas atualiza seu current_tenant_id
    IF EXISTS (SELECT 1 FROM tenant_members WHERE tenant_id = _inv.tenant_id AND user_id = _uid) THEN
      UPDATE profiles SET current_tenant_id = _inv.tenant_id WHERE id = _uid;
      RETURN _inv.tenant_id;
    ELSE
      RAISE EXCEPTION 'Este convite já foi utilizado';
    END IF;
  END IF;

  IF _inv.expires_at < now() THEN
    UPDATE tenant_invitations SET status = 'revoked' WHERE id = _inv.id;
    RAISE EXCEPTION 'Este convite expirou';
  END IF;

  -- Inserir ou atualizar na tabela de membros do tenant
  INSERT INTO tenant_members (tenant_id, user_id, role)
  VALUES (_inv.tenant_id, _uid, _inv.role)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  -- Marcar convite como aceito
  UPDATE tenant_invitations
     SET status = 'accepted', accepted_at = now(), accepted_by = _uid
   WHERE id = _inv.id;

  -- Definir este tenant como ativo no perfil do usuário
  UPDATE profiles
     SET current_tenant_id = _inv.tenant_id
   WHERE id = _uid;

  RETURN _inv.tenant_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT) TO authenticated;
