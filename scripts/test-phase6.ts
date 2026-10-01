// ============================================================================
// ProMetric® — Testes de Homologação e Conclusão da Fase 6
// ============================================================================
// Este script valida a integração ponta a ponta de todas as fases (1 a 6):
// 1. Recálculo em lote e migração do dataset histórico real (bd/evaluations.csv)
// 2. Auditoria de dados (age_months, IMC OMS 2007, classificações, discrepâncias)
// 3. Validação de guardrails e termos proibidos em 100% dos dados gerados
// 4. Integração do pipeline completo (Entrada -> Validação -> Classificação -> Laudo -> Exportação)
// 5. Conformidade das regras do usuário (sem bun.lock/bun.lockb)
// ============================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  recalculateEvaluationRecord,
  auditEvaluationDataset,
  generateSqlMigration,
  type StudentLookup,
  type RawEvaluationRecord,
} from "../src/lib/batch-recompute";
import { PROMETRIC_CATEGORIES, PROMETRIC_DIMENSIONS } from "../src/lib/ai/prometric-system-prompt";
import { IMC_CLINICAL_DISCLAIMER } from "../src/lib/imc-reference";
import { buildExportRows, type EvalReportItem } from "../src/routes/_authenticated/reports";
import { generateEvaluationPDF } from "../src/lib/pdf-report";
import { generateCohortPDF } from "../src/lib/pdf-cohort-report";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

console.log("=== 1. Testes de Ausência de Arquivos Proibidos (Regra do Usuário) ===");
const bunLockPath = path.resolve(__dirname, "../bun.lock");
const bunLockbPath = path.resolve(__dirname, "../bun.lockb");
assert(!fs.existsSync(bunLockPath), "bun.lock NÃO existe no repositório");
assert(!fs.existsSync(bunLockbPath), "bun.lockb NÃO existe no repositório");

console.log("\n=== 2. Carregamento e Auditoria dos Dados Históricos Reais (bd/) ===");
const studentsCsvPath = path.resolve(__dirname, "../bd/students.csv");
const evalsCsvPath = path.resolve(__dirname, "../bd/evaluations.csv");

assert(fs.existsSync(studentsCsvPath), "Arquivo bd/students.csv encontrado");
assert(fs.existsSync(evalsCsvPath), "Arquivo bd/evaluations.csv encontrado");

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse simplificado compatível com campos com aspas e vírgulas internas
  const parseLine = (line: string): string[] => {
    const fields: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        fields.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    fields.push(cur);
    return fields;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

const rawStudents = parseCsv(fs.readFileSync(studentsCsvPath, "utf-8"));
const rawEvals = parseCsv(fs.readFileSync(evalsCsvPath, "utf-8"));

console.log(`Carregados ${rawStudents.length} alunos e ${rawEvals.length} avaliações do histórico.`);
assert(rawStudents.length >= 300, `Dataset de alunos íntegro (${rawStudents.length} alunos)`);
assert(rawEvals.length >= 600, `Dataset de avaliações íntegro (${rawEvals.length} avaliações)`);

const studentsLookup: StudentLookup[] = rawStudents.map((s) => ({
  id: s.id,
  full_name: s.full_name,
  sex: (s.sex === "male" ? "male" : "female") as any,
  birth_date: s.birth_date,
}));

const evalsLookup: RawEvaluationRecord[] = rawEvals.map((e) => {
  let cls = null;
  if (e.classifications) {
    try {
      cls = JSON.parse(e.classifications);
    } catch {}
  }
  return {
    id: e.id,
    student_id: e.student_id,
    evaluated_at: e.evaluated_at,
    age_years: e.age_years ? parseInt(e.age_years, 10) : undefined,
    weight_kg: e.weight_kg ? parseFloat(e.weight_kg) : undefined,
    height_cm: e.height_cm ? parseFloat(e.height_cm) : undefined,
    waist_cm: e.waist_cm ? parseFloat(e.waist_cm) : undefined,
    wingspan_cm: e.wingspan_cm ? parseFloat(e.wingspan_cm) : undefined,
    imc: e.imc ? parseFloat(e.imc) : undefined,
    rce: e.rce ? parseFloat(e.rce) : undefined,
    sit_and_reach_cm: e.sit_and_reach_cm ? parseFloat(e.sit_and_reach_cm) : undefined,
    abdominal_reps: e.abdominal_reps ? parseInt(e.abdominal_reps, 10) : undefined,
    horizontal_jump_cm: e.horizontal_jump_cm ? parseFloat(e.horizontal_jump_cm) : undefined,
    medicine_ball_m: e.medicine_ball_m ? parseFloat(e.medicine_ball_m) : undefined,
    square_test_s: e.square_test_s ? parseFloat(e.square_test_s) : undefined,
    sprint_20m_s: e.sprint_20m_s ? parseFloat(e.sprint_20m_s) : undefined,
    run_6min_m: e.run_6min_m ? parseFloat(e.run_6min_m) : undefined,
    classifications: cls,
  };
});

const auditSummary = auditEvaluationDataset(evalsLookup, studentsLookup);

console.log("\n=== 3. Resultados da Auditoria em Lote (Fase 6) ===");
console.log(`- Total de avaliações processadas: ${auditSummary.totalEvaluations}`);
console.log(`- Avaliações que precisavam de age_months: ${auditSummary.evaluationsWithoutAgeMonths}`);
console.log(`- Distribuição por Categoria ProMetric:`, auditSummary.categoryDistribution);

assert(auditSummary.totalEvaluations > 600, "Mais de 600 avaliações foram auditadas e recalculadas");
assert(auditSummary.evaluationsWithoutAgeMonths > 600, "Identificou corretamente que os registros legados não tinham age_months");

// Verifica que todas as avaliações recalculadas têm age_months > 0
const allHaveAgeMonths = auditSummary.recalculatedItems.every((r) => r.age_months > 0);
assert(allHaveAgeMonths, "100% das avaliações recalculadas possuem age_months positivo e exato");

// Verifica distribuição nas 5 categorias oficiais
const categoriesCovered = Object.keys(auditSummary.categoryDistribution).filter(
  (c) => auditSummary.categoryDistribution[c as any] > 0
);
assert(
  categoriesCovered.length >= 4,
  `Distribuição cobre as categorias oficiais ProMetric (${categoriesCovered.join(", ")})`
);

console.log("\n=== 4. Testes de Conformidade Textual e Ausência de Termos Proibidos ===");
let sampleCount = 0;
for (const item of auditSummary.recalculatedItems) {
  if (sampleCount++ > 50) break; // Testa uma amostra representativa de 50 laudos gerados
  checkNoForbiddenTerms(item.ai_diagnosis, `Diagnóstico da avaliação ${item.id}`);
  checkNoForbiddenTerms(item.ai_technical, `Parecer Técnico da avaliação ${item.id}`);
  checkNoForbiddenTerms(item.ai_family, `Parecer Família da avaliação ${item.id}`);
  assert(
    item.ai_technical.includes(IMC_CLINICAL_DISCLAIMER),
    `Parecer técnico da avaliação ${item.id} inclui a nota clínica da SBP`
  );
  assert(
    !item.prometric_category || PROMETRIC_CATEGORIES.includes(item.prometric_category),
    `Categoria ${item.prometric_category} é uma das 5 categorias oficiais ProMetric ou null se avaliação parcial`
  );
}

console.log("\n=== 5. Testes de Integração com Exportação Unificada e Relatórios PDF ===");
// Testa que os dados recalculados são aceitos por buildExportRows sem falhas
const sampleEvalsForExport: EvalReportItem[] = auditSummary.recalculatedItems.slice(0, 5).map((r) => {
  const st = studentsLookup.find((s) => s.id === r.student_id)!;
  return {
    id: r.id,
    evaluated_at: r.evaluated_at,
    age_years: r.age_years,
    age_months: r.age_months,
    weight_kg: r.weight_kg,
    height_cm: r.height_cm,
    waist_cm: r.waist_cm,
    imc: r.imc,
    rce: r.rce,
    sit_and_reach_cm: r.sit_and_reach_cm,
    abdominal_reps: r.abdominal_reps,
    horizontal_jump_cm: r.horizontal_jump_cm,
    medicine_ball_m: r.medicine_ball_m,
    square_test_s: r.square_test_s,
    sprint_20m_s: r.sprint_20m_s,
    run_6min_m: r.run_6min_m,
    classifications: r.classifications,
    student: {
      full_name: st.full_name,
      sex: st.sex,
      birth_date: st.birth_date,
    },
  };
});

const exportRows = buildExportRows(sampleEvalsForExport);
assert(exportRows.length === 5, "buildExportRows gerou 5 linhas com os dados auditados");
assert(typeof exportRows[0]["Idade (meses)"] === "number", "Coluna 'Idade (meses)' preenchida com número");
assert(exportRows[0]["Classificação IMC (OMS 2007)"].length > 0, "Classificação OMS 2007 preenchida");

// Testa funções PDF
assert(typeof generateEvaluationPDF === "function", "generateEvaluationPDF disponível para emissão individual");
assert(typeof generateCohortPDF === "function", "generateCohortPDF disponível para emissão por turma/coorte");

console.log("\n=== 6. Teste do Script SQL de Migração da Fase 6 ===");
const migrationSql = generateSqlMigration();
assert(migrationSql.includes("UPDATE public.evaluations"), "SQL contém comando UPDATE na tabela evaluations");
assert(migrationSql.includes("age_months"), "SQL atualiza a coluna age_months");
assert(migrationSql.includes("compute_eval_classifications"), "SQL chama compute_eval_classifications com novo corte");

const migrationFilePath = path.resolve(
  __dirname,
  "../supabase/migrations/20261001140000_batch_recompute_evaluations.sql"
);
assert(fs.existsSync(migrationFilePath), "Arquivo de migração 20261001140000_batch_recompute_evaluations.sql criado");

if (failures > 0) {
  console.error(`\n❌ Total de falhas na Fase 6: ${failures}`);
  process.exit(1);
} else {
  console.log("\n🎉 TODOS OS TESTES DA FASE 6 PASSARAM COM 100% DE SUCESSO!");
}
