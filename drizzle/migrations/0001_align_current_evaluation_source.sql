-- Fonte oficial do estado atual: classificações da avaliação clínica mais recente.
-- Atualizações somente de medidas são ignoradas; avaliações diferentes não são mescladas.
CREATE OR REPLACE FUNCTION public.consolidated_classifications(_student uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE((
    SELECT e.classifications
    FROM public.evaluations e
    WHERE e.student_id = _student
      AND EXISTS (
        SELECT 1
        FROM jsonb_each(COALESCE(e.classifications, '{}'::jsonb)) AS kv(key, value)
        WHERE kv.value IS NOT NULL AND kv.value <> 'null'::jsonb
      )
    ORDER BY e.evaluated_at DESC, e.created_at DESC
    LIMIT 1
  ), '{}'::jsonb);
$$;

REVOKE ALL ON FUNCTION public.consolidated_classifications(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consolidated_classifications(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.consolidated_classifications(uuid) FROM authenticated;

-- O portal público mantém as avaliações originais e usa a mesma avaliação
-- clínica atual para comparativos de turma e escola.
CREATE OR REPLACE FUNCTION public.portal_get_data(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _s RECORD;
  _class_id uuid;
  _school_id uuid;
  _group_id uuid;
  _tenant_id uuid;
  _evals jsonb;
  _class_avg jsonb;
  _school_avg jsonb;
  _tenant_brand jsonb;
  _school_brand jsonb;
  _group_brand jsonb;
BEGIN
  IF _token IS NULL OR length(_token) < 4 THEN RETURN NULL; END IF;

  SELECT st.id, st.full_name, st.sex, st.birth_date, st.photo_url, st.class_id, st.group_id, st.tenant_id,
         c.name AS class_name, c.school_id,
         sc.name AS school_name, sc.logo_url AS school_logo
    INTO _s
    FROM public.students st
    LEFT JOIN public.classes c ON c.id = st.class_id
    LEFT JOIN public.schools sc ON sc.id = c.school_id
   WHERE (st.portal_slug = _token OR st.portal_token = _token)
     AND st.portal_enabled = true AND st.is_active = true
   LIMIT 1;
  IF _s.id IS NULL THEN RETURN NULL; END IF;

  _class_id := _s.class_id;
  _school_id := _s.school_id;
  _group_id := _s.group_id;
  _tenant_id := _s.tenant_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', e.id, 'evaluated_at', e.evaluated_at, 'age_years', e.age_years,
    'weight_kg', e.weight_kg, 'height_cm', e.height_cm, 'imc', e.imc, 'rce', e.rce,
    'sit_and_reach_cm', e.sit_and_reach_cm, 'abdominal_reps', e.abdominal_reps,
    'horizontal_jump_cm', e.horizontal_jump_cm, 'medicine_ball_m', e.medicine_ball_m,
    'square_test_s', e.square_test_s, 'sprint_20m_s', e.sprint_20m_s,
    'run_6min_m', e.run_6min_m, 'classifications', e.classifications
  ) ORDER BY e.evaluated_at, e.created_at), '[]'::jsonb)
    INTO _evals FROM public.evaluations e WHERE e.student_id = _s.id;

  SELECT COALESCE(jsonb_agg(public.consolidated_classifications(st.id)), '[]'::jsonb)
    INTO _class_avg
    FROM public.students st
   WHERE st.class_id = _class_id
     AND st.is_active
     AND public.consolidated_classifications(st.id) <> '{}'::jsonb;

  SELECT COALESCE(jsonb_agg(public.consolidated_classifications(st.id)), '[]'::jsonb)
    INTO _school_avg
    FROM public.students st
    JOIN public.classes c ON c.id = st.class_id
   WHERE c.school_id = _school_id
     AND st.is_active
     AND public.consolidated_classifications(st.id) <> '{}'::jsonb;

  SELECT to_jsonb(t) INTO _tenant_brand FROM (
    SELECT name, display_name, primary_color, secondary_color, description, website, email, phone, logo_url
      FROM public.tenants WHERE id = _tenant_id) t;
  SELECT to_jsonb(sc) INTO _school_brand FROM (
    SELECT name, display_name, primary_color, secondary_color, description, logo_url
      FROM public.schools WHERE id = _school_id) sc;
  SELECT to_jsonb(g) INTO _group_brand FROM (
    SELECT name, display_name, primary_color, secondary_color, description, logo_url
      FROM public.groups WHERE id = _group_id) g;

  RETURN jsonb_build_object(
    'student', jsonb_build_object(
      'id', _s.id, 'full_name', _s.full_name, 'sex', _s.sex,
      'birth_date', _s.birth_date, 'photo_url', _s.photo_url,
      'class_name', _s.class_name, 'school_name', _s.school_name, 'school_logo', _s.school_logo,
      'group_id', _s.group_id
    ),
    'evaluations', _evals,
    'class_latest', _class_avg,
    'school_latest', _school_avg,
    'branding', jsonb_build_object('tenant', _tenant_brand, 'school', _school_brand, 'group', _group_brand)
  );
END
$function$;

GRANT EXECUTE ON FUNCTION public.portal_get_data(text) TO anon, authenticated, service_role;