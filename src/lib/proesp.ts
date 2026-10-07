// Referências Oficiais ProMetric®
// Motoras: Manual de Testes e Avaliação 2015
// IMC: OMS 2007 (5 a 19 anos completos, 61 a 228 meses)

import {
  classifyHorizontalJump,
  classifyMedicineBall,
  classifySquareTest,
  classifySprint20m,
  classifyRun6minPerformance,
  classifyFlexibilityHealth,
  classifyAbdominalHealth,
  getMotorExpectedRange,
  motorCategoryToZone,
} from "./motor-norms";
import {
  classifyWhoBmi,
  getWhoBmiExpectedRange,
  WHO_BMI_TO_HEALTH_ZONE_MAP,
  WHO_BMI_MIN_MONTHS,
  WHO_BMI_MAX_MONTHS,
} from "./who2007-bmi";
import { prometricIndex } from "./prometric-method";
export { ageFromBirth } from "./age";

export type Sex = "male" | "female";

export type Zone =
  | "Muito Fraco"
  | "Fraco"
  | "Razoável"
  | "Bom"
  | "Muito Bom"
  | "Excelente";

export const ZONES: Zone[] = [
  "Muito Fraco",
  "Fraco",
  "Razoável",
  "Bom",
  "Muito Bom",
  "Excelente",
];

export const PROESP_MIN_AGE = 6;
export const PROESP_MAX_AGE = 17;

export const ZONE_LABEL: Record<Zone, string> = {
  "Muito Fraco": "Muito Fraco",
  "Fraco": "Fraco",
  "Razoável": "Razoável",
  "Bom": "Bom",
  "Muito Bom": "Muito Bom",
  "Excelente": "Excelente",
};

export const ZONE_COLOR: Record<Zone, string> = {
  "Muito Fraco": "text-destructive font-semibold",
  "Fraco": "text-warning font-semibold",
  "Razoável": "text-accent-foreground",
  "Bom": "text-primary font-medium",
  "Muito Bom": "text-primary font-semibold",
  "Excelente": "text-primary font-bold",
};

export const ZONE_BG_COLOR: Record<Zone, string> = {
  "Muito Fraco": "bg-destructive/15 text-destructive border-destructive/30",
  "Fraco": "bg-warning/15 text-warning border-warning/30",
  "Razoável": "bg-muted text-muted-foreground border-border",
  "Bom": "bg-primary/10 text-primary border-primary/20",
  "Muito Bom": "bg-primary/20 text-primary border-primary/30",
  "Excelente": "bg-primary/25 text-primary border-primary/40",
};

export function zoneColor(zone?: Zone | null): string {
  if (!zone) return "text-muted-foreground";
  return ZONE_COLOR[zone] ?? "text-muted-foreground";
}

export function calcImc(weightKg?: number | null, heightCm?: number | null): number | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const hM = heightCm / 100;
  return +(weightKg / (hM * hM)).toFixed(2);
}

export function calcRce(waistCm?: number | null, heightCm?: number | null): number | null {
  if (!waistCm || !heightCm || waistCm <= 0 || heightCm <= 0) return null;
  return +(waistCm / heightCm).toFixed(3);
}

export function calcWingspanHeightRatio(wingspanCm?: number | null, heightCm?: number | null): number | null {
  if (!wingspanCm || !heightCm || wingspanCm <= 0 || heightCm <= 0) return null;
  return +(wingspanCm / heightCm).toFixed(2);
}

/**
 * IMC zonas (saúde) — referência oficial OMS 2007 (61–228 meses) por idade e sexo.
 * Fora de 61–228 meses: sem referência oficial (retorna null). Adultos (20+): faixas de adulto.
 */
export function imcZone(imc: number | null, age: number, sex: Sex, ageMonths?: number): Zone | null {
  if (imc == null) return null;
  if (age >= 20) {
    if (imc < 16) return "Muito Fraco";
    if (imc < 18.5) return "Fraco";
    if (imc < 25) return "Excelente";
    if (imc < 30) return "Razoável";
    return "Muito Fraco";
  }
  const months = ageMonths ?? (age >= 5 ? Math.floor(age) * 12 + 6 : null);
  if (months == null || months < WHO_BMI_MIN_MONTHS || months > WHO_BMI_MAX_MONTHS) {
    return null;
  }
  const cat = classifyWhoBmi(imc, sex, months);
  if (!cat) return null;
  return WHO_BMI_TO_HEALTH_ZONE_MAP[cat] ?? null;
}

export function rceZone(rce: number | null): Zone | null {
  if (rce == null) return null;
  if (rce < 0.40) return "Razoável";
  if (rce < 0.50) return "Excelente";
  if (rce < 0.55) return "Razoável";
  if (rce < 0.60) return "Fraco";
  return "Muito Fraco";
}

export type EvaluationInput = {
  sex: Sex; age: number;
  age_months?: number | null;
  weight_kg?: number | null; height_cm?: number | null;
  waist_cm?: number | null; hip_cm?: number | null;
  sit_and_reach_cm?: number | null;
  abdominal_reps?: number | null;
  horizontal_jump_cm?: number | null;
  medicine_ball_m?: number | null;
  square_test_s?: number | null;
  sprint_20m_s?: number | null;
  run_6min_m?: number | null;
};

export type ClassificationKey =
  | "imc" | "rce" | "flex" | "abdo" | "jump" | "mball" | "square" | "sprint" | "run6";

export const TEST_META: Record<ClassificationKey, { label: string; unit: string; field: keyof EvaluationInput | "imc" | "rce"; better: "higher" | "lower" | "health" }> = {
  imc:    { label: "IMC",                    unit: "kg/m²", field: "imc",                 better: "health" },
  rce:    { label: "RCE",                    unit: "",      field: "rce",                 better: "health" },
  flex:   { label: "Flexibilidade",          unit: "cm",    field: "sit_and_reach_cm",    better: "higher" },
  abdo:   { label: "Abdominal 1min",         unit: "reps",  field: "abdominal_reps",      better: "higher" },
  jump:   { label: "Salto Horizontal",       unit: "cm",    field: "horizontal_jump_cm",  better: "higher" },
  mball:  { label: "Medicine Ball 2kg",      unit: "m",     field: "medicine_ball_m",     better: "higher" },
  square: { label: "Agilidade (Quadrado)",   unit: "s",     field: "square_test_s",       better: "lower" },
  sprint: { label: "Velocidade 20m",         unit: "s",     field: "sprint_20m_s",        better: "lower" },
  run6:   { label: "Corrida 6min",           unit: "m",     field: "run_6min_m",          better: "higher" },
};

export type Classifications = Partial<Record<ClassificationKey, Zone>>;

export function classifyAll(e: EvaluationInput): Classifications {
  const imc = calcImc(e.weight_kg, e.height_cm);
  const rce = calcRce(e.waist_cm, e.height_cm);
  const age = Math.floor(e.age);
  const months = e.age_months ?? (age >= 20 ? 240 : age >= 5 ? age * 12 + 6 : null);

  return {
    imc:    imcZone(imc, e.age, e.sex, months ?? undefined) ?? undefined,
    rce:    rceZone(rce) ?? undefined,
    flex:   motorCategoryToZone(classifyFlexibilityHealth(e.sit_and_reach_cm, e.sex, age)) ?? undefined,
    abdo:   motorCategoryToZone(classifyAbdominalHealth(e.abdominal_reps, e.sex, age)) ?? undefined,
    jump:   motorCategoryToZone(classifyHorizontalJump(e.horizontal_jump_cm, e.sex, age)) ?? undefined,
    mball:  motorCategoryToZone(classifyMedicineBall(e.medicine_ball_m, e.sex, age)) ?? undefined,
    square: motorCategoryToZone(classifySquareTest(e.square_test_s, e.sex, age)) ?? undefined,
    sprint: motorCategoryToZone(classifySprint20m(e.sprint_20m_s, e.sex, age)) ?? undefined,
    run6:   motorCategoryToZone(classifyRun6minPerformance(e.run_6min_m, e.sex, age)) ?? undefined,
  };
}

export function zoneScore(z?: Zone | null): number {
  if (!z) return 0;
  return ZONES.indexOf(z) + 1; // 1..6
}

export const MIN_TESTS_FOR_CLASSIFICATION = 4;
export const TOTAL_TESTS = 9;

export function filledTestsCount(c: Classifications): number {
  return (Object.values(c).filter(Boolean) as Zone[]).length;
}

export function isPartialEvaluation(c: Classifications): boolean {
  return filledTestsCount(c) < MIN_TESTS_FOR_CLASSIFICATION;
}

export function overallScore(c: Classifications): { score: number; label: Zone | null; filled: number; partial: boolean } {
  const pm = prometricIndex(c);
  let label: Zone | null = null;
  if (!pm.partial && pm.category) {
    switch (pm.category) {
      case "Prioritário":
        label = "Muito Fraco";
        break;
      case "Atenção":
        label = "Fraco";
        break;
      case "Em Desenvolvimento":
        label = "Razoável";
        break;
      case "Bom":
        label = "Bom";
        break;
      case "Excelente":
        label = pm.score >= 90 ? "Excelente" : "Muito Bom";
        break;
    }
  }
  return {
    score: pm.partial ? 0 : pm.score,
    label,
    filled: pm.filledTests,
    partial: pm.partial,
  };
}

export type ExpectedRange = {
  min: number;
  max: number;
  domainMin: number;
  domainMax: number;
  higherBetter: boolean;
};

export function expectedRangeFor(
  key: ClassificationKey,
  age: number,
  sex: Sex,
  ageMonths?: number,
): ExpectedRange | null {
  if (key === "imc") {
    if (age >= 20) return { min: 18.5, max: 24.9, domainMin: 14, domainMax: 32, higherBetter: false };
    const months = ageMonths ?? (age >= 5 ? Math.floor(age) * 12 + 6 : null);
    if (months == null) return null;
    const r = getWhoBmiExpectedRange(sex, months);
    if (!r) return null;
    return {
      min: +r.min.toFixed(1),
      max: +r.max.toFixed(1),
      domainMin: +r.domainMin.toFixed(1),
      domainMax: +r.domainMax.toFixed(1),
      higherBetter: false,
    };
  }
  if (key === "rce") {
    return { min: 0.40, max: 0.50, domainMin: 0.30, domainMax: 0.70, higherBetter: false };
  }
  return getMotorExpectedRange(key, sex, Math.floor(age));
}

export const EARLY_CHILDHOOD_MOTOR_NOTE =
  "Nessa faixa etária (6 e 7 anos), a musculatura está sendo desenvolvida, sendo comum e esperado haver maior divergência entre um teste e outro.";

export function isEarlyChildhoodAge(ageYears: number | null | undefined): boolean {
  if (ageYears == null || isNaN(ageYears)) return false;
  const a = Math.floor(ageYears);
  return a === 6 || a === 7;
}
