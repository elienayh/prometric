
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT;

CREATE OR REPLACE FUNCTION public._validate_tenant_branding()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.primary_color IS NOT NULL AND NEW.primary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'primary_color deve ser hex #RRGGBB';
  END IF;
  IF NEW.secondary_color IS NOT NULL AND NEW.secondary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'secondary_color deve ser hex #RRGGBB';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_tenants_branding ON public.tenants;
CREATE TRIGGER trg_tenants_branding BEFORE INSERT OR UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public._validate_tenant_branding();
