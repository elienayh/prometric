// ============================================================================
// ProMetric® — Módulo Central Unificado de Resultados por Indicador (Fase 1)
// ----------------------------------------------------------------------------
// Fonte única de leitura para todas as superfícies (Cartões, Análise Automática,
// IA, Portal do Aluno e Relatórios PDF).
// NÃO recalcula limites nem inventa classificações: consome as definições
// oficiais de `proesp.ts`, `prometric-method.ts`, `prometric-reference.ts`
// e `imc-reference.ts`.
// ============================================================================

import {
  type ClassificationKey,
  type Classifications,
  type Zone,
  type ExpectedRange,
  TEST_META,
  expectedRangeFor,
  MIN_TESTS_FOR_CLASSIFICATION,
  filledTestsCount,
} from "./proesp";
import {
  type PMCategory,
  type PMDimension,
  PM_DIMENSIONS,
  prometricIndex,
  dimensionScores,
  zoneToCategory,
  scoreToCategory,
} from "./prometric-method";
import {
  type PRSituation,
  zoneToSituation,
  scoreToSituation,
  situationSentence,
  EXPECTED_INDEX_RANGE,
} from "./prometric-reference";
import {
  imcBand,
  imcAdultBand,
  IMC_BAND_LABEL,
  imcFamilyGuidance,
  IMC_CLINICAL_DISCLAIMER,
  type ImcBand,
} from "./imc-reference";
import {
  chronological,
  consolidatedClassifications,
  type EvalLike,
} from "./student-metrics";
import { resolveAge, type ResolvedAge } from "./age";

export type ClinicalStatus = "adequate" | "attention" | "critical" | "unknown";

export type SingleIndicatorResult = {
  key: ClassificationKey;
  label: string;
  unit: string;
  field: string;
  better: "higher" | "lower" | "health";
  hasData: boolean;
  value: number | null;
  displayValue: string;
  measuredAt: string | null;
  evalId: string | null;
  sourceEval: EvalLike | null;
  zone: Zone | null;
  category: PMCategory | null;
  clinicalStatus: ClinicalStatus;
  clinicalLabel: string;
  situation: PRSituation | null;
  expectedRange: ExpectedRange | null;
  rangeLabel: string;
  diffFromPrevious: {
    diffPercent: number | null;
    diffAbsolute: number | null;
    isPositiveChange: boolean | null; // null para indicadores de saúde (IMC/RCE)
    previousValue: number | null;
    previousDate: string | null;
  } | null;
};

export type EvaluationCounts = {
  totalRegistered: number;
  classified: number;
  partial: number;
};

export type DimensionResultUnified = {
  dimension: PMDimension;
  hasData: boolean;
  score: number | null; // null quando não há testes realizados (NUNCA 0)
  displayScore: string; // "—" quando null
  category: PMCategory | null;
  testsCount: number;
};

export type EvolutionAnalysis = {
  firstRecord: EvalLike | null;
  firstClassified: EvalLike | null;
  previousEvaluation: EvalLike | null;
  currentEvaluation: EvalLike | null;
  
  // Base utilizada para comparação do índice geral
  comparableBase: EvalLike | null;
  isSameComposition: boolean;
  currentDimensions: PMDimension[];
  baseDimensions: PMDimension[];
  
  currentScore: number;
  baseScore: number | null;
  deltaScore: number | null;
  trajectory: "positive" | "negative" | "stable" | "incomparable" | "baseline";
  summaryText: string;
};

export type StudentConsolidatedPackage = {
  student: {
    id?: string;
    fullName: string;
    sex: "male" | "female";
    birthDate: string | null;
    age: ResolvedAge;
  };
  counts: EvaluationCounts;
  indicators: Record<ClassificationKey, SingleIndicatorResult>;
  indicatorsList: SingleIndicatorResult[];
  dimensions: DimensionResultUnified[];
  index: {
    score: number;
    category: PMCategory | null;
    situation: PRSituation | null;
    partial: boolean;
    filledTests: number;
    totalPossibleTests: number;
    expectedRange: { min: number; max: number };
  };
  evolution: EvolutionAnalysis;
  disclaimers: {
    imc: string;
    missingDimensionWarning: string | null;
  };
};

/** Mapeamento de 6 zonas PROESP → 3 níveis do cartão clínico */
export function zoneToClinicalStatus(z: Zone | null | undefined): ClinicalStatus {
  if (!z) return "unknown";
  if (z === "Muito Fraco") return "critical";
  if (z === "Fraco") return "attention";
  return "adequate"; // Razoável, Bom, Muito Bom, Excelente
}

export function clinicalStatusLabel(status: ClinicalStatus): string {
  switch (status) {
    case "adequate": return "Adequado";
    case "attention": return "Atenção";
    case "critical": return "Crítico";
    default: return "Sem dado";
  }
}

/** Formata número de forma consistente conforme unidade */
export function formatIndicatorNumber(v: number | null | undefined, unit: string): string {
  if (v == null || isNaN(v)) return "—";
  if (unit === "kg/m²" || unit === "" || unit === "s" || unit === "m") {
    return v.toFixed(unit === "" ? 2 : 1);
  }
  return String(Math.round(v));
}

function extractNumber(evalItem: EvalLike, field: string): number | null {
  const rec = (evalItem as unknown as Record<string, unknown>).recorded_values as Record<string, unknown> | undefined;
  if (rec && typeof rec[field] === "number" && !isNaN(rec[field] as number)) {
    return rec[field] as number;
  }
  const v = (evalItem as unknown as Record<string, unknown>)[field];
  if (typeof v === "number" && !isNaN(v)) return v;
  return null;
}

/**
 * REGRA VIGENTE: Dimensão ausente (ex.: Resistência sem teste) é excluída da média do
 * Índice ProMetric, e o índice geral é calculado como a média simples apenas das dimensões
 * com testes realizados.
 * RISCO METODOLÓGICO: Um aluno pode obter índice "Bom" ou "Excelente" avaliando apenas
 * valências neuromusculares (potência, velocidade) sem nunca ter sua capacidade cardiorrespiratória
 * ou composição corporal testadas.
 */
export function buildStudentConsolidatedPackage(
  studentInput: {
    id?: string;
    full_name?: string;
    fullName?: string;
    sex?: string | null;
    birth_date?: string | null;
    birthDate?: string | null;
  },
  evalsInput: readonly EvalLike[],
): StudentConsolidatedPackage {
  const ordered = chronological(evalsInput);
  const fullName = studentInput.full_name || studentInput.fullName || "Aluno(a)";
  const sex: "male" | "female" = studentInput.sex === "female" ? "female" : "male";
  const birthDate = studentInput.birth_date || studentInput.birthDate || null;

  // 1. Contagens oficiais rigorosas
  const totalRegistered = ordered.length;
  let classifiedCount = 0;
  let partialCount = 0;

  for (const ev of ordered) {
    const cls = ev.classifications ?? {};
    const filled = filledTestsCount(cls);
    if (filled >= MIN_TESTS_FOR_CLASSIFICATION) {
      classifiedCount++;
    } else {
      partialCount++;
    }
  }

  const counts: EvaluationCounts = {
    totalRegistered,
    classified: classifiedCount,
    partial: partialCount,
  };

  // 2. Avaliações cronológicas marcadas
  const firstRecord = ordered[0] ?? null;
  const firstClassified = ordered.find((e) => filledTestsCount(e.classifications ?? {}) >= MIN_TESTS_FOR_CLASSIFICATION) ?? null;
  const currentEvaluation = ordered[ordered.length - 1] ?? null;
  const previousEvaluation = ordered.length >= 2 ? ordered[ordered.length - 2] : null;

  // Idade resolvida para a avaliação atual
  const refDate = currentEvaluation?.evaluated_at ? currentEvaluation.evaluated_at : new Date();
  const fallbackAgeYears = currentEvaluation ? (currentEvaluation as any).age_years : null;
  const fallbackAgeMonths = currentEvaluation ? (currentEvaluation as any).age_months : null;
  const resolvedAge = resolveAge(birthDate, refDate, fallbackAgeYears, fallbackAgeMonths);

  // 3. Classificações consolidadas de todo o histórico
  const consolidated = consolidatedClassifications(ordered);
  const pmIndex = prometricIndex(consolidated);

  // 4. Indicadores individuais unificados
  const indicatorsRecord: Partial<Record<ClassificationKey, SingleIndicatorResult>> = {};

  const keys: ClassificationKey[] = ["imc", "rce", "flex", "abdo", "jump", "mball", "square", "sprint", "run6"];

  for (const key of keys) {
    const meta = TEST_META[key];
    
    // Procura a sessão mais recente que contém dado deste teste
    const withValue = ordered.filter((e) => {
      const v = extractNumber(e, meta.field);
      return v != null;
    });

    const sourceEval = withValue[withValue.length - 1] ?? null;
    const value = sourceEval ? extractNumber(sourceEval, meta.field) : null;
    const hasData = value != null;
    const measuredAt = sourceEval?.evaluated_at ?? null;
    const evalId = sourceEval?.id ?? null;

    // Zona oficial da fonte única consolidada
    const zone = consolidated[key] ?? null;
    const category = zoneToCategory(zone);
    const clinicalStatus = zoneToClinicalStatus(zone);
    const situation = zoneToSituation(zone);

    // Faixa de referência
    const rangeAge = sourceEval && (sourceEval as any).age_years != null ? (sourceEval as any).age_years : resolvedAge.years;
    const rangeMonths = sourceEval && (sourceEval as any).age_months != null ? (sourceEval as any).age_months : resolvedAge.months;
    const expectedRange = rangeAge != null ? expectedRangeFor(key, rangeAge, sex, rangeMonths ?? undefined) : null;
    const rangeLabel = expectedRange
      ? `${formatIndicatorNumber(expectedRange.min, meta.unit)}–${formatIndicatorNumber(expectedRange.max, meta.unit)}${meta.unit ? ` ${meta.unit}` : ""}`
      : "—";

    // Variação em relação à medição anterior deste mesmo indicador
    let diffFromPrevious: SingleIndicatorResult["diffFromPrevious"] = null;
    if (withValue.length >= 2 && value != null) {
      const prevEval = withValue[withValue.length - 2];
      const prevVal = extractNumber(prevEval, meta.field);
      if (prevVal != null && prevVal !== 0) {
        const diffAbs = value - prevVal;
        const diffPct = (diffAbs / prevVal) * 100;
        let isPos: boolean | null = null;
        if (meta.better === "higher") isPos = diffAbs >= 0;
        else if (meta.better === "lower") isPos = diffAbs <= 0;
        else isPos = null; // health (IMC/RCE): neutro!

        diffFromPrevious = {
          diffPercent: diffPct,
          diffAbsolute: diffAbs,
          isPositiveChange: isPos,
          previousValue: prevVal,
          previousDate: prevEval.evaluated_at,
        };
      }
    }

    // Label clínico específico para IMC
    let clinicalLabel = clinicalStatusLabel(clinicalStatus);
    if (key === "imc" && value != null) {
      if (resolvedAge.years == null) {
        clinicalLabel = "Sem referência";
      } else {
        const months = (sourceEval as any)?.age_months ?? (resolvedAge.years >= 20 ? 240 : resolvedAge.months ?? resolvedAge.years * 12 + 6);
        const band = resolvedAge.years >= 20 ? imcAdultBand(value) : imcBand(value, sex, months);
        clinicalLabel = IMC_BAND_LABEL[band];
      }
    }

    indicatorsRecord[key] = {
      key,
      label: meta.label,
      unit: meta.unit,
      field: meta.field,
      better: meta.better,
      hasData,
      value,
      displayValue: formatIndicatorNumber(value, meta.unit),
      measuredAt,
      evalId,
      sourceEval,
      zone,
      category,
      clinicalStatus,
      clinicalLabel,
      situation,
      expectedRange,
      rangeLabel,
      diffFromPrevious,
    };
  }

  const indicatorsList = keys.map((k) => indicatorsRecord[k]!);

  // 5. Dimensões unificadas com tratamento rigoroso para dados ausentes (NUNCA 0)
  const rawDims = dimensionScores(consolidated);
  const dimensions: DimensionResultUnified[] = rawDims.map((rd) => {
    const hasData = rd.category !== null;
    return {
      dimension: rd.dimension,
      hasData,
      score: hasData ? rd.score : null, // null se não tem dados (evita ponto 0 no radar)
      displayScore: hasData ? String(rd.score) : "—",
      category: rd.category,
      testsCount: hasData ? 1 : 0,
    };
  });

  // 6. Análise de evolução rigorosa (somente entre avaliações comparáveis ou sinalizando composição)
  const currentDimsPresent = dimensions.filter((d) => d.hasData).map((d) => d.dimension);
  
  // Base para evolução: primeira avaliação classificada ou avaliação anterior classificada
  let comparableBase: EvalLike | null = null;
  let baseDimsPresent: PMDimension[] = [];
  let isSameComposition = false;
  let baseScore: number | null = null;
  let deltaScore: number | null = null;
  let trajectory: EvolutionAnalysis["trajectory"] = "baseline";
  let summaryText = "";

  if (firstClassified && currentEvaluation && firstClassified.id !== currentEvaluation.id) {
    comparableBase = firstClassified;
    const baseConsolidated = consolidatedClassifications(
      ordered.filter((e) => e.evaluated_at <= firstClassified.evaluated_at)
    );
    const baseDims = dimensionScores(baseConsolidated);
    baseDimsPresent = baseDims.filter((d) => d.category !== null).map((d) => d.dimension);
    
    // Verifica se as dimensões presentes são exatamente iguais
    isSameComposition =
      currentDimsPresent.length === baseDimsPresent.length &&
      currentDimsPresent.every((d) => baseDimsPresent.includes(d));

    const baseIndex = prometricIndex(baseConsolidated);
    baseScore = baseIndex.score;
    deltaScore = pmIndex.score - baseScore;

    if (!isSameComposition) {
      trajectory = "incomparable";
      summaryText = `A composição de testes mudou entre as avaliações (de ${baseDimsPresent.length} para ${currentDimsPresent.length} dimensões avaliadas). A variação de pontuação reflete a inclusão de novas capacidades corporais, e não puramente ganho ou perda física.`;
    } else if (deltaScore > 0) {
      trajectory = "positive";
      summaryText = `Evolução positiva: o Índice ProMetric avançou de ${baseScore} para ${pmIndex.score} pontos (+${deltaScore} pts) mantendo a mesma base de dimensões corporais.`;
    } else if (deltaScore < 0) {
      trajectory = "negative";
      summaryText = `Atenção: o Índice ProMetric oscilou de ${baseScore} para ${pmIndex.score} pontos (${deltaScore} pts) na mesma composição dimensional, indicando necessidade de suporte direcionado.`;
    } else {
      trajectory = "stable";
      summaryText = `Desempenho estável: manutenção do Índice ProMetric em ${pmIndex.score} pontos com as mesmas dimensões avaliadas.`;
    }
  } else if (totalRegistered <= 1 || !firstClassified) {
    trajectory = "baseline";
    summaryText = `Avaliação diagnóstica inicial de referência. As próximas reavaliações classificadas permitirão mensurar a evolução longitudinal.`;
  } else {
    trajectory = "baseline";
    summaryText = `Avaliações parciais registradas. Aguardando conclusão de ao menos 4 testes para cálculo de trajetória.`;
  }

  // 7. Alertas de dimensões ausentes
  const missingDims = PM_DIMENSIONS.filter((d) => !currentDimsPresent.includes(d));
  const missingDimensionWarning = missingDims.length > 0
    ? `Índice calculado com base em ${currentDimsPresent.length}/5 dimensões. Valências não testadas: ${missingDims.join(", ")}.`
    : null;

  return {
    student: {
      id: studentInput.id,
      fullName,
      sex,
      birthDate,
      age: resolvedAge,
    },
    counts,
    indicators: indicatorsRecord as Record<ClassificationKey, SingleIndicatorResult>,
    indicatorsList,
    dimensions,
    index: {
      score: pmIndex.score,
      category: pmIndex.category,
      situation: scoreToSituation(pmIndex.score, pmIndex.partial),
      partial: pmIndex.partial,
      filledTests: pmIndex.filledTests,
      totalPossibleTests: 9,
      expectedRange: EXPECTED_INDEX_RANGE,
    },
    evolution: {
      firstRecord,
      firstClassified,
      previousEvaluation,
      currentEvaluation,
      comparableBase,
      isSameComposition,
      currentDimensions: currentDimsPresent,
      baseDimensions: baseDimsPresent,
      currentScore: pmIndex.score,
      baseScore,
      deltaScore,
      trajectory,
      summaryText,
    },
    disclaimers: {
      imc: IMC_CLINICAL_DISCLAIMER,
      missingDimensionWarning,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Comparação com Turma / Escola (Isolada, Exclusão do Aluno e Neutra em Saúde)
// ────────────────────────────────────────────────────────────────────────────

export type CohortComparisonResult = {
  indicatorKey: ClassificationKey;
  label: string;
  unit: string;
  studentValue: number | null;
  classmateCount: number;
  classmateAverage: number | null;
  displayAverage: string;
  diffPercent: number | null;
  displayDiff: string;
  isNeutral: boolean;
  statusTone: "positive" | "negative" | "neutral" | "none";
};

export function compareStudentWithClassmates(
  studentVal: number | null,
  classmateEvals: readonly EvalLike[],
  field: string,
  indicatorKey: ClassificationKey,
  studentId?: string,
): CohortComparisonResult {
  const meta = TEST_META[indicatorKey];
  const isNeutral = meta.better === "health";

  // Exclui estritamente o próprio aluno da média dos colegas
  const validPeers = classmateEvals.filter((e) => {
    if (studentId && (e as any).student_id === studentId) return false;
    const v = extractNumber(e, field);
    return v != null;
  });

  const peerValues = validPeers.map((e) => extractNumber(e, field)!).filter((x): x is number => x != null);

  if (peerValues.length === 0 || studentVal == null) {
    return {
      indicatorKey,
      label: meta.label,
      unit: meta.unit,
      studentValue: studentVal,
      classmateCount: peerValues.length,
      classmateAverage: null,
      displayAverage: "—",
      diffPercent: null,
      displayDiff: "—",
      isNeutral,
      statusTone: "none",
    };
  }

  // Média exata não arredondada
  const exactAvg = peerValues.reduce((a, b) => a + b, 0) / peerValues.length;
  const exactDiff = ((studentVal - exactAvg) / exactAvg) * 100;

  // Formatação com a mesma precisão decimal para evitar discrepâncias visuais
  const displayAverage = formatIndicatorNumber(exactAvg, meta.unit);
  const displayDiff = `${exactDiff > 0 ? "+" : ""}${exactDiff.toFixed(1)}%`;

  let statusTone: CohortComparisonResult["statusTone"] = "neutral";
  if (!isNeutral) {
    if (meta.better === "higher") {
      statusTone = exactDiff >= 0 ? "positive" : "negative";
    } else {
      statusTone = exactDiff <= 0 ? "positive" : "negative";
    }
  }

  return {
    indicatorKey,
    label: meta.label,
    unit: meta.unit,
    studentValue: studentVal,
    classmateCount: peerValues.length,
    classmateAverage: exactAvg,
    displayAverage,
    diffPercent: exactDiff,
    displayDiff,
    isNeutral,
    statusTone,
  };
}
