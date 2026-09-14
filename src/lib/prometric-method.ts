// Método ProMetric® — Camada pública de identidade metodológica.
// Encapsula internamente os cálculos científicos do projeto e expõe ao
// usuário final um vocabulário próprio: 5 categorias, 5 dimensões e um
// Índice ProMetric (0–100). Os cálculos permanecem em `proesp.ts`.

import { ZONES, type Classifications, type Zone, type ClassificationKey, zoneScore } from "./proesp";

export type PMCategory =
  | "Prioritário"
  | "Atenção"
  | "Em Desenvolvimento"
  | "Bom"
  | "Excelente";

export const PM_CATEGORIES: PMCategory[] = [
  "Prioritário",
  "Atenção",
  "Em Desenvolvimento",
  "Bom",
  "Excelente",
];

// Mapeia as 6 zonas internas para as 5 categorias ProMetric.
export function zoneToCategory(z: Zone | null | undefined): PMCategory | null {
  if (!z) return null;
  switch (z) {
    case "Muito Fraco": return "Prioritário";
    case "Fraco":       return "Atenção";
    case "Razoável":    return "Em Desenvolvimento";
    case "Bom":         return "Bom";
    case "Muito Bom":   return "Excelente";
    case "Excelente":   return "Excelente";
  }
}

// Cor semântica (token shadcn) por categoria ProMetric.
export function categoryColor(c: PMCategory | null | undefined) {
  switch (c) {
    case "Excelente":          return "bg-success/20 text-success border-success/30";
    case "Bom":                return "bg-primary/15 text-primary border-primary/30";
    case "Em Desenvolvimento": return "bg-accent/20 text-accent-foreground border-accent/30";
    case "Atenção":            return "bg-warning/20 text-warning border-warning/30";
    case "Prioritário":        return "bg-destructive/15 text-destructive border-destructive/30";
    default:                   return "bg-muted text-muted-foreground border-border";
  }
}

// Hex (para Recharts) por categoria.
export const CATEGORY_HEX: Record<PMCategory, string> = {
  "Prioritário":        "#ef4444",
  "Atenção":            "#f59e0b",
  "Em Desenvolvimento": "#a855f7",
  "Bom":                "#6366f1",
  "Excelente":          "#22c55e",
};

// ─── DIMENSÕES PROMETRIC ───────────────────────────────────────────────
// 5 grandes dimensões agregando os testes internos.
export type PMDimension =
  | "Saúde Corporal"
  | "Resistência"
  | "Mobilidade"
  | "Potência"
  | "Velocidade e Agilidade";

export const PM_DIMENSIONS: PMDimension[] = [
  "Saúde Corporal",
  "Resistência",
  "Mobilidade",
  "Potência",
  "Velocidade e Agilidade",
];

// Mapeamento dimensão → chaves internas de classificação.
const DIM_TO_KEYS: Record<PMDimension, ClassificationKey[]> = {
  "Saúde Corporal":         ["imc", "rce"],
  "Resistência":            ["run6", "abdo"],
  "Mobilidade":             ["flex"],
  "Potência":               ["jump", "mball"],
  "Velocidade e Agilidade": ["sprint", "square"],
};

// Converte a média de zoneScore (1..6) → escala 0..100.
function avgToScore100(scores: number[]): number {
  if (scores.length === 0) return 0;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  // 1 → 0 ; 6 → 100
  return Math.round(((avg - 1) / 5) * 100);
}

// Score 0..100 → categoria.
export function scoreToCategory(score: number): PMCategory {
  if (score < 25) return "Prioritário";
  if (score < 45) return "Atenção";
  if (score < 65) return "Em Desenvolvimento";
  if (score < 85) return "Bom";
  return "Excelente";
}

export type PMDimensionResult = {
  dimension: PMDimension;
  score: number;          // 0..100
  category: PMCategory | null;
};

export function dimensionScores(c: Classifications): PMDimensionResult[] {
  return PM_DIMENSIONS.map((d) => {
    const keys = DIM_TO_KEYS[d];
    const zs = keys.map((k) => c[k]).filter(Boolean) as Zone[];
    const scores = zs.map((z) => zoneScore(z));
    if (scores.length === 0) return { dimension: d, score: 0, category: null };
    const s = avgToScore100(scores);
    return { dimension: d, score: s, category: scoreToCategory(s) };
  });
}

export type PMOverall = {
  score: number;            // 0..100
  category: PMCategory | null;
  dimensions: PMDimensionResult[];
  filledTests: number;      // nº de testes preenchidos (0..9)
  partial: boolean;         // true se abaixo do mínimo para classificar
};

// Mínimo de testes para emitir o Índice ProMetric com categoria.
export const MIN_TESTS_FOR_INDEX = 4;
export const INSUFFICIENT_DATA_LABEL = "Dados insuficientes para classificação.";

// Índice ProMetric® — score geral 0..100 com categoria e radar por dimensão.
export function prometricIndex(c: Classifications): PMOverall {
  const dims = dimensionScores(c);
  const filledTests = (Object.values(c).filter(Boolean) as Zone[]).length;
  const partial = filledTests < MIN_TESTS_FOR_INDEX;
  const filled = dims.filter((d) => d.category !== null);
  if (filled.length === 0) return { score: 0, category: null, dimensions: dims, filledTests, partial: true };
  const avg = Math.round(filled.reduce((a, d) => a + d.score, 0) / filled.length);
  return {
    score: avg,
    category: partial ? null : scoreToCategory(avg),
    dimensions: dims,
    filledTests,
    partial,
  };
}

// Útil para charts agregados: distribuição de categorias a partir de zonas.
export function categoryDistribution(zones: (Zone | null | undefined)[]): Record<PMCategory, number> {
  const acc: Record<PMCategory, number> = {
    "Prioritário": 0, "Atenção": 0, "Em Desenvolvimento": 0, "Bom": 0, "Excelente": 0,
  };
  for (const z of zones) {
    const c = zoneToCategory(z);
    if (c) acc[c]++;
  }
  return acc;
}

// Mantém referência implícita aos tipos internos para evitar tree-shaking
// inesperado e documentar a abstração.
export const _internalRef = { ZONES };
