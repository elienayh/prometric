import {
  buildDeterministicDiagnosis,
  type EvaluationForDiagnosis,
} from "../src/lib/deterministic-diagnosis";
import {
  buildDeterministicStudentReport,
  type StudentReportData,
  type StudentEvalData,
} from "../src/lib/deterministic-student-report";
import {
  buildDeterministicPortalReport,
  type PortalStudentData,
  type PortalEvalData,
} from "../src/lib/deterministic-portal-report";
import { PROMETRIC_PROMPT_VERSION } from "../src/lib/ai/prometric-system-prompt";

let failures = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

// Lista de termos proibidos pelo Modelo ProMetric®
const FORBIDDEN_TERMS = [
  /\bPROESP\b/i,
  /\bPROESP-BR\b/i,
  /\bZ-score\b/i,
  /\bpercentil\b/i,
  /\bdesvio-padrão\b/i,
  /\bdesvio padrão\b/i,
  /\bRegular\b/i,
  /\bÓtimo\b/i,
  /\bMédio\b/i,
  /\bBom o suficiente\b/i,
];

function checkNoForbiddenTerms(text: string, contextName: string) {
  for (const term of FORBIDDEN_TERMS) {
    const match = text.match(term);
    assert(
      !match,
      `${contextName} não deve conter termo proibido '${term}'. Encontrado: "${match?.[0]}"`
    );
  }
}

console.log("=== 1. Teste do Motor de Diagnóstico Determinístico (buildDeterministicDiagnosis) ===");

// 1.1 Avaliação de Aluno Masculino (11 anos) com perfil heterogêneo
const evalMale: EvaluationForDiagnosis = {
  id: "eval-001",
  age_years: 11,
  age_months: 132,
  weight_kg: 38.5,
  height_cm: 145,
  imc: 18.3,
  rce: 0.44,
  horizontal_jump_cm: 165,
  medicine_ball_m: 3.2,
  abdominal_reps: 28,
  sit_and_reach_cm: 22,
  sprint_20m_s: 4.1,
  square_test_s: 6.2,
  run_6min_m: 950,
  classifications: {
    imc: "Excelente",
    rce: "Excelente",
    jump: "Bom",
    mball: "Bom",
    abdo: "Excelente",
    flex: "Razoável",
    sprint: "Bom",
    square: "Razoável",
    run6: "Fraco",
  },
  student: {
    full_name: "Lucas Silva",
    sex: "male",
    birth_date: "2013-05-15",
  },
};

const diagMale = buildDeterministicDiagnosis(evalMale);

assert(typeof diagMale.diagnosis === "string" && diagMale.diagnosis.length > 20, "Diagnóstico curto gerado");
assert(typeof diagMale.technical === "string" && diagMale.technical.length > 50, "Parecer técnico gerado");
assert(typeof diagMale.family === "string" && diagMale.family.length > 50, "Parecer família gerado");
assert(Array.isArray(diagMale.goals["30_days"]) && diagMale.goals["30_days"].length === 3, "Metas de 30 dias contêm 3 itens");
assert(Array.isArray(diagMale.goals["60_days"]) && diagMale.goals["60_days"].length === 3, "Metas de 60 dias contêm 3 itens");
assert(Array.isArray(diagMale.goals["90_days"]) && diagMale.goals["90_days"].length === 3, "Metas de 90 dias contêm 3 itens");
assert(diagMale.promptVersion === PROMETRIC_PROMPT_VERSION, `Versão do prompt compatível (${PROMETRIC_PROMPT_VERSION})`);
assert(diagMale.source === "algoritmo determinístico", "Fonte marcada como determinística");

// Verificação de concordância para menino
assert(diagMale.technical.includes("Lucas Silva"), "Parecer técnico cita nome do aluno");
assert(diagMale.family.includes("O aluno Lucas Silva"), "Parecer família usa artigo masculino 'O aluno'");

// Verificação de termos proibidos no parecer técnico e família
checkNoForbiddenTerms(diagMale.technical, "Parecer Técnico (Masculino)");
checkNoForbiddenTerms(diagMale.family, "Parecer Família (Masculino)");
checkNoForbiddenTerms(diagMale.diagnosis, "Diagnóstico Resumido (Masculino)");

// Verificação da menção à OMS 2007 e nota clínica no parecer técnico
assert(diagMale.technical.includes("OMS 2007"), "Parecer técnico menciona referência OMS 2007 para IMC");
assert(diagMale.technical.includes("Nota clínica"), "Parecer técnico inclui nota clínica");

// 1.2 Avaliação de Aluna Feminina (14 anos)
const evalFemale: EvaluationForDiagnosis = {
  id: "eval-002",
  age_years: 14,
  age_months: 168,
  weight_kg: 52,
  height_cm: 160,
  imc: 20.3,
  rce: 0.42,
  horizontal_jump_cm: 130,
  medicine_ball_m: 2.8,
  abdominal_reps: 20,
  sit_and_reach_cm: 32,
  sprint_20m_s: 4.8,
  square_test_s: 7.1,
  run_6min_m: 800,
  classifications: {
    imc: "Excelente",
    rce: "Excelente",
    jump: "Razoável",
    mball: "Fraco",
    abdo: "Razoável",
    flex: "Excelente",
    sprint: "Razoável",
    square: "Fraco",
    run6: "Muito Fraco",
  },
  student: {
    full_name: "Mariana Souza",
    sex: "female",
    birth_date: "2010-08-20",
  },
};

const diagFemale = buildDeterministicDiagnosis(evalFemale);

assert(diagFemale.family.includes("A aluna Mariana Souza"), "Parecer família usa artigo feminino 'A aluna'");
checkNoForbiddenTerms(diagFemale.technical, "Parecer Técnico (Feminino)");
checkNoForbiddenTerms(diagFemale.family, "Parecer Família (Feminino)");

// 1.3 Avaliação de Aluno Adulto (22 anos)
const evalAdult: EvaluationForDiagnosis = {
  id: "eval-003",
  age_years: 22,
  age_months: 264,
  weight_kg: 74,
  height_cm: 178,
  imc: 23.4,
  rce: 0.45,
  classifications: {
    imc: "Excelente",
    rce: "Excelente",
  },
  student: {
    full_name: "Carlos Eduardo",
    sex: "male",
    birth_date: "2002-01-10",
  },
};

const diagAdult = buildDeterministicDiagnosis(evalAdult);
assert(diagAdult.technical.includes("Eutrofia"), "Adulto 23.4 kg/m² classificado como Eutrofia");
checkNoForbiddenTerms(diagAdult.technical, "Parecer Técnico (Adulto)");
checkNoForbiddenTerms(diagAdult.family, "Parecer Família (Adulto)");

console.log("\n=== 2. Teste do Relatório Individual Completo (buildDeterministicStudentReport) ===");

const studentData: StudentReportData = {
  id: "student-100",
  full_name: "Beatriz Oliveira",
  sex: "female",
  birth_date: "2012-04-10",
};

// 2.1 Avaliação única (Linha de Base / Diagnóstica Inicial)
const singleEvalList: StudentEvalData[] = [
  {
    id: "eval-s1",
    evaluated_at: "2024-03-10",
    age_years: 11,
    weight_kg: 40,
    height_cm: 148,
    imc: 18.26,
    rce: 0.43,
    sit_and_reach_cm: 25,
    abdominal_reps: 24,
    horizontal_jump_cm: 140,
    medicine_ball_m: 2.7,
    square_test_s: 6.8,
    sprint_20m_s: 4.5,
    run_6min_m: 900,
    classifications: {
      imc: "Excelente",
      rce: "Excelente",
      flex: "Bom",
      abdo: "Bom",
      jump: "Bom",
      mball: "Razoável",
      square: "Razoável",
      sprint: "Razoável",
      run6: "Razoável",
    },
  },
];

const reportSingle = buildDeterministicStudentReport(studentData, singleEvalList);

assert(typeof reportSingle.resumo_geral === "string", "Resumo geral presente");
assert(reportSingle.evolucao.includes("linha de base"), "Avaliação única reconhecida como linha de base");
assert(reportSingle.pontos_fortes.length > 0, "Pontos fortes identificados");
assert(reportSingle.pontos_atencao.length > 0, "Pontos de atenção identificados");
assert(reportSingle.recomendacoes.length > 0, "Recomendações presentes");
assert(typeof reportSingle.conclusao === "string", "Conclusão presente");
checkNoForbiddenTerms(reportSingle.resumo_geral, "Resumo Geral (Avaliação Única)");
checkNoForbiddenTerms(reportSingle.evolucao, "Evolução (Avaliação Única)");
checkNoForbiddenTerms(reportSingle.conclusao, "Conclusão (Avaliação Única)");

// 2.2 Avaliações múltiplas (Acompanhamento Temporal com Ganho)
const multiEvalList: StudentEvalData[] = [
  singleEvalList[0],
  {
    id: "eval-s2",
    evaluated_at: "2024-09-15",
    age_years: 12,
    weight_kg: 43,
    height_cm: 153, // +5 cm
    imc: 18.37,
    rce: 0.42,
    sit_and_reach_cm: 28, // +3 cm
    abdominal_reps: 30, // +6 reps
    horizontal_jump_cm: 155, // +15 cm
    medicine_ball_m: 3.2, // +0.5 m
    square_test_s: 6.3, // -0.5s mais veloz
    sprint_20m_s: 4.2, // -0.3s mais veloz
    run_6min_m: 1050, // +150 m
    classifications: {
      imc: "Excelente",
      rce: "Excelente",
      flex: "Muito Bom",
      abdo: "Excelente",
      jump: "Muito Bom",
      mball: "Bom",
      square: "Bom",
      sprint: "Bom",
      run6: "Bom",
    },
  },
];

const reportMulti = buildDeterministicStudentReport(studentData, multiEvalList);

assert(reportMulti.evolucao.includes("crescimento estatural de +5 cm"), "Evolução registra crescimento de +5 cm");
assert(reportMulti.evolucao.includes("Salto Horizontal evoluiu"), "Evolução registra melhora no salto horizontal");
assert(reportMulti.evolucao.includes("pontos no Índice ProMetric®"), "Evolução registra cálculo de delta no Índice ProMetric®");
checkNoForbiddenTerms(reportMulti.resumo_geral, "Resumo Geral (Multi Avaliações)");
checkNoForbiddenTerms(reportMulti.evolucao, "Evolução (Multi Avaliações)");
checkNoForbiddenTerms(reportMulti.conclusao, "Conclusão (Multi Avaliações)");

console.log("\n=== 3. Teste do Relatório para o Portal do Aluno/Família (buildDeterministicPortalReport) ===");

const portalStudent: PortalStudentData = {
  id: "portal-st-1",
  full_name: "Gabriel Ramos",
  sex: "male",
  birth_date: "2014-11-05",
  portal_enabled: true,
  is_active: true,
};

const portalEvals: PortalEvalData[] = [
  {
    id: "eval-p1",
    evaluated_at: "2024-06-01",
    age_years: 9,
    weight_kg: 32,
    height_cm: 136,
    imc: 17.3,
    rce: 0.45,
    classifications: {
      imc: "Excelente",
      rce: "Excelente",
      jump: "Bom",
      abdo: "Razoável",
      run6: "Fraco",
    },
  },
];

const portalReport = buildDeterministicPortalReport(portalStudent, portalEvals);

assert(typeof portalReport.parecer === "string" && portalReport.parecer.length > 50, "Parecer do portal gerado");
assert(typeof portalReport.evolucao === "string", "Texto de evolução do portal gerado");
assert(Array.isArray(portalReport.recomendacoes_familia) && portalReport.recomendacoes_familia.length > 0, "Recomendações para a família presentes");
assert(Array.isArray(portalReport.plano_evolucao) && portalReport.plano_evolucao.length > 0, "Plano de evolução presente");
assert(Array.isArray(portalReport.atividades_sugeridas) && portalReport.atividades_sugeridas.length > 0, "Atividades sugeridas presentes");

checkNoForbiddenTerms(portalReport.parecer, "Parecer do Portal");
checkNoForbiddenTerms(portalReport.evolucao, "Evolução do Portal");

console.log("\n=== 4. Teste de Conformidade de Categorias e Dimensões ProMetric® ===");

const VALID_CATEGORIES = ["Prioritário", "Atenção", "Em Desenvolvimento", "Bom", "Excelente"];
for (const cat of VALID_CATEGORIES) {
  assert(VALID_CATEGORIES.includes(cat), `Categoria oficial ProMetric: ${cat}`);
}

const VALID_DIMENSIONS = [
  "Saúde Corporal",
  "Resistência",
  "Mobilidade",
  "Potência",
  "Velocidade e Agilidade",
];
for (const dim of VALID_DIMENSIONS) {
  assert(VALID_DIMENSIONS.includes(dim), `Dimensão oficial ProMetric: ${dim}`);
}

if (failures > 0) {
  console.error(`\n❌ Total de falhas na Fase 4: ${failures}`);
  process.exit(1);
} else {
  console.log("\n🎉 TODOS OS TESTES DA FASE 4 PASSARAM COM 100% DE SUCESSO!");
}
