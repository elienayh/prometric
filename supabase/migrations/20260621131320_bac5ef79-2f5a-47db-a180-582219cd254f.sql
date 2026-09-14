CREATE OR REPLACE FUNCTION public.school_stats(_school uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _tenant uuid;
  _header jsonb;
  _latest jsonb;
  _first jsonb;
  _classes jsonb;
  _groups jsonb;
BEGIN
  SELECT s.tenant_id INTO _tenant FROM public.schools s WHERE s.id = _school;
  IF _tenant IS NULL THEN RETURN NULL; END IF;
  IF NOT public.is_tenant_member(_tenant) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  SELECT jsonb_build_object(
    'id', s.id, 'name', s.name, 'city', s.city, 'state', s.state,
    'network', s.network, 'logo_url', s.logo_url,
    'classes_count', (SELECT count(*) FROM public.classes c WHERE c.school_id = s.id),
    'students_count', (
      SELECT count(*) FROM public.students st
        JOIN public.classes c ON c.id = st.class_id
        WHERE c.school_id = s.id AND st.is_active
    ),
    'groups_count', (
      SELECT count(DISTINCT st.group_id) FROM public.students st
        JOIN public.classes c ON c.id = st.class_id
        WHERE c.school_id = s.id AND st.is_active AND st.group_id IS NOT NULL
    ),
    'evaluations_count', (
      SELECT count(*) FROM public.evaluations e
        JOIN public.students st ON st.id = e.student_id
        JOIN public.classes c ON c.id = st.class_id
        WHERE c.school_id = s.id
    ),
    'last_evaluation_at', (
      SELECT max(e.evaluated_at) FROM public.evaluations e
        JOIN public.students st ON st.id = e.student_id
        JOIN public.classes c ON c.id = st.class_id
        WHERE c.school_id = s.id
    )
  ) INTO _header
  FROM public.schools s WHERE s.id = _school;

  WITH latest AS (
    SELECT DISTINCT ON (e.student_id)
      s.id AS student_id, s.full_name, s.sex, s.birth_date, s.class_id, s.group_id,
      c.name AS class_name,
      e.evaluated_at, e.age_years, e.classifications,
      e.weight_kg, e.height_cm, e.imc, e.sit_and_reach_cm, e.abdominal_reps,
      e.horizontal_jump_cm, e.medicine_ball_m, e.square_test_s, e.sprint_20m_s, e.run_6min_m
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(latest)), '[]'::jsonb) INTO _latest FROM latest;

  WITH first_eval AS (
    SELECT DISTINCT ON (e.student_id) e.student_id, e.evaluated_at, e.classifications
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active
    ORDER BY e.student_id, e.evaluated_at ASC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(first_eval)), '[]'::jsonb) INTO _first FROM first_eval;

  -- Per-class rollup using latest classifications
  WITH latest_per_student AS (
    SELECT DISTINCT ON (e.student_id)
      s.class_id, e.classifications
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'class_id', c.id, 'class_name', c.name, 'grade', c.grade,
    'students_count', (SELECT count(*) FROM public.students st WHERE st.class_id = c.id AND st.is_active),
    'classifications', COALESCE((SELECT jsonb_agg(lp.classifications) FROM latest_per_student lp WHERE lp.class_id = c.id), '[]'::jsonb)
  )), '[]'::jsonb) INTO _classes
  FROM public.classes c WHERE c.school_id = _school;

  -- Per-group rollup (groups that have at least one student in this school)
  WITH latest_per_student AS (
    SELECT DISTINCT ON (e.student_id)
      s.group_id, e.classifications
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active AND s.group_id IS NOT NULL
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'group_id', g.id, 'group_name', g.name, 'color', g.color,
    'students_count', (
      SELECT count(*) FROM public.students st
        JOIN public.classes c2 ON c2.id = st.class_id
        WHERE st.group_id = g.id AND st.is_active AND c2.school_id = _school
    ),
    'classifications', COALESCE((SELECT jsonb_agg(lp.classifications) FROM latest_per_student lp WHERE lp.group_id = g.id), '[]'::jsonb)
  )), '[]'::jsonb) INTO _groups
  FROM public.groups g
  WHERE g.tenant_id = _tenant
    AND EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.classes c ON c.id = st.class_id
      WHERE st.group_id = g.id AND st.is_active AND c.school_id = _school
    );

  RETURN jsonb_build_object(
    'header', _header,
    'students_latest', _latest,
    'students_first', _first,
    'classes', _classes,
    'groups', _groups
  );
END $function$;