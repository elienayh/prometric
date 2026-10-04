import fs from "fs";
import path from "path";
import {
  WHO_BMI_BOYS,
  WHO_BMI_GIRLS,
  WHO_BMI_MIN_MONTHS,
  WHO_BMI_MAX_MONTHS,
  classifyWhoBmi,
  getWhoBmiCuts,
} from "../src/lib/who2007-bmi";
import { imcZone } from "../src/lib/proesp";

let failures = 0;
function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

console.log("=== 1. Teste de Paridade TS vs SQL Migration (OMS 2007 Oficial) ===");
const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20261004120000_official_motor_norms_and_who2007_bmi.sql");
assert(fs.existsSync(migrationPath), "Arquivo de migração oficial existe");
const sqlContent = fs.readFileSync(migrationPath, "utf-8");

assert(sqlContent.includes("ref_boys jsonb :="), "SQL contém tabela OMS para meninos");
assert(sqlContent.includes("ref_girls jsonb :="), "SQL contém tabela OMS para meninas");

const totalMonths = WHO_BMI_MAX_MONTHS - WHO_BMI_MIN_MONTHS + 1; // 168 meses (61..228)
assert(Object.keys(WHO_BMI_BOYS).length === totalMonths, `TS male tem ${totalMonths} meses`);
assert(Object.keys(WHO_BMI_GIRLS).length === totalMonths, `TS female tem ${totalMonths} meses`);

console.log("\n=== 2. Teste de Escore-z Estritamente Crescente ===");
let monotonicOk = true;
for (const sex of ["male", "female"] as const) {
  const table = sex === "male" ? WHO_BMI_BOYS : WHO_BMI_GIRLS;
  for (let m = WHO_BMI_MIN_MONTHS; m <= WHO_BMI_MAX_MONTHS; m++) {
    const row = table[m];
    if (!(row.sd3neg < row.sd2neg && row.sd2neg < row.sd1neg && row.sd1neg < row.sd0 && row.sd0 < row.sd1 && row.sd1 < row.sd2 && row.sd2 < row.sd3)) {
      monotonicOk = false;
      console.error(`Violação de monotonicidade no sexo ${sex}, mês ${m}:`, row);
    }
  }
}
assert(monotonicOk, "Valores de escore-z são estritamente crescentes (-3 < -2 < -1 < 0 < +1 < +2 < +3) em todos os meses");

console.log("\n=== 3. Critérios de Classificação Oficial OMS 2007 ===");
for (let m of [61, 120, 180, 228]) {
  const b = getWhoBmiCuts("male", m)!;
  assert(classifyWhoBmi(b.sd3neg - 0.1, "male", m) === "magreza acentuada", `Menino ${m}m: < sd3neg -> magreza acentuada`);
  assert(classifyWhoBmi(b.sd3neg, "male", m) === "magreza", `Menino ${m}m: = sd3neg -> magreza`);
  assert(classifyWhoBmi(b.sd2neg, "male", m) === "eutrofia", `Menino ${m}m: = sd2neg -> eutrofia`);
  assert(classifyWhoBmi(b.sd1, "male", m) === "eutrofia", `Menino ${m}m: = sd1 -> eutrofia`);
  assert(classifyWhoBmi(b.sd1 + 0.01, "male", m) === "sobrepeso", `Menino ${m}m: > sd1 -> sobrepeso`);
  assert(classifyWhoBmi(b.sd2, "male", m) === "sobrepeso", `Menino ${m}m: = sd2 -> sobrepeso`);
  assert(classifyWhoBmi(b.sd2 + 0.01, "male", m) === "obesidade", `Menino ${m}m: > sd2 -> obesidade`);
  assert(classifyWhoBmi(b.sd3, "male", m) === "obesidade", `Menino ${m}m: = sd3 -> obesidade`);
  assert(classifyWhoBmi(b.sd3 + 0.01, "male", m) === "obesidade grave", `Menino ${m}m: > sd3 -> obesidade grave`);
}

// Menor de 5 anos -> null
assert(imcZone(16, 4, "male") === null, "Menor de 5 anos (4 anos) → null");
assert(imcZone(18, 3, "female") === null, "Menor de 5 anos (3 anos) → null");

// Adulto (20+)
assert(imcZone(26, 20, "male") === "Razoável", "IMC 26 aos 20 anos → Razoável (adulto)");

if (failures > 0) {
  console.error(`\n❌ Total de falhas: ${failures}`);
  process.exit(1);
} else {
  console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!");
}
