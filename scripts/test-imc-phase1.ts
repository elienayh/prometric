import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { IMC_REF, IMC_REF_MIN_MONTHS, IMC_REF_MAX_MONTHS, imcCutsForAge, imcBand, IMC_BAND_TO_ZONE } from "../src/lib/imc-reference";
import { imcZone } from "../src/lib/proesp";

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

console.log("=== 1. Teste de Paridade TS vs SQL Migration ===");
const migrationPath = path.resolve(__dirname, "../supabase/migrations/20260930120000_imc_who_2007_reference.sql");
const sqlContent = fs.readFileSync(migrationPath, "utf-8");
const jsonMatch = sqlContent.match(/ref\s+jsonb\s*:=\s*'([^']+)'::jsonb/);
if (!jsonMatch) {
  assert(false, "Não foi possível extrair o JSON da migração SQL");
} else {
  const sqlJson = JSON.parse(jsonMatch[1]);
  assert(Array.isArray(sqlJson.male) && sqlJson.male.length === 169, "SQL male tem 169 meses");
  assert(Array.isArray(sqlJson.female) && sqlJson.female.length === 169, "SQL female tem 169 meses");
  assert(IMC_REF.male.length === 169, "TS male tem 169 meses");
  assert(IMC_REF.female.length === 169, "TS female tem 169 meses");

  let diffCount = 0;
  for (let m = 0; m < 169; m++) {
    for (let c = 0; c < 5; c++) {
      if (sqlJson.male[m][c] !== IMC_REF.male[m][c]) diffCount++;
      if (sqlJson.female[m][c] !== IMC_REF.female[m][c]) diffCount++;
    }
  }
  assert(diffCount === 0, `Paridade total TS x SQL: 0 divergências em todos os 169 meses x 5 percentis x 2 sexos`);
}

console.log("\n=== 2. Teste de Percentis Estritamente Crescentes ===");
let monotonicOk = true;
for (const sex of ["male", "female"] as const) {
  const table = IMC_REF[sex];
  for (let idx = 0; idx < table.length; idx++) {
    const [p3, p15, p50, p85, p97] = table[idx];
    if (!(p3 < p15 && p15 < p50 && p50 < p85 && p85 < p97)) {
      monotonicOk = false;
      console.error(`Violação de monotonicidade no sexo ${sex}, mês ${idx + 60}:`, table[idx]);
    }
  }
}
assert(monotonicOk, "Percentis são estritamente crescentes (P3 < P15 < P50 < P85 < P97) em todos os 169 meses nos dois sexos");

console.log("\n=== 3. Critérios de Aceite Obrigatórios ===");

// 1. Menino, IMC 20 aos 8 anos → Muito Fraco; IMC 22 aos 9 → Muito Fraco; IMC 20 aos 10 → Razoável.
assert(imcZone(20, 8, "male") === "Muito Fraco", "Menino, IMC 20 aos 8 anos → Muito Fraco");
assert(imcZone(22, 9, "male") === "Muito Fraco", "Menino, IMC 22 aos 9 anos → Muito Fraco");
assert(imcZone(20, 10, "male") === "Razoável", "Menino, IMC 20 aos 10 anos → Razoável");

// 2. Menino, IMC 16,5 aos 16 anos → Fraco; IMC 17,4 aos 17 → Bom; IMC 19 aos 17 → Excelente.
assert(imcZone(16.5, 16, "male") === "Fraco", "Menino, IMC 16,5 aos 16 anos → Fraco");
assert(imcZone(17.4, 17, "male") === "Bom", "Menino, IMC 17,4 aos 17 anos → Bom");
assert(imcZone(19, 17, "male") === "Excelente", "Menino, IMC 19 aos 17 anos → Excelente");

// 3. Menino 10 anos (120 meses): cortes ≈ 13.8 / 14.9 / 16.4 / 18.6 / 21.0. Menina 10 anos: 13.6 / 14.8 / 16.6 / 19.1 / 22.1.
const cutsBoy10 = imcCutsForAge("male", 120);
console.log("Cortes Menino 10 anos (120m):", cutsBoy10.map(v => v.toFixed(1)).join(" / "));
assert(cutsBoy10.map(v => v.toFixed(1)).join(" / ") === "13.8 / 14.9 / 16.4 / 18.6 / 21.0", "Menino 10 anos (120 meses) cortes corretos");

const cutsGirl10 = imcCutsForAge("female", 120);
console.log("Cortes Menina 10 anos (120m):", cutsGirl10.map(v => v.toFixed(1)).join(" / "));
assert(cutsGirl10.map(v => v.toFixed(1)).join(" / ") === "13.6 / 14.8 / 16.6 / 19.1 / 22.1", "Menina 10 anos (120 meses) cortes corretos");

// 4. Menino IMC 18,6: aos 10a00m → Razoável; aos 10a06m → Excelente (comprova uso da idade em meses).
assert(imcZone(18.6, 10, "male", 120) === "Razoável", "Menino IMC 18,6 aos 10a00m (120m) → Razoável");
assert(imcZone(18.6, 10, "male", 126) === "Excelente", "Menino IMC 18,6 aos 10a06m (126m) → Excelente");

// 5. Menor de 5 anos → null. IMC 26 aos 19 e aos 20 anos → Razoável.
assert(imcZone(16, 4, "male") === null, "Menor de 5 anos (4 anos) → null");
assert(imcZone(18, 3, "female") === null, "Menor de 5 anos (3 anos) → null");
assert(imcZone(26, 19, "male") === "Razoável", "IMC 26 aos 19 anos → Razoável (OMS 2007)");
assert(imcZone(26, 20, "male") === "Razoável", "IMC 26 aos 20 anos → Razoável (adulto)");

if (failures > 0) {
  console.error(`\n❌ Total de falhas: ${failures}`);
  process.exit(1);
} else {
  console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!");
}
