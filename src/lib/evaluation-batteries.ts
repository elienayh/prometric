import { ageFromBirth, calcImc, calcRce, classifyAll, type Sex } from "@/lib/proesp";

export type FieldKey =
  | "weight_kg"
  | "height_cm"
  | "waist_cm"
  | "wingspan_cm"
  | "sit_and_reach_cm"
  | "abdominal_reps"
  | "run_6min_m"
  | "medicine_ball_m"
  | "horizontal_jump_cm"
  | "square_test_s"
  | "sprint_20m_s";

export const EVALUATION_FIELDS: {
  key: FieldKey;
  label: string;
  short: string;
  unit: string;
  step?: string;
  category: "anthropometry" | "motor";
}[] = [
  { key: "weight_kg",          label: "Peso",                short: "Peso",  unit: "kg", step: "0.1", category: "anthropometry" },
  { key: "height_cm",          label: "Altura",              short: "Alt.",  unit: "cm", step: "0.1", category: "anthropometry" },
  { key: "waist_cm",           label: "Cintura",             short: "Cint.", unit: "cm", step: "0.1", category: "anthropometry" },
  { key: "wingspan_cm",        label: "Envergadura",         short: "Env.",  unit: "cm", step: "0.1", category: "anthropometry" },
  { key: "sit_and_reach_cm",   label: "Sentar e Alcançar",   short: "Flex",  unit: "cm", step: "0.1", category: "motor" },
  { key: "abdominal_reps",     label: "Abdominal 1min",      short: "Abdo",  unit: "reps", category: "motor" },
  { key: "run_6min_m",         label: "Corrida 6 minutos",   short: "6min",  unit: "m",  step: "1",   category: "motor" },
  { key: "medicine_ball_m",    label: "Medicine Ball 2kg",   short: "MBall", unit: "m",  step: "0.01", category: "motor" },
  { key: "horizontal_jump_cm", label: "Salto Horizontal",    short: "Salto", unit: "cm", step: "0.1", category: "motor" },
  { key: "square_test_s",      label: "Agilidade (Quadrado)",short: "Agil",  unit: "s",  step: "0.01", category: "motor" },
  { key: "sprint_20m_s",       label: "Corrida 20 metros",   short: "20m",   unit: "s",  step: "0.01", category: "motor" },
];

export type StudentLite = {
  id: string;
  full_name: string;
  sex: Sex;
  birth_date: string;
  photo_url: string | null;
};

export type RawEvaluation = Record<string, unknown> & {
  id?: string;
  student_id: string;
  evaluated_at: string;
  tenant_id?: string;
  created_at?: string;
};

export type StudentBatteryProgress = {
  studentId: string;
  filledCount: number;
  totalFields: number;
  isComplete: boolean;
  isPartial: boolean;
  isEmpty: boolean;
  missingFields: typeof EVALUATION_FIELDS;
  completedFields: typeof EVALUATION_FIELDS;
  consolidatedValues: Record<FieldKey, number | null>;
  evaluatedDates: string[];
  primaryEvaluationId?: string;
};

export type EvaluationBattery = {
  id: string; // ID canônico (normalmente a data de referência/início: YYYY-MM-DD)
  name: string;
  startDate: string;
  latestDate: string;
  evaluatedDates: string[];
  isCurrent: boolean;
  studentCount: number;
  completeCount: number;
  partialCount: number;
  emptyCount: number;
  // Mapa de student_id -> progresso e valores consolidados
  progressByStudent: Record<string, StudentBatteryProgress>;
  // Avaliação consolidada por student_id para persistência
  consolidatedByStudent: Record<string, RawEvaluation>;
};

const ROLLING_WINDOW_DAYS = 35; // Dias para agrupar aulas da mesma bateria avaliativa

function diffDays(dateA: string, dateB: string): number {
  const msA = new Date(dateA).getTime();
  const msB = new Date(dateB).getTime();
  return Math.abs(Math.round((msA - msB) / (1000 * 60 * 60 * 24)));
}

export function formatDateBr(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  } catch {
    return isoDate;
  }
}

/**
 * Agrupa todas as avaliações de uma turma em Baterias de Testes
 * com merge automático dos valores realizados em dias diferentes.
 */
export function buildBatteries(
  students: StudentLite[],
  allEvaluations: RawEvaluation[],
  selectedBatteryDate?: string | null,
): {
  batteries: EvaluationBattery[];
  activeBattery: EvaluationBattery;
} {
  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. Identificar todas as datas distintas ordenadas decrescentemente
  const rawDates = Array.from(new Set(allEvaluations.map((e) => e.evaluated_at))).filter(Boolean);
  rawDates.sort((a, b) => b.localeCompare(a)); // Mais recente primeiro

  // 2. Agrupar datas em clusters de até 35 dias entre datas adjacentes
  const clusters: string[][] = [];
  for (const date of rawDates) {
    let placed = false;
    for (const cluster of clusters) {
      // Se a data está a menos de ROLLING_WINDOW_DAYS de alguma data do cluster
      const canJoin = cluster.some((cDate) => diffDays(cDate, date) <= ROLLING_WINDOW_DAYS);
      if (canJoin) {
        cluster.push(date);
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push([date]);
    }
  }

  // 3. Montar objetos EvaluationBattery
  const batteries: EvaluationBattery[] = clusters.map((dates, idx) => {
    dates.sort((a, b) => a.localeCompare(b)); // Ordenar cronologicamente no cluster
    const startDate = dates[0];
    const latestDate = dates[dates.length - 1];
    const dateRangeLabel =
      dates.length > 1
        ? `${formatDateBr(startDate)} a ${formatDateBr(latestDate)}`
        : formatDateBr(startDate);

    // Se é a bateria mais recente e ocorreu nos últimos 60 dias
    const isCurrent = idx === 0 && diffDays(todayStr, latestDate) <= 60;
    const name = isCurrent
      ? `Bateria Atual (${dateRangeLabel})`
      : `Bateria de ${dateRangeLabel}`;

    // Filtrar avaliações deste cluster
    const clusterEvals = allEvaluations.filter((e) => dates.includes(e.evaluated_at));

    // Agrupar por estudante
    const evalsByStudentId: Record<string, RawEvaluation[]> = {};
    for (const e of clusterEvals) {
      if (!evalsByStudentId[e.student_id]) evalsByStudentId[e.student_id] = [];
      evalsByStudentId[e.student_id].push(e);
    }

    const progressByStudent: Record<string, StudentBatteryProgress> = {};
    const consolidatedByStudent: Record<string, RawEvaluation> = {};

    let completeCount = 0;
    let partialCount = 0;
    let emptyCount = 0;

    for (const student of students) {
      const studentEvals = evalsByStudentId[student.id] ?? [];
      const evaluatedDates = Array.from(new Set(studentEvals.map((e) => e.evaluated_at))).sort();

      // Consolidar valores (se teste foi preenchido em qualquer dia deste cluster, mantemos)
      const consolidatedValues: Record<FieldKey, number | null> = {} as Record<FieldKey, number | null>;
      let primaryEvaluation: RawEvaluation | undefined;

      // Ordenar por data decrescente para que o valor mais recente prevaleça em caso de reteste
      const sortedEvals = [...studentEvals].sort((a, b) => b.evaluated_at.localeCompare(a.evaluated_at));
      if (sortedEvals.length > 0) {
        primaryEvaluation = sortedEvals[0];
      }

      for (const field of EVALUATION_FIELDS) {
        let val: number | null = null;
        for (const ev of sortedEvals) {
          const raw = ev[field.key];
          if (raw !== null && raw !== undefined && raw !== "") {
            const parsed = typeof raw === "number" ? raw : parseFloat(String(raw));
            if (!isNaN(parsed)) {
              val = parsed;
              break;
            }
          }
        }
        consolidatedValues[field.key] = val;
      }

      const missingFields: typeof EVALUATION_FIELDS = [];
      const completedFields: typeof EVALUATION_FIELDS = [];

      for (const field of EVALUATION_FIELDS) {
        if (consolidatedValues[field.key] !== null) {
          completedFields.push(field);
        } else {
          missingFields.push(field);
        }
      }

      const filledCount = completedFields.length;
      const isComplete = filledCount === EVALUATION_FIELDS.length;
      const isPartial = filledCount > 0 && !isComplete;
      const isEmpty = filledCount === 0;

      if (isComplete) completeCount++;
      else if (isPartial) partialCount++;
      else emptyCount++;

      progressByStudent[student.id] = {
        studentId: student.id,
        filledCount,
        totalFields: EVALUATION_FIELDS.length,
        isComplete,
        isPartial,
        isEmpty,
        missingFields,
        completedFields,
        consolidatedValues,
        evaluatedDates,
        primaryEvaluationId: primaryEvaluation?.id,
      };

      // Objeto consolidado para passar a formulários e planilhas
      const baseEval = primaryEvaluation ?? {
        student_id: student.id,
        evaluated_at: startDate,
      };

      consolidatedByStudent[student.id] = {
        ...baseEval,
        ...consolidatedValues,
        evaluated_at: startDate, // Ancorada na data de início da bateria
      };
    }

    return {
      id: startDate,
      name,
      startDate,
      latestDate,
      evaluatedDates: dates,
      isCurrent,
      studentCount: students.length,
      completeCount,
      partialCount,
      emptyCount,
      progressByStudent,
      consolidatedByStudent,
    };
  });

  // Se nenhuma bateria existir para a turma, criamos a bateria inicial de hoje
  if (batteries.length === 0) {
    const defaultBattery: EvaluationBattery = {
      id: todayStr,
      name: `Bateria Atual (${formatDateBr(todayStr)})`,
      startDate: todayStr,
      latestDate: todayStr,
      evaluatedDates: [todayStr],
      isCurrent: true,
      studentCount: students.length,
      completeCount: 0,
      partialCount: 0,
      emptyCount: students.length,
      progressByStudent: {},
      consolidatedByStudent: {},
    };

    for (const s of students) {
      defaultBattery.progressByStudent[s.id] = {
        studentId: s.id,
        filledCount: 0,
        totalFields: EVALUATION_FIELDS.length,
        isComplete: false,
        isPartial: false,
        isEmpty: true,
        missingFields: [...EVALUATION_FIELDS],
        completedFields: [],
        consolidatedValues: {} as Record<FieldKey, number | null>,
        evaluatedDates: [],
      };
      defaultBattery.consolidatedByStudent[s.id] = {
        student_id: s.id,
        evaluated_at: todayStr,
      };
    }
    batteries.push(defaultBattery);
  }

  // Determinar bateria ativa com base na seleção ou padrão
  let activeBattery = batteries[0];
  if (selectedBatteryDate) {
    const found = batteries.find((b) => b.id === selectedBatteryDate || b.evaluatedDates.includes(selectedBatteryDate));
    if (found) activeBattery = found;
  }

  return { batteries, activeBattery };
}

/**
 * Constrói payload seguro para upsert no banco consolidando com o histórico da bateria
 */
export function buildConsolidatedPayload(
  student: StudentLite,
  tenantId: string,
  targetBatteryDate: string,
  newValues: Partial<Record<FieldKey, number | null>>,
  existingInBattery?: RawEvaluation | null,
) {
  const age = ageFromBirth(student.birth_date, new Date(targetBatteryDate));
  const payload: Record<string, unknown> = {
    tenant_id: tenantId,
    student_id: student.id,
    evaluated_at: targetBatteryDate,
    age_years: age,
  };

  // Merge: novos valores sobrepostos aos já existentes da bateria
  for (const f of EVALUATION_FIELDS) {
    const next = newValues[f.key];
    const prev = existingInBattery ? (existingInBattery[f.key] as number | null | undefined) : undefined;
    payload[f.key] = next !== undefined ? next : (prev ?? null);
  }

  payload.imc = calcImc(payload.weight_kg as number | null, payload.height_cm as number | null);
  payload.rce = calcRce(payload.waist_cm as number | null, payload.height_cm as number | null);
  payload.classifications = classifyAll({
    sex: student.sex,
    age,
    weight_kg: payload.weight_kg as number | null,
    height_cm: payload.height_cm as number | null,
    waist_cm: payload.waist_cm as number | null,
    sit_and_reach_cm: payload.sit_and_reach_cm as number | null,
    abdominal_reps: payload.abdominal_reps as number | null,
    horizontal_jump_cm: payload.horizontal_jump_cm as number | null,
    medicine_ball_m: payload.medicine_ball_m as number | null,
    square_test_s: payload.square_test_s as number | null,
    sprint_20m_s: payload.sprint_20m_s as number | null,
    run_6min_m: payload.run_6min_m as number | null,
  });

  return payload;
}
