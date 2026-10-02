-- Migration: Consolidar histórico de avaliações em school_stats, class_stats e group_stats
-- Alinha o cálculo do Índice ProMetric nos rankings/dashboards com a ficha do aluno (consolidatedClassifications).

-- 1. Função e agregado SQL para merge cronológico de JSONB
CREATE OR REPLACE FUNCTION public.jsonb_merge_sfunc(state jsonb, val jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT state || COALESCE(
    (
      SELECT jsonb_object_agg(kv.key, kv.value)
      FROM jsonb_each(COALESCE(val, '{}'::jsonb)) AS kv(key, value)
      WHERE kv.value IS NOT NULL AND kv.value <> 'null'::jsonb
    ),
    '{}'::jsonb
  );
$$;

DROP AGGREGATE IF EXISTS public.jsonb_merge_agg(jsonb);
CREATE AGGREGATE public.jsonb_merge_agg(jsonb) (
  SFUNC = public.jsonb_merge_sfunc,
  STYPE = jsonb,
  INITCOND = '{}'
);

GRANT EXECUTE ON FUNCTION public.jsonb_merge_sfunc(jsonb, jsonb) TO authenticated, service_role;

-- 2. school_stats com histórico consolidado por aluno
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
    SELECT
      s.id AS student_id, s.full_name, s.sex, s.birth_date, s.class_id, s.group_id,
      c.name AS class_name,
      max(e.evaluated_at) AS evaluated_at,
      (array_agg(e.age_years ORDER BY e.evaluated_at DESC) FILTER (WHERE e.age_years IS NOT NULL))[1] AS age_years,
      public.jsonb_merge_agg(e.classifications ORDER BY e.evaluated_at ASC) AS classifications,
      (array_agg(e.weight_kg ORDER BY e.evaluated_at DESC) FILTER (WHERE e.weight_kg IS NOT NULL))[1] AS weight_kg,
      (array_agg(e.height_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.height_cm IS NOT NULL))[1] AS height_cm,
      (array_agg(e.imc ORDER BY e.evaluated_at DESC) FILTER (WHERE e.imc IS NOT NULL))[1] AS imc,
      (array_agg(e.sit_and_reach_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.sit_and_reach_cm IS NOT NULL))[1] AS sit_and_reach_cm,
      (array_agg(e.abdominal_reps ORDER BY e.evaluated_at DESC) FILTER (WHERE e.abdominal_reps IS NOT NULL))[1] AS abdominal_reps,
      (array_agg(e.horizontal_jump_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.horizontal_jump_cm IS NOT NULL))[1] AS horizontal_jump_cm,
      (array_agg(e.medicine_ball_m ORDER BY e.evaluated_at DESC) FILTER (WHERE e.medicine_ball_m IS NOT NULL))[1] AS medicine_ball_m,
      (array_agg(e.square_test_s ORDER BY e.evaluated_at DESC) FILTER (WHERE e.square_test_s IS NOT NULL))[1] AS square_test_s,
      (array_agg(e.sprint_20m_s ORDER BY e.evaluated_at DESC) FILTER (WHERE e.sprint_20m_s IS NOT NULL))[1] AS sprint_20m_s,
      (array_agg(e.run_6min_m ORDER BY e.evaluated_at DESC) FILTER (WHERE e.run_6min_m IS NOT NULL))[1] AS run_6min_m
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active
    GROUP BY s.id, s.full_name, s.sex, s.birth_date, s.class_id, s.group_id, c.name
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
    SELECT
      s.class_id,
      public.jsonb_merge_agg(e.classifications ORDER BY e.evaluated_at ASC) AS classifications
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active
    GROUP BY e.student_id, s.class_id
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'class_id', c.id, 'class_name', c.name, 'grade', c.grade,
    'students_count', (SELECT count(*) FROM public.students st WHERE st.class_id = c.id AND st.is_active),
    'classifications', COALESCE((SELECT jsonb_agg(lp.classifications) FROM latest_per_student lp WHERE lp.class_id = c.id), '[]'::jsonb)
  )), '[]'::jsonb) INTO _classes
  FROM public.classes c WHERE c.school_id = _school;

  -- Per-group rollup (groups that have at least one student in this school)
  WITH latest_per_student AS (
    SELECT
      s.group_id,
      public.jsonb_merge_agg(e.classifications ORDER BY e.evaluated_at ASC) AS classifications
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active AND s.group_id IS NOT NULL
    GROUP BY e.student_id, s.group_id
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

REVOKE EXECUTE ON FUNCTION public.school_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.school_stats(uuid) TO authenticated;

-- 3. class_stats com histórico consolidado por aluno
CREATE OR REPLACE FUNCTION public.class_stats(_class uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

  -- Latest evaluation per student in the class (consolidado de todo o histórico)
  WITH latest AS (
    SELECT
      s.id AS student_id, s.full_name, s.sex, s.birth_date,
      max(e.evaluated_at) AS evaluated_at,
      (array_agg(e.age_years ORDER BY e.evaluated_at DESC) FILTER (WHERE e.age_years IS NOT NULL))[1] AS age_years,
      public.jsonb_merge_agg(e.classifications ORDER BY e.evaluated_at ASC) AS classifications,
      (array_agg(e.weight_kg ORDER BY e.evaluated_at DESC) FILTER (WHERE e.weight_kg IS NOT NULL))[1] AS weight_kg,
      (array_agg(e.height_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.height_cm IS NOT NULL))[1] AS height_cm,
      (array_agg(e.imc ORDER BY e.evaluated_at DESC) FILTER (WHERE e.imc IS NOT NULL))[1] AS imc,
      (array_agg(e.sit_and_reach_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.sit_and_reach_cm IS NOT NULL))[1] AS sit_and_reach_cm,
      (array_agg(e.abdominal_reps ORDER BY e.evaluated_at DESC) FILTER (WHERE e.abdominal_reps IS NOT NULL))[1] AS abdominal_reps,
      (array_agg(e.horizontal_jump_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.horizontal_jump_cm IS NOT NULL))[1] AS horizontal_jump_cm,
      (array_agg(e.medicine_ball_m ORDER BY e.evaluated_at DESC) FILTER (WHERE e.medicine_ball_m IS NOT NULL))[1] AS medicine_ball_m,
      (array_agg(e.square_test_s ORDER BY e.evaluated_at DESC) FILTER (WHERE e.square_test_s IS NOT NULL))[1] AS square_test_s,
      (array_agg(e.sprint_20m_s ORDER BY e.evaluated_at DESC) FILTER (WHERE e.sprint_20m_s IS NOT NULL))[1] AS sprint_20m_s,
      (array_agg(e.run_6min_m ORDER BY e.evaluated_at DESC) FILTER (WHERE e.run_6min_m IS NOT NULL))[1] AS run_6min_m
    FROM public.students s
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.class_id = _class AND s.is_active
    GROUP BY s.id, s.full_name, s.sex, s.birth_date
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

  -- School latest classifications (consolidado para comparação da turma com a escola)
  WITH school_latest AS (
    SELECT
      public.jsonb_merge_agg(e.classifications ORDER BY e.evaluated_at ASC) AS classifications
    FROM public.students s
    JOIN public.classes c2 ON c2.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c2.school_id = _school AND s.is_active
    GROUP BY e.student_id
  )
  SELECT COALESCE(jsonb_agg(classifications), '[]'::jsonb) INTO _school_latest FROM school_latest;

  RETURN jsonb_build_object(
    'header', _header,
    'students_latest', _latest,
    'students_first', _first,
    'school_latest', _school_latest
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.class_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.class_stats(uuid) TO authenticated;

-- 4. group_stats com histórico consolidado por aluno
CREATE OR REPLACE FUNCTION public.group_stats(_group uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
    SELECT
      s.id AS student_id, s.full_name, s.sex, s.birth_date, s.class_id,
      c.name AS class_name,
      max(e.evaluated_at) AS evaluated_at,
      (array_agg(e.age_years ORDER BY e.evaluated_at DESC) FILTER (WHERE e.age_years IS NOT NULL))[1] AS age_years,
      public.jsonb_merge_agg(e.classifications ORDER BY e.evaluated_at ASC) AS classifications,
      (array_agg(e.weight_kg ORDER BY e.evaluated_at DESC) FILTER (WHERE e.weight_kg IS NOT NULL))[1] AS weight_kg,
      (array_agg(e.height_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.height_cm IS NOT NULL))[1] AS height_cm,
      (array_agg(e.imc ORDER BY e.evaluated_at DESC) FILTER (WHERE e.imc IS NOT NULL))[1] AS imc,
      (array_agg(e.sit_and_reach_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.sit_and_reach_cm IS NOT NULL))[1] AS sit_and_reach_cm,
      (array_agg(e.abdominal_reps ORDER BY e.evaluated_at DESC) FILTER (WHERE e.abdominal_reps IS NOT NULL))[1] AS abdominal_reps,
      (array_agg(e.horizontal_jump_cm ORDER BY e.evaluated_at DESC) FILTER (WHERE e.horizontal_jump_cm IS NOT NULL))[1] AS horizontal_jump_cm,
      (array_agg(e.medicine_ball_m ORDER BY e.evaluated_at DESC) FILTER (WHERE e.medicine_ball_m IS NOT NULL))[1] AS medicine_ball_m,
      (array_agg(e.square_test_s ORDER BY e.evaluated_at DESC) FILTER (WHERE e.square_test_s IS NOT NULL))[1] AS square_test_s,
      (array_agg(e.sprint_20m_s ORDER BY e.evaluated_at DESC) FILTER (WHERE e.sprint_20m_s IS NOT NULL))[1] AS sprint_20m_s,
      (array_agg(e.run_6min_m ORDER BY e.evaluated_at DESC) FILTER (WHERE e.run_6min_m IS NOT NULL))[1] AS run_6min_m
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.group_id = _group AND s.is_active
    GROUP BY s.id, s.full_name, s.sex, s.birth_date, s.class_id, c.name
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
    SELECT
      public.jsonb_merge_agg(e.classifications ORDER BY e.evaluated_at ASC) AS classifications
    FROM public.students gs
    JOIN public.students s ON s.class_id = gs.class_id AND s.is_active
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE gs.group_id = _group AND gs.class_id IS NOT NULL
    GROUP BY e.student_id
  )
  SELECT COALESCE(jsonb_agg(classifications), '[]'::jsonb) INTO _origin_classes_latest FROM origin;

  -- Latest per student of all students in same schools
  WITH school_latest AS (
    SELECT
      public.jsonb_merge_agg(e.classifications ORDER BY e.evaluated_at ASC) AS classifications
    FROM public.students gs
    JOIN public.classes gc ON gc.id = gs.class_id
    JOIN public.classes c2 ON c2.school_id = gc.school_id
    JOIN public.students s ON s.class_id = c2.id AND s.is_active
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE gs.group_id = _group
    GROUP BY e.student_id
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

REVOKE EXECUTE ON FUNCTION public.group_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.group_stats(uuid) TO authenticated;
