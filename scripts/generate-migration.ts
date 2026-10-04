import fs from "fs";
import path from "path";
import {
  WHO_BMI_BOYS,
  WHO_BMI_GIRLS,
  WHO_BMI_MIN_MONTHS,
  WHO_BMI_MAX_MONTHS,
} from "../src/lib/who2007-bmi";
import {
  MEDICINE_BALL_BOYS,
  MEDICINE_BALL_GIRLS,
  JUMP_BOYS,
  JUMP_GIRLS,
  SQUARE_BOYS,
  SQUARE_GIRLS,
  SPRINT_BOYS,
  SPRINT_GIRLS,
  RUN6_PERFORMANCE_BOYS,
  RUN6_PERFORMANCE_GIRLS,
  FLEXIBILITY_HEALTH_CUTS_BOYS,
  FLEXIBILITY_HEALTH_CUTS_GIRLS,
  ABDOMINAL_HEALTH_CUTS_BOYS,
  ABDOMINAL_HEALTH_CUTS_GIRLS,
  RUN6_HEALTH_CUTS_BOYS,
  RUN6_HEALTH_CUTS_GIRLS,
} from "../src/lib/motor-norms";

function generateSql(): string {
  // 1. Build WHO 2007 BMI JSON for SQL
  // Map month 61..228: [sd3neg, sd2neg, sd1, sd2, sd3]
  const whoBoys: Record<number, [number, number, number, number, number]> = {};
  const whoGirls: Record<number, [number, number, number, number, number]> = {};

  for (let m = WHO_BMI_MIN_MONTHS; m <= WHO_BMI_MAX_MONTHS; m++) {
    const b = WHO_BMI_BOYS[m];
    const g = WHO_BMI_GIRLS[m];
    whoBoys[m] = [b.sd3neg, b.sd2neg, b.sd1, b.sd2, b.sd3];
    whoGirls[m] = [g.sd3neg, g.sd2neg, g.sd1, g.sd2, g.sd3];
  }

  // 2. Build Motor Norms data dictionary
  const motorData: Record<string, number[]> = {};

  for (let a = 6; a <= 17; a++) {
    // Jump
    const jb = JUMP_BOYS[a];
    const jg = JUMP_GIRLS[a];
    motorData[`jumpmale${a}`] = [jb.p40, jb.p60, jb.p80, jb.p98];
    motorData[`jumpfemale${a}`] = [jg.p40, jg.p60, jg.p80, jg.p98];

    // Medicine ball (cm)
    const mb = MEDICINE_BALL_BOYS[a];
    const mg = MEDICINE_BALL_GIRLS[a];
    motorData[`mballmale${a}`] = [mb.p40, mb.p60, mb.p80, mb.p98];
    motorData[`mballfemale${a}`] = [mg.p40, mg.p60, mg.p80, mg.p98];

    // Square (s) [p98, p80, p60, p40]
    const sqb = SQUARE_BOYS[a];
    const sqg = SQUARE_GIRLS[a];
    motorData[`squaremale${a}`] = [sqb.p98, sqb.p80, sqb.p60, sqb.p40];
    motorData[`squarefemale${a}`] = [sqg.p98, sqg.p80, sqg.p60, sqg.p40];

    // Sprint 20m (s) [p98, p80, p60, p40]
    const spb = SPRINT_BOYS[a];
    const spg = SPRINT_GIRLS[a];
    motorData[`sprintmale${a}`] = [spb.p98, spb.p80, spb.p60, spb.p40];
    motorData[`sprintfemale${a}`] = [spg.p98, spg.p80, spg.p60, spg.p40];

    // Run 6min (m) [p40, p60, p80, p98]
    const r6b = RUN6_PERFORMANCE_BOYS[a];
    const r6g = RUN6_PERFORMANCE_GIRLS[a];
    motorData[`run6male${a}`] = [r6b.p40, r6b.p60, r6b.p80, r6b.p98];
    motorData[`run6female${a}`] = [r6g.p40, r6g.p60, r6g.p80, r6g.p98];

    // Health cuts (single cutoff):
    motorData[`flexmale${a}`] = [FLEXIBILITY_HEALTH_CUTS_BOYS[a]];
    motorData[`flexfemale${a}`] = [FLEXIBILITY_HEALTH_CUTS_GIRLS[a]];

    motorData[`abdomale${a}`] = [ABDOMINAL_HEALTH_CUTS_BOYS[a]];
    motorData[`abdofemale${a}`] = [ABDOMINAL_HEALTH_CUTS_GIRLS[a]];
  }

  const sql = `-- Migration: Normas Motoras Oficiais (Manual 2015) e IMC OMS 2007 Oficial
-- Gerado automaticamente por scripts/generate-migration.ts garantindo 100% de paridade TS x SQL.
-- REGRAS:
-- 1. IMC: Tabela oficial da OMS 2007 (61 a 228 meses) por escore-z (-3, -2, +1, +2, +3).
-- 2. Motoras (Desempenho): 5 faixas (<p40 Fraco, p40..p59 Razoável, p60..p79 Bom, p80..p98 Muito Bom, >p98 Excelência).
-- 3. Motoras (Saúde): Ponto de corte único (>= corte Zona Saudável/Bom, < corte Zona de Risco/Fraco).
-- 4. Arremesso: Medida do sistema em metros (m), comparada aos cortes em cm via val_cm = val_m * 100 sem arredondamento.

-- 1. Função _imc_zone atualizada com a tabela oficial OMS 2007 (meses 61 a 228)
CREATE OR REPLACE FUNCTION public._imc_zone(imc numeric, age int, sex text, age_months int DEFAULT NULL)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  ref_boys jsonb := '${JSON.stringify(whoBoys)}'::jsonb;
  ref_girls jsonb := '${JSON.stringify(whoGirls)}'::jsonb;
  months int;
  row_ jsonb;
  sd3neg numeric; sd2neg numeric; sd1 numeric; sd2 numeric; sd3 numeric;
BEGIN
  IF imc IS NULL THEN RETURN NULL; END IF;

  -- Se age_months for informado, utiliza diretamente; caso contrário, estima por age
  IF age_months IS NOT NULL THEN
    IF age_months < 61 THEN RETURN NULL; END IF;
    IF age_months > 228 THEN
      IF age_months >= 240 THEN
        IF imc < 16 THEN RETURN 'Muito Fraco'; END IF;
        IF imc < 18.5 THEN RETURN 'Fraco'; END IF;
        IF imc < 25 THEN RETURN 'Excelente'; END IF;
        IF imc < 30 THEN RETURN 'Razoável'; END IF;
        RETURN 'Muito Fraco';
      END IF;
      RETURN NULL;
    END IF;
    months := age_months;
  ELSE
    IF age IS NULL THEN RETURN NULL; END IF;
    IF age >= 20 THEN
      IF imc < 16 THEN RETURN 'Muito Fraco'; END IF;
      IF imc < 18.5 THEN RETURN 'Fraco'; END IF;
      IF imc < 25 THEN RETURN 'Excelente'; END IF;
      IF imc < 30 THEN RETURN 'Razoável'; END IF;
      RETURN 'Muito Fraco';
    END IF;
    IF age < 5 THEN RETURN NULL; END IF;
    months := age * 12 + 6;
    IF months < 61 OR months > 228 THEN RETURN NULL; END IF;
  END IF;

  IF sex = 'female' THEN
    row_ := ref_girls -> months::text;
  ELSE
    row_ := ref_boys -> months::text;
  END IF;

  IF row_ IS NULL THEN RETURN NULL; END IF;

  sd3neg := (row_ ->> 0)::numeric;
  sd2neg := (row_ ->> 1)::numeric;
  sd1    := (row_ ->> 2)::numeric;
  sd2    := (row_ ->> 3)::numeric;
  sd3    := (row_ ->> 4)::numeric;

  -- Classificação oficial por escore-z:
  -- < -3: magreza acentuada (Muito Fraco)
  -- < -2: magreza (Fraco)
  -- <= +1: eutrofia (Excelente)
  -- <= +2: sobrepeso (Razoável)
  -- <= +3: obesidade (Fraco)
  -- > +3: obesidade grave (Muito Fraco)
  IF imc < sd3neg THEN RETURN 'Muito Fraco'; END IF;
  IF imc < sd2neg THEN RETURN 'Fraco'; END IF;
  IF imc <= sd1   THEN RETURN 'Excelente'; END IF;
  IF imc <= sd2   THEN RETURN 'Razoável'; END IF;
  IF imc <= sd3   THEN RETURN 'Fraco'; END IF;
  RETURN 'Muito Fraco';
END $$;

ALTER FUNCTION public._imc_zone(numeric, integer, text, integer) SET search_path = public;

-- 2. Tabela de cortes motores _cuts atualizada conforme Manual de Testes 2015
CREATE OR REPLACE FUNCTION public._cuts(kind text, sex text, age int)
RETURNS numeric[] LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  a int := GREATEST(6, LEAST(17, COALESCE(age, 14)));
  data jsonb := '${JSON.stringify(motorData)}'::jsonb;
  arr jsonb;
BEGIN
  arr := data -> (kind || sex || a::text);
  IF arr IS NULL THEN RETURN NULL; END IF;
  RETURN ARRAY(SELECT (jsonb_array_elements_text(arr))::numeric);
END $$;

ALTER FUNCTION public._cuts(text, text, integer) SET search_path = public;

-- 3. Classificação de testes de desempenho motor onde MAIOR é melhor (Salto, Arremesso cm, Corrida 6min)
-- Cortes: [p40, p60, p80, p98] -> 5 faixas (Fraco, Razoável, Bom, Muito Bom, Excelência/Excelente)
CREATE OR REPLACE FUNCTION public._classify_motor_higher(val numeric, cuts numeric[])
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN val IS NULL OR cuts IS NULL OR array_length(cuts, 1) < 4 THEN NULL
    WHEN val > cuts[4] THEN 'Excelente'
    WHEN val >= cuts[3] THEN 'Muito Bom'
    WHEN val >= cuts[2] THEN 'Bom'
    WHEN val >= cuts[1] THEN 'Razoável'
    ELSE 'Fraco'
  END;
$$;

ALTER FUNCTION public._classify_motor_higher(numeric, numeric[]) SET search_path = public;

-- 4. Classificação de testes de desempenho motor onde MENOR é melhor (Quadrado s, Velocidade 20m s)
-- Cortes: [p98, p80, p60, p40] -> 5 faixas
CREATE OR REPLACE FUNCTION public._classify_motor_lower(val numeric, cuts numeric[])
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN val IS NULL OR cuts IS NULL OR array_length(cuts, 1) < 4 THEN NULL
    WHEN val < cuts[1] THEN 'Excelente'
    WHEN val <= cuts[2] THEN 'Muito Bom'
    WHEN val <= cuts[3] THEN 'Bom'
    WHEN val <= cuts[4] THEN 'Razoável'
    ELSE 'Fraco'
  END;
$$;

ALTER FUNCTION public._classify_motor_lower(numeric, numeric[]) SET search_path = public;

-- 5. Classificação de testes de saúde com corte único (Flexibilidade, Abdominal)
-- Corte único: [cut] -> Zona Saudável (Bom) ou Zona de Risco (Fraco)
CREATE OR REPLACE FUNCTION public._classify_health_binary(val numeric, cuts numeric[])
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN val IS NULL OR cuts IS NULL OR array_length(cuts, 1) < 1 THEN NULL
    WHEN val >= cuts[1] THEN 'Bom'
    ELSE 'Fraco'
  END;
$$;

ALTER FUNCTION public._classify_health_binary(numeric, numeric[]) SET search_path = public;

-- 6. Atualizar compute_eval_classifications para utilizar os novos classificadores
CREATE OR REPLACE FUNCTION public.compute_eval_classifications(
  _sex text, _age int,
  _weight numeric, _height numeric, _waist numeric,
  _imc numeric, _rce numeric,
  _flex numeric, _abdo numeric, _jump numeric, _mball numeric,
  _square numeric, _sprint numeric, _run6 numeric,
  _age_months int DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  imc numeric := COALESCE(_imc, CASE WHEN _weight>0 AND _height>0 THEN _weight/((_height/100)*(_height/100)) END);
  rce numeric := COALESCE(_rce, CASE WHEN _waist>0 AND _height>0 THEN _waist/_height END);
  out jsonb := '{}'::jsonb;
  z text;
  mball_cm numeric;
BEGIN
  IF _sex IS NULL OR (_age IS NULL AND _age_months IS NULL) THEN RETURN out; END IF;

  -- 1. IMC (OMS 2007 oficial)
  z := public._imc_zone(imc, _age, _sex, _age_months);
  IF z IS NOT NULL THEN out := out || jsonb_build_object('imc', z); END IF;

  -- 2. RCE
  z := public._rce_zone(rce);
  IF z IS NOT NULL THEN out := out || jsonb_build_object('rce', z); END IF;

  -- 3. Flexibilidade (saúde - corte único)
  z := public._classify_health_binary(_flex, public._cuts('flex', _sex, _age));
  IF z IS NOT NULL THEN out := out || jsonb_build_object('flex', z); END IF;

  -- 4. Abdominal (saúde - corte único)
  z := public._classify_health_binary(_abdo, public._cuts('abdo', _sex, _age));
  IF z IS NOT NULL THEN out := out || jsonb_build_object('abdo', z); END IF;

  -- 5. Salto horizontal (maior é melhor - 5 faixas)
  z := public._classify_motor_higher(_jump, public._cuts('jump', _sex, _age));
  IF z IS NOT NULL THEN out := out || jsonb_build_object('jump', z); END IF;

  -- 6. Arremesso medicine ball (sistema em m, tabela em cm: mball_cm = _mball * 100)
  IF _mball IS NOT NULL THEN
    mball_cm := _mball * 100;
    z := public._classify_motor_higher(mball_cm, public._cuts('mball', _sex, _age));
    IF z IS NOT NULL THEN out := out || jsonb_build_object('mball', z); END IF;
  END IF;

  -- 7. Quadrado (menor é melhor - 5 faixas)
  z := public._classify_motor_lower(_square, public._cuts('square', _sex, _age));
  IF z IS NOT NULL THEN out := out || jsonb_build_object('square', z); END IF;

  -- 8. Velocidade 20m (menor é melhor - 5 faixas)
  z := public._classify_motor_lower(_sprint, public._cuts('sprint', _sex, _age));
  IF z IS NOT NULL THEN out := out || jsonb_build_object('sprint', z); END IF;

  -- 9. Corrida 6min (maior é melhor - 5 faixas)
  z := public._classify_motor_higher(_run6, public._cuts('run6', _sex, _age));
  IF z IS NOT NULL THEN out := out || jsonb_build_object('run6', z); END IF;

  RETURN out;
END $$;

ALTER FUNCTION public.compute_eval_classifications(text, integer, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, integer) SET search_path = public;
`;

  return sql;
}

const sql = generateSql();
const outPath = path.resolve(process.cwd(), "supabase/migrations/20261004120000_official_motor_norms_and_who2007_bmi.sql");
fs.writeFileSync(outPath, sql, "utf-8");
console.log(`Generated migration at ${outPath} (${sql.length} bytes)`);
