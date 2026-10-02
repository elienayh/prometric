ALTER TABLE public.tenant_members ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS ai_technical TEXT,
  ADD COLUMN IF NOT EXISTS ai_family TEXT,
  ADD COLUMN IF NOT EXISTS ai_goals JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS evaluations_student_date_uniq
  ON public.evaluations (student_id, evaluated_at);
