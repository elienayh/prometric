// ============================================================================
// FONTE ÚNICA DE VERDADE (Single Source of Truth) — resultados por aluno
// ----------------------------------------------------------------------------
// Toda tela/relatório do ProMetric deriva os valores do aluno destas funções.
// Elas consolidam todo o histórico de testes realizados pelo aluno, garantindo
// que qualquer teste já executado (seja antropometria, flexibilidade,
// resistência, potência ou agilidade/velocidade) permaneça ativo e considerado
// na condição física do aluno até que uma nova medição desse mesmo teste ocorra.
//
// Definições oficiais:
//  • "Avaliação atual consolidada" → o estado acumulado mais recente de cada
//    indicador/teste realizado pelo aluno em qualquer momento do seu histórico.
//  • "Evolução temporal" → cada ponto cronológico representa o estado consolidado
//    do aluno até aquela data, preservando também `recorded_classifications`
//    e `recorded_values` para auditoria do que foi realizado na sessão específica.
// ============================================================================

import type { Classifications, ClassificationKey, Zone } from "./proesp";
import { overallScore } from "./proesp";
import { prometricIndex, type PMOverall } from "./prometric-method";

export type { ClassificationKey };

export type EvalLike = {
  id?: string;
  evaluated_at: string;
  classifications: Classifications | null;
  [key: string]: unknown;
};

/** Ordena avaliações cronologicamente (mais antiga → mais recente). */
export function chronological<T extends EvalLike>(evals: readonly T[]): T[] {
  return [...evals].sort((a, b) => a.evaluated_at.localeCompare(b.evaluated_at));
}

function hasClassifications(c: Classifications | null | undefined): boolean {
  return !!c && Object.values(c).some(Boolean);
}

/** Avaliação clínica atual: registro mais recente com alguma classificação ou o mais recente da lista. */
export function currentEvaluation<T extends EvalLike>(evals: readonly T[]): T | null {
  const ordered = chronological(evals);
  for (let i = ordered.length - 1; i >= 0; i--) {
    if (hasClassifications(ordered[i].classifications)) return ordered[i];
  }
  return ordered[ordered.length - 1] ?? null;
}

/**
 * Classificações consolidadas de todo o histórico do aluno.
 * Considera o registro mais recente de cada teste já realizado,
 * garantindo que todas as avaliações do aluno sejam consideradas
 * como fonte única de verdade.
 */
export function consolidatedClassifications(evals: readonly EvalLike[]): Classifications {
  const ordered = chronological(evals);
  const result: Record<string, Zone> = {};
  for (const ev of ordered) {
    if (!ev.classifications) continue;
    for (const [key, zone] of Object.entries(ev.classifications)) {
      if (zone) {
        result[key] = zone as Zone;
      }
    }
  }
  return result as Classifications;
}

export type Snapshot = {
  id?: string;
  evaluated_at: string;
  /** Estado consolidado até esta avaliação (inclusive). */
  classifications: Classifications;
  /** Zonas efetivamente registradas nesta avaliação. */
  recorded: Classifications;
  index: PMOverall;
};

/**
 * Série temporal oficial: cada ponto reflete o estado consolidado acumulado
 * até aquela data, permitindo acompanhar a evolução real do Índice ProMetric.
 */
export function consolidatedSeries(evals: readonly EvalLike[]): Snapshot[] {
  const withConsolidated = withConsolidatedView(evals);
  return withConsolidated.map((ev) => ({
    id: ev.id,
    evaluated_at: ev.evaluated_at,
    classifications: ev.classifications,
    recorded: ev.recorded_classifications,
    index: prometricIndex(ev.classifications),
  }));
}

/** Índice ProMetric atual do aluno (mesma origem em todas as telas). */
export function currentIndex(evals: readonly EvalLike[]): PMOverall {
  return prometricIndex(consolidatedClassifications(evals));
}

/** Perfil geral (zona média) atual do aluno. */
export function currentOverall(evals: readonly EvalLike[]) {
  return overallScore(consolidatedClassifications(evals));
}

/**
 * Valor bruto mais recente registrado para um campo de teste
 * (ex.: `sit_and_reach_cm`), com a avaliação de origem.
 */
export function latestRecordedValue<T extends EvalLike>(
  evals: readonly T[],
  field: string,
): { value: number | null; source: T | null } {
  const ordered = chronological(evals);
  for (let i = ordered.length - 1; i >= 0; i--) {
    const v = (ordered[i] as unknown as Record<string, unknown>)[field];
    if (typeof v === "number" && !isNaN(v)) return { value: v, source: ordered[i] };
  }
  return { value: null, source: ordered[ordered.length - 1] ?? null };
}

export const NUMERIC_EVAL_FIELDS = [
  "weight_kg",
  "height_cm",
  "waist_circumference_cm",
  "waist_cm",
  "hip_cm",
  "wingspan_cm",
  "imc",
  "rce",
  "sit_and_reach_cm",
  "abdominal_reps",
  "horizontal_jump_cm",
  "medicine_ball_m",
  "square_test_s",
  "sprint_20m_s",
  "run_6min_m",
] as const;

/**
 * Normaliza e consolida cronologicamente as avaliações de um aluno.
 * Cada avaliação na saída possui:
 *  - `classifications`: as classificações consolidadas de todos os testes até aquela data.
 *  - `recorded_classifications`: o registro estrito apenas dos testes feitos naquele dia.
 *  - Os campos numéricos mais recentes consolidados até aquela data.
 *  - `recorded_values`: os valores brutos medidos exclusivamente naquele dia.
 */
export function withConsolidatedView<T extends EvalLike>(
  evals: readonly T[],
): (T & {
  recorded_classifications: Classifications;
  recorded_values: Record<string, number | null>;
  classifications: Classifications;
})[] {
  const ordered = chronological(evals);
  const accumulatedClass: Record<string, Zone> = {};
  const accumulatedNums: Record<string, number> = {};

  return ordered.map((ev) => {
    const evRecord = ev as unknown as Record<string, unknown>;

    // 1. Snapshot dos testes registrados puramente nesta data
    const recorded_classifications: Record<string, Zone> = {};
    if (ev.classifications) {
      for (const [key, zone] of Object.entries(ev.classifications)) {
        if (zone) {
          recorded_classifications[key] = zone as Zone;
          accumulatedClass[key] = zone as Zone;
        }
      }
    }

    // 2. Snapshot dos valores numéricos medidos puramente nesta data
    // Suporta tanto 'number' quanto strings numéricas vindas do PostgREST/PostgreSQL
    const recorded_values: Record<string, number | null> = {};
    for (const f of NUMERIC_EVAL_FIELDS) {
      const val = evRecord[f];
      const parsed =
        val !== null && val !== undefined && val !== "" && !isNaN(Number(val))
          ? Number(val)
          : null;
      if (parsed !== null) {
        recorded_values[f] = parsed;
        accumulatedNums[f] = parsed;
      } else {
        recorded_values[f] = null;
      }
    }

    return {
      ...ev,
      ...accumulatedNums,
      recorded_classifications: recorded_classifications as Classifications,
      recorded_values,
      classifications: { ...accumulatedClass } as Classifications,
    };
  });
}
