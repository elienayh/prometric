
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS impersonating_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS impersonation_original_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS impersonation_started_at timestamptz;

CREATE OR REPLACE FUNCTION public.impersonate_tenant(_tenant uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE _uid uuid := auth.uid(); _orig uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_super_admin(_uid) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant) THEN RAISE EXCEPTION 'Tenant not found'; END IF;

  SELECT COALESCE(impersonation_original_tenant_id, current_tenant_id)
    INTO _orig FROM public.profiles WHERE id = _uid;

  UPDATE public.profiles
    SET current_tenant_id = _tenant,
        impersonating_tenant_id = _tenant,
        impersonation_original_tenant_id = _orig,
        impersonation_started_at = now()
    WHERE id = _uid;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, tenant_id)
  VALUES (_uid, 'tenant.impersonated', 'tenant', _tenant::text, _tenant);
  RETURN _tenant;
END;
$function$;

CREATE OR REPLACE FUNCTION public.end_impersonation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE _uid uuid := auth.uid(); _orig uuid; _imp uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT impersonation_original_tenant_id, impersonating_tenant_id
    INTO _orig, _imp FROM public.profiles WHERE id = _uid;

  UPDATE public.profiles
    SET current_tenant_id = _orig,
        impersonating_tenant_id = NULL,
        impersonation_original_tenant_id = NULL,
        impersonation_started_at = NULL
    WHERE id = _uid;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, tenant_id)
  VALUES (_uid, 'tenant.impersonation_ended', 'tenant', COALESCE(_imp::text, ''), _imp);

  RETURN _orig;
END;
$function$;
