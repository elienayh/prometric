// Aggregations for class/group dashboards from raw RPC payloads.
import { supabase } from "@/integrations/supabase/client";
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

export type StatsPayload = {
  header: {
    id: string;
    name: string;
    grade: string | null;
    school_year: number | null;
    shift: string | null;
    school_id: string | null;
    school_name: string | null;
    students_count: number;
    evaluations_count: number;
    last_evaluation_at: string | null;
  };
  students_latest: CohortStudentLatest[];
  students_first: CohortFirst[];
  school_latest: (Record<string, string> | null)[];
};

export type GroupStatsPayload = {
  header: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    students_count: number;
    evaluations_count: number;
    last_evaluation_at: string | null;
  };
  students_latest: CohortStudentLatest[];
  students_first: CohortFirst[];
  origin_classes_latest: (Record<string, string> | null)[];
  school_latest: (Record<string, string> | null)[];
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

/**
 * Carrega estatísticas completas de uma turma com garantia de resiliência.
 * Tenta a RPC `class_stats` primeiro e, se a RPC retornar nulo, falhar ou
 * vier com lista vazia de avaliações enquanto há avaliações cadastradas,
 * consulta diretamente as tabelas `classes`, `students` e `evaluations`.
 */
export async function fetchClassCohortStats(classId: string): Promise<StatsPayload | null> {
  let rpcData: StatsPayload | null = null;
  try {
    const { data, error } = await supabase.rpc("class_stats", { _class: classId });
    if (!error && data) {
      rpcData = data as unknown as StatsPayload;
    }
  } catch {
    // fallback para tabelas diretas
  }

  // Se a RPC retornou dados e possui avaliações consolidadas, retorna direto
  if (rpcData && Array.isArray(rpcData.students_latest) && rpcData.students_latest.length > 0) {
    return rpcData;
  }

  // Fallback: consulta direta às tabelas para alimentar os dados da turma
  const { data: classRow } = await supabase
    .from("classes")
    .select("id, name, grade, school_year, shift, school_id, school:schools(name)")
    .eq("id", classId)
    .maybeSingle();

  if (!classRow) {
    return rpcData ?? null;
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, sex, birth_date, is_active, class_id")
    .eq("class_id", classId)
    .order("full_name");

  const studentList = students ?? [];
  const sids = studentList.map((s) => s.id);

  let evaluations: any[] = [];
  if (sids.length > 0) {
    const { data: evals } = await supabase
      .from("evaluations")
      .select("id, student_id, evaluated_at, age_years, weight_kg, height_cm, imc, rce, sit_and_reach_cm, abdominal_reps, horizontal_jump_cm, medicine_ball_m, square_test_s, sprint_20m_s, run_6min_m, classifications")
      .in("student_id", sids)
      .order("evaluated_at", { ascending: false });
    evaluations = evals ?? [];
  }

  const studentMap = new Map(studentList.map((s) => [s.id, s]));
  const evalsByStudent = new Map<string, any[]>();
  for (const e of evaluations) {
    const arr = evalsByStudent.get(e.student_id) ?? [];
    arr.push(e);
    evalsByStudent.set(e.student_id, arr);
  }

  const students_latest: CohortStudentLatest[] = [];
  const students_first: CohortFirst[] = [];

  for (const [sid, sEvals] of evalsByStudent.entries()) {
    const st = studentMap.get(sid);
    if (!st || !sEvals.length) continue;
    const latest = sEvals[0]; // mais recente
    const first = sEvals[sEvals.length - 1]; // primeira

    students_latest.push({
      student_id: sid,
      full_name: st.full_name,
      sex: st.sex,
      birth_date: st.birth_date,
      age_years: latest.age_years ?? null,
      evaluated_at: latest.evaluated_at,
      classifications: (latest.classifications ?? null) as Classifications | null,
      weight_kg: latest.weight_kg ?? null,
      height_cm: latest.height_cm ?? null,
      imc: latest.imc ?? null,
      sit_and_reach_cm: latest.sit_and_reach_cm ?? null,
      abdominal_reps: latest.abdominal_reps ?? null,
      horizontal_jump_cm: latest.horizontal_jump_cm ?? null,
      medicine_ball_m: latest.medicine_ball_m ?? null,
      square_test_s: latest.square_test_s ?? null,
      sprint_20m_s: latest.sprint_20m_s ?? null,
      run_6min_m: latest.run_6min_m ?? null,
      class_id: classId,
      class_name: classRow.name,
    });

    students_first.push({
      student_id: sid,
      evaluated_at: first.evaluated_at,
      classifications: (first.classifications ?? null) as Classifications | null,
    });
  }

  let school_latest = rpcData?.school_latest ?? [];
  if (!school_latest.length && classRow.school_id) {
    try {
      const { data: schoolClasses } = await supabase.from("classes").select("id").eq("school_id", classRow.school_id);
      const cids = (schoolClasses ?? []).map((c) => c.id);
      if (cids.length) {
        const { data: schStudents } = await supabase.from("students").select("id").in("class_id", cids).limit(250);
        const schSids = (schStudents ?? []).map((s) => s.id);
        if (schSids.length) {
          const { data: schEvals } = await supabase.from("evaluations").select("student_id, classifications, evaluated_at").in("student_id", schSids).order("evaluated_at", { ascending: false });
          const seen = new Set<string>();
          const pList: any[] = [];
          for (const se of schEvals ?? []) {
            if (!seen.has(se.student_id)) {
              seen.add(se.student_id);
              pList.push(se.classifications);
            }
          }
          school_latest = pList;
        }
      }
    } catch {
      // ignore
    }
  }

  const lastEvaluationAt = evaluations.length > 0 ? evaluations[0].evaluated_at : (rpcData?.header?.last_evaluation_at ?? null);

  return {
    header: {
      id: classRow.id,
      name: classRow.name,
      grade: classRow.grade ?? rpcData?.header?.grade ?? null,
      school_year: classRow.school_year ?? rpcData?.header?.school_year ?? null,
      shift: classRow.shift ?? rpcData?.header?.shift ?? null,
      school_id: classRow.school_id ?? rpcData?.header?.school_id ?? null,
      school_name: (classRow.school as any)?.name ?? rpcData?.header?.school_name ?? null,
      students_count: studentList.length,
      evaluations_count: evaluations.length,
      last_evaluation_at: lastEvaluationAt,
    },
    students_latest: students_latest.length > 0 ? students_latest : (rpcData?.students_latest ?? []),
    students_first: students_first.length > 0 ? students_first : (rpcData?.students_first ?? []),
    school_latest,
  };
}

/**
 * Carrega estatísticas completas de um grupo com garantia de resiliência.
 * Tenta a RPC `group_stats` primeiro e, se a RPC retornar nulo ou
 * vier com lista vazia enquanto há avaliações cadastradas,
 * consulta diretamente as tabelas `groups`, `students` e `evaluations`.
 */
export async function fetchGroupCohortStats(groupId: string): Promise<GroupStatsPayload | null> {
  let rpcData: GroupStatsPayload | null = null;
  try {
    const { data, error } = await supabase.rpc("group_stats", { _group: groupId });
    if (!error && data) {
      rpcData = data as unknown as GroupStatsPayload;
    }
  } catch {
    // fallback para tabelas diretas
  }

  if (rpcData && Array.isArray(rpcData.students_latest) && rpcData.students_latest.length > 0) {
    return rpcData;
  }

  const { data: groupRow } = await supabase
    .from("groups")
    .select("id, name, description, primary_color")
    .eq("id", groupId)
    .maybeSingle();

  if (!groupRow) {
    return rpcData ?? null;
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, sex, birth_date, is_active, group_id, class_id, class:classes(name)")
    .eq("group_id", groupId)
    .order("full_name");

  const studentList = students ?? [];
  const sids = studentList.map((s) => s.id);

  let evaluations: any[] = [];
  if (sids.length > 0) {
    const { data: evals } = await supabase
      .from("evaluations")
      .select("id, student_id, evaluated_at, age_years, weight_kg, height_cm, imc, rce, sit_and_reach_cm, abdominal_reps, horizontal_jump_cm, medicine_ball_m, square_test_s, sprint_20m_s, run_6min_m, classifications")
      .in("student_id", sids)
      .order("evaluated_at", { ascending: false });
    evaluations = evals ?? [];
  }

  const studentMap = new Map(studentList.map((s) => [s.id, s]));
  const evalsByStudent = new Map<string, any[]>();
  for (const e of evaluations) {
    const arr = evalsByStudent.get(e.student_id) ?? [];
    arr.push(e);
    evalsByStudent.set(e.student_id, arr);
  }

  const students_latest: CohortStudentLatest[] = [];
  const students_first: CohortFirst[] = [];

  for (const [sid, sEvals] of evalsByStudent.entries()) {
    const st = studentMap.get(sid);
    if (!st || !sEvals.length) continue;
    const latest = sEvals[0];
    const first = sEvals[sEvals.length - 1];

    students_latest.push({
      student_id: sid,
      full_name: st.full_name,
      sex: st.sex,
      birth_date: st.birth_date,
      age_years: latest.age_years ?? null,
      evaluated_at: latest.evaluated_at,
      classifications: (latest.classifications ?? null) as Classifications | null,
      weight_kg: latest.weight_kg ?? null,
      height_cm: latest.height_cm ?? null,
      imc: latest.imc ?? null,
      sit_and_reach_cm: latest.sit_and_reach_cm ?? null,
      abdominal_reps: latest.abdominal_reps ?? null,
      horizontal_jump_cm: latest.horizontal_jump_cm ?? null,
      medicine_ball_m: latest.medicine_ball_m ?? null,
      square_test_s: latest.square_test_s ?? null,
      sprint_20m_s: latest.sprint_20m_s ?? null,
      run_6min_m: latest.run_6min_m ?? null,
      class_id: st.class_id,
      class_name: (st.class as any)?.name ?? null,
    });

    students_first.push({
      student_id: sid,
      evaluated_at: first.evaluated_at,
      classifications: (first.classifications ?? null) as Classifications | null,
    });
  }

  const lastEvaluationAt = evaluations.length > 0 ? evaluations[0].evaluated_at : (rpcData?.header?.last_evaluation_at ?? null);

  return {
    header: {
      id: groupRow.id,
      name: groupRow.name,
      description: groupRow.description ?? rpcData?.header?.description ?? null,
      color: groupRow.primary_color ?? rpcData?.header?.color ?? null,
      students_count: studentList.length,
      evaluations_count: evaluations.length,
      last_evaluation_at: lastEvaluationAt,
    },
    students_latest: students_latest.length > 0 ? students_latest : (rpcData?.students_latest ?? []),
    students_first: students_first.length > 0 ? students_first : (rpcData?.students_first ?? []),
    origin_classes_latest: rpcData?.origin_classes_latest ?? [],
    school_latest: rpcData?.school_latest ?? [],
  };
}

export { CATEGORY_COLOR };
export type { PMCategory, PMDimension };

