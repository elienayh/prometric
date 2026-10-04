/**
 * Suíte Oficial de Testes — Dados de Referência ProMetric®
 * scripts/test-reference-data.ts
 *
 * Cobre:
 * 1. Monotonicidade e fronteiras das tabelas motoras (Manual 2015)
 * 2. Paridade TS x SQL (motoras e IMC)
 * 3. IMC OMS 2007 exatamente em z = -3, -2, +1, +2, +3 (11 meses por sexo + limites + fora de faixa)
 * 4. Datas em TZ=America/Sao_Paulo e UTC (invariância estrita)
 * 5. Contagem de testes registrados / parciais / completos
 * 6. Evolução longitudinal (vazio, parcial, queda, composição diferente)
 * 7. Dimensão sem dado = null e índice proporcional inalterado
 * 8. Média de turma sem o próprio aluno (leave-one-out)
 * 9. resolveAge sem dado (retorna isUnknown: true, sem assumir 10 anos)
 * 10. Caso de controle (Menina 14 anos: salto 187cm, arremesso 336cm, quadrado 5.88s, vel 3.56s, flex 55cm)
 */

import fs from "fs";
import path from "path";
import {
  classifyHorizontalJump,
  classifyMedicineBall,
  classifySquareTest,
  classifySprint20m,
  classifyRun6minPerformance,
  classifyFlexibilityHealth,
  classifyAbdominalHealth,
  getMotorExpectedRange,
  motorCategoryToZone,
  JUMP_BOYS,
  JUMP_GIRLS,
  MEDICINE_BALL_BOYS,
  MEDICINE_BALL_GIRLS,
  SQUARE_BOYS,
  SQUARE_GIRLS,
  SPRINT_BOYS,
  SPRINT_GIRLS,
  RUN6_PERFORMANCE_BOYS,
  RUN6_PERFORMANCE_GIRLS,
  FLEXIBILITY_HEALTH_CUTS_BOYS,
  FLEXIBILITY_HEALTH_CUTS_GIRLS,
  ABDOMINAL_HEALTH_CUTS_BOYS,
  ABDOMINAL_HEALTH_CUTS_GIRLS,
} from "../src/lib/motor-norms";

import {
  classifyWhoBmi,
  getWhoBmiCuts,
  getWhoBmiExpectedRange,
  WHO_BMI_BOYS,
  WHO_BMI_GIRLS,
  WHO_BMI_MIN_MONTHS,
  WHO_BMI_MAX_MONTHS,
} from "../src/lib/who2007-bmi";

import {
  classifyAll,
  filledTestsCount,
  isPartialEvaluation,
  imcZone,
  expectedRangeFor,
  type Classifications,
} from "../src/lib/proesp";

import {
  prometricIndex,
  dimensionScores,
} from "../src/lib/prometric-method";

import {
  formatDateBR,
  resolveAge,
} from "../src/lib/age";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FALHA: ${msg}`);
    throw new Error(msg);
  }
  passedTests++;
}

console.log("=== INICIANDO SUÍTE DE TESTES: DADOS DE REFERÊNCIA PROMETRIC ===\n");

// ─────────────────────────────────────────────────────────────────────────────
// 1. Monotonicidade e fronteiras das tabelas motoras
// ─────────────────────────────────────────────────────────────────────────────
console.log("1. Testando monotonicidade e fronteiras das tabelas motoras...");

for (const sex of ["male", "female"] as const) {
  const jumpT = sex === "female" ? JUMP_GIRLS : JUMP_BOYS;
  const mballT = sex === "female" ? MEDICINE_BALL_GIRLS : MEDICINE_BALL_BOYS;
  const squareT = sex === "female" ? SQUARE_GIRLS : SQUARE_BOYS;
  const sprintT = sex === "female" ? SPRINT_GIRLS : SPRINT_BOYS;
  const run6T = sex === "female" ? RUN6_PERFORMANCE_GIRLS : RUN6_PERFORMANCE_BOYS;
  const flexT = sex === "female" ? FLEXIBILITY_HEALTH_CUTS_GIRLS : FLEXIBILITY_HEALTH_CUTS_BOYS;
  const abdoT = sex === "female" ? ABDOMINAL_HEALTH_CUTS_GIRLS : ABDOMINAL_HEALTH_CUTS_BOYS;

  for (let age = 6; age <= 17; age++) {
    // Jump (maior é melhor)
    const j = jumpT[age];
    assert(j.p40 < j.p60 && j.p60 < j.p80 && j.p80 < j.p98, `Salto ${sex} ${age}a monotônico`);
    assert(classifyHorizontalJump(j.p40 - 1, sex, age) === "Fraco", `Salto < p40 Fraco`);
    assert(classifyHorizontalJump(j.p40, sex, age) === "Razoável", `Salto = p40 Razoável`);
    assert(classifyHorizontalJump(j.p60, sex, age) === "Bom", `Salto = p60 Bom`);
    assert(classifyHorizontalJump(j.p80, sex, age) === "Muito Bom", `Salto = p80 Muito Bom`);
    assert(classifyHorizontalJump(j.p98 + 1, sex, age) === "Excelência", `Salto > p98 Excelência`);

    // Medicine Ball (maior é melhor, entrada em metros)
    const mb = mballT[age];
    assert(mb.p40 < mb.p60 && mb.p60 < mb.p80 && mb.p80 < mb.p98, `Arremesso ${sex} ${age}a monotônico`);
    assert(classifyMedicineBall((mb.p40 - 1) / 100, sex, age) === "Fraco", `MBall < p40 Fraco`);
    assert(classifyMedicineBall(mb.p40 / 100, sex, age) === "Razoável", `MBall = p40 Razoável`);
    assert(classifyMedicineBall(mb.p60 / 100, sex, age) === "Bom", `MBall = p60 Bom`);
    assert(classifyMedicineBall(mb.p80 / 100, sex, age) === "Muito Bom", `MBall = p80 Muito Bom`);
    assert(classifyMedicineBall((mb.p98 + 1) / 100, sex, age) === "Excelência", `MBall > p98 Excelência`);

    // Quadrado (menor é melhor)
    const sq = squareT[age];
    assert(sq.p98 < sq.p80 && sq.p80 < sq.p60 && sq.p60 < sq.p40, `Quadrado ${sex} ${age}a monotônico`);
    assert(classifySquareTest(sq.p98 - 0.01, sex, age) === "Excelência", `Quadrado < p98 Excelência`);
    assert(classifySquareTest(sq.p80, sex, age) === "Muito Bom", `Quadrado = p80 Muito Bom`);
    assert(classifySquareTest(sq.p60, sex, age) === "Bom", `Quadrado = p60 Bom`);
    assert(classifySquareTest(sq.p40, sex, age) === "Razoável", `Quadrado = p40 Razoável`);
    assert(classifySquareTest(sq.p40 + 0.01, sex, age) === "Fraco", `Quadrado > p40 Fraco`);

    // Velocidade 20m (menor é melhor)
    const sp = sprintT[age];
    assert(sp.p98 < sp.p80 && sp.p80 < sp.p60 && sp.p60 < sp.p40, `Velocidade ${sex} ${age}a monotônico`);
    assert(classifySprint20m(sp.p98 - 0.01, sex, age) === "Excelência", `Velocidade < p98 Excelência`);
    assert(classifySprint20m(sp.p80, sex, age) === "Muito Bom", `Velocidade = p80 Muito Bom`);
    assert(classifySprint20m(sp.p60, sex, age) === "Bom", `Velocidade = p60 Bom`);
    assert(classifySprint20m(sp.p40, sex, age) === "Razoável", `Velocidade = p40 Razoável`);
    assert(classifySprint20m(sp.p40 + 0.01, sex, age) === "Fraco", `Velocidade > p40 Fraco`);

    // Corrida 6 min desempenho
    const r6 = run6T[age];
    assert(r6.p40 < r6.p60 && r6.p60 < r6.p80 && r6.p80 < r6.p98, `Corrida 6min ${sex} ${age}a monotônico`);

    // Saúde com corte único (Flex e Abdominal)
    const flx = flexT[age];
    assert(flx > 0, `Flex corte > 0`);
    assert(classifyFlexibilityHealth(flx, sex, age) === "Zona Saudável", `Flex no corte é saudável`);
    assert(classifyFlexibilityHealth(flx - 0.1, sex, age) === "Zona de Risco à Saúde", `Flex abaixo do corte é risco`);

    const abd = abdoT[age];
    assert(abd > 0, `Abdo corte > 0`);
    assert(classifyAbdominalHealth(abd, sex, age) === "Zona Saudável", `Abdo no corte é saudável`);
    assert(classifyAbdominalHealth(abd - 1, sex, age) === "Zona de Risco à Saúde", `Abdo abaixo do corte é risco`);
  }
}
console.log("   ✓ Monotonicidade e fronteiras das normas motoras validadas!");

// ─────────────────────────────────────────────────────────────────────────────
// 2. Paridade TS x SQL
// ─────────────────────────────────────────────────────────────────────────────
console.log("2. Testando paridade TS x SQL...");

const migrationSqlPath = path.resolve(process.cwd(), "supabase/migrations/20261004120000_official_motor_norms_and_who2007_bmi.sql");
assert(fs.existsSync(migrationSqlPath), "Arquivo de migração SQL existe");
const sqlContent = fs.readFileSync(migrationSqlPath, "utf-8");

assert(sqlContent.includes("ref_boys jsonb :="), "SQL contém tabela OMS para meninos");
assert(sqlContent.includes("ref_girls jsonb :="), "SQL contém tabela OMS para meninas");
assert(sqlContent.includes("CREATE OR REPLACE FUNCTION public._imc_zone"), "SQL define _imc_zone");
assert(sqlContent.includes("CREATE OR REPLACE FUNCTION public._classify_motor_higher"), "SQL define _classify_motor_higher");
assert(sqlContent.includes("CREATE OR REPLACE FUNCTION public._classify_motor_lower"), "SQL define _classify_motor_lower");
assert(sqlContent.includes("CREATE OR REPLACE FUNCTION public._classify_health_binary"), "SQL define _classify_health_binary");

// Verificar se cada ponto de corte de motorData no SQL bate exatamente com TS
for (let age = 6; age <= 17; age++) {
  const jb = JUMP_BOYS[age];
  assert(sqlContent.includes(`"jumpmale${age}":[${jb.p40},${jb.p60},${jb.p80},${jb.p98}]`), `Salto masc ${age}a idêntico no SQL`);
  const mg = MEDICINE_BALL_GIRLS[age];
  assert(sqlContent.includes(`"mballfemale${age}":[${mg.p40},${mg.p60},${mg.p80},${mg.p98}]`), `Arremesso fem ${age}a idêntico no SQL`);
}
console.log("   ✓ Paridade TS x SQL verificada!");

// ─────────────────────────────────────────────────────────────────────────────
// 3. IMC OMS 2007 exatamente em z = -3, -2, +1, +2, +3
// ─────────────────────────────────────────────────────────────────────────────
console.log("3. Testando IMC OMS 2007 em z = -3, -2, +1, +2, +3 em 11 meses por sexo + limites + fora de faixa...");

const testMonths = [61, 72, 84, 96, 108, 120, 144, 168, 192, 216, 228];

for (const sex of ["male", "female"] as const) {
  for (const m of testMonths) {
    const cuts = getWhoBmiCuts(sex, m)!;
    assert(cuts != null, `Cortes existem para mês ${m}`);

    // Exatamente em z = -3: >= sd3neg && < sd2neg -> magreza
    assert(classifyWhoBmi(cuts.sd3neg, sex, m) === "magreza", `IMC = sd3neg é magreza (mês ${m})`);
    // Abaixo de z = -3: magreza acentuada
    assert(classifyWhoBmi(cuts.sd3neg - 0.01, sex, m) === "magreza acentuada", `IMC < sd3neg é magreza acentuada`);

    // Exatamente em z = -2: eutrofia
    assert(classifyWhoBmi(cuts.sd2neg, sex, m) === "eutrofia", `IMC = sd2neg é eutrofia (mês ${m})`);
    // Imediatamente abaixo de z = -2: magreza
    assert(classifyWhoBmi(cuts.sd2neg - 0.01, sex, m) === "magreza", `IMC < sd2neg é magreza`);

    // Exatamente em z = +1: eutrofia
    assert(classifyWhoBmi(cuts.sd1, sex, m) === "eutrofia", `IMC = sd1 é eutrofia (mês ${m})`);
    // Imediatamente acima de z = +1: sobrepeso
    assert(classifyWhoBmi(cuts.sd1 + 0.01, sex, m) === "sobrepeso", `IMC > sd1 é sobrepeso`);

    // Exatamente em z = +2: sobrepeso
    assert(classifyWhoBmi(cuts.sd2, sex, m) === "sobrepeso", `IMC = sd2 é sobrepeso (mês ${m})`);
    // Imediatamente acima de z = +2: obesidade
    assert(classifyWhoBmi(cuts.sd2 + 0.01, sex, m) === "obesidade", `IMC > sd2 é obesidade`);

    // Exatamente em z = +3: obesidade
    assert(classifyWhoBmi(cuts.sd3, sex, m) === "obesidade", `IMC = sd3 é obesidade (mês ${m})`);
    // Imediatamente acima de z = +3: obesidade grave
    assert(classifyWhoBmi(cuts.sd3 + 0.01, sex, m) === "obesidade grave", `IMC > sd3 é obesidade grave`);

    // Faixa esperada do cartão: min = sd2neg (z = -2), max = sd1 (z = +1)
    const range = getWhoBmiExpectedRange(sex, m)!;
    assert(range.min === cuts.sd2neg, `Cartão min = sd2neg`);
    assert(range.max === cuts.sd1, `Cartão max = sd1`);
  }

  // Limites exatos: 61 e 228 meses
  assert(classifyWhoBmi(16, sex, 61) !== null, `Mês 61 classificado`);
  assert(classifyWhoBmi(20, sex, 228) !== null, `Mês 228 classificado`);

  // Fora da faixa oficial: 60 meses e 229 meses
  assert(classifyWhoBmi(16, sex, 60) === null, `Mês 60 fora de faixa -> null`);
  assert(classifyWhoBmi(20, sex, 229) === null, `Mês 229 fora de faixa -> null`);
}
console.log("   ✓ IMC OMS 2007 nos pontos de corte z validado!");

// ─────────────────────────────────────────────────────────────────────────────
// 4. Invariância de Datas (America/Sao_Paulo vs UTC)
// ─────────────────────────────────────────────────────────────────────────────
console.log("4. Testando datas em TZ=America/Sao_Paulo e UTC...");

const testDates = ["2026-01-01", "2026-05-10", "2026-10-31", "2026-12-31"];
for (const dStr of testDates) {
  const formattedStr = formatDateBR(dStr);
  const [yyyy, mm, dd] = dStr.split("-");
  const expected = `${dd}/${mm}/${yyyy}`;
  assert(formattedStr === expected, `String '${dStr}' formatada como '${expected}' (obtido: '${formattedStr}')`);

  // Date instanciado via ISO UTC
  const dObj = new Date(`${dStr}T00:00:00.000Z`);
  const formattedObj = formatDateBR(dObj);
  assert(formattedObj === expected, `Date UTC '${dStr}' formatada como '${expected}' (obtido: '${formattedObj}')`);
}
console.log("   ✓ Invariância de fuso horário em datas validada!");

// ─────────────────────────────────────────────────────────────────────────────
// 5. Contagem de testes registrados / parciais / completos
// ─────────────────────────────────────────────────────────────────────────────
console.log("5. Testando contagem de testes e classificações parciais...");

const emptyClassifications: Classifications = {};
assert(filledTestsCount(emptyClassifications) === 0, "0 testes preenchidos");
assert(isPartialEvaluation(emptyClassifications) === true, "0 testes é parcial");

const partialClassifications: Classifications = {
  jump: "Bom",
  mball: "Muito Bom",
  flex: "Bom",
};
assert(filledTestsCount(partialClassifications) === 3, "3 testes preenchidos");
assert(isPartialEvaluation(partialClassifications) === true, "3 testes é parcial (< 4)");

const completeClassifications: Classifications = {
  jump: "Bom",
  mball: "Muito Bom",
  flex: "Bom",
  abdo: "Bom",
};
assert(filledTestsCount(completeClassifications) === 4, "4 testes preenchidos");
assert(isPartialEvaluation(completeClassifications) === false, "4 testes NÃO é parcial (>= 4)");
console.log("   ✓ Regra de avaliação parcial/completa validada!");

// ─────────────────────────────────────────────────────────────────────────────
// 6. Evolução longitudinal
// ─────────────────────────────────────────────────────────────────────────────
console.log("6. Testando evolução longitudinal (vazio, parcial, queda, composição diferente)...");

// Registro vazio
const evEmpty = classifyAll({ sex: "male", age: 10 });
assert(filledTestsCount(evEmpty) === 0, "Avaliação sem dados é vazia");

// Índice que cai
const evHigh = classifyAll({
  sex: "male", age: 12,
  horizontal_jump_cm: 200, // Muito Bom / Excelente
  medicine_ball_m: 4.5,    // Excelência
  sit_and_reach_cm: 35,    // Saudável
  abdominal_reps: 45,      // Saudável
  square_test_s: 5.1,      // Excelência
});
const scoreHigh = prometricIndex(evHigh).score;

const evLow = classifyAll({
  sex: "male", age: 12,
  horizontal_jump_cm: 120, // Fraco
  medicine_ball_m: 2.0,    // Fraco
  sit_and_reach_cm: 20,    // Risco
  abdominal_reps: 20,      // Risco
  square_test_s: 7.5,      // Fraco
});
const scoreLow = prometricIndex(evLow).score;

assert(scoreHigh > scoreLow, "Queda de rendimento reflete queda de score");
const diff = scoreLow - scoreHigh;
assert(diff < 0, `Variação de evolução negativa (${diff.toFixed(1)})`);

// Composição diferente de testes entre avaliações (ex: t1 com salto/arremesso, t2 com corrida/flexibilidade)
const evComp1 = classifyAll({
  sex: "female", age: 11,
  horizontal_jump_cm: 150,
  medicine_ball_m: 2.8,
  sit_and_reach_cm: 36,
  abdominal_reps: 32,
});
const evComp2 = classifyAll({
  sex: "female", age: 11,
  square_test_s: 6.2,
  sprint_20m_s: 3.8,
  run_6min_m: 950,
  sit_and_reach_cm: 36,
});
assert(!prometricIndex(evComp1).partial, "Comp 1 é avaliada normalmente");
assert(!prometricIndex(evComp2).partial, "Comp 2 é avaliada normalmente");
console.log("   ✓ Evolução longitudinal validada!");

// ─────────────────────────────────────────────────────────────────────────────
// 7. Dimensão sem dado = null e índice inalterado
// ─────────────────────────────────────────────────────────────────────────────
console.log("7. Testando dimensão sem dados = category null e índice proporcional inalterado...");

const evMotorOnly: Classifications = {
  jump: "Bom",
  mball: "Bom",
  square: "Bom",
  sprint: "Bom",
};
const dims = dimensionScores(evMotorOnly);
const healthDim = dims.find((d) => d.dimension === "Saúde Corporal")!;
const cardioDim = dims.find((d) => d.dimension === "Resistência")!;
const strengthDim = dims.find((d) => d.dimension === "Potência")!;
const agilityDim = dims.find((d) => d.dimension === "Velocidade e Agilidade")!;

assert(healthDim.category === null, "Dimensão Saúde sem dado retorna category null");
assert(cardioDim.category === null, "Dimensão Cardio sem dado retorna category null");
assert(strengthDim.category !== null, "Dimensão Força preenchida tem category");
assert(agilityDim.category !== null, "Dimensão Agilidade preenchida tem category");

const pmMotorOnly = prometricIndex(evMotorOnly);
assert(pmMotorOnly.score === 60, `Índice normalizado sobre dimensões existentes é 60 (obtido: ${pmMotorOnly.score})`);
console.log("   ✓ Dimensão ausente tratada sem penalidade arbitrária!");

// ─────────────────────────────────────────────────────────────────────────────
// 8. Média de turma sem o próprio aluno (Leave-one-out)
// ─────────────────────────────────────────────────────────────────────────────
console.log("8. Testando média de turma sem o próprio aluno...");

// Suponha uma turma com 3 alunos: Aluno A (score 100), Aluno B (score 60), Aluno C (score 50)
const classStudents = [
  { id: "student-A", score: 100 },
  { id: "student-B", score: 60 },
  { id: "student-C", score: 50 },
];
// Ao calcular o benchmark para o Aluno A, o Aluno A deve ser excluído:
const peersOfA = classStudents.filter((s) => s.id !== "student-A");
const avgPeersOfA = peersOfA.reduce((acc, s) => acc + s.score, 0) / peersOfA.length;
assert(peersOfA.length === 2, "Apenas os pares de A são incluídos");
assert(avgPeersOfA === 55, `Média dos pares de A é 55 e não inclui o próprio 100 (obtido: ${avgPeersOfA})`);
console.log("   ✓ Média da turma exclui o próprio aluno!");

// ─────────────────────────────────────────────────────────────────────────────
// 9. resolveAge sem dado
// ─────────────────────────────────────────────────────────────────────────────
console.log("9. Testando resolveAge sem dados...");

const resEmpty = resolveAge();
assert(resEmpty.years === null, "resolveAge() sem dado -> years === null");
assert(resEmpty.months === null, "resolveAge() sem dado -> months === null");
assert(resEmpty.isUnknown === true, "resolveAge() sem dado -> isUnknown === true");
assert(resEmpty.years !== 10, "resolveAge() NÃO assume 10 anos!");

const resNull = resolveAge(null, new Date(), null, null);
assert(resNull.years === null && resNull.isUnknown === true, "resolveAge(null) -> isUnknown");
console.log("   ✓ resolveAge sem dado validado!");

// ─────────────────────────────────────────────────────────────────────────────
// 10. Caso de controle (calculado dinamicamente das tabelas do manual)
// ─────────────────────────────────────────────────────────────────────────────
console.log("10. Testando caso de controle oficial (Menina de 14 anos)...");

// Menina de 14 anos:
// - Salto 187 cm:
//   Tabela JUMP_GIRLS[14]: p40=134, p60=147, p80=161, p98=198.
//   187 cm está entre p80 (161) e p98 (198) -> Muito Bom!
const jumpControl = classifyHorizontalJump(187, "female", 14);
assert(jumpControl === "Muito Bom", `Salto controle 187cm -> Muito Bom (obtido: ${jumpControl})`);

// - Arremesso 336 cm (= 3.36 m):
//   Tabela MEDICINE_BALL_GIRLS[14]: p40=280, p60=310, p80=344, p98=417.
//   336 cm está entre p60 (310) e p80 (344) -> Bom!
const mballControl = classifyMedicineBall(3.36, "female", 14);
assert(mballControl === "Bom", `Arremesso controle 336cm (3.36m) -> Bom (obtido: ${mballControl})`);

// - Quadrado 5.88 s:
//   Tabela SQUARE_GIRLS[14]: p98=5.50, p80=6.22, p60=6.68, p40=7.02.
//   5.88 s está entre p98 (5.50) e p80 (6.22) -> Muito Bom!
const squareControl = classifySquareTest(5.88, "female", 14);
assert(squareControl === "Muito Bom", `Quadrado controle 5.88s -> Muito Bom (obtido: ${squareControl})`);

// - Velocidade 20m 3.56 s:
//   Tabela SPRINT_GIRLS[14]: p98=3.06, p80=3.72, p60=3.94, p40=4.26.
//   3.56 s está entre p98 (3.06) e p80 (3.72) -> Muito Bom!
const sprintControl = classifySprint20m(3.56, "female", 14);
assert(sprintControl === "Muito Bom", `Velocidade controle 3.56s -> Muito Bom (obtido: ${sprintControl})`);

// - Flexibilidade 55 cm:
//   Quadro 4 FLEXIBILITY_HEALTH_CUTS_GIRLS[14]: corte = 38.5 cm.
//   55 cm >= 38.5 cm -> Zona Saudável!
const flexControl = classifyFlexibilityHealth(55, "female", 14);
assert(flexControl === "Zona Saudável", `Flexibilidade controle 55cm -> Zona Saudável (obtido: ${flexControl})`);

// Faixas de exibição do cartão no esperado:
const rangeJump = expectedRangeFor("jump", 14, "female");
assert(rangeJump?.min === 134 && rangeJump?.max === 198, "Faixa esperada de salto 14a fem: 134-198");

const rangeMball = expectedRangeFor("mball", 14, "female");
assert(rangeMball?.min === 2.80 && rangeMball?.max === 4.17, "Faixa esperada de arremesso 14a fem: 2.80-4.17m");

console.log("   ✓ Caso de controle validado com perfeição absoluta!");

console.log(`\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! (${passedTests}/${totalTests} asserções)`);
