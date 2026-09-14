CREATE OR REPLACE FUNCTION public.is_platform_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_roles WHERE user_id = _user AND role = 'super_admin');
$$;

DROP POLICY IF EXISTS "tenant members insert portal logs" ON public.portal_access_logs;
CREATE POLICY "tenant members insert portal logs"
ON public.portal_access_logs FOR INSERT TO authenticated
WITH CHECK (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Invitee reads own admin invitation" ON public.admin_invitations;
CREATE POLICY "Invitee reads own admin invitation"
ON public.admin_invitations FOR SELECT TO authenticated
USING (status = 'pending' AND expires_at > now()
       AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

DROP POLICY IF EXISTS "Invitee reads own tenant invitation" ON public.tenant_invitations;
CREATE POLICY "Invitee reads own tenant invitation"
ON public.tenant_invitations FOR SELECT TO authenticated
USING (status = 'pending' AND expires_at > now()
       AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_admin_role(uuid, admin_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, member_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_tenant_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_write_tenant(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_student_plan_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.evaluations_fill_classifications() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_tenant_last_login(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tenant_can_add_student(uuid) FROM PUBLIC, anon, authenticated;