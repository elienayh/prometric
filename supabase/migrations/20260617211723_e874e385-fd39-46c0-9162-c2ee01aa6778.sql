
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
