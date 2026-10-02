
-- 1) Tenants: dados administrativos
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS cnpj text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','trial','suspended','blocked','canceled'));

-- Backfill status from is_active
UPDATE public.tenants SET status = CASE WHEN is_active THEN 'active' ELSE 'suspended' END
WHERE status = 'active' AND is_active = false;

-- 2) Subscriptions: Stripe-ready
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS stripe_status text,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_yearly_cents integer NOT NULL DEFAULT 0;

-- 3) Plans: limites adicionais
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS max_schools integer,
  ADD COLUMN IF NOT EXISTS max_evaluations integer,
  ADD COLUMN IF NOT EXISTS max_storage_mb integer;

-- 4) Permitir super admin atualizar tenants
DROP POLICY IF EXISTS "Platform admins update tenant" ON public.tenants;
CREATE POLICY "Platform admins update tenant"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- 5) RPC: registrar último acesso (chamada após login)
CREATE OR REPLACE FUNCTION public.touch_tenant_last_login(_tenant uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.tenants SET last_login_at = now() WHERE id = _tenant;
$$;
REVOKE EXECUTE ON FUNCTION public.touch_tenant_last_login(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.touch_tenant_last_login(uuid) TO authenticated;
