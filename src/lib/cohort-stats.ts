// Aggregations for class/group dashboards from raw RPC payloads.
import type { Classifications, ClassificationKey, Zone } from "./proesp";
import { ZONES } from "./proesp";
import {
  PM_CATEGORIES, PM_DIMENSIONS, prometricIndex, scoreToCategory,
  zoneToCategory,
  type PMCategory, type PMDimension,
} from "./prometric-method";

export type CohortStudentLatest = {
  student_id: string;
  full_name: string;
  sex: "male" | "female" | string;
  birth_date: string | null;
  age_years: number | null;
  evaluated_at: string;
  classifications: Classifications | null;
  weight_kg: number | null;
  height_cm: number | null;
  imc: number | null;
  sit_and_reach_cm: number | null;
  abdominal_reps: number | null;
  horizontal_jump_cm: number | null;
  medicine_ball_m: number | null;
  square_test_s: number | null;
  sprint_20m_s: number | null;
  run_6min_m: number | null;
  class_id?: string | null;
  class_name?: string | null;
};

export type CohortFirst = {
  student_id: string;
  evaluated_at: string;
  classifications: Classifications | null;
};

export type StudentScore = {
  student_id: string;
  full_name: string;
  score: number;          // 0..100
  category: PMCategory | null;
  evolution: number | null; // delta vs first eval (percentage points)
};

export type DistributionRow = { category: PMCategory; count: number; pct: number; color: string };

export type DimensionAvg = { dimension: PMDimension; score: number };

export type CohortAggregates = {
  studentCount: number;
  evaluatedCount: number;
  avgScore: number;
  avgCategory: PMCategory | null;
  distribution: DistributionRow[];
  dimensions: DimensionAvg[];
  students: StudentScore[];
  atRisk: StudentScore[];
  topGains: StudentScore[];
};

const CATEGORY_COLOR: Record<PMCategory, string> = {
  "Prioritário": "#ef4444",
  "Atenção": "#f59e0b",
  "Em Desenvolvimento": "#a855f7",
  "Bom": "#6366f1",
  "Excelente": "#22c55e",
};

export function aggregateCohort(
  studentsLatest: CohortStudentLatest[],
  studentsFirst: CohortFirst[],
): CohortAggregates {
  const firstMap = new Map(studentsFirst.map((f) => [f.student_id, f]));

  const students: StudentScore[] = studentsLatest.map((s) => {
    const c = (s.classifications ?? {}) as Classifications;
    const idx = prometricIndex(c);
    const first = firstMap.get(s.student_id);
    let evolution: number | null = null;
    if (first && first.classifications && first.evaluated_at !== s.evaluated_at) {
      const baseIdx = prometricIndex(first.classifications as Classifications);
      evolution = idx.score - baseIdx.score;
    }
    return {
      student_id: s.student_id,
      full_name: s.full_name,
      score: idx.score,
      category: idx.category,
      evolution,
    };
  });

  const evaluatedCount = students.length;
  const avgScore = evaluatedCount
    ? Math.round(students.reduce((a, s) => a + s.score, 0) / evaluatedCount)
    : 0;
  const avgCategory = evaluatedCount ? scoreToCategory(avgScore) : null;

  // Distribution
  const distCounts: Record<PMCategory, number> = {
    "Prioritário": 0, "Atenção": 0, "Em Desenvolvimento": 0, "Bom": 0, "Excelente": 0,
  };
  for (const s of students) if (s.category) distCounts[s.category]++;
  const distribution: DistributionRow[] = PM_CATEGORIES.map((cat) => ({
    category: cat,
    count: distCounts[cat],
    pct: evaluatedCount ? Math.round((distCounts[cat] / evaluatedCount) * 100) : 0,
    color: CATEGORY_COLOR[cat],
  }));

  // Dimensions
  const dimSums: Record<PMDimension, { sum: number; n: number }> = {} as Record<PMDimension, { sum: number; n: number }>;
  PM_DIMENSIONS.forEach((d) => (dimSums[d] = { sum: 0, n: 0 }));
  for (const s of studentsLatest) {
    const idx = prometricIndex((s.classifications ?? {}) as Classifications);
    for (const d of idx.dimensions) {
      if (d.category) {
        dimSums[d.dimension].sum += d.score;
        dimSums[d.dimension].n++;
      }
    }
  }
  const dimensions: DimensionAvg[] = PM_DIMENSIONS.map((d) => ({
    dimension: d,
    score: dimSums[d].n ? Math.round(dimSums[d].sum / dimSums[d].n) : 0,
  }));

  const atRisk = students
    .filter((s) => s.category === "Prioritário" || s.category === "Atenção")
    .sort((a, b) => a.score - b.score);

  const topGains = students
    .filter((s) => s.evolution != null)
    .sort((a, b) => (b.evolution ?? 0) - (a.evolution ?? 0))
    .slice(0, 10);

  return {
    studentCount: studentsLatest.length,
    evaluatedCount,
    avgScore,
    avgCategory,
    distribution,
    dimensions,
    students: students.sort((a, b) => b.score - a.score),
    atRisk,
    topGains,
  };
}

// Aggregate peer classifications array to dimension averages (for comparisons).
export function peerDimensions(classificationsArr: (Classifications | null)[]): DimensionAvg[] {
  const dimSums: Record<PMDimension, { sum: number; n: number }> = {} as Record<PMDimension, { sum: number; n: number }>;
  PM_DIMENSIONS.forEach((d) => (dimSums[d] = { sum: 0, n: 0 }));
  for (const c of classificationsArr) {
    if (!c) continue;
    const idx = prometricIndex(c);
    for (const d of idx.dimensions) {
      if (d.category) {
        dimSums[d.dimension].sum += d.score;
        dimSums[d.dimension].n++;
      }
    }
  }
  return PM_DIMENSIONS.map((d) => ({
    dimension: d,
    score: dimSums[d].n ? Math.round(dimSums[d].sum / dimSums[d].n) : 0,
  }));
}

// Top N students by a given raw indicator field; respects higher/lower-better.
export function topByIndicator(
  students: CohortStudentLatest[],
  field: keyof CohortStudentLatest,
  higherBetter: boolean,
  limit = 10,
): { student_id: string; full_name: string; value: number }[] {
  const rows = students
    .map((s) => ({ student_id: s.student_id, full_name: s.full_name, value: Number(s[field]) }))
    .filter((r) => Number.isFinite(r.value));
  rows.sort((a, b) => (higherBetter ? b.value - a.value : a.value - b.value));
  return rows.slice(0, limit);
}

export { CATEGORY_COLOR };
export type { PMCategory, PMDimension };
