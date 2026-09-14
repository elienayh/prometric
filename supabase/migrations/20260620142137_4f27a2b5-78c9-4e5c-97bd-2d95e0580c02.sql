
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS rg TEXT,
  ADD COLUMN IF NOT EXISTS guardian_name TEXT,
  ADD COLUMN IF NOT EXISTS guardian_relationship TEXT,
  ADD COLUMN IF NOT EXISTS guardian_phone TEXT,
  ADD COLUMN IF NOT EXISTS guardian_email TEXT,
  ADD COLUMN IF NOT EXISTS address_zip TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT;

CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_notes_student ON public.student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_tenant  ON public.student_notes(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_notes TO authenticated;
GRANT ALL ON public.student_notes TO service_role;

ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read notes of their tenant"
  ON public.student_notes FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Members can create notes for their tenant"
  ON public.student_notes FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id) AND author_id = auth.uid());

CREATE POLICY "Author or tenant admin can update notes"
  ON public.student_notes FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_tenant_admin(tenant_id))
  WITH CHECK (author_id = auth.uid() OR public.is_tenant_admin(tenant_id));

CREATE POLICY "Author or tenant admin can delete notes"
  ON public.student_notes FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_tenant_admin(tenant_id));

CREATE TRIGGER trg_student_notes_updated_at
  BEFORE UPDATE ON public.student_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
