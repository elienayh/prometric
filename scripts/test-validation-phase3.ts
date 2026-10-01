import {
  FIELD_RULES,
  validateField,
  normalizeHeight,
  normalizeEvaluationValues,
  isAgeInProespRange,
  validateEvaluation,
  PROESP_MIN_AGE,
  PROESP_MAX_AGE,
  PROESP_AGE_WARNING,
} from "../src/lib/validation";

let failures = 0;
function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

console.log("=== 1. Testes de Bloqueio de Valores Impossíveis (Erros Fisiológicos) ===");

// Peso: minImpossible 5, maxImpossible 250
assert(!validateField("weight_kg", 4).valid, "Peso 4 kg é bloqueado (< 5 kg)");
assert(validateField("weight_kg", 4).severity === "error", "Peso 4 kg tem severidade error");
assert(!validateField("weight_kg", 260).valid, "Peso 260 kg é bloqueado (> 250 kg)");
assert(validateField("weight_kg", 260).severity === "error", "Peso 260 kg tem severidade error");

// Altura: minImpossible 50, maxImpossible 240
assert(!validateField("height_cm", 40).valid, "Altura 40 cm é bloqueada (< 50 cm)");
assert(!validateField("height_cm", 250).valid, "Altura 250 cm é bloqueada (> 240 cm)");

// Cintura: minImpossible 25, maxImpossible 180
assert(!validateField("waist_cm", 20).valid, "Cintura 20 cm é bloqueada (< 25 cm)");
assert(!validateField("waist_cm", 190).valid, "Cintura 190 cm é bloqueada (> 180 cm)");

// Flexibilidade: minImpossible -20, maxImpossible 70
assert(!validateField("sit_and_reach_cm", -25).valid, "Flexibilidade -25 cm é bloqueada (< -20 cm)");
assert(!validateField("sit_and_reach_cm", 75).valid, "Flexibilidade 75 cm é bloqueada (> 70 cm)");

// Abdominal: minImpossible 0, maxImpossible 120
assert(!validateField("abdominal_reps", -5).valid, "Abdominal -5 reps é bloqueado (< 0)");
assert(!validateField("abdominal_reps", 130).valid, "Abdominal 130 reps é bloqueado (> 120)");

// Salto Horizontal: minImpossible 20, maxImpossible 350
assert(!validateField("horizontal_jump_cm", 15).valid, "Salto Horizontal 15 cm é bloqueado (< 20 cm)");
assert(!validateField("horizontal_jump_cm", 360).valid, "Salto Horizontal 360 cm é bloqueado (> 350 cm)");

// Medicine Ball: minImpossible 0.5, maxImpossible 15
assert(!validateField("medicine_ball_m", 0.3).valid, "Medicine ball 0.3 m é bloqueado (< 0.5 m)");
assert(!validateField("medicine_ball_m", 16).valid, "Medicine ball 16 m é bloqueado (> 15 m)");

// Agilidade (Quadrado): minImpossible 3.5, maxImpossible 30 (tempo)
assert(!validateField("square_test_s", 2.0).valid, "Quadrado 2.0 s é bloqueado (< 3.5 s - sobre-humano)");
assert(!validateField("square_test_s", 35).valid, "Quadrado 35 s é bloqueado (> 30 s)");

// Velocidade 20m: minImpossible 2.0, maxImpossible 20
assert(!validateField("sprint_20m_s", 1.5).valid, "Velocidade 20m 1.5 s é bloqueado (< 2.0 s - recorde mundial)");
assert(!validateField("sprint_20m_s", 22).valid, "Velocidade 20m 22 s é bloqueado (> 20 s)");

// Corrida 6min: minImpossible 100, maxImpossible 2500
assert(!validateField("run_6min_m", 50).valid, "Corrida 6min 50 m é bloqueado (< 100 m)");
assert(!validateField("run_6min_m", 2600).valid, "Corrida 6min 2600 m é bloqueado (> 2500 m)");

console.log("\n=== 2. Testes de Alerta de Valores Improváveis (Warnings) ===");

// Valores plausíveis usuais
assert(validateField("weight_kg", 8).valid && validateField("weight_kg", 8).severity === "warning", "Peso 8 kg gera alerta de improvável (< 10 kg)");
assert(validateField("weight_kg", 160).valid && validateField("weight_kg", 160).severity === "warning", "Peso 160 kg gera alerta de improvável (> 150 kg)");
assert(validateField("weight_kg", 45).valid && validateField("weight_kg", 45).severity === "ok", "Peso 45 kg está OK");

assert(validateField("height_cm", 85).valid && validateField("height_cm", 85).severity === "warning", "Altura 85 cm gera alerta (< 90 cm)");
assert(validateField("height_cm", 215).valid && validateField("height_cm", 215).severity === "warning", "Altura 215 cm gera alerta (> 210 cm)");
assert(validateField("height_cm", 150).valid && validateField("height_cm", 150).severity === "ok", "Altura 150 cm está OK");

assert(validateField("horizontal_jump_cm", 35).valid && validateField("horizontal_jump_cm", 35).severity === "warning", "Salto 35 cm gera alerta (< 40 cm)");
assert(validateField("horizontal_jump_cm", 310).valid && validateField("horizontal_jump_cm", 310).severity === "warning", "Salto 310 cm gera alerta (> 300 cm)");
assert(validateField("horizontal_jump_cm", 150).valid && validateField("horizontal_jump_cm", 150).severity === "ok", "Salto 150 cm está OK");

console.log("\n=== 3. Validação de Zero (Permitido vs Proibido) ===");

// Abdominal e flexibilidade permitem 0 (com alerta para confirmação)
const abdo0 = validateField("abdominal_reps", 0);
assert(abdo0.valid, "Abdominal = 0 é permitido");
assert(abdo0.severity === "warning", "Abdominal = 0 gera aviso de confirmação");

const flex0 = validateField("sit_and_reach_cm", 0);
assert(flex0.valid, "Flexibilidade = 0 é permitida");
assert(flex0.severity === "warning", "Flexibilidade = 0 gera aviso de confirmação");

// Peso, altura, salto, etc. NÃO permitem 0
const peso0 = validateField("weight_kg", 0);
assert(!peso0.valid && peso0.severity === "error", "Peso = 0 é BLOQUEADO");

const alt0 = validateField("height_cm", 0);
assert(!alt0.valid && alt0.severity === "error", "Altura = 0 é BLOQUEADA");

const salto0 = validateField("horizontal_jump_cm", 0);
assert(!salto0.valid && salto0.severity === "error", "Salto = 0 é BLOQUEADO");

console.log("\n=== 4. Tratamento de Altura em Metros (Normalização e Sugestão) ===");

const h1 = normalizeHeight(1.65);
assert(h1.convertedFromMeters && h1.normalized === 165, "1.65 m normalizado para 165 cm");

const h2 = normalizeHeight("1,45");
assert(h2.convertedFromMeters && h2.normalized === 145, "'1,45' normalizado para 145 cm");

const h3 = normalizeHeight("1.70");
assert(h3.convertedFromMeters && h3.normalized === 170, "'1.70' normalizado para 170 cm");

const h4 = normalizeHeight(160);
assert(!h4.convertedFromMeters && h4.normalized === 160, "160 cm mantido sem alteração");

const valH = validateField("height_cm", "1.52");
assert(valH.valid && valH.severity === "warning" && valH.suggestedValue === 152, "validateField sugere 152 cm para 1.52 m");

const normObj = normalizeEvaluationValues({ weight_kg: 50, height_cm: "1.75" });
assert(normObj.height_cm === 175, "normalizeEvaluationValues converteu height_cm para 175 cm");

console.log("\n=== 5. Faixa Etária PROESP-BR (6 a 17 anos) ===");

assert(PROESP_MIN_AGE === 6 && PROESP_MAX_AGE === 17, "Constantes PROESP 6 a 17 anos");
assert(!isAgeInProespRange(5), "Idade 5 anos está fora do PROESP");
assert(isAgeInProespRange(6), "Idade 6 anos está dentro do PROESP");
assert(isAgeInProespRange(12), "Idade 12 anos está dentro do PROESP");
assert(isAgeInProespRange(17), "Idade 17 anos está dentro do PROESP");
assert(!isAgeInProespRange(18), "Idade 18 anos está fora do PROESP");

const evalUnder6 = validateEvaluation({ weight_kg: 20, height_cm: 110 }, 5);
assert(evalUnder6.ageWarning === PROESP_AGE_WARNING, "Aviso de idade presente para aluno de 5 anos");

const evalIn10 = validateEvaluation({ weight_kg: 35, height_cm: 140 }, 10);
assert(evalIn10.ageWarning === undefined, "Sem aviso de idade para aluno de 10 anos");

console.log("\n=== 6. Validação Completa de Avaliação (validateEvaluation) ===");

const validEval = validateEvaluation({
  weight_kg: 42,
  height_cm: 152,
  waist_cm: 64,
  abdominal_reps: 25,
  horizontal_jump_cm: 140,
}, 11);
assert(validEval.valid, "Avaliação com valores corretos é válida");
assert(!validEval.hasBlockingErrors, "Avaliação correta não tem erros bloqueantes");
assert(Object.keys(validEval.errors).length === 0, "Sem erros");

const invalidEval = validateEvaluation({
  weight_kg: 500, // Impossível
  height_cm: 152,
  horizontal_jump_cm: 0, // Zero proibido
}, 11);
assert(!invalidEval.valid, "Avaliação com peso 500 e salto 0 é inválida");
assert(invalidEval.hasBlockingErrors, "hasBlockingErrors é true");
assert(invalidEval.errors.weight_kg !== undefined, "Erro presente em weight_kg");
assert(invalidEval.errors.horizontal_jump_cm !== undefined, "Erro presente em horizontal_jump_cm");

if (failures > 0) {
  console.error(`\n❌ Total de falhas: ${failures}`);
  process.exit(1);
} else {
  console.log("\n🎉 TODOS OS TESTES DA FASE 3 PASSARAM COM 100% DE SUCESSO!");
}
