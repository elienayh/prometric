DROP POLICY IF EXISTS "auth can read by token via fn" ON public.tenant_invitations;

DROP POLICY IF EXISTS "Admin insert members" ON public.tenant_members;
CREATE POLICY "Admin insert members"
  ON public.tenant_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_tenant_admin(tenant_id));

ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;

ALTER FUNCTION public._classify_higher(numeric, numeric[]) SET search_path = public;
ALTER FUNCTION public._classify_lower(numeric, numeric[]) SET search_path = public;
ALTER FUNCTION public._cuts(text, text, integer) SET search_path = public;
ALTER FUNCTION public._imc_zone(numeric, integer, text) SET search_path = public;
ALTER FUNCTION public._rce_zone(numeric) SET search_path = public;
ALTER FUNCTION public.compute_eval_classifications(text, integer, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric) SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.can_write_tenant(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.end_impersonation() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.evaluations_fill_classifications() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_admin_role(uuid, public.admin_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, public.member_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.impersonate_tenant(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_tenant_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.tenant_can_add_student(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.accept_admin_invitation(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.accept_invitation(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.create_demo_environment() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.create_tenant_with_owner(text, public.tenant_type) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.delete_demo_environment() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_demo_tenant() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.restore_demo_environment() FROM anon, public;