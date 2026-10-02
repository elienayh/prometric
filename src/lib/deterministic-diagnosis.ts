import { PROMETRIC_PROMPT_VERSION } from "@/lib/ai/prometric-system-prompt";
import { prometricIndex, zoneToCategory } from "@/lib/prometric-method";
import { TEST_META, type ClassificationKey, type Zone, type Classifications, type Sex } from "@/lib/proesp";
import {
  imcBand,
  imcAdultBand,
  IMC_BAND_LABEL,
  imcFamilyGuidance,
  IMC_CLINICAL_DISCLAIMER,
  type ImcBand,
} from "@/lib/imc-reference";

export type EvaluationForDiagnosis = {
  id?: string;
  evaluated_at?: string | null;
  age_years?: number | null;
  age_months?: number | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  waist_cm?: number | null;
  wingspan_cm?: number | null;
  imc?: number | null;
  rce?: number | null;
  sit_and_reach_cm?: number | null;
  abdominal_reps?: number | null;
  horizontal_jump_cm?: number | null;
  medicine_ball_m?: number | null;
  square_test_s?: number | null;
  sprint_20m_s?: number | null;
  run_6min_m?: number | null;
  classifications?: Classifications | Record<string, Zone> | null;
  student?: {
    full_name?: string | null;
    sex?: string | null;
    birth_date?: string | null;
  } | null;
};

export type DeterministicDiagnosisResult = {
  diagnosis: string;
  technical: string;
  family: string;
  goals: {
    "30_days": string[];
    "60_days": string[];
    "90_days": string[];
  };
  signature: string;
  provider: string;
  source: string;
  promptVersion: string;
};

export function buildDeterministicDiagnosis(
  row: EvaluationForDiagnosis,
  fallbackStudentName?: string
): DeterministicDiagnosisResult {
  const studentName = row.student?.full_name || fallbackStudentName || "Aluno(a)";
  const studentSex = row.student?.sex ?? "other";
  const isFem = studentSex === "female";
  const art = isFem ? "A aluna" : "O aluno";

  const classif: Classifications = (row.classifications ?? {}) as Classifications;
  const pIndex = prometricIndex(classif);
  const overallCategory = pIndex.category ?? "Em Desenvolvimento";

  const testItems: { key: ClassificationKey; name: string; zone?: Zone; cat: string | null; val: number | null | undefined }[] = [
    { key: "jump", name: "Salto Horizontal", zone: classif.jump, cat: zoneToCategory(classif.jump), val: row.horizontal_jump_cm },
    { key: "mball", name: "Medicine Ball", zone: classif.mball, cat: zoneToCategory(classif.mball), val: row.medicine_ball_m },
    { key: "abdo", name: "Abdominal 1min", zone: classif.abdo, cat: zoneToCategory(classif.abdo), val: row.abdominal_reps },
    { key: "flex", name: "Flexibilidade", zone: classif.flex, cat: zoneToCategory(classif.flex), val: row.sit_and_reach_cm },
    { key: "sprint", name: "Velocidade 20m", zone: classif.sprint, cat: zoneToCategory(classif.sprint), val: row.sprint_20m_s },
    { key: "square", name: "Quadrado", zone: classif.square, cat: zoneToCategory(classif.square), val: row.square_test_s },
    { key: "run6", name: "Corrida 6min", zone: classif.run6, cat: zoneToCategory(classif.run6), val: row.run_6min_m },
  ];

  const strongTests = testItems.filter((t) => t.cat === "Excelente" || t.cat === "Bom");
  const warnTests = testItems.filter((t) => t.cat === "Prioritário" || t.cat === "Atenção");
  const devTests = testItems.filter((t) => t.cat === "Em Desenvolvimento");

  // Avaliação antropométrica clínica do IMC (OMS 2007)
  let imcClinicalLabel: string | null = null;
  let imcGuidanceText: string | null = null;
  if (row.imc != null) {
    const age = row.age_years ?? 10;
    const months = row.age_months ?? (age >= 20 ? 240 : age * 12 + 6);
    if (age < 5) {
      imcClinicalLabel = "Sem referência para menores de 5 anos";
    } else if (age >= 20) {
      const b = imcAdultBand(row.imc);
      imcClinicalLabel = IMC_BAND_LABEL[b];
      imcGuidanceText = imcFamilyGuidance(b, studentName);
    } else {
      const sexKey: Sex = studentSex === "male" ? "male" : "female";
      const b = imcBand(row.imc, sexKey, months);
      imcClinicalLabel = IMC_BAND_LABEL[b];
      imcGuidanceText = imcFamilyGuidance(b, studentName);
    }
  }

  // 1. Parecer técnico (destinado a professores e coordenação escolar)
  const technicalParts: string[] = [
    `Avaliação física diagnóstica de ${studentName} (${row.age_years ?? "—"} anos). Índice ProMetric® registrado em ${pIndex.score}/100 pontos, perfil consolidado '${overallCategory}'.`,
  ];
  if (row.imc != null) {
    technicalParts.push(`Antropometria: IMC ${row.imc.toFixed(1)} kg/m² (${imcClinicalLabel ?? "—"} — OMS 2007), RCE ${row.rce ? row.rce.toFixed(2) : "—"}.`);
  }
  if (strongTests.length > 0) {
    technicalParts.push(`Capacidades em destaque: ${strongTests.map((t) => `${t.name} ('${t.cat}')`).join(", ")}.`);
  }
  if (warnTests.length > 0) {
    technicalParts.push(`Valências prioritárias para intervenção: ${warnTests.map((t) => `${t.name} ('${t.cat}')`).join(", ")}.`);
  } else if (devTests.length > 0) {
    technicalParts.push(`Valências com margem para desenvolvimento: ${devTests.map((t) => `${t.name} ('${t.cat}')`).join(", ")}.`);
  }
  technicalParts.push(`Recomenda-se programa motor diversificado com ênfase nas valências deficitárias e nova bateria de controle em 90 a 120 dias.`);
  technicalParts.push(`Nota clínica: ${IMC_CLINICAL_DISCLAIMER} Critérios de classificação do IMC alinhados às curvas da OMS 2007 e às diretrizes da Sociedade Brasileira de Pediatria (Manual nº 64/2023).`);

  const technical = technicalParts.join(" ");

  // 2. Parecer para a família (linguagem acolhedora, encorajadora e sem termos patológicos)
  const familyParts: string[] = [
    `${art} ${studentName} participou da avaliação física do ProMetric®. Seu resultado geral alcançou a categoria '${overallCategory}' (${pIndex.score}/100 pontos).`,
    strongTests.length > 0
      ? `Parabenizamos pelo excelente desempenho observado em ${strongTests.map((t) => t.name.toLowerCase()).join(" e ")}, que mostram dedicação e boa aptidão física.`
      : `Demonstrou excelente disposição e engajamento na execução dos testes propostos.`,
    warnTests.length > 0
      ? `Como oportunidade de melhoria, sugerimos brincadeiras e atividades ativas que estimulem ${warnTests.map((t) => t.name.toLowerCase()).join(" e ")}.`
      : `O aluno mantém um perfil motor bastante harmônico e equilibrado.`,
  ];

  if (imcGuidanceText) {
    familyParts.push(imcGuidanceText);
  }

  familyParts.push(
    `O apoio da família em incentivar o movimento diário e limitar o tempo de telas é fundamental para seu desenvolvimento contínuo.`
  );

  const family = familyParts.join(" ");

  // 3. Diagnóstico curto
  const diagnosis = `${art} ${studentName} apresenta Índice ProMetric® de ${pIndex.score}/100 (${overallCategory}). ${strongTests.length > 0 ? `Pontos fortes: ${strongTests.map((t) => t.name).join(", ")}. ` : ""}${warnTests.length > 0 ? `Atenção: ${warnTests.map((t) => t.name).join(", ")}. ` : ""}${imcClinicalLabel ? `Estado nutricional: ${imcClinicalLabel}. ` : ""}Plano pedagógico focado em estímulos motores contínuos e reavaliação periódica.`;

  // 4. Metas progressivas
  const focusNames = [...warnTests, ...devTests].map((t) => t.name);
  const primFocus = focusNames[0] ?? "Capacidade aeróbica";
  const secFocus = focusNames[1] ?? "Coordenação e força";

  const goals = {
    "30_days": [
      "Consolidar participação ativa em ao menos 3 sessões semanais de Educação Física.",
      `Iniciar rotina de estímulos específicos focados em ${primFocus.toLowerCase()}.`,
      "Adotar rotina diária de hidratação adequada e sono satisfatório (8-10h).",
    ],
    "60_days": [
      `Evoluir a tolerância e o desempenho motor nas tarefas de ${secFocus.toLowerCase()}.`,
      "Incorporar circuitos motores e jogos de agilidade nas práticas corporais.",
      "Reduzir o tempo sedentário nos dias sem aula com atividades ao ar livre.",
    ],
    "90_days": [
      "Realizar nova bateria de avaliação física ProMetric® para mensuração comparativa.",
      "Consolidar o ganho de pontuação nas valências que estavam em atenção.",
      "Manter o engajamento positivo e a autoestima corporal em novos esportes.",
    ],
  };

  const signature = `\n\n_Gerado pelo Modelo ProMetric® ${PROMETRIC_PROMPT_VERSION} • Sistema Especialista_`;

  return {
    diagnosis,
    technical,
    family,
    goals,
    signature,
    provider: "ProMetric® Engine (Sistema Especialista)",
    source: "algoritmo determinístico",
    promptVersion: PROMETRIC_PROMPT_VERSION,
  };
}
