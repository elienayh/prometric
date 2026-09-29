-- =====================================================================
-- Migration: 20260925180000_multi_user_team_invitations.sql
-- Descrição: Limpeza de referências órfãs, otimização de permissões,
--            multiusuários, convites de equipe e garantia de admin para todos os tenants.
-- =====================================================================

-- 1. LIMPEZA PREVENTIVA: Limpar referências em profiles para tenants deletados
UPDATE public.profiles
   SET current_tenant_id = NULL
 WHERE current_tenant_id IS NOT NULL
   AND current_tenant_id NOT IN (SELECT id FROM public.tenants);

UPDATE public.profiles
   SET impersonating_tenant_id = NULL
 WHERE impersonating_tenant_id IS NOT NULL
   AND impersonating_tenant_id NOT IN (SELECT id FROM public.tenants);

-- 2. Assegurar constraint UNIQUE em tenant_members (tenant_id, user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.tenant_members'::regclass 
      AND contype = 'u' 
      AND conkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.tenant_members'::regclass AND attname = 'tenant_id'),
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.tenant_members'::regclass AND attname = 'user_id')
      ]
  ) THEN
    ALTER TABLE public.tenant_members ADD CONSTRAINT tenant_members_tenant_user_uniq UNIQUE (tenant_id, user_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Índices otimizados
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_lower_email
  ON public.tenant_invitations (lower(email), status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_contacts_tenant_email
  ON public.team_contacts (tenant_id, lower(email))
  WHERE email IS NOT NULL;

-- 4. BACKFILL SEGURO: Vincular o criador (owner_id) de cada tenant como 'admin' em tenant_members
-- Valida que o tenant existe em tenants E que o owner_id existe em auth.users
INSERT INTO public.tenant_members (tenant_id, user_id, role)
SELECT t.id, t.owner_id, 'admin'::public.member_role
FROM public.tenants t
JOIN auth.users u ON u.id = t.owner_id
ON CONFLICT (tenant_id, user_id)
DO UPDATE SET role = 'admin' WHERE tenant_members.role IS NULL;

-- 5. BACKFILL SEGURO POR PROFILE: Para tenants que não tenham nenhum admin cadastrado
INSERT INTO public.tenant_members (tenant_id, user_id, role)
SELECT DISTINCT ON (p.current_tenant_id)
  p.current_tenant_id, p.id, 'admin'::public.member_role
FROM public.profiles p
JOIN public.tenants t ON t.id = p.current_tenant_id
JOIN auth.users u ON u.id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenant_members tm
  WHERE tm.tenant_id = p.current_tenant_id AND tm.role = 'admin'
)
ORDER BY p.current_tenant_id, p.created_at ASC
ON CONFLICT (tenant_id, user_id)
DO UPDATE SET role = 'admin' WHERE tenant_members.role IS NULL;

-- 6. CASO HUGO: Garante que hugocoutomendes@gmail.com seja admin do seu tenant
DO $$
DECLARE
  _hugo_id UUID;
  _hugo_tenant_id UUID;
BEGIN
  SELECT id INTO _hugo_id 
  FROM auth.users 
  WHERE lower(email) = 'hugocoutomendes@gmail.com' 
  LIMIT 1;

  IF _hugo_id IS NULL THEN
    SELECT id INTO _hugo_id 
    FROM public.profiles 
    WHERE lower(email) = 'hugocoutomendes@gmail.com' 
    LIMIT 1;
  END IF;

  IF _hugo_id IS NOT NULL THEN
    -- Localiza tenant ativo do Hugo
    SELECT id INTO _hugo_tenant_id
    FROM public.tenants
    WHERE (owner_id = _hugo_id OR lower(name) LIKE '%hugo%' OR lower(coalesce(display_name, '')) LIKE '%hugo%')
    ORDER BY created_at ASC
    LIMIT 1;

    IF _hugo_tenant_id IS NULL THEN
      SELECT current_tenant_id INTO _hugo_tenant_id
      FROM public.profiles
      WHERE id = _hugo_id AND current_tenant_id IN (SELECT id FROM public.tenants);
    END IF;

    IF _hugo_tenant_id IS NOT NULL THEN
      INSERT INTO public.tenant_members (tenant_id, user_id, role)
      VALUES (_hugo_tenant_id, _hugo_id, 'admin')
      ON CONFLICT (tenant_id, user_id)
      DO UPDATE SET role = 'admin';

      UPDATE public.tenants SET owner_id = _hugo_id WHERE id = _hugo_tenant_id AND (owner_id IS NULL OR owner_id != _hugo_id);
      UPDATE public.profiles SET current_tenant_id = _hugo_tenant_id WHERE id = _hugo_id;
    END IF;
  END IF;
END $$;

-- 7. TRIGGER AUTOMÁTICO: Qualquer novo tenant criado já matricula o criador como 'admin'
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

-- 8. Atualizar funções de verificação para reconhecer owner, super_admin e impersonação
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_tenant UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN (
    EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = _uid AND role = 'admin')
    OR
    EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant AND owner_id = _uid)
    OR
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = _uid)
    OR
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
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = _uid)
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
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = _uid)
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND impersonating_tenant_id = _tenant)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_tenant_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(UUID) TO authenticated;

-- 9. Atualizar função de aceite de convite no banco (RPC pública para fallback)
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

  INSERT INTO tenant_members (tenant_id, user_id, role)
  VALUES (_inv.tenant_id, _uid, _inv.role)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  UPDATE tenant_invitations
     SET status = 'accepted', accepted_at = now(), accepted_by = _uid
   WHERE id = _inv.id;

  UPDATE profiles
     SET current_tenant_id = _inv.tenant_id
   WHERE id = _uid;

  RETURN _inv.tenant_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT) TO authenticated;
