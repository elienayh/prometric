
-- ============ ENUMS ============
CREATE TYPE public.tenant_type AS ENUM ('professor','school','academy','club','personal_trainer');
CREATE TYPE public.member_role AS ENUM ('admin','evaluator','viewer');
CREATE TYPE public.sex_type AS ENUM ('male','female');
CREATE TYPE public.class_shift AS ENUM ('morning','afternoon','evening','full');

-- ============ PLANS ============
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  max_students INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.plans FOR SELECT USING (is_active = true);

INSERT INTO public.plans (slug,name,max_students,max_users,price_monthly,sort_order,features) VALUES
  ('free','Gratuito',50,1,0,1,'["Até 50 alunos","1 usuário","Relatórios básicos"]'),
  ('professor','Professor',500,3,49.90,2,'["Até 500 alunos","3 usuários","Relatórios PDF","Avaliação em lote"]'),
  ('school','Escola',2000,10,149.90,3,'["Até 2000 alunos","10 usuários","Múltiplas escolas","BI Avançado"]'),
  ('network','Rede',999999,999,499.90,4,'["Alunos ilimitados","Usuários ilimitados","Suporte prioritário","API"]');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  current_tenant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles readable by self" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles updatable by self" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insertable by self" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============ TENANTS ============
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.tenant_type NOT NULL DEFAULT 'professor',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- ============ TENANT MEMBERS ============
CREATE TABLE public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.member_role NOT NULL DEFAULT 'evaluator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
CREATE INDEX idx_tenant_members_user ON public.tenant_members(user_id);
CREATE INDEX idx_tenant_members_tenant ON public.tenant_members(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_members TO authenticated;
GRANT ALL ON public.tenant_members TO service_role;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER HELPERS (evitam recursão) ============
CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(_tenant UUID, _role public.member_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = auth.uid() AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin(_tenant UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.can_write_tenant(_tenant UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = auth.uid() AND role IN ('admin','evaluator'));
$$;

-- ============ POLICIES PARA TENANTS & MEMBERS ============
CREATE POLICY "Members can read tenant" ON public.tenants FOR SELECT USING (public.is_tenant_member(id));
CREATE POLICY "Any authed can create tenant" ON public.tenants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins can update tenant" ON public.tenants FOR UPDATE USING (public.is_tenant_admin(id));
CREATE POLICY "Owner can delete tenant" ON public.tenants FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Read own memberships" ON public.tenant_members FOR SELECT USING (user_id = auth.uid() OR public.is_tenant_admin(tenant_id));
CREATE POLICY "Admin insert members" ON public.tenant_members FOR INSERT WITH CHECK (public.is_tenant_admin(tenant_id) OR (user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin update members" ON public.tenant_members FOR UPDATE USING (public.is_tenant_admin(tenant_id));
CREATE POLICY "Admin delete members" ON public.tenant_members FOR DELETE USING (public.is_tenant_admin(tenant_id));

-- ============ SCHOOLS ============
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  network TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_schools_tenant ON public.schools(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read schools" ON public.schools FOR SELECT USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Writers manage schools" ON public.schools FOR ALL USING (public.can_write_tenant(tenant_id)) WITH CHECK (public.can_write_tenant(tenant_id));

-- ============ CLASSES ============
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  grade TEXT,
  school_year INT,
  shift public.class_shift,
  teacher_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_classes_tenant ON public.classes(tenant_id);
CREATE INDEX idx_classes_school ON public.classes(school_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read classes" ON public.classes FOR SELECT USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Writers manage classes" ON public.classes FOR ALL USING (public.can_write_tenant(tenant_id)) WITH CHECK (public.can_write_tenant(tenant_id));

-- ============ GROUPS ============
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_groups_tenant ON public.groups(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read groups" ON public.groups FOR SELECT USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Writers manage groups" ON public.groups FOR ALL USING (public.can_write_tenant(tenant_id)) WITH CHECK (public.can_write_tenant(tenant_id));

-- ============ STUDENTS ============
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  sex public.sex_type NOT NULL,
  birth_date DATE NOT NULL,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  mother_name TEXT,
  father_name TEXT,
  photo_url TEXT,
  notes TEXT,
  sport_modality TEXT,
  weekly_frequency INT,
  practice_time_months INT,
  has_disability BOOLEAN NOT NULL DEFAULT false,
  disability_type TEXT,
  medical_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_students_tenant ON public.students(tenant_id);
CREATE INDEX idx_students_class ON public.students(class_id);
CREATE INDEX idx_students_group ON public.students(group_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read students" ON public.students FOR SELECT USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Writers manage students" ON public.students FOR ALL USING (public.can_write_tenant(tenant_id)) WITH CHECK (public.can_write_tenant(tenant_id));

-- ============ UPDATED_AT TRIGGERS ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path=public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_schools_updated BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_groups_updated BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ AUTO PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ BOOTSTRAP TENANT RPC ============
-- Cria um tenant + adiciona o usuário como admin atomicamente
CREATE OR REPLACE FUNCTION public.create_tenant_with_owner(
  _name TEXT,
  _type public.tenant_type DEFAULT 'professor'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _tenant_id UUID;
  _plan_id UUID;
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT id INTO _plan_id FROM public.plans WHERE slug='free' LIMIT 1;

  INSERT INTO public.tenants (name, type, owner_id, plan_id)
  VALUES (_name, _type, _uid, _plan_id)
  RETURNING id INTO _tenant_id;

  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (_tenant_id, _uid, 'admin');

  UPDATE public.profiles SET current_tenant_id = _tenant_id WHERE id = _uid;

  RETURN _tenant_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_tenant_with_owner(TEXT, public.tenant_type) TO authenticated;

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

CREATE TABLE public.tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.member_role NOT NULL DEFAULT 'evaluator',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tenant_invitations_tenant_idx ON public.tenant_invitations(tenant_id, status);
CREATE INDEX tenant_invitations_token_idx ON public.tenant_invitations(token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_invitations TO authenticated;
GRANT ALL ON public.tenant_invitations TO service_role;

ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage invitations"
  ON public.tenant_invitations FOR ALL TO authenticated
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));

-- Convidado lê o próprio convite pelo token (controlado via server fn).
CREATE POLICY "auth can read by token via fn"
  ON public.tenant_invitations FOR SELECT TO authenticated
  USING (true);

CREATE TRIGGER tenant_invitations_set_updated_at
  BEFORE UPDATE ON public.tenant_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.accept_invitation(_token TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _inv tenant_invitations%ROWTYPE;
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _inv FROM tenant_invitations WHERE token = _token;
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite inválido'; END IF;
  IF _inv.status <> 'pending' THEN RAISE EXCEPTION 'Convite já utilizado ou revogado'; END IF;
  IF _inv.expires_at < now() THEN
    UPDATE tenant_invitations SET status='revoked' WHERE id=_inv.id;
    RAISE EXCEPTION 'Convite expirado';
  END IF;

  INSERT INTO tenant_members (tenant_id, user_id, role)
  VALUES (_inv.tenant_id, _uid, _inv.role)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  UPDATE tenant_invitations
     SET status='accepted', accepted_at=now(), accepted_by=_uid
   WHERE id=_inv.id;

  UPDATE profiles SET current_tenant_id = _inv.tenant_id WHERE id = _uid;

  RETURN _inv.tenant_id;
END;
$$;
ALTER TABLE public.tenant_members ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS ai_technical TEXT,
  ADD COLUMN IF NOT EXISTS ai_family TEXT,
  ADD COLUMN IF NOT EXISTS ai_goals JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS evaluations_student_date_uniq
  ON public.evaluations (student_id, evaluated_at);
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

-- Admin platform read access to tenant data
CREATE POLICY "Platform admins read students" ON public.students FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read evaluations" ON public.evaluations FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read classes" ON public.classes FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read schools" ON public.schools FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read groups" ON public.groups FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read members" ON public.tenant_members FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Super admin full access for impersonation on tenant-scoped tables
CREATE POLICY "Super admin manage students" ON public.students AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage evaluations" ON public.evaluations AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage schools" ON public.schools AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage classes" ON public.classes AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage groups" ON public.groups AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage team_contacts" ON public.team_contacts AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage tenant_members" ON public.tenant_members AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage tenant_invitations" ON public.tenant_invitations AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- Allow super_admin to switch profiles.current_tenant_id even if it's not a tenant they belong to (already covered by self update; this just makes intent explicit)
-- Helper to impersonate: sets current_tenant_id on caller's profile, logs audit
CREATE OR REPLACE FUNCTION public.impersonate_tenant(_tenant uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_super_admin(_uid) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant) THEN RAISE EXCEPTION 'Tenant not found'; END IF;
  UPDATE public.profiles SET current_tenant_id = _tenant WHERE id = _uid;
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, tenant_id)
  VALUES (_uid, 'tenant.impersonated', 'tenant', _tenant::text, _tenant);
  RETURN _tenant;
END;
$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS impersonating_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS impersonation_original_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS impersonation_started_at timestamptz;

CREATE OR REPLACE FUNCTION public.impersonate_tenant(_tenant uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE _uid uuid := auth.uid(); _orig uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_super_admin(_uid) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant) THEN RAISE EXCEPTION 'Tenant not found'; END IF;

  SELECT COALESCE(impersonation_original_tenant_id, current_tenant_id)
    INTO _orig FROM public.profiles WHERE id = _uid;

  UPDATE public.profiles
    SET current_tenant_id = _tenant,
        impersonating_tenant_id = _tenant,
        impersonation_original_tenant_id = _orig,
        impersonation_started_at = now()
    WHERE id = _uid;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, tenant_id)
  VALUES (_uid, 'tenant.impersonated', 'tenant', _tenant::text, _tenant);
  RETURN _tenant;
END;
$function$;

CREATE OR REPLACE FUNCTION public.end_impersonation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE _uid uuid := auth.uid(); _orig uuid; _imp uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT impersonation_original_tenant_id, impersonating_tenant_id
    INTO _orig, _imp FROM public.profiles WHERE id = _uid;

  UPDATE public.profiles
    SET current_tenant_id = _orig,
        impersonating_tenant_id = NULL,
        impersonation_original_tenant_id = NULL,
        impersonation_started_at = NULL
    WHERE id = _uid;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, tenant_id)
  VALUES (_uid, 'tenant.impersonation_ended', 'tenant', COALESCE(_imp::text, ''), _imp);

  RETURN _orig;
END;
$function$;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
-- 1. Add demo_data flag to all relevant tables
ALTER TABLE public.tenants       ADD COLUMN IF NOT EXISTS demo_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.schools       ADD COLUMN IF NOT EXISTS demo_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.classes       ADD COLUMN IF NOT EXISTS demo_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.groups        ADD COLUMN IF NOT EXISTS demo_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.students      ADD COLUMN IF NOT EXISTS demo_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.evaluations   ADD COLUMN IF NOT EXISTS demo_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.team_contacts ADD COLUMN IF NOT EXISTS demo_data boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_tenants_demo ON public.tenants(demo_data) WHERE demo_data = true;

-- 2. DELETE demo environment
CREATE OR REPLACE FUNCTION public.delete_demo_environment()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid(); _n int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_super_admin(_uid) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  -- Clear impersonation pointing at demo tenants first
  UPDATE public.profiles
     SET current_tenant_id = impersonation_original_tenant_id,
         impersonating_tenant_id = NULL,
         impersonation_original_tenant_id = NULL,
         impersonation_started_at = NULL
   WHERE impersonating_tenant_id IN (SELECT id FROM public.tenants WHERE demo_data);

  UPDATE public.profiles SET current_tenant_id = NULL
   WHERE current_tenant_id IN (SELECT id FROM public.tenants WHERE demo_data);

  WITH d AS (DELETE FROM public.tenants WHERE demo_data RETURNING 1)
  SELECT count(*) INTO _n FROM d;

  INSERT INTO public.audit_logs (actor_id, action, metadata)
  VALUES (_uid, 'demo.deleted', jsonb_build_object('removed_tenants', _n));

  RETURN _n;
END;
$$;

-- 3. CREATE demo environment (returns tenant id)
CREATE OR REPLACE FUNCTION public.create_demo_environment()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _tenant uuid;
  _plan uuid;
  _school1 uuid; _school2 uuid; _school3 uuid;
  _schools uuid[];
  _classes uuid[];
  _groups uuid[];
  _student_id uuid;
  _seed int;
  _grades text[] := ARRAY['6º Ano','7º Ano','8º Ano','9º Ano','1º Ano EM','2º Ano EM','3º Ano EM'];
  _class_defs text[][] := ARRAY[
    ARRAY['6º Ano A','6º Ano'], ARRAY['6º Ano B','6º Ano'],
    ARRAY['7º Ano A','7º Ano'], ARRAY['7º Ano B','7º Ano'],
    ARRAY['8º Ano A','8º Ano'],
    ARRAY['9º Ano A','9º Ano'],
    ARRAY['1º EM A','1º Ano EM'],
    ARRAY['2º EM A','2º Ano EM'],
    ARRAY['3º EM A','3º Ano EM']
  ];
  _group_defs text[][] := ARRAY[
    ARRAY['Futebol Masculino','#1e88e5'], ARRAY['Futebol Feminino','#ec407a'],
    ARRAY['Futsal','#43a047'], ARRAY['Voleibol','#fb8c00'],
    ARRAY['Basquete','#e53935'], ARRAY['Atletismo','#8e24aa'],
    ARRAY['Handebol','#00acc1'], ARRAY['Treinamento Funcional','#6d4c41'],
    ARRAY['Grupo Saúde','#26a69a'], ARRAY['Grupo Alto Rendimento','#5e35b5']
  ];
  _firsts_m text[] := ARRAY['Lucas','Pedro','Gabriel','Matheus','Rafael','Bruno','Felipe','Henrique','Gustavo','Vinícius','João','Bernardo','Davi','Arthur','Miguel','Enzo','Theo','Heitor','Caio','Diego','Igor','Leonardo','Murilo','Otávio','Samuel','Tiago','Vitor','Yago','André','Cauã'];
  _firsts_f text[] := ARRAY['Ana','Beatriz','Camila','Daniela','Eduarda','Fernanda','Gabriela','Helena','Isabela','Julia','Larissa','Mariana','Natália','Olivia','Patrícia','Rafaela','Sofia','Tainá','Vitória','Yara','Alice','Bianca','Clara','Letícia','Mirella','Nicole','Rebeca','Sabrina','Valentina','Mariane'];
  _lasts text[] := ARRAY['Silva','Souza','Oliveira','Santos','Pereira','Lima','Ferreira','Costa','Rodrigues','Almeida','Nascimento','Carvalho','Gomes','Martins','Araújo','Ribeiro','Barbosa','Cardoso','Rocha','Dias','Mendes','Castro','Cavalcanti','Moreira','Teixeira','Correia','Pinto','Ramos','Reis','Freitas'];
  _ai_phrases text[] := ARRAY[
    'Aluno demonstra evolução consistente em força e resistência cardiorrespiratória. Recomenda-se manter periodização atual.',
    'Composição corporal dentro do esperado para idade. Boa progressão na flexibilidade e potência de membros inferiores.',
    'Performance acima da média da turma. Indicado encaminhamento para grupo de alto rendimento.',
    'Pequenas oscilações em provas de velocidade — focar trabalho técnico de saída e aceleração.',
    'Indicadores de saúde estáveis. Continuar reforço de treinos funcionais e mobilidade.',
    'Boa adesão ao programa. Sugere-se ampliar volume de corrida contínua para melhorar VO2.',
    'Atenção ao IMC: orientar família sobre hábitos alimentares e manter monitoramento trimestral.',
    'Evolução excelente em potência de membros superiores (medicine ball). Manter treino com cargas progressivas.',
    'Resultados em flexibilidade abaixo da meta — incluir rotina de alongamento ativo nas aulas.',
    'Perfil de baixo risco. Recomenda-se participação em modalidades coletivas para socialização.'
  ];
  _now date := current_date;
  _eval_dates date[] := ARRAY[_now - interval '9 months', _now - interval '5 months', _now - interval '1 month']::date[];
  i int; j int; sex sex_type; first_name text; last_name text; full_name text;
  birth_year int; bd date; age int; grade_text text; class_id uuid; group_id uuid;
  profile_tier int; -- 1..5: 1=excelente,2=bom,3=desenvolvimento,4=atenção,5=prioritário
  base_weight numeric; base_height numeric; eval_idx int; ev_date date; eval_age int;
  weight_kg numeric; height_cm numeric; wing numeric; waist numeric; imc numeric; rce numeric;
  sit numeric; abd int; jump numeric; mball numeric; sq numeric; sprint numeric; run6 numeric;
  progress numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_super_admin(_uid) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  SELECT id INTO _plan FROM public.plans WHERE slug = 'network' LIMIT 1;
  IF _plan IS NULL THEN RAISE EXCEPTION 'Plano "network" não encontrado'; END IF;

  -- Avoid duplicate demo environments
  IF EXISTS (SELECT 1 FROM public.tenants WHERE demo_data) THEN
    RAISE EXCEPTION 'Ambiente demonstrativo já existe. Use restore_demo_environment().';
  END IF;

  -- Tenant
  INSERT INTO public.tenants (name, type, owner_id, plan_id, demo_data)
  VALUES ('Colégio Modelo ProMetric', 'school', _uid, _plan, true)
  RETURNING id INTO _tenant;

  -- Owner membership (so user can transition into the tenant naturally)
  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (_tenant, _uid, 'admin')
  ON CONFLICT (tenant_id, user_id) DO NOTHING;

  -- Schools
  INSERT INTO public.schools (tenant_id, name, city, state, demo_data) VALUES
    (_tenant, 'Colégio Modelo ProMetric', 'São Paulo', 'SP', true) RETURNING id INTO _school1;
  INSERT INTO public.schools (tenant_id, name, city, state, demo_data) VALUES
    (_tenant, 'Escola Estadual Futuro', 'Campinas', 'SP', true) RETURNING id INTO _school2;
  INSERT INTO public.schools (tenant_id, name, city, state, demo_data) VALUES
    (_tenant, 'Centro Educacional Horizonte', 'Belo Horizonte', 'MG', true) RETURNING id INTO _school3;
  _schools := ARRAY[_school1, _school2, _school3];

  -- Classes (round-robin across schools)
  _classes := ARRAY[]::uuid[];
  FOR i IN 1..array_length(_class_defs, 1) LOOP
    INSERT INTO public.classes (tenant_id, school_id, name, grade, shift, demo_data)
    VALUES (_tenant, _schools[1 + ((i-1) % 3)], _class_defs[i][1], _class_defs[i][2], 'morning', true)
    RETURNING id INTO class_id;
    _classes := _classes || class_id;
  END LOOP;

  -- Groups
  _groups := ARRAY[]::uuid[];
  FOR i IN 1..array_length(_group_defs, 1) LOOP
    INSERT INTO public.groups (tenant_id, name, color, demo_data)
    VALUES (_tenant, _group_defs[i][1], _group_defs[i][2], true)
    RETURNING id INTO group_id;
    _groups := _groups || group_id;
  END LOOP;

  -- Team contacts (professores fictícios)
  INSERT INTO public.team_contacts (tenant_id, full_name, email, phone, role, demo_data) VALUES
    (_tenant, 'Carlos Henrique Oliveira', 'carlos.oliveira@demo.prometric.app', '(11) 99000-1001', 'evaluator', true),
    (_tenant, 'Mariana Souza',             'mariana.souza@demo.prometric.app',  '(11) 99000-1002', 'evaluator', true),
    (_tenant, 'Rafael Martins',            'rafael.martins@demo.prometric.app', '(11) 99000-1003', 'evaluator', true),
    (_tenant, 'Juliana Almeida',           'juliana.almeida@demo.prometric.app','(11) 99000-1004', 'admin',     true);

  -- Students + Evaluations
  FOR i IN 1..200 LOOP
    _seed := i;
    sex := CASE WHEN i % 2 = 0 THEN 'male'::sex_type ELSE 'female'::sex_type END;
    IF sex = 'male' THEN
      first_name := _firsts_m[1 + (i % array_length(_firsts_m,1))];
    ELSE
      first_name := _firsts_f[1 + (i % array_length(_firsts_f,1))];
    END IF;
    last_name := _lasts[1 + ((i*7) % array_length(_lasts,1))] || ' ' || _lasts[1 + ((i*13) % array_length(_lasts,1))];
    full_name := first_name || ' ' || last_name;

    class_id := _classes[1 + ((i-1) % array_length(_classes,1))];
    grade_text := (SELECT c.grade FROM public.classes c WHERE c.id = class_id);
    -- Age inferred from grade
    age := CASE grade_text
      WHEN '6º Ano' THEN 11 WHEN '7º Ano' THEN 12 WHEN '8º Ano' THEN 13 WHEN '9º Ano' THEN 14
      WHEN '1º Ano EM' THEN 15 WHEN '2º Ano EM' THEN 16 WHEN '3º Ano EM' THEN 17 ELSE 14
    END + ((i % 2));
    birth_year := EXTRACT(year FROM _now)::int - age;
    bd := make_date(birth_year, 1 + (i % 12), 1 + (i % 27));

    -- 30% chance to be in a sports group
    IF i % 3 = 0 THEN
      group_id := _groups[1 + ((i/3) % array_length(_groups,1))];
    ELSE
      group_id := NULL;
    END IF;

    -- Profile distribution: 20/35/25/15/5
    profile_tier := CASE
      WHEN (i % 100) < 20 THEN 1
      WHEN (i % 100) < 55 THEN 2
      WHEN (i % 100) < 80 THEN 3
      WHEN (i % 100) < 95 THEN 4
      ELSE 5
    END;

    INSERT INTO public.students (tenant_id, class_id, group_id, full_name, sex, birth_date, phone, demo_data, is_active)
    VALUES (_tenant, class_id, group_id, full_name, sex, bd,
            '(' || lpad(((i*7) % 90 + 10)::text, 2, '0') || ') 9' || lpad((10000 + (i*131) % 89999)::text, 4, '0') || '-' || lpad((1000 + (i*97) % 8999)::text, 4, '0'),
            true, true)
    RETURNING id INTO _student_id;

    -- Baselines by age & sex
    IF sex = 'male' THEN
      base_height := 140 + (age - 11) * 6 + ((i % 7) - 3);
      base_weight := 36  + (age - 11) * 5 + ((i % 9) - 4);
    ELSE
      base_height := 138 + (age - 11) * 5 + ((i % 7) - 3);
      base_weight := 34  + (age - 11) * 4 + ((i % 9) - 4);
    END IF;

    -- 3 evaluations per student
    FOR eval_idx IN 1..3 LOOP
      ev_date := _eval_dates[eval_idx];
      eval_age := EXTRACT(year FROM age(ev_date, bd))::int;
      progress := (eval_idx - 1)::numeric; -- 0, 1, 2

      weight_kg := round((base_weight + progress * 1.2 + ((i % 5)::numeric * 0.3))::numeric, 1);
      height_cm := round((base_height + progress * 0.8)::numeric, 1);
      wing      := round((height_cm + ((i % 5) - 2))::numeric, 1);
      waist     := round((55 + (age - 11) * 1.5 + ((i % 7)) - progress * 0.4)::numeric, 1);
      imc       := round((weight_kg / power(height_cm/100, 2))::numeric, 2);
      rce       := round((waist / height_cm)::numeric, 3);

      -- Performance improves with eval; better profile tier → better absolute values
      sit    := round((20 + (5 - profile_tier) * 2 + progress * 1.5 + (i % 4))::numeric, 1);
      abd    := round((18 + (5 - profile_tier) * 4 + progress * 3 + (i % 5))::numeric)::int;
      jump   := round((120 + (5 - profile_tier) * 12 + progress * 6 + (i % 8))::numeric, 1);
      mball  := round((2.5 + (5 - profile_tier) * 0.4 + progress * 0.3 + ((i % 5) * 0.1))::numeric, 2);
      sq     := round((8.0 - (5 - profile_tier) * 0.4 - progress * 0.15 + ((i % 4) * 0.05))::numeric, 2);
      sprint := round((4.6 - (5 - profile_tier) * 0.2 - progress * 0.08 + ((i % 4) * 0.04))::numeric, 2);
      run6   := round((800 + (5 - profile_tier) * 80 + progress * 60 + ((i % 9) * 10))::numeric, 2);

      INSERT INTO public.evaluations (
        tenant_id, student_id, evaluator_id, evaluated_at, age_years,
        weight_kg, height_cm, wingspan_cm, waist_cm, imc, rce,
        sit_and_reach_cm, abdominal_reps, horizontal_jump_cm, medicine_ball_m,
        square_test_s, sprint_20m_s, run_6min_m,
        ai_diagnosis, classifications, demo_data
      ) VALUES (
        _tenant, _student_id, _uid, ev_date, eval_age,
        weight_kg, height_cm, wing, waist, imc, rce,
        sit, abd, jump, mball, sq, sprint, run6,
        _ai_phrases[1 + ((i + eval_idx) % array_length(_ai_phrases,1))],
        '{}'::jsonb, true
      );
    END LOOP;
  END LOOP;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, tenant_id, metadata)
  VALUES (_uid, 'demo.created', 'tenant', _tenant::text, _tenant,
          jsonb_build_object('students', 200, 'evaluations', 600));

  RETURN _tenant;
END;
$$;

-- 4. RESTORE: delete + create
CREATE OR REPLACE FUNCTION public.restore_demo_environment()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid(); _new uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_super_admin(_uid) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  PERFORM public.delete_demo_environment();
  _new := public.create_demo_environment();
  RETURN _new;
END;
$$;

-- 5. Helper: find the demo tenant id
CREATE OR REPLACE FUNCTION public.get_demo_tenant()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.tenants WHERE demo_data ORDER BY created_at DESC LIMIT 1;
$$;

-- Restrict EXECUTE to authenticated (functions still enforce super_admin internally)
REVOKE ALL ON FUNCTION public.create_demo_environment()  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_demo_environment()  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.restore_demo_environment() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_demo_tenant()          FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_demo_environment()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_demo_environment()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_demo_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_demo_tenant()          TO authenticated;

CREATE OR REPLACE FUNCTION public._classify_higher(val numeric, cuts numeric[])
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN val IS NULL OR cuts IS NULL THEN NULL
    WHEN val <= cuts[1] THEN 'Muito Fraco'
    WHEN val <= cuts[2] THEN 'Fraco'
    WHEN val <= cuts[3] THEN 'Razoável'
    WHEN val <= cuts[4] THEN 'Bom'
    WHEN val <= cuts[5] THEN 'Muito Bom'
    ELSE 'Excelente'
  END;
$$;

CREATE OR REPLACE FUNCTION public._classify_lower(val numeric, cuts numeric[])
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN val IS NULL OR cuts IS NULL THEN NULL
    WHEN val >= cuts[1] THEN 'Muito Fraco'
    WHEN val >= cuts[2] THEN 'Fraco'
    WHEN val >= cuts[3] THEN 'Razoável'
    WHEN val >= cuts[4] THEN 'Bom'
    WHEN val >= cuts[5] THEN 'Muito Bom'
    ELSE 'Excelente'
  END;
$$;

CREATE OR REPLACE FUNCTION public._imc_zone(imc numeric, age int, sex text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE base numeric[];
BEGIN
  IF imc IS NULL THEN RETURN NULL; END IF;
  IF age >= 18 THEN
    IF imc < 16 THEN RETURN 'Muito Fraco'; END IF;
    IF imc < 18.5 THEN RETURN 'Fraco'; END IF;
    IF imc < 25 THEN RETURN 'Excelente'; END IF;
    IF imc < 30 THEN RETURN 'Razoável'; END IF;
    RETURN 'Muito Fraco';
  END IF;
  IF sex = 'male' THEN base := ARRAY[14,15.5,22.5,25,28]::numeric[];
  ELSE base := ARRAY[13.5,15,22.5,25.5,28.5]::numeric[]; END IF;
  IF imc < base[1] THEN RETURN 'Muito Fraco'; END IF;
  IF imc < base[2] THEN RETURN 'Fraco'; END IF;
  IF imc < base[3] THEN RETURN 'Excelente'; END IF;
  IF imc < base[4] THEN RETURN 'Razoável'; END IF;
  IF imc < base[5] THEN RETURN 'Fraco'; END IF;
  RETURN 'Muito Fraco';
END $$;

CREATE OR REPLACE FUNCTION public._rce_zone(rce numeric)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN rce IS NULL THEN NULL
    WHEN rce < 0.40 THEN 'Razoável'
    WHEN rce < 0.50 THEN 'Excelente'
    WHEN rce < 0.55 THEN 'Razoável'
    WHEN rce < 0.60 THEN 'Fraco'
    ELSE 'Muito Fraco'
  END;
$$;

CREATE OR REPLACE FUNCTION public._cuts(kind text, sex text, age int)
RETURNS numeric[] LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  a int := GREATEST(6, LEAST(17, COALESCE(age, 14)));
  data jsonb := '{"flexmale6":[15,20,24,28,32],"flexmale7":[15,20,24,28,32],"flexmale8":[15,20,24,28,32],"flexmale9":[14,19,23,27,31],"flexmale10":[14,19,23,27,31],"flexmale11":[14,19,23,28,32],"flexmale12":[14,19,23,28,33],"flexmale13":[15,20,24,29,34],"flexmale14":[16,21,25,30,35],"flexmale15":[17,22,27,32,37],"flexmale16":[18,24,29,34,39],"flexmale17":[20,25,30,35,40],"flexfemale6":[18,23,28,32,36],"flexfemale7":[18,23,28,32,36],"flexfemale8":[18,23,28,32,36],"flexfemale9":[18,23,28,33,37],"flexfemale10":[19,24,29,34,38],"flexfemale11":[20,25,30,35,39],"flexfemale12":[21,26,31,36,40],"flexfemale13":[22,27,32,37,41],"flexfemale14":[23,28,33,38,42],"flexfemale15":[24,29,34,39,43],"flexfemale16":[25,30,35,40,44],"flexfemale17":[26,31,36,41,45],"abdomale6":[8,14,20,26,32],"abdomale7":[10,16,22,28,34],"abdomale8":[12,18,24,30,36],"abdomale9":[14,20,26,32,38],"abdomale10":[16,22,28,34,40],"abdomale11":[18,24,30,36,42],"abdomale12":[20,26,32,38,44],"abdomale13":[22,28,34,40,46],"abdomale14":[24,30,36,42,48],"abdomale15":[26,32,38,44,50],"abdomale16":[28,34,40,46,52],"abdomale17":[30,36,42,48,54],"abdofemale6":[6,12,18,24,30],"abdofemale7":[8,14,20,26,32],"abdofemale8":[10,16,22,28,34],"abdofemale9":[12,18,24,30,36],"abdofemale10":[14,20,26,32,38],"abdofemale11":[16,22,28,34,40],"abdofemale12":[18,24,30,36,42],"abdofemale13":[18,24,30,36,42],"abdofemale14":[19,25,31,37,43],"abdofemale15":[20,26,32,38,44],"abdofemale16":[20,26,32,38,44],"abdofemale17":[21,27,33,39,45],"jumpmale6":[80,95,110,125,140],"jumpmale7":[90,105,120,135,150],"jumpmale8":[100,115,130,145,160],"jumpmale9":[110,125,140,155,170],"jumpmale10":[120,135,150,165,180],"jumpmale11":[125,140,155,170,190],"jumpmale12":[130,145,160,180,200],"jumpmale13":[140,155,170,190,210],"jumpmale14":[150,165,180,200,220],"jumpmale15":[160,175,190,210,230],"jumpmale16":[170,185,200,220,240],"jumpmale17":[175,190,210,225,245],"jumpfemale6":[75,90,105,120,135],"jumpfemale7":[85,100,115,130,145],"jumpfemale8":[95,110,125,140,155],"jumpfemale9":[100,115,130,145,160],"jumpfemale10":[105,120,135,150,165],"jumpfemale11":[110,125,140,155,170],"jumpfemale12":[115,130,145,160,175],"jumpfemale13":[120,135,150,165,180],"jumpfemale14":[125,140,155,170,185],"jumpfemale15":[125,140,155,170,190],"jumpfemale16":[130,145,160,175,195],"jumpfemale17":[130,145,160,175,195],"mballmale6":[1.5,2.0,2.5,3.0,3.6],"mballmale7":[1.7,2.2,2.8,3.4,4.0],"mballmale8":[1.9,2.5,3.1,3.7,4.4],"mballmale9":[2.1,2.7,3.4,4.0,4.7],"mballmale10":[2.3,3.0,3.7,4.3,5.0],"mballmale11":[2.5,3.3,4.0,4.7,5.5],"mballmale12":[2.8,3.6,4.3,5.0,5.8],"mballmale13":[3.0,3.9,4.7,5.5,6.3],"mballmale14":[3.4,4.3,5.2,6.0,7.0],"mballmale15":[3.8,4.7,5.7,6.7,7.7],"mballmale16":[4.0,5.0,6.0,7.0,8.0],"mballmale17":[4.3,5.4,6.5,7.5,8.5],"mballfemale6":[1.3,1.8,2.2,2.7,3.2],"mballfemale7":[1.5,2.0,2.5,3.0,3.5],"mballfemale8":[1.7,2.2,2.7,3.3,3.9],"mballfemale9":[1.9,2.4,3.0,3.6,4.2],"mballfemale10":[2.0,2.6,3.2,3.9,4.5],"mballfemale11":[2.2,2.8,3.5,4.2,4.9],"mballfemale12":[2.4,3.0,3.7,4.5,5.2],"mballfemale13":[2.5,3.2,3.9,4.7,5.5],"mballfemale14":[2.7,3.4,4.1,4.9,5.7],"mballfemale15":[2.8,3.5,4.3,5.0,5.8],"mballfemale16":[2.9,3.6,4.4,5.2,6.0],"mballfemale17":[3.0,3.7,4.5,5.3,6.1],"squaremale6":[8.5,7.8,7.2,6.6,6.0],"squaremale7":[8.2,7.5,6.9,6.3,5.8],"squaremale8":[7.8,7.2,6.6,6.1,5.6],"squaremale9":[7.5,6.9,6.4,5.9,5.4],"squaremale10":[7.2,6.7,6.2,5.7,5.2],"squaremale11":[7.0,6.5,6.0,5.5,5.0],"squaremale12":[6.8,6.3,5.8,5.3,4.9],"squaremale13":[6.6,6.1,5.6,5.2,4.8],"squaremale14":[6.4,5.9,5.5,5.1,4.7],"squaremale15":[6.2,5.8,5.4,5.0,4.6],"squaremale16":[6.1,5.7,5.3,4.9,4.5],"squaremale17":[6.0,5.6,5.2,4.8,4.4],"squarefemale6":[9.0,8.3,7.6,7.0,6.4],"squarefemale7":[8.7,8.0,7.4,6.8,6.2],"squarefemale8":[8.4,7.7,7.1,6.5,6.0],"squarefemale9":[8.1,7.4,6.8,6.3,5.8],"squarefemale10":[7.8,7.2,6.6,6.1,5.6],"squarefemale11":[7.6,7.0,6.4,5.9,5.4],"squarefemale12":[7.4,6.8,6.3,5.8,5.3],"squarefemale13":[7.2,6.7,6.2,5.7,5.2],"squarefemale14":[7.1,6.6,6.1,5.6,5.2],"squarefemale15":[7.0,6.5,6.0,5.6,5.1],"squarefemale16":[6.9,6.4,6.0,5.5,5.1],"squarefemale17":[6.9,6.4,6.0,5.5,5.1],"sprintmale6":[5.5,5.0,4.6,4.2,3.9],"sprintmale7":[5.2,4.8,4.4,4.0,3.7],"sprintmale8":[5.0,4.6,4.2,3.9,3.6],"sprintmale9":[4.8,4.4,4.1,3.8,3.5],"sprintmale10":[4.7,4.3,4.0,3.7,3.4],"sprintmale11":[4.6,4.2,3.9,3.6,3.3],"sprintmale12":[4.5,4.1,3.8,3.5,3.2],"sprintmale13":[4.3,4.0,3.7,3.4,3.1],"sprintmale14":[4.2,3.9,3.6,3.3,3.0],"sprintmale15":[4.1,3.8,3.5,3.2,2.9],"sprintmale16":[4.0,3.7,3.4,3.1,2.9],"sprintmale17":[4.0,3.7,3.4,3.1,2.9],"sprintfemale6":[5.8,5.3,4.9,4.5,4.1],"sprintfemale7":[5.5,5.1,4.7,4.3,4.0],"sprintfemale8":[5.3,4.9,4.5,4.2,3.9],"sprintfemale9":[5.1,4.7,4.4,4.1,3.8],"sprintfemale10":[5.0,4.6,4.3,4.0,3.7],"sprintfemale11":[4.9,4.5,4.2,3.9,3.6],"sprintfemale12":[4.8,4.4,4.1,3.8,3.5],"sprintfemale13":[4.7,4.3,4.0,3.7,3.5],"sprintfemale14":[4.7,4.3,4.0,3.7,3.5],"sprintfemale15":[4.6,4.3,4.0,3.7,3.5],"sprintfemale16":[4.6,4.3,4.0,3.7,3.5],"sprintfemale17":[4.6,4.3,4.0,3.7,3.5],"run6male6":[600,750,900,1050,1200],"run6male7":[650,800,950,1100,1250],"run6male8":[700,850,1000,1150,1300],"run6male9":[750,900,1050,1200,1350],"run6male10":[800,950,1100,1250,1400],"run6male11":[850,1000,1150,1300,1450],"run6male12":[900,1050,1200,1350,1500],"run6male13":[950,1100,1250,1400,1550],"run6male14":[1000,1150,1300,1450,1600],"run6male15":[1050,1200,1350,1500,1650],"run6male16":[1100,1250,1400,1550,1700],"run6male17":[1150,1300,1450,1600,1750],"run6female6":[550,700,850,1000,1150],"run6female7":[600,750,900,1050,1200],"run6female8":[650,800,950,1100,1250],"run6female9":[700,850,1000,1150,1300],"run6female10":[750,900,1050,1200,1350],"run6female11":[800,950,1100,1250,1400],"run6female12":[850,1000,1150,1300,1450],"run6female13":[850,1000,1150,1300,1450],"run6female14":[850,1000,1150,1300,1450],"run6female15":[850,1000,1150,1300,1450],"run6female16":[850,1000,1150,1300,1450],"run6female17":[850,1000,1150,1300,1450]}'::jsonb;
  arr jsonb;
BEGIN
  arr := data -> (kind || sex || a::text);
  IF arr IS NULL THEN RETURN NULL; END IF;
  RETURN ARRAY(SELECT (jsonb_array_elements_text(arr))::numeric);
END $$;

CREATE OR REPLACE FUNCTION public.compute_eval_classifications(
  _sex text, _age int,
  _weight numeric, _height numeric, _waist numeric,
  _imc numeric, _rce numeric,
  _flex numeric, _abdo numeric, _jump numeric, _mball numeric,
  _square numeric, _sprint numeric, _run6 numeric
) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  imc numeric := COALESCE(_imc, CASE WHEN _weight>0 AND _height>0 THEN _weight/((_height/100)*(_height/100)) END);
  rce numeric := COALESCE(_rce, CASE WHEN _waist>0 AND _height>0 THEN _waist/_height END);
  out jsonb := '{}'::jsonb;
  z text;
BEGIN
  IF _sex IS NULL OR _age IS NULL THEN RETURN out; END IF;
  z := public._imc_zone(imc, _age, _sex);   IF z IS NOT NULL THEN out := out || jsonb_build_object('imc', z); END IF;
  z := public._rce_zone(rce);                IF z IS NOT NULL THEN out := out || jsonb_build_object('rce', z); END IF;
  z := public._classify_higher(_flex,  public._cuts('flex',_sex,_age));   IF z IS NOT NULL THEN out := out || jsonb_build_object('flex', z); END IF;
  z := public._classify_higher(_abdo,  public._cuts('abdo',_sex,_age));   IF z IS NOT NULL THEN out := out || jsonb_build_object('abdo', z); END IF;
  z := public._classify_higher(_jump,  public._cuts('jump',_sex,_age));   IF z IS NOT NULL THEN out := out || jsonb_build_object('jump', z); END IF;
  z := public._classify_higher(_mball, public._cuts('mball',_sex,_age));  IF z IS NOT NULL THEN out := out || jsonb_build_object('mball', z); END IF;
  z := public._classify_lower(_square, public._cuts('square',_sex,_age)); IF z IS NOT NULL THEN out := out || jsonb_build_object('square', z); END IF;
  z := public._classify_lower(_sprint, public._cuts('sprint',_sex,_age)); IF z IS NOT NULL THEN out := out || jsonb_build_object('sprint', z); END IF;
  z := public._classify_higher(_run6,  public._cuts('run6',_sex,_age));   IF z IS NOT NULL THEN out := out || jsonb_build_object('run6', z); END IF;
  RETURN out;
END $$;

CREATE OR REPLACE FUNCTION public.evaluations_fill_classifications()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _sex text; _bd date; _age int;
BEGIN
  SELECT sex::text, birth_date INTO _sex, _bd FROM public.students WHERE id = NEW.student_id;
  _age := COALESCE(NEW.age_years, CASE WHEN _bd IS NOT NULL THEN EXTRACT(year FROM age(NEW.evaluated_at, _bd))::int END);
  NEW.age_years := _age;
  IF NEW.imc IS NULL AND NEW.weight_kg>0 AND NEW.height_cm>0 THEN
    NEW.imc := round((NEW.weight_kg/((NEW.height_cm/100)*(NEW.height_cm/100)))::numeric, 2);
  END IF;
  IF NEW.rce IS NULL AND NEW.waist_cm>0 AND NEW.height_cm>0 THEN
    NEW.rce := round((NEW.waist_cm/NEW.height_cm)::numeric, 3);
  END IF;
  NEW.classifications := public.compute_eval_classifications(
    _sex, _age, NEW.weight_kg, NEW.height_cm, NEW.waist_cm, NEW.imc, NEW.rce,
    NEW.sit_and_reach_cm, NEW.abdominal_reps, NEW.horizontal_jump_cm, NEW.medicine_ball_m,
    NEW.square_test_s, NEW.sprint_20m_s, NEW.run_6min_m
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_evaluations_fill_classifications ON public.evaluations;
CREATE TRIGGER trg_evaluations_fill_classifications
BEFORE INSERT OR UPDATE ON public.evaluations
FOR EACH ROW EXECUTE FUNCTION public.evaluations_fill_classifications();

UPDATE public.evaluations e
SET classifications = public.compute_eval_classifications(
  s.sex::text,
  COALESCE(e.age_years, EXTRACT(year FROM age(e.evaluated_at, s.birth_date))::int),
  e.weight_kg, e.height_cm, e.waist_cm, e.imc, e.rce,
  e.sit_and_reach_cm, e.abdominal_reps, e.horizontal_jump_cm, e.medicine_ball_m,
  e.square_test_s, e.sprint_20m_s, e.run_6min_m
)
FROM public.students s
WHERE s.id = e.student_id;
DROP POLICY IF EXISTS "auth can read by token via fn" ON public.tenant_invitations;

DROP POLICY IF EXISTS "Admin insert members" ON public.tenant_members;
CREATE POLICY "Admin insert members"
  ON public.tenant_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_tenant_admin(tenant_id));

ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;

ALTER FUNCTION public._classify_higher(numeric, numeric[]) SET search_path = public;
ALTER FUNCTION public._classify_lower(numeric, numeric[]) SET search_path = public;
ALTER FUNCTION public._cuts(text, text, integer) SET search_path = public;
ALTER FUNCTION public._imc_zone(numeric, integer, text) SET search_path = public;
ALTER FUNCTION public._rce_zone(numeric) SET search_path = public;
ALTER FUNCTION public.compute_eval_classifications(text, integer, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric) SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.can_write_tenant(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.end_impersonation() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.evaluations_fill_classifications() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_admin_role(uuid, public.admin_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, public.member_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.impersonate_tenant(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_tenant_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.tenant_can_add_student(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.accept_admin_invitation(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.accept_invitation(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.create_demo_environment() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.create_tenant_with_owner(text, public.tenant_type) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.delete_demo_environment() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_demo_tenant() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.restore_demo_environment() FROM anon, public;
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

DROP POLICY IF EXISTS "Members read branding" ON storage.objects;
CREATE POLICY "Members read branding" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'branding'
    AND public.is_tenant_member((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "Writers upload branding" ON storage.objects;
CREATE POLICY "Writers upload branding" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'branding'
    AND public.can_write_tenant((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "Writers update branding" ON storage.objects;
CREATE POLICY "Writers update branding" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'branding'
    AND public.can_write_tenant((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "Writers delete branding" ON storage.objects;
CREATE POLICY "Writers delete branding" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'branding'
    AND public.can_write_tenant((storage.foldername(name))[1]::uuid)
  );
-- =============================================================
-- RPCs analíticos para dashboards de Turma e Grupo
-- =============================================================

CREATE OR REPLACE FUNCTION public.class_stats(_class uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant uuid;
  _school uuid;
  _header jsonb;
  _latest jsonb;
  _first jsonb;
  _school_latest jsonb;
BEGIN
  SELECT c.tenant_id, c.school_id INTO _tenant, _school
    FROM public.classes c WHERE c.id = _class;
  IF _tenant IS NULL THEN RETURN NULL; END IF;
  IF NOT public.is_tenant_member(_tenant) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  SELECT jsonb_build_object(
    'id', c.id, 'name', c.name, 'grade', c.grade, 'school_year', c.school_year,
    'shift', c.shift, 'school_id', c.school_id, 'school_name', sc.name,
    'students_count', (SELECT count(*) FROM public.students s WHERE s.class_id = c.id AND s.is_active),
    'evaluations_count', (
      SELECT count(*) FROM public.evaluations e
        JOIN public.students s ON s.id = e.student_id
        WHERE s.class_id = c.id
    ),
    'last_evaluation_at', (
      SELECT max(e.evaluated_at) FROM public.evaluations e
        JOIN public.students s ON s.id = e.student_id
        WHERE s.class_id = c.id
    )
  ) INTO _header
  FROM public.classes c LEFT JOIN public.schools sc ON sc.id = c.school_id
  WHERE c.id = _class;

  -- Latest evaluation per student in the class
  WITH latest AS (
    SELECT DISTINCT ON (e.student_id)
      s.id AS student_id, s.full_name, s.sex, s.birth_date,
      e.evaluated_at, e.age_years, e.classifications,
      e.weight_kg, e.height_cm, e.imc, e.sit_and_reach_cm, e.abdominal_reps,
      e.horizontal_jump_cm, e.medicine_ball_m, e.square_test_s, e.sprint_20m_s, e.run_6min_m
    FROM public.students s
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.class_id = _class AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(latest)), '[]'::jsonb) INTO _latest FROM latest;

  -- First evaluation per student (for evolution delta)
  WITH first_eval AS (
    SELECT DISTINCT ON (e.student_id)
      e.student_id, e.evaluated_at, e.classifications
    FROM public.students s
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.class_id = _class AND s.is_active
    ORDER BY e.student_id, e.evaluated_at ASC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(first_eval)), '[]'::jsonb) INTO _first FROM first_eval;

  -- School latest classifications (for school comparison)
  WITH school_latest AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
    FROM public.students s
    JOIN public.classes c2 ON c2.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c2.school_id = _school AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(classifications), '[]'::jsonb) INTO _school_latest FROM school_latest;

  RETURN jsonb_build_object(
    'header', _header,
    'students_latest', _latest,
    'students_first', _first,
    'school_latest', _school_latest
  );
END $$;

GRANT EXECUTE ON FUNCTION public.class_stats(uuid) TO authenticated;


CREATE OR REPLACE FUNCTION public.group_stats(_group uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant uuid;
  _header jsonb;
  _latest jsonb;
  _first jsonb;
  _origin_classes_latest jsonb;
  _school_latest jsonb;
BEGIN
  SELECT g.tenant_id INTO _tenant FROM public.groups g WHERE g.id = _group;
  IF _tenant IS NULL THEN RETURN NULL; END IF;
  IF NOT public.is_tenant_member(_tenant) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  SELECT jsonb_build_object(
    'id', g.id, 'name', g.name, 'description', g.description, 'color', g.color,
    'students_count', (SELECT count(*) FROM public.students s WHERE s.group_id = g.id AND s.is_active),
    'evaluations_count', (
      SELECT count(*) FROM public.evaluations e
        JOIN public.students s ON s.id = e.student_id
        WHERE s.group_id = g.id
    ),
    'last_evaluation_at', (
      SELECT max(e.evaluated_at) FROM public.evaluations e
        JOIN public.students s ON s.id = e.student_id
        WHERE s.group_id = g.id
    )
  ) INTO _header
  FROM public.groups g WHERE g.id = _group;

  WITH latest AS (
    SELECT DISTINCT ON (e.student_id)
      s.id AS student_id, s.full_name, s.sex, s.birth_date, s.class_id,
      c.name AS class_name,
      e.evaluated_at, e.age_years, e.classifications,
      e.weight_kg, e.height_cm, e.imc, e.sit_and_reach_cm, e.abdominal_reps,
      e.horizontal_jump_cm, e.medicine_ball_m, e.square_test_s, e.sprint_20m_s, e.run_6min_m
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.group_id = _group AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(latest)), '[]'::jsonb) INTO _latest FROM latest;

  WITH first_eval AS (
    SELECT DISTINCT ON (e.student_id) e.student_id, e.evaluated_at, e.classifications
    FROM public.students s
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE s.group_id = _group AND s.is_active
    ORDER BY e.student_id, e.evaluated_at ASC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(first_eval)), '[]'::jsonb) INTO _first FROM first_eval;

  -- Latest per student of all students in origin classes (excluding group members)
  WITH origin AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
    FROM public.students gs
    JOIN public.students s ON s.class_id = gs.class_id AND s.is_active
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE gs.group_id = _group AND gs.class_id IS NOT NULL
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(classifications), '[]'::jsonb) INTO _origin_classes_latest FROM origin;

  -- Latest per student of all students in same schools
  WITH school_latest AS (
    SELECT DISTINCT ON (e.student_id) e.classifications
    FROM public.students gs
    JOIN public.classes gc ON gc.id = gs.class_id
    JOIN public.classes c2 ON c2.school_id = gc.school_id
    JOIN public.students s ON s.class_id = c2.id AND s.is_active
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE gs.group_id = _group
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(classifications), '[]'::jsonb) INTO _school_latest FROM school_latest;

  RETURN jsonb_build_object(
    'header', _header,
    'students_latest', _latest,
    'students_first', _first,
    'origin_classes_latest', _origin_classes_latest,
    'school_latest', _school_latest
  );
END $$;

GRANT EXECUTE ON FUNCTION public.group_stats(uuid) TO authenticated;CREATE OR REPLACE FUNCTION public.school_stats(_school uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _tenant uuid;
  _header jsonb;
  _latest jsonb;
  _first jsonb;
  _classes jsonb;
  _groups jsonb;
BEGIN
  SELECT s.tenant_id INTO _tenant FROM public.schools s WHERE s.id = _school;
  IF _tenant IS NULL THEN RETURN NULL; END IF;
  IF NOT public.is_tenant_member(_tenant) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  SELECT jsonb_build_object(
    'id', s.id, 'name', s.name, 'city', s.city, 'state', s.state,
    'network', s.network, 'logo_url', s.logo_url,
    'classes_count', (SELECT count(*) FROM public.classes c WHERE c.school_id = s.id),
    'students_count', (
      SELECT count(*) FROM public.students st
        JOIN public.classes c ON c.id = st.class_id
        WHERE c.school_id = s.id AND st.is_active
    ),
    'groups_count', (
      SELECT count(DISTINCT st.group_id) FROM public.students st
        JOIN public.classes c ON c.id = st.class_id
        WHERE c.school_id = s.id AND st.is_active AND st.group_id IS NOT NULL
    ),
    'evaluations_count', (
      SELECT count(*) FROM public.evaluations e
        JOIN public.students st ON st.id = e.student_id
        JOIN public.classes c ON c.id = st.class_id
        WHERE c.school_id = s.id
    ),
    'last_evaluation_at', (
      SELECT max(e.evaluated_at) FROM public.evaluations e
        JOIN public.students st ON st.id = e.student_id
        JOIN public.classes c ON c.id = st.class_id
        WHERE c.school_id = s.id
    )
  ) INTO _header
  FROM public.schools s WHERE s.id = _school;

  WITH latest AS (
    SELECT DISTINCT ON (e.student_id)
      s.id AS student_id, s.full_name, s.sex, s.birth_date, s.class_id, s.group_id,
      c.name AS class_name,
      e.evaluated_at, e.age_years, e.classifications,
      e.weight_kg, e.height_cm, e.imc, e.sit_and_reach_cm, e.abdominal_reps,
      e.horizontal_jump_cm, e.medicine_ball_m, e.square_test_s, e.sprint_20m_s, e.run_6min_m
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(latest)), '[]'::jsonb) INTO _latest FROM latest;

  WITH first_eval AS (
    SELECT DISTINCT ON (e.student_id) e.student_id, e.evaluated_at, e.classifications
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active
    ORDER BY e.student_id, e.evaluated_at ASC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(first_eval)), '[]'::jsonb) INTO _first FROM first_eval;

  -- Per-class rollup using latest classifications
  WITH latest_per_student AS (
    SELECT DISTINCT ON (e.student_id)
      s.class_id, e.classifications
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'class_id', c.id, 'class_name', c.name, 'grade', c.grade,
    'students_count', (SELECT count(*) FROM public.students st WHERE st.class_id = c.id AND st.is_active),
    'classifications', COALESCE((SELECT jsonb_agg(lp.classifications) FROM latest_per_student lp WHERE lp.class_id = c.id), '[]'::jsonb)
  )), '[]'::jsonb) INTO _classes
  FROM public.classes c WHERE c.school_id = _school;

  -- Per-group rollup (groups that have at least one student in this school)
  WITH latest_per_student AS (
    SELECT DISTINCT ON (e.student_id)
      s.group_id, e.classifications
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.evaluations e ON e.student_id = s.id
    WHERE c.school_id = _school AND s.is_active AND s.group_id IS NOT NULL
    ORDER BY e.student_id, e.evaluated_at DESC
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'group_id', g.id, 'group_name', g.name, 'color', g.color,
    'students_count', (
      SELECT count(*) FROM public.students st
        JOIN public.classes c2 ON c2.id = st.class_id
        WHERE st.group_id = g.id AND st.is_active AND c2.school_id = _school
    ),
    'classifications', COALESCE((SELECT jsonb_agg(lp.classifications) FROM latest_per_student lp WHERE lp.group_id = g.id), '[]'::jsonb)
  )), '[]'::jsonb) INTO _groups
  FROM public.groups g
  WHERE g.tenant_id = _tenant
    AND EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.classes c ON c.id = st.class_id
      WHERE st.group_id = g.id AND st.is_active AND c.school_id = _school
    );

  RETURN jsonb_build_object(
    'header', _header,
    'students_latest', _latest,
    'students_first', _first,
    'classes', _classes,
    'groups', _groups
  );
END $function$;-- Schools branding
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Groups branding
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT;

-- Hex color validation triggers (reuse existing pattern from tenants)
CREATE OR REPLACE FUNCTION public._validate_school_branding()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.primary_color IS NOT NULL AND NEW.primary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'primary_color deve ser hex #RRGGBB';
  END IF;
  IF NEW.secondary_color IS NOT NULL AND NEW.secondary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'secondary_color deve ser hex #RRGGBB';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_validate_school_branding ON public.schools;
CREATE TRIGGER trg_validate_school_branding
  BEFORE INSERT OR UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public._validate_school_branding();

CREATE OR REPLACE FUNCTION public._validate_group_branding()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.primary_color IS NOT NULL AND NEW.primary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'primary_color deve ser hex #RRGGBB';
  END IF;
  IF NEW.secondary_color IS NOT NULL AND NEW.secondary_color !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'secondary_color deve ser hex #RRGGBB';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_validate_group_branding ON public.groups;
CREATE TRIGGER trg_validate_group_branding
  BEFORE INSERT OR UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public._validate_group_branding();

-- Update portal_get_data to include resolved branding chain
CREATE OR REPLACE FUNCTION public.portal_get_data(_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _s RECORD; _class_id UUID; _school_id UUID; _group_id UUID; _tenant_id UUID;
  _evals JSONB; _class_avg JSONB; _school_avg JSONB;
  _tenant_brand JSONB; _school_brand JSONB; _group_brand JSONB;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN RETURN NULL; END IF;
  SELECT st.id, st.full_name, st.sex, st.birth_date, st.photo_url, st.class_id, st.group_id, st.tenant_id,
         c.name AS class_name, c.school_id,
         sc.name AS school_name, sc.logo_url AS school_logo
    INTO _s
    FROM public.students st
    LEFT JOIN public.classes c ON c.id = st.class_id
    LEFT JOIN public.schools sc ON sc.id = c.school_id
   WHERE st.portal_token = _token AND st.portal_enabled = true AND st.is_active = true;
  IF _s.id IS NULL THEN RETURN NULL; END IF;

  _class_id := _s.class_id; _school_id := _s.school_id; _group_id := _s.group_id; _tenant_id := _s.tenant_id;

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

  SELECT to_jsonb(t) - 'id' - 'created_at' - 'updated_at'
    INTO _tenant_brand
    FROM (SELECT name, display_name, primary_color, secondary_color, description, website, email, phone, logo_url
          FROM public.tenants WHERE id = _tenant_id) t;

  SELECT to_jsonb(sc)
    INTO _school_brand
    FROM (SELECT name, display_name, primary_color, secondary_color, description, logo_url
          FROM public.schools WHERE id = _school_id) sc;

  SELECT to_jsonb(g)
    INTO _group_brand
    FROM (SELECT name, display_name, primary_color, secondary_color, description, logo_url
          FROM public.groups WHERE id = _group_id) g;

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
    'branding', jsonb_build_object(
      'tenant', _tenant_brand,
      'school', _school_brand,
      'group',  _group_brand
    )
  );
END $function$;
CREATE OR REPLACE FUNCTION public.portal_set_enabled(_student uuid, _enabled boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tenant UUID; _tok TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id, portal_token INTO _tenant, _tok FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para ativar portal deste aluno';
  END IF;

  IF _enabled AND _tok IS NULL THEN
    _tok := encode(gen_random_bytes(16), 'hex');
    UPDATE public.students
       SET portal_enabled = true, portal_token = _tok, portal_token_created_at = now()
     WHERE id = _student;
  ELSE
    UPDATE public.students SET portal_enabled = _enabled WHERE id = _student;
  END IF;
END $function$;

CREATE OR REPLACE FUNCTION public.portal_regenerate_token(_student uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tenant UUID; _tok TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id INTO _tenant FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para regenerar token deste aluno';
  END IF;

  _tok := encode(gen_random_bytes(16), 'hex');
  UPDATE public.students
     SET portal_token = _tok, portal_token_created_at = now(), portal_enabled = true
   WHERE id = _student;
  RETURN _tok;
END $function$;
create extension if not exists pgcrypto;
CREATE OR REPLACE FUNCTION public.portal_set_enabled(_student uuid, _enabled boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tenant UUID; _tok TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id, portal_token INTO _tenant, _tok FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para ativar portal deste aluno';
  END IF;

  IF _enabled AND _tok IS NULL THEN
    _tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
    UPDATE public.students
       SET portal_enabled = true, portal_token = _tok, portal_token_created_at = now()
     WHERE id = _student;
  ELSE
    UPDATE public.students SET portal_enabled = _enabled WHERE id = _student;
  END IF;
END $function$;

CREATE OR REPLACE FUNCTION public.portal_regenerate_token(_student uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tenant UUID; _tok TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id INTO _tenant FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para regenerar token deste aluno';
  END IF;

  _tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  UPDATE public.students
     SET portal_token = _tok, portal_token_created_at = now(), portal_enabled = true
   WHERE id = _student;
  RETURN _tok;
END $function$;

-- 1) Add portal_slug column
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS portal_slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS students_portal_slug_key ON public.students(portal_slug) WHERE portal_slug IS NOT NULL;

-- 2) Slugify helper (ASCII-folded, lowercase, hyphenated)
CREATE OR REPLACE FUNCTION public._slugify(_input text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(
          translate(
            COALESCE(_input,''),
            'àáâãäåèéêëìíîïòóôõöùúûüñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÇ',
            'aaaaaaeeeeiiiiooooouuuuncAAAAAAEEEEIIIIOOOOOUUUUNC'
          )
        ),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
$$;

-- 3) Generate a unique slug from a name
CREATE OR REPLACE FUNCTION public._portal_unique_slug(_name text)
RETURNS text LANGUAGE plpgsql VOLATILE SET search_path TO 'public' AS $$
DECLARE _base text; _slug text; _try int := 0;
BEGIN
  _base := public._slugify(_name);
  IF _base IS NULL OR length(_base) = 0 THEN _base := 'aluno'; END IF;
  _base := substring(_base from 1 for 48);
  LOOP
    _slug := _base || '-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 4);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.students WHERE portal_slug = _slug);
    _try := _try + 1;
    IF _try > 10 THEN _slug := _base || '-' || substring(replace(gen_random_uuid()::text,'-','') from 1 for 8); EXIT; END IF;
  END LOOP;
  RETURN _slug;
END $$;

-- 4) Update portal_set_enabled to also produce a slug
CREATE OR REPLACE FUNCTION public.portal_set_enabled(_student uuid, _enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _tenant UUID; _tok TEXT; _slug TEXT; _name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id, portal_token, portal_slug, full_name INTO _tenant, _tok, _slug, _name
    FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para ativar portal deste aluno';
  END IF;

  IF _enabled THEN
    IF _tok IS NULL THEN
      _tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
    END IF;
    IF _slug IS NULL THEN
      _slug := public._portal_unique_slug(_name);
    END IF;
    UPDATE public.students
       SET portal_enabled = true, portal_token = _tok, portal_slug = _slug,
           portal_token_created_at = COALESCE(portal_token_created_at, now())
     WHERE id = _student;
  ELSE
    UPDATE public.students SET portal_enabled = false WHERE id = _student;
  END IF;
END $$;

-- 5) Update portal_regenerate_token (slug remains stable)
CREATE OR REPLACE FUNCTION public.portal_regenerate_token(_student uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _tenant UUID; _tok TEXT; _slug TEXT; _name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT tenant_id, portal_slug, full_name INTO _tenant, _slug, _name FROM public.students WHERE id = _student;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  IF NOT (public.can_write_tenant(_tenant) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para regenerar token deste aluno';
  END IF;

  _tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  IF _slug IS NULL THEN _slug := public._portal_unique_slug(_name); END IF;
  UPDATE public.students
     SET portal_token = _tok, portal_slug = _slug,
         portal_token_created_at = now(), portal_enabled = true
   WHERE id = _student;
  RETURN _tok;
END $$;

-- 6) portal_get_data accepts either token or slug (same param)
CREATE OR REPLACE FUNCTION public.portal_get_data(_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _s RECORD; _class_id UUID; _school_id UUID; _group_id UUID; _tenant_id UUID;
  _evals JSONB; _class_avg JSONB; _school_avg JSONB;
  _tenant_brand JSONB; _school_brand JSONB; _group_brand JSONB;
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
    'id', e.id, 'evaluated_at', e.evaluated_at, 'age_years', e.age_years,
    'weight_kg', e.weight_kg, 'height_cm', e.height_cm, 'imc', e.imc, 'rce', e.rce,
    'sit_and_reach_cm', e.sit_and_reach_cm, 'abdominal_reps', e.abdominal_reps,
    'horizontal_jump_cm', e.horizontal_jump_cm, 'medicine_ball_m', e.medicine_ball_m,
    'square_test_s', e.square_test_s, 'sprint_20m_s', e.sprint_20m_s,
    'run_6min_m', e.run_6min_m, 'classifications', e.classifications
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
    'branding', jsonb_build_object('tenant', _tenant_brand, 'school', _school_brand, 'group', _group_brand)
  );
END $$;

-- 7) portal_log_access accepts either token or slug
CREATE OR REPLACE FUNCTION public.portal_log_access(_token text, _ip text DEFAULT NULL::text, _ua text DEFAULT NULL::text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _sid UUID; _tid UUID;
BEGIN
  SELECT id, tenant_id INTO _sid, _tid FROM public.students
   WHERE (portal_slug = _token OR portal_token = _token)
     AND portal_enabled = true AND is_active = true
   LIMIT 1;
  IF _sid IS NULL THEN RETURN; END IF;
  INSERT INTO public.portal_access_logs (student_id, tenant_id, ip, user_agent)
    VALUES (_sid, _tid, _ip, _ua);
  UPDATE public.students
     SET portal_last_access = now(), portal_views = portal_views + 1
   WHERE id = _sid;
END $$;

-- 8) Backfill slugs for already-enabled portals
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id, full_name FROM public.students
            WHERE portal_enabled = true AND portal_slug IS NULL LOOP
    UPDATE public.students SET portal_slug = public._portal_unique_slug(r.full_name) WHERE id = r.id;
  END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_roles WHERE user_id = _user AND role = 'super_admin');
$$;

DROP POLICY IF EXISTS "tenant members insert portal logs" ON public.portal_access_logs;
CREATE POLICY "tenant members insert portal logs"
ON public.portal_access_logs FOR INSERT TO authenticated
WITH CHECK (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Invitee reads own admin invitation" ON public.admin_invitations;
CREATE POLICY "Invitee reads own admin invitation"
ON public.admin_invitations FOR SELECT TO authenticated
USING (status = 'pending' AND expires_at > now()
       AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

DROP POLICY IF EXISTS "Invitee reads own tenant invitation" ON public.tenant_invitations;
CREATE POLICY "Invitee reads own tenant invitation"
ON public.tenant_invitations FOR SELECT TO authenticated
USING (status = 'pending' AND expires_at > now()
       AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_admin_role(uuid, admin_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, member_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_tenant_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_write_tenant(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_student_plan_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.evaluations_fill_classifications() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_tenant_last_login(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tenant_can_add_student(uuid) FROM PUBLIC, anon, authenticated;GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_role(uuid, public.admin_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, public.member_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_can_add_student(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_with_owner(text, public.tenant_type) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_admin_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.impersonate_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_impersonation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_set_enabled(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_regenerate_token(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_demo_tenant() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_demo_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_demo_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_demo_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.class_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.group_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_stats(uuid) TO authenticated;REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_admin_role(uuid, public.admin_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, public.member_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_tenant_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_write_tenant(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.tenant_can_add_student(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_tenant_with_owner(text, public.tenant_type) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.accept_invitation(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.accept_admin_invitation(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.impersonate_tenant(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.end_impersonation() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.portal_set_enabled(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.portal_regenerate_token(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_demo_tenant() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_demo_environment() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.restore_demo_environment() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_demo_environment() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.class_stats(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.group_stats(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.school_stats(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_role(uuid, public.admin_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, public.member_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_can_add_student(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_with_owner(text, public.tenant_type) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_admin_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.impersonate_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_impersonation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_set_enabled(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_regenerate_token(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_demo_tenant() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_demo_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_demo_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_demo_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.class_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.group_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_stats(uuid) TO authenticated;
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
