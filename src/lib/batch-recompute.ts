// ============================================================================
// ProMetric® — Motor de Auditoria e Recálculo em Lote (Fase 6)
// ============================================================================
// Este módulo fornece funções puras e utilitários para:
// 1. Recalcular avaliações históricas com a precisão de idade em meses (Fase 2)
// 2. Aplicar a curva de IMC OMS 2007 e critérios SBP (Fase 1)
// 3. Validar consistência física e metabólica dos dados (Fase 3)
// 4. Gerar/atualizar laudos determinísticos padronizados (Fase 4)
// 5. Auditar datasets em lote e gerar relatórios de discrepância e migração
// ============================================================================

import { ageInYears, ageInMonths } from "./age";
import {
  calcImc,
  calcRce,
  classifyAll,
  type Classifications,
  type Sex,
  type Zone,
} from "./proesp";
import {
  imcBand,
  imcAdultBand,
  IMC_BAND_LABEL,
  IMC_CLINICAL_DISCLAIMER,
  type IMCBand,
} from "./imc-reference";
import {
  prometricIndex,
  scoreToCategory,
  type PMCategory,
} from "./prometric-method";
import {
  scoreToSituation,
} from "./prometric-reference";
import {
  validateEvaluation,
} from "./validation";

export type EvaluationFormValues = Record<string, unknown>;
import {
  buildDeterministicDiagnosis,
  type EvaluationForDiagnosis,
} from "./deterministic-diagnosis";

export interface StudentLookup {
  id: string;
  full_name: string;
  sex: Sex;
  birth_date: string;
}

export interface RawEvaluationRecord {
  id: string;
  tenant_id?: string;
  student_id: string;
  evaluator_id?: string | null;
  evaluated_at: string;
  age_years?: number | null;
  age_months?: number | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  wingspan_cm?: number | null;
  waist_cm?: number | null;
  hip_cm?: number | null;
  imc?: number | null;
  rce?: number | null;
  sit_and_reach_cm?: number | null;
  abdominal_reps?: number | null;
  horizontal_jump_cm?: number | null;
  medicine_ball_m?: number | null;
  square_test_s?: number | null;
  sprint_20m_s?: number | null;
  run_6min_m?: number | null;
  classifications?: Classifications | null;
  ai_diagnosis?: string | null;
  ai_technical?: string | null;
  ai_family?: string | null;
  ai_goals?: { "30_days": string[]; "60_days": string[]; "90_days": string[] } | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RecalculatedEvaluationResult {
  id: string;
  student_id: string;
  evaluated_at: string;
  age_years: number;
  age_months: number;
  weight_kg: number | null;
  height_cm: number | null;
  waist_cm: number | null;
  wingspan_cm: number | null;
  imc: number | null;
  rce: number | null;
  imc_band: IMCBand | null;
  imc_label: string | null;
  previous_classifications: Classifications | null;
  classifications: Classifications;
  prometric_score: number;
  prometric_category: PMCategory | null;
  prometric_situation: string | null;
  ai_diagnosis: string;
  ai_technical: string;
  ai_family: string;
  ai_goals: { "30_days": string[]; "60_days": string[]; "90_days": string[] };
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  changed: {
    age_months_added: boolean;
    age_years_corrected: boolean;
    imc_recalculated: boolean;
    classifications_updated: boolean;
  };
}

export interface BatchAuditSummary {
  totalEvaluations: number;
  totalStudents: number;
  evaluationsWithAgeMonths: number;
  evaluationsWithoutAgeMonths: number;
  evaluationsWithImcChange: number;
  evaluationsWithClassificationChange: number;
  evaluationsWithValidationErrors: number;
  evaluationsWithValidationWarnings: number;
  categoryDistribution: Record<PMCategory, number>;
  recalculatedItems: RecalculatedEvaluationResult[];
}

/**
 * Recalcula um único registro de avaliação com a data de nascimento do aluno
 * e os novos motores (OMS 2007, idade em meses civil, laudo determinístico).
 */
export function recalculateEvaluationRecord(
  ev: RawEvaluationRecord,
  student: StudentLookup
): RecalculatedEvaluationResult {
  // 1. Cálculo exato de calendário civil
  const exactYears = ageInYears(student.birth_date, ev.evaluated_at);
  const exactMonths = ageInMonths(student.birth_date, ev.evaluated_at);

  const prevYears = ev.age_years ?? null;
  const prevMonths = ev.age_months ?? null;

  // 2. Normalização e cálculo de IMC e RCE
  const w = ev.weight_kg != null && !isNaN(Number(ev.weight_kg)) ? Number(ev.weight_kg) : null;
  const h = ev.height_cm != null && !isNaN(Number(ev.height_cm)) ? Number(ev.height_cm) : null;
  const waist = ev.waist_cm != null && !isNaN(Number(ev.waist_cm)) ? Number(ev.waist_cm) : null;

  const calculatedImc = w != null && h != null && w > 0 && h > 0 ? calcImc(w, h) : null;
  const calculatedRce = waist != null && h != null && waist > 0 && h > 0 ? calcRce(waist, h) : null;

  const finalImc = calculatedImc ?? (ev.imc != null ? Number(ev.imc) : null);
  const finalRce = calculatedRce ?? (ev.rce != null ? Number(ev.rce) : null);

  // 3. Classificações com suporte a idade em meses e OMS 2007
  const measurements: EvaluationFormValues = {
    weight_kg: w ?? undefined,
    height_cm: h ?? undefined,
    waist_cm: waist ?? undefined,
    wingspan_cm: ev.wingspan_cm != null ? Number(ev.wingspan_cm) : undefined,
    sit_and_reach_cm: ev.sit_and_reach_cm != null ? Number(ev.sit_and_reach_cm) : undefined,
    abdominal_reps: ev.abdominal_reps != null ? Number(ev.abdominal_reps) : undefined,
    horizontal_jump_cm: ev.horizontal_jump_cm != null ? Number(ev.horizontal_jump_cm) : undefined,
    medicine_ball_m: ev.medicine_ball_m != null ? Number(ev.medicine_ball_m) : undefined,
    square_test_s: ev.square_test_s != null ? Number(ev.square_test_s) : undefined,
    sprint_20m_s: ev.sprint_20m_s != null ? Number(ev.sprint_20m_s) : undefined,
    run_6min_m: ev.run_6min_m != null ? Number(ev.run_6min_m) : undefined,
  };

  const validationResult = validateEvaluation(measurements, exactYears);

  const newClassifications = classifyAll({
    ...measurements,
    sex: student.sex,
    age: exactYears,
    age_months: exactMonths,
  });

  // 4. Faixa de IMC OMS 2007 / Adulto
  let imcBandResult: IMCBand | null = null;
  let imcLabelResult: string | null = null;
  if (finalImc != null) {
    if (exactYears >= 20) {
      imcBandResult = imcAdultBand(finalImc);
    } else if (exactMonths >= 60) {
      imcBandResult = imcBand(finalImc, student.sex, exactMonths);
    }
    if (imcBandResult) {
      imcLabelResult = IMC_BAND_LABEL[imcBandResult] ?? null;
    }
  }

  // 5. Score ProMetric (0-100), categoria e situação
  const pm = prometricIndex(newClassifications);
  const situation = scoreToSituation(pm.score, pm.partial);

  // 6. Laudo determinístico completo (Fase 4)
  const evalForDiagnosis: EvaluationForDiagnosis = {
    id: ev.id,
    evaluated_at: ev.evaluated_at,
    age_years: exactYears,
    age_months: exactMonths,
    weight_kg: w,
    height_cm: h,
    waist_cm: waist,
    wingspan_cm: ev.wingspan_cm != null ? Number(ev.wingspan_cm) : null,
    imc: finalImc,
    rce: finalRce,
    sit_and_reach_cm: ev.sit_and_reach_cm != null ? Number(ev.sit_and_reach_cm) : null,
    abdominal_reps: ev.abdominal_reps != null ? Number(ev.abdominal_reps) : null,
    horizontal_jump_cm: ev.horizontal_jump_cm != null ? Number(ev.horizontal_jump_cm) : null,
    medicine_ball_m: ev.medicine_ball_m != null ? Number(ev.medicine_ball_m) : null,
    square_test_s: ev.square_test_s != null ? Number(ev.square_test_s) : null,
    sprint_20m_s: ev.sprint_20m_s != null ? Number(ev.sprint_20m_s) : null,
    run_6min_m: ev.run_6min_m != null ? Number(ev.run_6min_m) : null,
    classifications: newClassifications,
    student: {
      full_name: student.full_name,
      sex: student.sex,
      birth_date: student.birth_date,
    },
  };

  const deterministicOutput = buildDeterministicDiagnosis(evalForDiagnosis);

  // 7. Detecção de mudanças
  const ageMonthsAdded = prevMonths == null;
  const ageYearsCorrected = prevYears != null && prevYears !== exactYears;
  const imcRecalculated = ev.imc != null && calculatedImc != null && Math.abs(Number(ev.imc) - calculatedImc) > 0.05;

  let classificationsUpdated = false;
  if (!ev.classifications) {
    classificationsUpdated = Object.keys(newClassifications).length > 0;
  } else {
    for (const [k, v] of Object.entries(newClassifications)) {
      if ((ev.classifications as any)[k] !== v) {
        classificationsUpdated = true;
        break;
      }
    }
  }

  return {
    id: ev.id,
    student_id: student.id,
    evaluated_at: ev.evaluated_at,
    age_years: exactYears,
    age_months: exactMonths,
    weight_kg: w,
    height_cm: h,
    waist_cm: waist,
    wingspan_cm: ev.wingspan_cm != null ? Number(ev.wingspan_cm) : null,
    imc: finalImc,
    rce: finalRce,
    imc_band: imcBandResult,
    imc_label: imcLabelResult,
    previous_classifications: ev.classifications ?? null,
    classifications: newClassifications,
    prometric_score: pm.score,
    prometric_category: pm.category,
    prometric_situation: situation,
    ai_diagnosis: deterministicOutput.diagnosis,
    ai_technical: deterministicOutput.technical,
    ai_family: deterministicOutput.family,
    ai_goals: deterministicOutput.goals,
    validation: {
      valid: validationResult.valid,
      errors: Object.entries(validationResult.errors).map(([f, m]) => `${f}: ${m}`),
      warnings: Object.entries(validationResult.warnings).map(([f, m]) => `${f}: ${m}`),
    },
    changed: {
      age_months_added: ageMonthsAdded,
      age_years_corrected: ageYearsCorrected,
      imc_recalculated: imcRecalculated,
      classifications_updated: classificationsUpdated,
    },
  };
}

/**
 * Executa auditoria em lote sobre um conjunto de avaliações e estudantes.
 */
export function auditEvaluationDataset(
  evaluations: RawEvaluationRecord[],
  students: StudentLookup[]
): BatchAuditSummary {
  const studentMap = new Map<string, StudentLookup>();
  for (const s of students) {
    studentMap.set(s.id, s);
  }

  const categoryDistribution: Record<PMCategory, number> = {
    "Prioritário": 0,
    "Atenção": 0,
    "Em Desenvolvimento": 0,
    "Bom": 0,
    "Excelente": 0,
  };

  let evaluationsWithAgeMonths = 0;
  let evaluationsWithoutAgeMonths = 0;
  let evaluationsWithImcChange = 0;
  let evaluationsWithClassificationChange = 0;
  let evaluationsWithValidationErrors = 0;
  let evaluationsWithValidationWarnings = 0;

  const recalculatedItems: RecalculatedEvaluationResult[] = [];

  for (const ev of evaluations) {
    const student = studentMap.get(ev.student_id);
    if (!student) continue;

    if (ev.age_months != null) {
      evaluationsWithAgeMonths++;
    } else {
      evaluationsWithoutAgeMonths++;
    }

    const res = recalculateEvaluationRecord(ev, student);
    recalculatedItems.push(res);

    if (res.changed.imc_recalculated) {
      evaluationsWithImcChange++;
    }
    if (res.changed.classifications_updated) {
      evaluationsWithClassificationChange++;
    }
    if (!res.validation.valid) {
      evaluationsWithValidationErrors++;
    }
    if (res.validation.warnings.length > 0) {
      evaluationsWithValidationWarnings++;
    }

    if (res.prometric_category) {
      categoryDistribution[res.prometric_category] =
        (categoryDistribution[res.prometric_category] ?? 0) + 1;
    }
  }

  return {
    totalEvaluations: recalculatedItems.length,
    totalStudents: studentMap.size,
    evaluationsWithAgeMonths,
    evaluationsWithoutAgeMonths,
    evaluationsWithImcChange,
    evaluationsWithClassificationChange,
    evaluationsWithValidationErrors,
    evaluationsWithValidationWarnings,
    categoryDistribution,
    recalculatedItems,
  };
}

/**
 * Gera script SQL de migração seguro e idempotente para recomputar
 * todas as avaliações históricas no banco de dados.
 */
export function generateSqlMigration(): string {
  return `-- ============================================================================
-- Migração Fase 6: Recálculo em Lote e Backfill Seguro de Avaliações
-- ============================================================================
-- Atualiza age_years, age_months (calendário civil exato), imc, rce e classifications
-- com a curva OMS 2007 (5-19 anos) e critérios SBP.
-- Idempotente e transacional.
-- ============================================================================

DO $$
BEGIN
  -- 1. Atualizar age_years e age_months via calendário civil exato para todas as avaliações
  UPDATE public.evaluations e
  SET
    age_years = EXTRACT(year FROM age(e.evaluated_at::date, s.birth_date))::int,
    age_months = (EXTRACT(year FROM age(e.evaluated_at::date, s.birth_date))::int * 12 + EXTRACT(month FROM age(e.evaluated_at::date, s.birth_date))::int),
    imc = CASE
      WHEN e.weight_kg > 0 AND e.height_cm > 0 THEN
        round((e.weight_kg / ((e.height_cm / 100) * (e.height_cm / 100)))::numeric, 2)
      ELSE e.imc
    END,
    rce = CASE
      WHEN e.waist_cm > 0 AND e.height_cm > 0 THEN
        round((e.waist_cm / e.height_cm)::numeric, 3)
      ELSE e.rce
    END
  FROM public.students s
  WHERE s.id = e.student_id
    AND s.birth_date IS NOT NULL;

  -- 2. Recalcular classifications com a nova função de 15 parâmetros (incluindo age_months)
  UPDATE public.evaluations e
  SET classifications = public.compute_eval_classifications(
    s.sex::text,
    e.age_years,
    e.weight_kg,
    e.height_cm,
    e.waist_cm,
    e.imc,
    e.rce,
    e.sit_and_reach_cm,
    e.abdominal_reps,
    e.horizontal_jump_cm,
    e.medicine_ball_m,
    e.square_test_s,
    e.sprint_20m_s,
    e.run_6min_m,
    e.age_months
  )
  FROM public.students s
  WHERE s.id = e.student_id;
END $$;
`;
}
