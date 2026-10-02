
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
