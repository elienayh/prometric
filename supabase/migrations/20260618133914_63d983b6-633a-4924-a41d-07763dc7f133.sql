
-- 1. Enum de papéis administrativos
DO $$ BEGIN
  CREATE TYPE public.admin_role AS ENUM ('super_admin','admin_financeiro','admin_suporte','admin_operacional');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('trial','active','canceled','suspended','past_due');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('open','pending','resolved','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_priority AS ENUM ('low','normal','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. admin_roles
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.admin_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.admin_roles TO authenticated;
GRANT ALL ON public.admin_roles TO service_role;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Função segura para checar papel admin (evita recursão em policies)
CREATE OR REPLACE FUNCTION public.has_admin_role(_user UUID, _role public.admin_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_roles WHERE user_id = _user AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user UUID)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_roles WHERE user_id = _user);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user UUID)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_roles WHERE user_id = _user AND role = 'super_admin');
$$;

CREATE POLICY "Admins see admin_roles" ON public.admin_roles FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Super admin manages roles" ON public.admin_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 3. admin_invitations
CREATE TABLE IF NOT EXISTS public.admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role public.admin_role NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  invited_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invitations TO authenticated;
GRANT ALL ON public.admin_invitations TO service_role;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin manages admin invites" ON public.admin_invitations FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- Aceitar convite admin
CREATE OR REPLACE FUNCTION public.accept_admin_invitation(_token TEXT)
RETURNS public.admin_role LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _inv public.admin_invitations%ROWTYPE; _uid UUID := auth.uid(); _email TEXT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  SELECT * INTO _inv FROM public.admin_invitations WHERE token = _token;
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite inválido'; END IF;
  IF _inv.status <> 'pending' THEN RAISE EXCEPTION 'Convite já utilizado'; END IF;
  IF _inv.expires_at < now() THEN
    UPDATE public.admin_invitations SET status='expired' WHERE id=_inv.id;
    RAISE EXCEPTION 'Convite expirado';
  END IF;
  IF lower(_inv.email) <> lower(_email) THEN RAISE EXCEPTION 'Convite destinado a outro e-mail'; END IF;

  INSERT INTO public.admin_roles (user_id, role, granted_by) VALUES (_uid, _inv.role, _inv.invited_by)
    ON CONFLICT (user_id, role) DO NOTHING;
  UPDATE public.admin_invitations SET status='accepted', accepted_at=now(), accepted_by=_uid WHERE id=_inv.id;
  RETURN _inv.role;
END $$;

-- 4. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_tenant_idx ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs(created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Authenticated write audit" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- 5. subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  status public.subscription_status NOT NULL DEFAULT 'trial',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscriptions_tenant_idx ON public.subscriptions(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant sees own subscription" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins write subscriptions" ON public.subscriptions FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE TRIGGER subs_set_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status public.payment_status NOT NULL DEFAULT 'paid',
  method TEXT,
  external_id TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_tenant_idx ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS payments_paid_at_idx ON public.payments(paid_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant sees own payments" ON public.payments FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins write payments" ON public.payments FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- 7. support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  opened_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  priority public.ticket_priority NOT NULL DEFAULT 'normal',
  status public.ticket_status NOT NULL DEFAULT 'open',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS tickets_tenant_idx ON public.support_tickets(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant opens/sees own tickets" ON public.support_tickets FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.is_tenant_member(tenant_id))
    OR opened_by = auth.uid()
  );
CREATE POLICY "Tenant creates tickets" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (opened_by = auth.uid());
CREATE POLICY "Admins update tickets" ON public.support_tickets FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Super admin deletes tickets" ON public.support_tickets FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));
CREATE TRIGGER tickets_set_updated BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. system_metrics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT current_date,
  active_tenants INT DEFAULT 0,
  trial_tenants INT DEFAULT 0,
  suspended_tenants INT DEFAULT 0,
  total_users INT DEFAULT 0,
  total_students INT DEFAULT 0,
  total_evaluations INT DEFAULT 0,
  mrr_cents BIGINT DEFAULT 0,
  arr_cents BIGINT DEFAULT 0,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (metric_date)
);
GRANT SELECT, INSERT, UPDATE ON public.system_metrics TO authenticated;
GRANT ALL ON public.system_metrics TO service_role;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read metrics" ON public.system_metrics FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins write metrics" ON public.system_metrics FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- 9. Expandir policies de tenants/students/evaluations para super admin
DROP POLICY IF EXISTS "Admins view all tenants" ON public.tenants;
CREATE POLICY "Admins view all tenants" ON public.tenants FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manages tenants" ON public.tenants;
CREATE POLICY "Super admin manages tenants" ON public.tenants FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin deletes tenants" ON public.tenants;
CREATE POLICY "Super admin deletes tenants" ON public.tenants FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- 10. Promover elienayhemerson@gmail.com a super_admin
INSERT INTO public.admin_roles (user_id, role)
SELECT id, 'super_admin'::public.admin_role FROM auth.users
WHERE lower(email) = 'elienayhemerson@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
