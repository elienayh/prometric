-- =============================================================
-- RPCs analíticos para dashboards de Turma e Grupo
-- =============================================================

CREATE OR REPLACE FUNCTION public.class_stats(_class uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant uuid;
  _school uuid;
  _header jsonb;
  _latest jsonb;
  _first jsonb;
  _school_latest jsonb;
BEGIN
  SELECT c.tenant_id, c.school_id INTO _tenant, _school
    FROM public.classes c WHERE c.id = _class;
  IF _tenant IS NULL THEN RETURN NULL; END IF;
  IF NOT public.is_tenant_member(_tenant) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  SELECT jsonb_build_object(
    'id', c.id, 'name', c.name, 'grade', c.grade, 'school_year', c.school_year,
    'shift', c.shift, 'school_id', c.school_id, 'school_name', sc.name,
    'students_count', (SELECT count(*) FROM public.students s WHERE s.class_id = c.id AND s.is_active),
    'evaluations_count', (
      SELECT count(*) FROM public.evaluations e
        JOIN public.students s ON s.id = e.student_id
        WHERE s.class_id = c.id
    ),
    'last_evaluation_at', (
      SELECT max(e.evaluated_at) FROM public.evaluations e
        JOIN public.students s ON s.id = e.student_id
        WHERE s.class_id = c.id
    )
  ) INTO _header
  FROM public.classes c LEFT JOIN public.schools sc ON sc.id = c.school_id
  WHERE c.id = _class;

  -- Latest evaluation per student in the class
  WITH latest AS (
    SELECT DISTINCT ON (e.student_id)
      s.id AS student_id, s.full_name, s.sex, s.birth_date,
      e.evaluated_at, e.age_years, e.classifications,
      e.weight_kg, e.height_cm, e.imc, e.sit_and_reach_cm, e.abdominal_reps,
      e.horizontal_jump_cm, e.medicine_ball_m, e.square_test_s, e.sprint_20m_s, e.run_6min_m
    FROM public.students s
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.class_id = _class AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(latest)), '[]'::jsonb) INTO _latest FROM latest;

  -- First evaluation per student (for evolution delta)
  WITH first_eval AS (
    SELECT DISTINCT ON (e.student_id)
      e.student_id, e.evaluated_at, e.classifications
    FROM public.students s
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.class_id = _class AND s.is_active
    ORDER BY e.student_id, e.evaluated_at ASC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(first_eval)), '[]'::jsonb) INTO _first FROM first_eval;

  -- School latest classifications (for school comparison)
  WITH school_latest AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
    FROM public.students s
    JOIN public.classes c2 ON c2.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c2.school_id = _school AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(classifications), '[]'::jsonb) INTO _school_latest FROM school_latest;

  RETURN jsonb_build_object(
    'header', _header,
    'students_latest', _latest,
    'students_first', _first,
    'school_latest', _school_latest
  );
END $$;

GRANT EXECUTE ON FUNCTION public.class_stats(uuid) TO authenticated;


CREATE OR REPLACE FUNCTION public.group_stats(_group uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant uuid;
  _header jsonb;
  _latest jsonb;
  _first jsonb;
  _origin_classes_latest jsonb;
  _school_latest jsonb;
BEGIN
  SELECT g.tenant_id INTO _tenant FROM public.groups g WHERE g.id = _group;
  IF _tenant IS NULL THEN RETURN NULL; END IF;
  IF NOT public.is_tenant_member(_tenant) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  SELECT jsonb_build_object(
    'id', g.id, 'name', g.name, 'description', g.description, 'color', g.color,
    'students_count', (SELECT count(*) FROM public.students s WHERE s.group_id = g.id AND s.is_active),
    'evaluations_count', (
      SELECT count(*) FROM public.evaluations e
        JOIN public.students s ON s.id = e.student_id
        WHERE s.group_id = g.id
    ),
    'last_evaluation_at', (
      SELECT max(e.evaluated_at) FROM public.evaluations e
        JOIN public.students s ON s.id = e.student_id
        WHERE s.group_id = g.id
    )
  ) INTO _header
  FROM public.groups g WHERE g.id = _group;

  WITH latest AS (
    SELECT DISTINCT ON (e.student_id)
      s.id AS student_id, s.full_name, s.sex, s.birth_date, s.class_id,
      c.name AS class_name,
      e.evaluated_at, e.age_years, e.classifications,
      e.weight_kg, e.height_cm, e.imc, e.sit_and_reach_cm, e.abdominal_reps,
      e.horizontal_jump_cm, e.medicine_ball_m, e.square_test_s, e.sprint_20m_s, e.run_6min_m
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.group_id = _group AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(latest)), '[]'::jsonb) INTO _latest FROM latest;

  WITH first_eval AS (
    SELECT DISTINCT ON (e.student_id) e.student_id, e.evaluated_at, e.classifications
    FROM public.students s
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.group_id = _group AND s.is_active
    ORDER BY e.student_id, e.evaluated_at ASC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(first_eval)), '[]'::jsonb) INTO _first FROM first_eval;

  -- Latest per student of all students in origin classes (excluding group members)
  WITH origin AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
    FROM public.students gs
    JOIN public.students s ON s.class_id = gs.class_id AND s.is_active
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE gs.group_id = _group AND gs.class_id IS NOT NULL
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(classifications), '[]'::jsonb) INTO _origin_classes_latest FROM origin;

  -- Latest per student of all students in same schools
  WITH school_latest AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
    FROM public.students gs
    JOIN public.classes gc ON gc.id = gs.class_id
    JOIN public.classes c2 ON c2.school_id = gc.school_id
    JOIN public.students s ON s.class_id = c2.id AND s.is_active
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE gs.group_id = _group
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(classifications), '[]'::jsonb) INTO _school_latest FROM school_latest;

  RETURN jsonb_build_object(
    'header', _header,
    'students_latest', _latest,
    'students_first', _first,
    'origin_classes_latest', _origin_classes_latest,
    'school_latest', _school_latest
  );
END $$;

GRANT EXECUTE ON FUNCTION public.group_stats(uuid) TO authenticated;