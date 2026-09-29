-- =====================================================================
-- Migration: 20260927164000_fix_tenant_admin_permissions_rls_and_storage.sql
-- Descrição:
-- 1. Unificação das regras de autorização de tenant (admin = role 'admin', owner_id, super_admin ou impersonador).
-- 2. Correção de RLS na tabela tenants para atualização de identidade visual (elimina "new row violates row-level security policy").
-- 3. Criação do bucket 'branding' no Storage e suas políticas de acesso.
-- 4. Trigger seguro on_auth_user_created para provisionamento automático de profiles e aceite de convites pendentes.
-- =====================================================================

-- 1. UNIFICAÇÃO DAS FUNÇÕES DE PERMISSÃO
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_tenant UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN (
    -- a) Membro com papel 'admin' em tenant_members
    EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = _uid AND role = 'admin')
    OR
    -- b) Dono (owner_id) do tenant
    EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant AND owner_id = _uid)
    OR
    -- c) Super administrador da plataforma
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = _uid AND role = 'super_admin')
    OR
    -- d) Em modo de impersonação do tenant
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

-- 2. CORREÇÃO DE POLÍTICA RLS EM TENANTS (CONFIGURAÇÕES & BRANDING)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can update tenant" ON public.tenants;
CREATE POLICY "Admins can update tenant" ON public.tenants
  FOR UPDATE
  USING (public.is_tenant_admin(id))
  WITH CHECK (public.is_tenant_admin(id));

DROP POLICY IF EXISTS "Members can read tenant" ON public.tenants;
CREATE POLICY "Members can read tenant" ON public.tenants
  FOR SELECT
  USING (public.is_tenant_member(id) OR public.is_tenant_admin(id));

-- 3. STORAGE: BUCKET 'branding' E SUAS POLÍTICAS DE ACESSO
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  2097152, -- 2 MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

DROP POLICY IF EXISTS "Public read branding" ON storage.objects;
CREATE POLICY "Public read branding" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'branding');

DROP POLICY IF EXISTS "Writers upload branding" ON storage.objects;
CREATE POLICY "Writers upload branding" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'branding'
    AND (
      public.can_write_tenant((storage.foldername(name))[1]::uuid)
      OR public.is_tenant_admin((storage.foldername(name))[1]::uuid)
    )
  );

DROP POLICY IF EXISTS "Writers update branding" ON storage.objects;
CREATE POLICY "Writers update branding" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'branding'
    AND (
      public.can_write_tenant((storage.foldername(name))[1]::uuid)
      OR public.is_tenant_admin((storage.foldername(name))[1]::uuid)
    )
  );

DROP POLICY IF EXISTS "Writers delete branding" ON storage.objects;
CREATE POLICY "Writers delete branding" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'branding'
    AND (
      public.can_write_tenant((storage.foldername(name))[1]::uuid)
      OR public.is_tenant_admin((storage.foldername(name))[1]::uuid)
    )
  );

-- 4. TRIGGER: PROVISIONAMENTO AUTOMÁTICO DE USUÁRIOS E ACEITE DE CONVITES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _first_name text;
  _pending_invite record;
BEGIN
  _first_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- 1. Insere ou atualiza o perfil em profiles
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    _first_name,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);

  -- 2. Se houver convites pendentes para este e-mail, vincula automaticamente
  FOR _pending_invite IN
    SELECT id, tenant_id, role
    FROM public.tenant_invitations
    WHERE lower(email) = lower(NEW.email) AND status = 'pending'
  LOOP
    INSERT INTO public.tenant_members (tenant_id, user_id, role)
    VALUES (_pending_invite.tenant_id, NEW.id, _pending_invite.role)
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    UPDATE public.tenant_invitations
    SET status = 'accepted', accepted_at = now(), accepted_by = NEW.id
    WHERE id = _pending_invite.id;

    -- Define o primeiro tenant como ativo
    UPDATE public.profiles
    SET current_tenant_id = _pending_invite.tenant_id
    WHERE id = NEW.id AND current_tenant_id IS NULL;
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. BACKFILL SEGURO (IDEMPOTENTE):
-- Garante profiles para usuários de auth.users que possam ter ficado órfãos
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Garante que todos os tenants tenham seu owner_id em tenant_members como 'admin'
INSERT INTO public.tenant_members (tenant_id, user_id, role)
SELECT t.id, t.owner_id, 'admin'::public.member_role
FROM public.tenants t
WHERE t.owner_id IS NOT NULL
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'admin';
