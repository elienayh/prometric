-- ============================================================================
-- Migração Fase 4 Item 5: Tabela de Persistência de Pareceres (student_reports)
-- ============================================================================
-- Persiste o laudo/parecer determinístico no banco de dados com versionamento,
-- timestamps e JSON estruturado das 4 dimensões (diagnóstico, parecer técnico,
-- parecer família, metas 30/60/90d).
-- RLS igual às tabelas do aluno, com leitura pública autorizada via portal token.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE SET NULL,
  engine_version TEXT NOT NULL DEFAULT 'v1.0.0',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  diagnosis TEXT,
  technical TEXT,
  family TEXT,
  goals JSONB DEFAULT '{}'::jsonb,
  full_report JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_student_reports_student ON public.student_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_student_reports_evaluation ON public.student_reports(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_student_reports_tenant ON public.student_reports(tenant_id);

-- Permissões e RLS
ALTER TABLE public.student_reports ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_reports TO authenticated;
GRANT SELECT, INSERT ON public.student_reports TO anon;
GRANT ALL ON public.student_reports TO service_role;

-- Políticas de RLS
DROP POLICY IF EXISTS "Members read student reports" ON public.student_reports;
CREATE POLICY "Members read student reports" ON public.student_reports
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Writers manage student reports" ON public.student_reports;
CREATE POLICY "Writers manage student reports" ON public.student_reports
  FOR ALL TO authenticated
  USING (public.can_write_tenant(tenant_id))
  WITH CHECK (public.can_write_tenant(tenant_id));

DROP POLICY IF EXISTS "Super admin manage student reports" ON public.student_reports;
CREATE POLICY "Super admin manage student reports" ON public.student_reports
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Platform admin read student reports" ON public.student_reports;
CREATE POLICY "Platform admin read student reports" ON public.student_reports
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read student reports with portal token" ON public.student_reports;
CREATE POLICY "Public read student reports with portal token" ON public.student_reports
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_reports.student_id
        AND s.portal_enabled = true
        AND s.is_active = true
    )
  );

-- Atualização da função portal_get_data para retornar o parecer salvo
CREATE OR REPLACE FUNCTION public.portal_get_data(_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _s RECORD; _class_id UUID; _school_id UUID; _group_id UUID; _tenant_id UUID;
  _evals JSONB; _class_avg JSONB; _school_avg JSONB;
  _tenant_brand JSONB; _school_brand JSONB; _group_brand JSONB;
  _saved_report JSONB;
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
    'id', e.id, 'evaluated_at', e.evaluated_at, 'age_years', e.age_years, 'age_months', e.age_months,
    'weight_kg', e.weight_kg, 'height_cm', e.height_cm, 'imc', e.imc, 'rce', e.rce,
    'sit_and_reach_cm', e.sit_and_reach_cm, 'abdominal_reps', e.abdominal_reps,
    'horizontal_jump_cm', e.horizontal_jump_cm, 'medicine_ball_m', e.medicine_ball_m,
    'square_test_s', e.square_test_s, 'sprint_20m_s', e.sprint_20m_s,
    'run_6min_m', e.run_6min_m, 'classifications', e.classifications,
    'ai_diagnosis', e.ai_diagnosis, 'ai_technical', e.ai_technical, 'ai_family', e.ai_family, 'ai_goals', e.ai_goals
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

  -- Busca o parecer mais recente salvo para este aluno
  SELECT jsonb_build_object(
    'id', sr.id,
    'evaluation_id', sr.evaluation_id,
    'engine_version', sr.engine_version,
    'generated_at', sr.generated_at,
    'diagnosis', sr.diagnosis,
    'technical', sr.technical,
    'family', sr.family,
    'goals', sr.goals,
    'full_report', sr.full_report
  ) INTO _saved_report
  FROM public.student_reports sr
  WHERE sr.student_id = _s.id
  ORDER BY sr.generated_at DESC
  LIMIT 1;

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
    'branding', jsonb_build_object('tenant', _tenant_brand, 'school', _school_brand, 'group', _group_brand),
    'saved_report', _saved_report
  );
END;
$$;
