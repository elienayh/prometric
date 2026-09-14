
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
