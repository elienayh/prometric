
-- Super admin full access for impersonation on tenant-scoped tables
CREATE POLICY "Super admin manage students" ON public.students AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage evaluations" ON public.evaluations AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage schools" ON public.schools AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage classes" ON public.classes AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage groups" ON public.groups AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage team_contacts" ON public.team_contacts AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage tenant_members" ON public.tenant_members AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage tenant_invitations" ON public.tenant_invitations AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- Allow super_admin to switch profiles.current_tenant_id even if it's not a tenant they belong to (already covered by self update; this just makes intent explicit)
-- Helper to impersonate: sets current_tenant_id on caller's profile, logs audit
CREATE OR REPLACE FUNCTION public.impersonate_tenant(_tenant uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_super_admin(_uid) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant) THEN RAISE EXCEPTION 'Tenant not found'; END IF;
  UPDATE public.profiles SET current_tenant_id = _tenant WHERE id = _uid;
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, tenant_id)
  VALUES (_uid, 'tenant.impersonated', 'tenant', _tenant::text, _tenant);
  RETURN _tenant;
END;
$$;
