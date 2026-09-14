CREATE TABLE IF NOT EXISTS public.team_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role member_role NOT NULL DEFAULT 'evaluator',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_contacts TO authenticated;
GRANT ALL ON public.team_contacts TO service_role;

ALTER TABLE public.team_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can read team_contacts"
  ON public.team_contacts FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "admins can write team_contacts"
  ON public.team_contacts FOR ALL TO authenticated
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE INDEX IF NOT EXISTS team_contacts_tenant_idx ON public.team_contacts(tenant_id);

CREATE TRIGGER team_contacts_set_updated_at
  BEFORE UPDATE ON public.team_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
