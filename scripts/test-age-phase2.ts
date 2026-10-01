import { ageInYears, ageInMonths, ageFromBirth, parseDateParts, getDaysInMonth, isLeapYear } from "../src/lib/age";

let failures = 0;
function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

console.log("=== 1. Testes de Casos Críticos e Documentados no Prompt ===");

// 1. Caso documentado: nascido em 01/03/2008 avaliado em 01/03/2014 (365.25 errava dando 5 anos)
assert(ageInYears("2008-03-01", "2014-03-01") === 6, "Nascido em 01/03/2008 avaliado em 01/03/2014 resulta em 6 anos exatos");
assert(ageInMonths("2008-03-01", "2014-03-01") === 72, "Nascido em 01/03/2008 avaliado em 01/03/2014 resulta em 72 meses exatos");

// 2. Véspera de aniversário (28/02/2014)
assert(ageInYears("2008-03-01", "2014-02-28") === 5, "Nascido em 01/03/2008 avaliado em 28/02/2014 resulta em 5 anos");
assert(ageInMonths("2008-03-01", "2014-02-28") === 71, "Nascido em 01/03/2008 avaliado em 28/02/2014 resulta em 71 meses");

// 3. Nascido em 29/02 (ano bissexto) avaliado em ano não bissexto
assert(ageInYears("2008-02-29", "2009-02-28") === 0, "29/02/2008 avaliado em 28/02/2009 tem 0 anos");
assert(ageInMonths("2008-02-29", "2009-02-28") === 11, "29/02/2008 avaliado em 28/02/2009 tem 11 meses");
assert(ageInYears("2008-02-29", "2009-03-01") === 1, "29/02/2008 avaliado em 01/03/2009 tem 1 ano completo");
assert(ageInMonths("2008-02-29", "2009-03-01") === 12, "29/02/2008 avaliado em 01/03/2009 tem 12 meses completos");

// 4. Nascido em 29/02 avaliado no próximo bissexto (29/02/2012)
assert(ageInYears("2008-02-29", "2012-02-29") === 4, "29/02/2008 avaliado em 29/02/2012 tem 4 anos completos");
assert(ageInMonths("2008-02-29", "2012-02-29") === 48, "29/02/2008 avaliado em 29/02/2012 tem 48 meses completos");

// 5. Nascido no último dia do ano (31/12)
assert(ageInYears("2008-12-31", "2009-12-30") === 0, "31/12/2008 avaliado em 30/12/2009 tem 0 anos");
assert(ageInMonths("2008-12-31", "2009-12-30") === 11, "31/12/2008 avaliado em 30/12/2009 tem 11 meses");
assert(ageInYears("2008-12-31", "2009-12-31") === 1, "31/12/2008 avaliado em 31/12/2009 tem 1 ano completo");
assert(ageInMonths("2008-12-31", "2009-12-31") === 12, "31/12/2008 avaliado em 31/12/2009 tem 12 meses completos");
assert(ageInYears("2008-12-31", "2010-01-01") === 1, "31/12/2008 avaliado em 01/01/2010 tem 1 ano completo");

// 6. Teste de compatibilidade de ageFromBirth
assert(ageFromBirth("2008-03-01", new Date("2014-03-01T00:00:00Z")) === 6, "ageFromBirth redireciona para ageInYears com 6 anos");

console.log("\n=== 2. Teste Exaustivo: Todos os 366 dias do ano bissexto ===");
// Varre todos os dias possíveis de nascimento (ano bissexto 2008)
// e avalia em anos posteriores (1, 5 e 10 anos depois)
let exhaustDivergences = 0;
let totalCases = 0;

for (let month = 1; month <= 12; month++) {
  const days = getDaysInMonth(2008, month);
  for (let day = 1; day <= days; day++) {
    const padM = String(month).padStart(2, "0");
    const padD = String(day).padStart(2, "0");
    const birthStr = `2008-${padM}-${padD}`;

    for (const targetYear of [2009, 2013, 2018]) {
      const deltaYears = targetYear - 2008;

      // Dia de aniversário correspondente no ano de destino
      let targetD = day;
      let targetM = month;
      if (month === 2 && day === 29 && !isLeapYear(targetYear)) {
        // No ano não bissexto, 29/02 cai em 01/03
        targetM = 3;
        targetD = 1;
      }

      // No dia do aniversário
      const exactStr = `${targetYear}-${String(targetM).padStart(2, "0")}-${String(targetD).padStart(2, "0")}`;
      const yExact = ageInYears(birthStr, exactStr);
      if (yExact !== deltaYears) {
        exhaustDivergences++;
        console.error(`Divergência exata: birth=${birthStr}, ref=${exactStr}, esperado=${deltaYears}, obtido=${yExact}`);
      }

      // Véspera do aniversário
      const exactDate = new Date(Date.UTC(targetYear, targetM - 1, targetD));
      const eveDate = new Date(exactDate.getTime() - 86400000);
      const eveStr = eveDate.toISOString().slice(0, 10);
      const yEve = ageInYears(birthStr, eveStr);
      if (yEve !== deltaYears - 1) {
        exhaustDivergences++;
        console.error(`Divergência véspera: birth=${birthStr}, ref=${eveStr}, esperado=${deltaYears - 1}, obtido=${yEve}`);
      }

      totalCases += 2;
    }
  }
}

assert(exhaustDivergences === 0, `Varredura exaustiva de ${totalCases} cenários de aniversários: 0 divergências`);

if (failures > 0) {
  console.error(`\n❌ Total de falhas: ${failures}`);
  process.exit(1);
} else {
  console.log("\n🎉 TODOS OS TESTES DA FASE 2 PASSARAM COM 100% DE SUCESSO!");
}
