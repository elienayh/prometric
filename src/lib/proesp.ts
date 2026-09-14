// PROESP-BR – Cálculos e classificações simplificadas.
// Tabelas referenciais para idades 6–17 anos. Valores embutidos com base nos
// pontos de corte públicos do PROESP-BR (versão simplificada – podem ser
// ajustados pela coordenação técnica).

export type Sex = "male" | "female";
export type Zone = "Muito Fraco" | "Fraco" | "Razoável" | "Bom" | "Muito Bom" | "Excelente";

export const ZONES: Zone[] = ["Muito Fraco", "Fraco", "Razoável", "Bom", "Muito Bom", "Excelente"];

// Cor por zona (token semântico)
export function zoneColor(z: Zone | null | undefined) {
  switch (z) {
    case "Excelente": return "bg-success/20 text-success border-success/30";
    case "Muito Bom": return "bg-success/15 text-success border-success/20";
    case "Bom": return "bg-primary/15 text-primary border-primary/30";
    case "Razoável": return "bg-accent/20 text-accent-foreground border-accent/30";
    case "Fraco": return "bg-warning/20 text-warning border-warning/30";
    case "Muito Fraco": return "bg-destructive/15 text-destructive border-destructive/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

export function ageFromBirth(birth: string, ref = new Date()): number {
  const b = new Date(birth);
  const d = ref.getTime() - b.getTime();
  return Math.max(0, Math.floor(d / (365.25 * 24 * 3600 * 1000)));
}

export function calcImc(weightKg?: number | null, heightCm?: number | null): number | null {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(2);
}

export function calcRce(waistCm?: number | null, heightCm?: number | null): number | null {
  if (!waistCm || !heightCm) return null;
  return +(waistCm / heightCm).toFixed(3);
}

// IMC zonas (saúde): <Baixo peso | Saudável | Sobrepeso | Obesidade>
export function imcZone(imc: number | null, age: number, sex: Sex): Zone | null {
  if (imc == null) return null;
  // Faixas simplificadas baseadas em CDC/IOTF para 6-17.
  // Adulto: <18.5 baixo; 18.5-24.9 saudável; 25-29.9 sobrepeso; ≥30 obeso.
  if (age >= 18) {
    if (imc < 16) return "Muito Fraco";
    if (imc < 18.5) return "Fraco";
    if (imc < 25) return "Excelente";
    if (imc < 30) return "Razoável";
    return "Muito Fraco";
  }
  // Crianças/jovens – aproximação
  const base = sex === "male"
    ? [14, 15.5, 22.5, 25, 28]
    : [13.5, 15, 22.5, 25.5, 28.5];
  if (imc < base[0]) return "Muito Fraco";
  if (imc < base[1]) return "Fraco";
  if (imc < base[2]) return "Excelente";
  if (imc < base[3]) return "Razoável";
  if (imc < base[4]) return "Fraco";
  return "Muito Fraco";
}

export function rceZone(rce: number | null): Zone | null {
  if (rce == null) return null;
  if (rce < 0.40) return "Razoável";        // muito baixo
  if (rce < 0.50) return "Excelente";       // saudável
  if (rce < 0.55) return "Razoável";        // alerta
  if (rce < 0.60) return "Fraco";
  return "Muito Fraco";
}

// Tabela genérica: pontos de corte ascendentes (quanto MAIOR melhor) por idade/sexo.
// Cada entrada: [muitoFraco, fraco, razoavel, bom, muitoBom] – acima do último é Excelente.
type CutTable = Partial<Record<number, [number, number, number, number, number]>>;
type SexCuts = { male: CutTable; female: CutTable };

// Helper: classificar onde MAIOR é melhor
function classifyHigher(val: number, cuts: [number, number, number, number, number]): Zone {
  if (val <= cuts[0]) return "Muito Fraco";
  if (val <= cuts[1]) return "Fraco";
  if (val <= cuts[2]) return "Razoável";
  if (val <= cuts[3]) return "Bom";
  if (val <= cuts[4]) return "Muito Bom";
  return "Excelente";
}
// Helper: classificar onde MENOR é melhor (tempo)
function classifyLower(val: number, cuts: [number, number, number, number, number]): Zone {
  if (val >= cuts[0]) return "Muito Fraco";
  if (val >= cuts[1]) return "Fraco";
  if (val >= cuts[2]) return "Razoável";
  if (val >= cuts[3]) return "Bom";
  if (val >= cuts[4]) return "Muito Bom";
  return "Excelente";
}

function pickCut(table: SexCuts, sex: Sex, age: number): [number, number, number, number, number] | null {
  const t = table[sex];
  const a = Math.max(6, Math.min(17, age));
  return (t[a] ?? t[Math.min(...Object.keys(t).map(Number))]) ?? null;
}

// ----- Flexibilidade (sentar e alcançar, cm) – MAIOR melhor -----
const FLEX: SexCuts = {
  male: {
    6:[15,20,24,28,32],7:[15,20,24,28,32],8:[15,20,24,28,32],
    9:[14,19,23,27,31],10:[14,19,23,27,31],11:[14,19,23,28,32],
    12:[14,19,23,28,33],13:[15,20,24,29,34],14:[16,21,25,30,35],
    15:[17,22,27,32,37],16:[18,24,29,34,39],17:[20,25,30,35,40],
  },
  female: {
    6:[18,23,28,32,36],7:[18,23,28,32,36],8:[18,23,28,32,36],
    9:[18,23,28,33,37],10:[19,24,29,34,38],11:[20,25,30,35,39],
    12:[21,26,31,36,40],13:[22,27,32,37,41],14:[23,28,33,38,42],
    15:[24,29,34,39,43],16:[25,30,35,40,44],17:[26,31,36,41,45],
  },
};

// ----- Abdominal 1min (reps) – MAIOR melhor -----
const ABDO: SexCuts = {
  male: {
    6:[8,14,20,26,32],7:[10,16,22,28,34],8:[12,18,24,30,36],
    9:[14,20,26,32,38],10:[16,22,28,34,40],11:[18,24,30,36,42],
    12:[20,26,32,38,44],13:[22,28,34,40,46],14:[24,30,36,42,48],
    15:[26,32,38,44,50],16:[28,34,40,46,52],17:[30,36,42,48,54],
  },
  female: {
    6:[6,12,18,24,30],7:[8,14,20,26,32],8:[10,16,22,28,34],
    9:[12,18,24,30,36],10:[14,20,26,32,38],11:[16,22,28,34,40],
    12:[18,24,30,36,42],13:[18,24,30,36,42],14:[19,25,31,37,43],
    15:[20,26,32,38,44],16:[20,26,32,38,44],17:[21,27,33,39,45],
  },
};

// ----- Salto horizontal (cm) – MAIOR melhor -----
const JUMP: SexCuts = {
  male: {
    6:[80,95,110,125,140],7:[90,105,120,135,150],8:[100,115,130,145,160],
    9:[110,125,140,155,170],10:[120,135,150,165,180],11:[125,140,155,170,190],
    12:[130,145,160,180,200],13:[140,155,170,190,210],14:[150,165,180,200,220],
    15:[160,175,190,210,230],16:[170,185,200,220,240],17:[175,190,210,225,245],
  },
  female: {
    6:[75,90,105,120,135],7:[85,100,115,130,145],8:[95,110,125,140,155],
    9:[100,115,130,145,160],10:[105,120,135,150,165],11:[110,125,140,155,170],
    12:[115,130,145,160,175],13:[120,135,150,165,180],14:[125,140,155,170,185],
    15:[125,140,155,170,190],16:[130,145,160,175,195],17:[130,145,160,175,195],
  },
};

// ----- Arremesso medicine ball 2kg (m) – MAIOR melhor -----
const MBALL: SexCuts = {
  male: {
    6:[1.5,2.0,2.5,3.0,3.6],7:[1.7,2.2,2.8,3.4,4.0],8:[1.9,2.5,3.1,3.7,4.4],
    9:[2.1,2.7,3.4,4.0,4.7],10:[2.3,3.0,3.7,4.3,5.0],11:[2.5,3.3,4.0,4.7,5.5],
    12:[2.8,3.6,4.3,5.0,5.8],13:[3.0,3.9,4.7,5.5,6.3],14:[3.4,4.3,5.2,6.0,7.0],
    15:[3.8,4.7,5.7,6.7,7.7],16:[4.0,5.0,6.0,7.0,8.0],17:[4.3,5.4,6.5,7.5,8.5],
  },
  female: {
    6:[1.3,1.8,2.2,2.7,3.2],7:[1.5,2.0,2.5,3.0,3.5],8:[1.7,2.2,2.7,3.3,3.9],
    9:[1.9,2.4,3.0,3.6,4.2],10:[2.0,2.6,3.2,3.9,4.5],11:[2.2,2.8,3.5,4.2,4.9],
    12:[2.4,3.0,3.7,4.5,5.2],13:[2.5,3.2,3.9,4.7,5.5],14:[2.7,3.4,4.1,4.9,5.7],
    15:[2.8,3.5,4.3,5.0,5.8],16:[2.9,3.6,4.4,5.2,6.0],17:[3.0,3.7,4.5,5.3,6.1],
  },
};

// ----- Quadrado / agilidade (s) – MENOR melhor -----
const SQUARE: SexCuts = {
  male: {
    6:[8.5,7.8,7.2,6.6,6.0],7:[8.2,7.5,6.9,6.3,5.8],8:[7.8,7.2,6.6,6.1,5.6],
    9:[7.5,6.9,6.4,5.9,5.4],10:[7.2,6.7,6.2,5.7,5.2],11:[7.0,6.5,6.0,5.5,5.0],
    12:[6.8,6.3,5.8,5.3,4.9],13:[6.6,6.1,5.6,5.2,4.8],14:[6.4,5.9,5.5,5.1,4.7],
    15:[6.2,5.8,5.4,5.0,4.6],16:[6.1,5.7,5.3,4.9,4.5],17:[6.0,5.6,5.2,4.8,4.4],
  },
  female: {
    6:[9.0,8.3,7.6,7.0,6.4],7:[8.7,8.0,7.4,6.8,6.2],8:[8.4,7.7,7.1,6.5,6.0],
    9:[8.1,7.4,6.8,6.3,5.8],10:[7.8,7.2,6.6,6.1,5.6],11:[7.6,7.0,6.4,5.9,5.4],
    12:[7.4,6.8,6.3,5.8,5.3],13:[7.2,6.7,6.2,5.7,5.2],14:[7.1,6.6,6.1,5.6,5.2],
    15:[7.0,6.5,6.0,5.6,5.1],16:[6.9,6.4,6.0,5.5,5.1],17:[6.9,6.4,6.0,5.5,5.1],
  },
};

// ----- Velocidade 20m (s) – MENOR melhor -----
const SPRINT: SexCuts = {
  male: {
    6:[5.5,5.0,4.6,4.2,3.9],7:[5.2,4.8,4.4,4.0,3.7],8:[5.0,4.6,4.2,3.9,3.6],
    9:[4.8,4.4,4.1,3.8,3.5],10:[4.7,4.3,4.0,3.7,3.4],11:[4.6,4.2,3.9,3.6,3.3],
    12:[4.5,4.1,3.8,3.5,3.2],13:[4.3,4.0,3.7,3.4,3.1],14:[4.2,3.9,3.6,3.3,3.0],
    15:[4.1,3.8,3.5,3.2,2.9],16:[4.0,3.7,3.4,3.1,2.9],17:[4.0,3.7,3.4,3.1,2.9],
  },
  female: {
    6:[5.8,5.3,4.9,4.5,4.1],7:[5.5,5.1,4.7,4.3,4.0],8:[5.3,4.9,4.5,4.2,3.9],
    9:[5.1,4.7,4.4,4.1,3.8],10:[5.0,4.6,4.3,4.0,3.7],11:[4.9,4.5,4.2,3.9,3.6],
    12:[4.8,4.4,4.1,3.8,3.5],13:[4.7,4.3,4.0,3.7,3.5],14:[4.7,4.3,4.0,3.7,3.5],
    15:[4.6,4.3,4.0,3.7,3.5],16:[4.6,4.3,4.0,3.7,3.5],17:[4.6,4.3,4.0,3.7,3.5],
  },
};

// ----- Corrida 6min (m) – MAIOR melhor -----
const RUN6: SexCuts = {
  male: {
    6:[600,750,900,1050,1200],7:[650,800,950,1100,1250],8:[700,850,1000,1150,1300],
    9:[750,900,1050,1200,1350],10:[800,950,1100,1250,1400],11:[850,1000,1150,1300,1450],
    12:[900,1050,1200,1350,1500],13:[950,1100,1250,1400,1550],14:[1000,1150,1300,1450,1600],
    15:[1050,1200,1350,1500,1650],16:[1100,1250,1400,1550,1700],17:[1150,1300,1450,1600,1750],
  },
  female: {
    6:[550,700,850,1000,1150],7:[600,750,900,1050,1200],8:[650,800,950,1100,1250],
    9:[700,850,1000,1150,1300],10:[750,900,1050,1200,1350],11:[800,950,1100,1250,1400],
    12:[850,1000,1150,1300,1450],13:[850,1000,1150,1300,1450],14:[850,1000,1150,1300,1450],
    15:[850,1000,1150,1300,1450],16:[850,1000,1150,1300,1450],17:[850,1000,1150,1300,1450],
  },
};

export type EvaluationInput = {
  sex: Sex; age: number;
  weight_kg?: number | null; height_cm?: number | null;
  waist_cm?: number | null; hip_cm?: number | null;
  sit_and_reach_cm?: number | null;
  abdominal_reps?: number | null;
  horizontal_jump_cm?: number | null;
  medicine_ball_m?: number | null;
  square_test_s?: number | null;
  sprint_20m_s?: number | null;
  run_6min_m?: number | null;
};

export type ClassificationKey =
  | "imc" | "rce" | "flex" | "abdo" | "jump" | "mball" | "square" | "sprint" | "run6";

export const TEST_META: Record<ClassificationKey, { label: string; unit: string; field: keyof EvaluationInput | "imc" | "rce"; better: "higher" | "lower" | "health" }> = {
  imc:    { label: "IMC",                    unit: "kg/m²", field: "imc",                 better: "health" },
  rce:    { label: "RCE",                    unit: "",      field: "rce",                 better: "health" },
  flex:   { label: "Flexibilidade",          unit: "cm",    field: "sit_and_reach_cm",    better: "higher" },
  abdo:   { label: "Abdominal 1min",         unit: "reps",  field: "abdominal_reps",      better: "higher" },
  jump:   { label: "Salto Horizontal",       unit: "cm",    field: "horizontal_jump_cm",  better: "higher" },
  mball:  { label: "Medicine Ball 2kg",      unit: "m",     field: "medicine_ball_m",     better: "higher" },
  square: { label: "Agilidade (Quadrado)",   unit: "s",     field: "square_test_s",       better: "lower" },
  sprint: { label: "Velocidade 20m",         unit: "s",     field: "sprint_20m_s",        better: "lower" },
  run6:   { label: "Corrida 6min",           unit: "m",     field: "run_6min_m",          better: "higher" },
};

function classifyHigherTable(val: number | null | undefined, table: SexCuts, sex: Sex, age: number) {
  if (val == null) return null;
  const cuts = pickCut(table, sex, age); if (!cuts) return null;
  return classifyHigher(val, cuts);
}
function classifyLowerTable(val: number | null | undefined, table: SexCuts, sex: Sex, age: number) {
  if (val == null) return null;
  const cuts = pickCut(table, sex, age); if (!cuts) return null;
  return classifyLower(val, cuts);
}

export type Classifications = Partial<Record<ClassificationKey, Zone>>;

export function classifyAll(e: EvaluationInput): Classifications {
  const imc = calcImc(e.weight_kg, e.height_cm);
  const rce = calcRce(e.waist_cm, e.height_cm);
  return {
    imc:    imcZone(imc, e.age, e.sex) ?? undefined,
    rce:    rceZone(rce) ?? undefined,
    flex:   classifyHigherTable(e.sit_and_reach_cm, FLEX, e.sex, e.age) ?? undefined,
    abdo:   classifyHigherTable(e.abdominal_reps, ABDO, e.sex, e.age) ?? undefined,
    jump:   classifyHigherTable(e.horizontal_jump_cm, JUMP, e.sex, e.age) ?? undefined,
    mball:  classifyHigherTable(e.medicine_ball_m, MBALL, e.sex, e.age) ?? undefined,
    square: classifyLowerTable(e.square_test_s, SQUARE, e.sex, e.age) ?? undefined,
    sprint: classifyLowerTable(e.sprint_20m_s, SPRINT, e.sex, e.age) ?? undefined,
    run6:   classifyHigherTable(e.run_6min_m, RUN6, e.sex, e.age) ?? undefined,
  };
}

export function zoneScore(z?: Zone | null): number {
  if (!z) return 0;
  return ZONES.indexOf(z) + 1; // 1..6
}

// Quantidade mínima de testes para que uma avaliação seja considerada
// "completa" e possa receber classificação geral / Índice ProMetric.
export const MIN_TESTS_FOR_CLASSIFICATION = 4;
export const TOTAL_TESTS = 9;

export function filledTestsCount(c: Classifications): number {
  return (Object.values(c).filter(Boolean) as Zone[]).length;
}

export function isPartialEvaluation(c: Classifications): boolean {
  return filledTestsCount(c) < MIN_TESTS_FOR_CLASSIFICATION;
}

export function overallScore(c: Classifications): { score: number; label: Zone | null; filled: number; partial: boolean } {
  const vals = Object.values(c).filter(Boolean) as Zone[];
  const filled = vals.length;
  const partial = filled < MIN_TESTS_FOR_CLASSIFICATION;
  if (filled === 0) return { score: 0, label: null, filled, partial: true };
  const avg = vals.reduce((a, z) => a + zoneScore(z), 0) / filled;
  const idx = Math.min(5, Math.max(0, Math.round(avg) - 1));
  return { score: +avg.toFixed(2), label: partial ? null : ZONES[idx], filled, partial };
}

// ────────────────────────────────────────────────────────────────────────────
// Faixa numérica de referência ("esperado para idade/sexo") por indicador.
// Apenas LEITURA das mesmas tabelas de corte já utilizadas em `classifyAll`.
// Não altera cálculos nem classificações — expõe os valores para a UI
// (barras de referência em estilo clínico).
// ────────────────────────────────────────────────────────────────────────────
const TABLE_BY_KEY: Record<Exclude<ClassificationKey, "imc" | "rce">, SexCuts> = {
  flex: FLEX, abdo: ABDO, jump: JUMP, mball: MBALL,
  square: SQUARE, sprint: SPRINT, run6: RUN6,
};

export type ExpectedRange = {
  min: number;
  max: number;
  /** limites totais da barra (Muito Fraco…Excelente) para renderização */
  domainMin: number;
  domainMax: number;
  higherBetter: boolean;
};

export function expectedRangeFor(
  key: ClassificationKey,
  age: number,
  sex: Sex,
): ExpectedRange | null {
  if (key === "imc") {
    if (age >= 18) return { min: 18.5, max: 24.9, domainMin: 14, domainMax: 32, higherBetter: false };
    const base = sex === "male" ? [15.5, 22.5] : [15, 22.5];
    return { min: base[0], max: base[1], domainMin: 12, domainMax: 30, higherBetter: false };
  }
  if (key === "rce") {
    return { min: 0.40, max: 0.50, domainMin: 0.30, domainMax: 0.70, higherBetter: false };
  }
  const table = TABLE_BY_KEY[key as Exclude<ClassificationKey, "imc" | "rce">];
  const cuts = pickCut(table, sex, Math.floor(Math.max(6, Math.min(17, age))));
  if (!cuts) return null;
  const higherBetter = !(key === "square" || key === "sprint");
  const min = Math.min(cuts[1], cuts[4]);
  const max = Math.max(cuts[1], cuts[4]);
  const lo = Math.min(cuts[0], cuts[4]);
  const hi = Math.max(cuts[0], cuts[4]);
  const pad = (hi - lo) * 0.15;
  return { min, max, domainMin: lo - pad, domainMax: hi + pad, higherBetter };
}

