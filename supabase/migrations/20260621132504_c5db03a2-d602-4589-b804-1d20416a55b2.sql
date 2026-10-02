-- Schools branding
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Groups branding
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT;

-- Hex color validation triggers (reuse existing pattern from tenants)
CREATE OR REPLACE FUNCTION public._validate_school_branding()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.primary_color IS NOT NULL AND NEW.primary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'primary_color deve ser hex #RRGGBB';
  END IF;
  IF NEW.secondary_color IS NOT NULL AND NEW.secondary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'secondary_color deve ser hex #RRGGBB';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_validate_school_branding ON public.schools;
CREATE TRIGGER trg_validate_school_branding
  BEFORE INSERT OR UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public._validate_school_branding();

CREATE OR REPLACE FUNCTION public._validate_group_branding()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.primary_color IS NOT NULL AND NEW.primary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'primary_color deve ser hex #RRGGBB';
  END IF;
  IF NEW.secondary_color IS NOT NULL AND NEW.secondary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'secondary_color deve ser hex #RRGGBB';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_validate_group_branding ON public.groups;
CREATE TRIGGER trg_validate_group_branding
  BEFORE INSERT OR UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public._validate_group_branding();

-- Update portal_get_data to include resolved branding chain
CREATE OR REPLACE FUNCTION public.portal_get_data(_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _s RECORD; _class_id UUID; _school_id UUID; _group_id UUID; _tenant_id UUID;
  _evals JSONB; _class_avg JSONB; _school_avg JSONB;
  _tenant_brand JSONB; _school_brand JSONB; _group_brand JSONB;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN RETURN NULL; END IF;
  SELECT st.id, st.full_name, st.sex, st.birth_date, st.photo_url, st.class_id, st.group_id, st.tenant_id,
         c.name AS class_name, c.school_id,
         sc.name AS school_name, sc.logo_url AS school_logo
    INTO _s
    FROM public.students st
    LEFT JOIN public.classes c ON c.id = st.class_id
    LEFT JOIN public.schools sc ON sc.id = c.school_id
   WHERE st.portal_token = _token AND st.portal_enabled = true AND st.is_active = true;
  IF _s.id IS NULL THEN RETURN NULL; END IF;

  _class_id := _s.class_id; _school_id := _s.school_id; _group_id := _s.group_id; _tenant_id := _s.tenant_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', e.id, 'evaluated_at', e.evaluated_at, 'age_years', e.age_years,
    'weight_kg', e.weight_kg, 'height_cm', e.height_cm, 'imc', e.imc, 'rce', e.rce,
    'sit_and_reach_cm', e.sit_and_reach_cm, 'abdominal_reps', e.abdominal_reps,
    'horizontal_jump_cm', e.horizontal_jump_cm, 'medicine_ball_m', e.medicine_ball_m,
    'square_test_s', e.square_test_s, 'sprint_20m_s', e.sprint_20m_s,
    'run_6min_m', e.run_6min_m, 'classifications', e.classifications
  ) ORDER BY e.evaluated_at), '[]'::jsonb)
    INTO _evals
    FROM public.evaluations e WHERE e.student_id = _s.id;

  WITH latest_class AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
      FROM public.evaluations e
      JOIN public.students st ON st.id = e.student_id
     WHERE st.class_id = _class_id AND st.is_active
     ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT jsonb_agg(classifications) INTO _class_avg FROM latest_class;

  WITH latest_school AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
      FROM public.evaluations e
      JOIN public.students st ON st.id = e.student_id
      JOIN public.classes c ON c.id = st.class_id
     WHERE c.school_id = _school_id AND st.is_active
     ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT jsonb_agg(classifications) INTO _school_avg FROM latest_school;

  SELECT to_jsonb(t) - 'id' - 'created_at' - 'updated_at'
    INTO _tenant_brand
    FROM (SELECT name, display_name, primary_color, secondary_color, description, website, email, phone, logo_url
          FROM public.tenants WHERE id = _tenant_id) t;

  SELECT to_jsonb(sc)
    INTO _school_brand
    FROM (SELECT name, display_name, primary_color, secondary_color, description, logo_url
          FROM public.schools WHERE id = _school_id) sc;

  SELECT to_jsonb(g)
    INTO _group_brand
    FROM (SELECT name, display_name, primary_color, secondary_color, description, logo_url
          FROM public.groups WHERE id = _group_id) g;

  RETURN jsonb_build_object(
    'student', jsonb_build_object(
      'id', _s.id, 'full_name', _s.full_name, 'sex', _s.sex,
      'birth_date', _s.birth_date, 'photo_url', _s.photo_url,
      'class_name', _s.class_name, 'school_name', _s.school_name, 'school_logo', _s.school_logo,
      'group_id', _s.group_id
    ),
    'evaluations', _evals,
    'class_latest', COALESCE(_class_avg, '[]'::jsonb),
    'school_latest', COALESCE(_school_avg, '[]'::jsonb),
    'branding', jsonb_build_object(
      'tenant', _tenant_brand,
      'school', _school_brand,
      'group',  _group_brand
    )
  );
END $function$;