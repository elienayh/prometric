// ============================================================================
// FONTE ÚNICA DE VERDADE (Single Source of Truth) — resultados por aluno
// ----------------------------------------------------------------------------
// Toda tela/relatório do ProMetric deve derivar os valores do aluno destas
// funções. Elas NÃO criam cálculo novo: apenas leem `evaluations.classifications`
// (gravado no lançamento pela lógica PROESP/ProMetric existente) e delegam o
// score para `prometricIndex`/`overallScore`, que permanecem inalterados.
//
// Definições oficiais:
//  • "Avaliação atual" → a avaliação mais recente que contém classificações.
//    Uma atualização isolada de medidas não apaga o último resultado clínico.
//  • "Evolução temporal" → cada ponto usa exclusivamente as classificações
//    persistidas naquela avaliação. Valores de datas diferentes nunca são
//    mesclados, preservando a rastreabilidade do registro original.
// ============================================================================

import type { Classifications, ClassificationKey, Zone } from "./proesp";
import { overallScore } from "./proesp";
import { prometricIndex, type PMOverall } from "./prometric-method";

export type EvalLike = {
  id?: string;
  evaluated_at: string;
  classifications: Classifications | null;
};

/** Ordena avaliações cronologicamente (mais antiga → mais recente). */
export function chronological<T extends EvalLike>(evals: readonly T[]): T[] {
  return [...evals].sort((a, b) => a.evaluated_at.localeCompare(b.evaluated_at));
}

function hasClassifications(c: Classifications | null | undefined): boolean {
  return !!c && Object.values(c).some(Boolean);
}

/** Avaliação clínica atual: registro mais recente com alguma classificação. */
export function currentEvaluation<T extends EvalLike>(evals: readonly T[]): T | null {
  const ordered = chronological(evals);
  for (let i = ordered.length - 1; i >= 0; i--) {
    if (hasClassifications(ordered[i].classifications)) return ordered[i];
  }
  return ordered[ordered.length - 1] ?? null;
}

/** Classificações da avaliação clínica atual, sem mesclar datas. */
export function consolidatedClassifications(evals: readonly EvalLike[]): Classifications {
  return { ...(currentEvaluation(evals)?.classifications ?? {}) };
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

/** Série temporal oficial: cada ponto conserva o registro da própria data. */
export function consolidatedSeries(evals: readonly EvalLike[]): Snapshot[] {
  return chronological(evals).map((ev) => {
    const classifications = { ...(ev.classifications ?? {}) };
    return {
      id: ev.id,
      evaluated_at: ev.evaluated_at,
      classifications,
      recorded: { ...(ev.classifications ?? {}) },
      index: prometricIndex(classifications),
    };
  });
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
    if (typeof v === "number") return { value: v, source: ordered[i] };
  }
  return { value: null, source: ordered[ordered.length - 1] ?? null };
}

/**
 * Normaliza apenas a ordem e preserva exatamente as classificações registradas
 * em cada avaliação. O campo auxiliar explicita o valor original para telas de
 * auditoria, sem mudar os dados clínicos.
 */
export function withConsolidatedView<T extends EvalLike>(
  evals: readonly T[],
): (T & { recorded_classifications: Classifications })[] {
  return chronological(evals).map((ev) => {
    return {
      ...ev,
      recorded_classifications: { ...(ev.classifications ?? {}) },
      classifications: { ...(ev.classifications ?? {}) },
    };
  });
}
