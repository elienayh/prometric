
-- 1) Add portal_slug column
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS portal_slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS students_portal_slug_key ON public.students(portal_slug) WHERE portal_slug IS NOT NULL;

-- 2) Slugify helper (ASCII-folded, lowercase, hyphenated)
CREATE OR REPLACE FUNCTION public._slugify(_input text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(
          translate(
            COALESCE(_input,''),
            'àáâãäåèéêëìíîïòóôõöùúûüñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÇ',
            'aaaaaaeeeeiiiiooooouuuuncAAAAAAEEEEIIIIOOOOOUUUUNC'
          )
        ),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
$$;

-- 3) Generate a unique slug from a name
CREATE OR REPLACE FUNCTION public._portal_unique_slug(_name text)
RETURNS text LANGUAGE plpgsql VOLATILE SET search_path TO 'public' AS $$
DECLARE _base text; _slug text; _try int := 0;
BEGIN
  _base := public._slugify(_name);
  IF _base IS NULL OR length(_base) = 0 THEN _base := 'aluno'; END IF;
  _base := substring(_base from 1 for 48);
  LOOP
    _slug := _base || '-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 4);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.students WHERE portal_slug = _slug);
    _try := _try + 1;
    IF _try > 10 THEN _slug := _base || '-' || substring(replace(gen_random_uuid()::text,'-','') from 1 for 8); EXIT; END IF;
  END LOOP;
  RETURN _slug;
END $$;

-- 4) Update portal_set_enabled to also produce a slug
CREATE OR REPLACE FUNCTION public.portal_set_enabled(_student uuid, _enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _tenant UUID; _tok TEXT; _slug TEXT; _name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id, portal_token, portal_slug, full_name INTO _tenant, _tok, _slug, _name
    FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para ativar portal deste aluno';
  END IF;

  IF _enabled THEN
    IF _tok IS NULL THEN
      _tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
    END IF;
    IF _slug IS NULL THEN
      _slug := public._portal_unique_slug(_name);
    END IF;
    UPDATE public.students
       SET portal_enabled = true, portal_token = _tok, portal_slug = _slug,
           portal_token_created_at = COALESCE(portal_token_created_at, now())
     WHERE id = _student;
  ELSE
    UPDATE public.students SET portal_enabled = false WHERE id = _student;
  END IF;
END $$;

-- 5) Update portal_regenerate_token (slug remains stable)
CREATE OR REPLACE FUNCTION public.portal_regenerate_token(_student uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _tenant UUID; _tok TEXT; _slug TEXT; _name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id, portal_slug, full_name INTO _tenant, _slug, _name FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para regenerar token deste aluno';
  END IF;

  _tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  IF _slug IS NULL THEN _slug := public._portal_unique_slug(_name); END IF;
  UPDATE public.students
     SET portal_token = _tok, portal_slug = _slug,
         portal_token_created_at = now(), portal_enabled = true
   WHERE id = _student;
  RETURN _tok;
END $$;

-- 6) portal_get_data accepts either token or slug (same param)
CREATE OR REPLACE FUNCTION public.portal_get_data(_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _s RECORD; _class_id UUID; _school_id UUID; _group_id UUID; _tenant_id UUID;
  _evals JSONB; _class_avg JSONB; _school_avg JSONB;
  _tenant_brand JSONB; _school_brand JSONB; _group_brand JSONB;
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

  _class_id := _s.class_id; _school_id := _s.school_id; _group_id := _s.group_id; _tenant_id := _s.tenant_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', e.id, 'evaluated_at', e.evaluated_at, 'age_years', e.age_years,
    'weight_kg', e.weight_kg, 'height_cm', e.height_cm, 'imc', e.imc, 'rce', e.rce,
    'sit_and_reach_cm', e.sit_and_reach_cm, 'abdominal_reps', e.abdominal_reps,
    'horizontal_jump_cm', e.horizontal_jump_cm, 'medicine_ball_m', e.medicine_ball_m,
    'square_test_s', e.square_test_s, 'sprint_20m_s', e.sprint_20m_s,
    'run_6min_m', e.run_6min_m, 'classifications', e.classifications
  ) ORDER BY e.evaluated_at), '[]'::jsonb)
    INTO _evals FROM public.evaluations e WHERE e.student_id = _s.id;

  WITH latest_class AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
      FROM public.evaluations e JOIN public.students st ON st.id = e.student_id
     WHERE st.class_id = _class_id AND st.is_active
     ORDER BY e.student_id, e.evaluated_at DESC
  ) SELECT jsonb_agg(classifications) INTO _class_avg FROM latest_class;

  WITH latest_school AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
      FROM public.evaluations e JOIN public.students st ON st.id = e.student_id
      JOIN public.classes c ON c.id = st.class_id
     WHERE c.school_id = _school_id AND st.is_active
     ORDER BY e.student_id, e.evaluated_at DESC
  ) SELECT jsonb_agg(classifications) INTO _school_avg FROM latest_school;

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
    'class_latest', COALESCE(_class_avg, '[]'::jsonb),
    'school_latest', COALESCE(_school_avg, '[]'::jsonb),
    'branding', jsonb_build_object('tenant', _tenant_brand, 'school', _school_brand, 'group', _group_brand)
  );
END $$;

-- 7) portal_log_access accepts either token or slug
CREATE OR REPLACE FUNCTION public.portal_log_access(_token text, _ip text DEFAULT NULL::text, _ua text DEFAULT NULL::text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _sid UUID; _tid UUID;
BEGIN
  SELECT id, tenant_id INTO _sid, _tid FROM public.students
   WHERE (portal_slug = _token OR portal_token = _token)
     AND portal_enabled = true AND is_active = true
   LIMIT 1;
  IF _sid IS NULL THEN RETURN; END IF;
  INSERT INTO public.portal_access_logs (student_id, tenant_id, ip, user_agent)
    VALUES (_sid, _tid, _ip, _ua);
  UPDATE public.students
     SET portal_last_access = now(), portal_views = portal_views + 1
   WHERE id = _sid;
END $$;

-- 8) Backfill slugs for already-enabled portals
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id, full_name FROM public.students
            WHERE portal_enabled = true AND portal_slug IS NULL LOOP
    UPDATE public.students SET portal_slug = public._portal_unique_slug(r.full_name) WHERE id = r.id;
  END LOOP;
END $$;
