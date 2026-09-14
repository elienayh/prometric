
-- =========================================================
-- PROESP Evaluations Module
-- =========================================================

CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  evaluated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  age_years INTEGER,                -- snapshot na hora da avaliação
  -- Antropometria
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  wingspan_cm NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  hip_cm NUMERIC(5,2),
  imc NUMERIC(5,2),
  rce NUMERIC(5,3),                 -- razão cintura/estatura
  -- 7 testes PROESP (valores brutos)
  sit_and_reach_cm NUMERIC(5,2),    -- flexibilidade
  abdominal_reps INTEGER,            -- resistência abdominal (1 min)
  horizontal_jump_cm NUMERIC(6,2),   -- força MI
  medicine_ball_m NUMERIC(5,2),      -- força MS (2kg)
  square_test_s NUMERIC(5,2),        -- agilidade
  sprint_20m_s NUMERIC(5,2),         -- velocidade
  run_6min_m NUMERIC(7,2),           -- aptidão cardio
  -- Classificações automáticas (calculadas no backend)
  classifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX evaluations_tenant_idx ON public.evaluations(tenant_id);
CREATE INDEX evaluations_student_idx ON public.evaluations(student_id, evaluated_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluations TO authenticated;
GRANT ALL ON public.evaluations TO service_role;

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read evaluations"
  ON public.evaluations FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "writers insert evaluations"
  ON public.evaluations FOR INSERT TO authenticated
  WITH CHECK (public.can_write_tenant(tenant_id));

CREATE POLICY "writers update evaluations"
  ON public.evaluations FOR UPDATE TO authenticated
  USING (public.can_write_tenant(tenant_id))
  WITH CHECK (public.can_write_tenant(tenant_id));

CREATE POLICY "admins delete evaluations"
  ON public.evaluations FOR DELETE TO authenticated
  USING (public.is_tenant_admin(tenant_id));

CREATE TRIGGER evaluations_set_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- Plan enforcement: contagem e checagem de limite
-- =========================================================
CREATE OR REPLACE FUNCTION public.tenant_can_add_student(_tenant uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _max INT; _count INT;
BEGIN
  SELECT p.max_students INTO _max
    FROM tenants t JOIN plans p ON p.id = t.plan_id
   WHERE t.id = _tenant;
  IF _max IS NULL THEN RETURN true; END IF;
  SELECT COUNT(*) INTO _count FROM students
   WHERE tenant_id = _tenant AND is_active = true;
  RETURN _count < _max;
END;
$$;

-- Bloqueio no insert de students quando excede o plano
CREATE OR REPLACE FUNCTION public.enforce_student_plan_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_active AND NOT public.tenant_can_add_student(NEW.tenant_id) THEN
    RAISE EXCEPTION 'Limite de alunos do plano atingido' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_plan_limit ON public.students;
CREATE TRIGGER students_plan_limit
  BEFORE INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.enforce_student_plan_limit();
