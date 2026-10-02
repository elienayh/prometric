
CREATE OR REPLACE FUNCTION public.portal_set_enabled(_student uuid, _enabled boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tenant UUID; _tok TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id, portal_token INTO _tenant, _tok FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para ativar portal deste aluno';
  END IF;

  IF _enabled AND _tok IS NULL THEN
    _tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
    UPDATE public.students
       SET portal_enabled = true, portal_token = _tok, portal_token_created_at = now()
     WHERE id = _student;
  ELSE
    UPDATE public.students SET portal_enabled = _enabled WHERE id = _student;
  END IF;
END $function$;

CREATE OR REPLACE FUNCTION public.portal_regenerate_token(_student uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tenant UUID; _tok TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id INTO _tenant FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para regenerar token deste aluno';
  END IF;

  _tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  UPDATE public.students
     SET portal_token = _tok, portal_token_created_at = now(), portal_enabled = true
   WHERE id = _student;
  RETURN _tok;
END $function$;
