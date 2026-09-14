
-- Provider enum
DO $$ BEGIN
  CREATE TYPE public.ai_provider AS ENUM ('openai','google','anthropic','xai');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Table
CREATE TABLE IF NOT EXISTS public.tenant_ai_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider public.ai_provider NOT NULL,
  model TEXT NOT NULL,
  api_key_ciphertext TEXT,
  api_key_iv TEXT,
  api_key_tag TEXT,
  api_key_fingerprint TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  last_test_ok BOOLEAN,
  last_test_error TEXT,
  last_test_latency_ms INT,
  prompt_version TEXT NOT NULL DEFAULT 'v1.0.0',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_ai_credentials_tenant ON public.tenant_ai_credentials(tenant_id);

-- GRANTs (Data API)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_ai_credentials TO authenticated;
GRANT ALL ON public.tenant_ai_credentials TO service_role;

-- RLS
ALTER TABLE public.tenant_ai_credentials ENABLE ROW LEVEL SECURITY;

-- Tenant admins (or platform super admin) can manage credentials
CREATE POLICY "ai_creds_select" ON public.tenant_ai_credentials
  FOR SELECT TO authenticated
  USING (
    public.is_tenant_admin(tenant_id)
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "ai_creds_insert" ON public.tenant_ai_credentials
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_tenant_admin(tenant_id)
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "ai_creds_update" ON public.tenant_ai_credentials
  FOR UPDATE TO authenticated
  USING (
    public.is_tenant_admin(tenant_id)
    OR public.is_platform_admin(auth.uid())
  )
  WITH CHECK (
    public.is_tenant_admin(tenant_id)
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "ai_creds_delete" ON public.tenant_ai_credentials
  FOR DELETE TO authenticated
  USING (
    public.is_tenant_admin(tenant_id)
    OR public.is_platform_admin(auth.uid())
  );

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_tenant_ai_credentials_updated_at ON public.tenant_ai_credentials;
CREATE TRIGGER trg_tenant_ai_credentials_updated_at
  BEFORE UPDATE ON public.tenant_ai_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Safe read function: returns only non-sensitive metadata (NO ciphertext, NO IV, NO tag)
CREATE OR REPLACE FUNCTION public.get_tenant_ai_config(_tenant uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT (public.is_tenant_admin(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_build_object(
    'id', c.id,
    'provider', c.provider,
    'model', c.model,
    'is_active', c.is_active,
    'has_key', (c.api_key_ciphertext IS NOT NULL),
    'fingerprint', c.api_key_fingerprint,
    'last_tested_at', c.last_tested_at,
    'last_test_ok', c.last_test_ok,
    'last_test_error', c.last_test_error,
    'last_test_latency_ms', c.last_test_latency_ms,
    'prompt_version', c.prompt_version,
    'updated_at', c.updated_at
  ) INTO _result
  FROM public.tenant_ai_credentials c
  WHERE c.tenant_id = _tenant;

  RETURN _result;
END $$;

GRANT EXECUTE ON FUNCTION public.get_tenant_ai_config(uuid) TO authenticated;
