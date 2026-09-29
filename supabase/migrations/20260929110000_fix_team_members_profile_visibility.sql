-- =====================================================================
-- Migration: 20260929110000_fix_team_members_profile_visibility.sql
-- Descrição:
-- 1. Permite visibilidade dos perfis (nome, email, avatar) entre membros da mesma escola/tenant no RLS de public.profiles.
-- 2. Cria função RPC SECURITY DEFINER public.get_tenant_team(UUID) para listar membros da equipe com dados completos de perfis e auth.
-- 3. Cria função RPC SECURITY DEFINER public.create_team_invitation para emissão resiliente de convites e vinculação de equipe.
-- =====================================================================

-- 1. RLS: Permite que membros autenticados de um mesmo tenant visualizem os perfis dos colegas de equipe
DROP POLICY IF EXISTS "Team members can view teammate profiles" ON public.profiles;

CREATE POLICY "Team members can view teammate profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = profiles.id
    OR (profiles.current_tenant_id IS NOT NULL AND public.is_tenant_member(profiles.current_tenant_id))
    OR (profiles.current_tenant_id IS NOT NULL AND public.is_tenant_admin(profiles.current_tenant_id))
    OR EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = profiles.id
        AND public.is_tenant_member(tm.tenant_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role = 'super_admin'
    )
  );

-- 2. RPC: Listagem segura de membros da equipe com dados unificados
CREATE OR REPLACE FUNCTION public.get_tenant_team(_tenant UUID)
RETURNS TABLE (
  user_id UUID,
  role public.member_role,
  created_at TIMESTAMPTZ,
  phone TEXT,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  tenant_name TEXT,
  tenant_display_name TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _t_name TEXT;
  _t_display_name TEXT;
BEGIN
  IF NOT (public.is_tenant_member(_tenant) OR public.is_tenant_admin(_tenant)) THEN
    RAISE EXCEPTION 'Acesso negado à equipe deste espaço';
  END IF;

  SELECT t.name, t.display_name INTO _t_name, _t_display_name
  FROM public.tenants t WHERE t.id = _tenant;

  RETURN QUERY
  SELECT 
    tm.user_id,
    tm.role,
    tm.created_at,
    tm.phone,
    COALESCE(
      NULLIF(trim(p.full_name), ''),
      NULLIF(trim(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(trim(u.raw_user_meta_data->>'name'), ''),
      split_part(COALESCE(p.email, u.email), '@', 1),
      _t_display_name,
      _t_name,
      'Membro da equipe'
    ) AS full_name,
    COALESCE(p.email, u.email) AS email,
    COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatar_url') AS avatar_url,
    _t_name,
    _t_display_name
  FROM public.tenant_members tm
  LEFT JOIN public.profiles p ON p.id = tm.user_id
  LEFT JOIN auth.users u ON u.id = tm.user_id
  WHERE tm.tenant_id = _tenant
  ORDER BY tm.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tenant_team(UUID) TO authenticated;

-- 3. RPC: Criação resiliente de convites e vinculação automática de usuários
CREATE OR REPLACE FUNCTION public.create_team_invitation(
  _tenant UUID,
  _email TEXT,
  _role public.member_role,
  _full_name TEXT DEFAULT NULL,
  _phone TEXT DEFAULT NULL
)
RETURNS TABLE (
  invitation_id UUID,
  token TEXT,
  expires_at TIMESTAMPTZ,
  is_existing_user BOOLEAN,
  existing_user_id UUID,
  tenant_name TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _clean_email TEXT := lower(trim(_email));
  _token TEXT;
  _expires TIMESTAMPTZ := now() + interval '14 days';
  _existing_user_id UUID;
  _inv_id UUID;
  _t_name TEXT;
  _t_display TEXT;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF NOT public.is_tenant_admin(_tenant) THEN
    RAISE EXCEPTION 'Você não tem permissão de administrador para convidar membros nesta escola/organização.';
  END IF;

  SELECT t.name, t.display_name INTO _t_name, _t_display
  FROM public.tenants t WHERE t.id = _tenant;

  IF _t_name IS NULL THEN
    RAISE EXCEPTION 'Escola ou organização não encontrada.';
  END IF;

  INSERT INTO public.team_contacts (tenant_id, full_name, email, phone, role)
  VALUES (_tenant, COALESCE(_full_name, split_part(_clean_email, '@', 1)), _clean_email, _phone, _role)
  ON CONFLICT DO NOTHING;

  SELECT p.id INTO _existing_user_id FROM public.profiles p WHERE lower(p.email) = _clean_email LIMIT 1;
  IF _existing_user_id IS NULL THEN
    SELECT u.id INTO _existing_user_id FROM auth.users u WHERE lower(u.email) = _clean_email LIMIT 1;
  END IF;

  _token := encode(gen_random_bytes(24), 'hex');

  IF _existing_user_id IS NOT NULL THEN
    INSERT INTO public.tenant_members (tenant_id, user_id, role, phone)
    VALUES (_tenant, _existing_user_id, _role, _phone)
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    UPDATE public.profiles p
    SET current_tenant_id = _tenant
    WHERE p.id = _existing_user_id AND p.current_tenant_id IS NULL;

    INSERT INTO public.tenant_invitations (tenant_id, email, role, token, invited_by, status, accepted_at, accepted_by)
    VALUES (_tenant, _clean_email, _role, _token, _uid, 'accepted', now(), _existing_user_id)
    RETURNING id INTO _inv_id;

    RETURN QUERY SELECT _inv_id, _token, _expires, true, _existing_user_id, COALESCE(_t_display, _t_name);
  ELSE
    INSERT INTO public.tenant_invitations (tenant_id, email, role, token, invited_by, status, expires_at)
    VALUES (_tenant, _clean_email, _role, _token, _uid, 'pending', _expires)
    RETURNING id INTO _inv_id;

    RETURN QUERY SELECT _inv_id, _token, _expires, false, NULL::UUID, COALESCE(_t_display, _t_name);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_team_invitation(UUID, TEXT, public.member_role, TEXT, TEXT) TO authenticated;
