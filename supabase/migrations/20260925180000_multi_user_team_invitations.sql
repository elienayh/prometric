-- =====================================================================
-- Migration: 20260925180000_multi_user_team_invitations.sql
-- Descrição: Otimização de índices, suporte robusto para multiusuários,
--            convites de equipe e garantia absoluta de que toda conta/tenant
--            possui ao menos um administrador (auto-vínculo do criador/owner).
-- =====================================================================

-- 1. Índice case-insensitive para busca de convites pendentes por e-mail
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_lower_email
  ON public.tenant_invitations (lower(email), status);

-- 2. Índice em team_contacts para busca rápida e unicidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_contacts_tenant_email
  ON public.team_contacts (tenant_id, lower(email))
  WHERE email IS NOT NULL;

-- 3. BACKFILL DE SEGURANÇA: Todo tenant existente DEVE ter seu owner_id como 'admin' em tenant_members
INSERT INTO public.tenant_members (tenant_id, user_id, role)
SELECT t.id, t.owner_id, 'admin'::public.member_role
FROM public.tenants t
WHERE t.owner_id IS NOT NULL
ON CONFLICT (tenant_id, user_id)
DO NOTHING;

-- Caso algum tenant ainda não tenha nenhum membro admin cadastrado, vincula o primeiro profile associado
INSERT INTO public.tenant_members (tenant_id, user_id, role)
SELECT DISTINCT ON (p.current_tenant_id)
  p.current_tenant_id, p.id, 'admin'::public.member_role
FROM public.profiles p
WHERE p.current_tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = p.current_tenant_id AND tm.role = 'admin'
  )
ORDER BY p.current_tenant_id, p.created_at ASC
ON CONFLICT (tenant_id, user_id)
DO UPDATE SET role = 'admin';

-- 4. TRIGGER AUTOMÁTICO: Ao criar qualquer novo tenant, seu owner_id é automaticamente matriculado como 'admin'
CREATE OR REPLACE FUNCTION public.trg_ensure_tenant_owner_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.tenant_members (tenant_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'admin')
    ON CONFLICT (tenant_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tenant_owner_admin ON public.tenants;
CREATE TRIGGER trg_tenant_owner_admin
  AFTER INSERT OR UPDATE OF owner_id ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.trg_ensure_tenant_owner_admin();

-- 5. Atualizar funções de verificação de permissão para reconhecer owner, super_admin e impersonação
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_tenant UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN (
    -- É admin em tenant_members
    EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = _uid AND role = 'admin')
    OR
    -- É o proprietário (owner) do tenant
    EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant AND owner_id = _uid)
    OR
    -- É super admin da plataforma
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = _uid AND role = 'super_admin')
    OR
    -- Está em modo impersonação deste tenant
    EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND impersonating_tenant_id = _tenant)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_write_tenant(_tenant UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN (
    EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = _uid AND role IN ('admin', 'evaluator'))
    OR
    EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant AND owner_id = _uid)
    OR
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = _uid AND role = 'super_admin')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND impersonating_tenant_id = _tenant)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN (
    EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = _uid)
    OR
    EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant AND owner_id = _uid)
    OR
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = _uid AND role = 'super_admin')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND impersonating_tenant_id = _tenant)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_tenant_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(UUID) TO authenticated;

-- 6. Atualizar função de aceite de convite no banco (RPC pública para fallback)
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
