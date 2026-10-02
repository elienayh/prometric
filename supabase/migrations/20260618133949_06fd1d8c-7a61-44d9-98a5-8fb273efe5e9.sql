
-- Admin platform read access to tenant data
CREATE POLICY "Platform admins read students" ON public.students FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read evaluations" ON public.evaluations FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read classes" ON public.classes FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read schools" ON public.schools FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read groups" ON public.groups FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read members" ON public.tenant_members FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
