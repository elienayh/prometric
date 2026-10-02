
-- ── students: campos do portal ──────────────────────────────────────
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS portal_token_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portal_last_access TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portal_views INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS students_portal_token_idx ON public.students(portal_token) WHERE portal_token IS NOT NULL;

-- ── portal_access_logs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portal_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS portal_access_logs_student_idx ON public.portal_access_logs(student_id, accessed_at DESC);

GRANT SELECT ON public.portal_access_logs TO authenticated;
GRANT ALL ON public.portal_access_logs TO service_role;

ALTER TABLE public.portal_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant members read portal logs"
  ON public.portal_access_logs FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

-- ── portal_set_enabled ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.portal_set_enabled(_student UUID, _enabled BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _tenant UUID; _tok TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id, portal_token INTO _tenant, _tok FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT public.can_write_tenant(_tenant) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  IF _enabled AND _tok IS NULL THEN
    _tok := encode(gen_random_bytes(16), 'hex');
    UPDATE public.students
       SET portal_enabled = true, portal_token = _tok, portal_token_created_at = now()
     WHERE id = _student;
  ELSE
    UPDATE public.students SET portal_enabled = _enabled WHERE id = _student;
  END IF;
END $$;

-- ── portal_regenerate_token ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.portal_regenerate_token(_student UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _tenant UUID; _tok TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id INTO _tenant FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT public.can_write_tenant(_tenant) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  _tok := encode(gen_random_bytes(16), 'hex');
  UPDATE public.students
     SET portal_token = _tok, portal_token_created_at = now(), portal_enabled = true
   WHERE id = _student;
  RETURN _tok;
END $$;

-- ── portal_get_data ────────────────────────────────────────────────
-- Público (anon/authenticated) — recebe token e devolve dados sanitizados.
CREATE OR REPLACE FUNCTION public.portal_get_data(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _s RECORD; _class_id UUID; _school_id UUID;
  _evals JSONB; _class_avg JSONB; _school_avg JSONB;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN RETURN NULL; END IF;
  SELECT st.id, st.full_name, st.sex, st.birth_date, st.photo_url, st.class_id,
         c.name AS class_name, c.school_id,
         sc.name AS school_name, sc.logo_url AS school_logo
    INTO _s
    FROM public.students st
    LEFT JOIN public.classes c ON c.id = st.class_id
    LEFT JOIN public.schools sc ON sc.id = c.school_id
   WHERE st.portal_token = _token AND st.portal_enabled = true AND st.is_active = true;
  IF _s.id IS NULL THEN RETURN NULL; END IF;

  _class_id := _s.class_id; _school_id := _s.school_id;

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

  -- agregados (últimas avaliações por aluno na turma/escola)
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

  RETURN jsonb_build_object(
    'student', jsonb_build_object(
      'id', _s.id, 'full_name', _s.full_name, 'sex', _s.sex,
      'birth_date', _s.birth_date, 'photo_url', _s.photo_url,
      'class_name', _s.class_name, 'school_name', _s.school_name, 'school_logo', _s.school_logo
    ),
    'evaluations', _evals,
    'class_latest', COALESCE(_class_avg, '[]'::jsonb),
    'school_latest', COALESCE(_school_avg, '[]'::jsonb)
  );
END $$;

-- ── portal_log_access ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.portal_log_access(_token TEXT, _ip TEXT DEFAULT NULL, _ua TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _sid UUID; _tid UUID;
BEGIN
  SELECT id, tenant_id INTO _sid, _tid FROM public.students
   WHERE portal_token = _token AND portal_enabled = true AND is_active = true;
  IF _sid IS NULL THEN RETURN; END IF;

  INSERT INTO public.portal_access_logs (student_id, tenant_id, ip, user_agent)
    VALUES (_sid, _tid, _ip, _ua);
  UPDATE public.students
     SET portal_last_access = now(), portal_views = portal_views + 1
   WHERE id = _sid;
END $$;

GRANT EXECUTE ON FUNCTION public.portal_set_enabled(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_regenerate_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_get_data(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_log_access(TEXT, TEXT, TEXT) TO anon, authenticated;
