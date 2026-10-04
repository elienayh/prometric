/**
 * Normas Motoras Oficiais — Manual de Testes e Avaliação 2015
 * 
 * Referência Oficial:
 * Manual de Testes e Avaliação - Versão 2015 (Gaya, Lemos, Gaya, Teixeira, Pinheiro & Moreira)
 * - Quadro 3 (página 11): Valores críticos de corrida/caminhada dos 6 minutos para saúde
 * - Quadro 4 (página 11): Valores críticos do teste de flexibilidade para saúde (sentar-e-alcançar sem banco)
 * - Quadro 5 (página 12): Valores críticos do teste de resistência abdominal para saúde (sit-up em 1 min)
 * - Seção 3.4 (páginas 12 a 15): Normas de desempenho esportivo por percentil:
 *     * < P40: Fraco
 *     * P40 - 59: Razoável
 *     * P60 - 79: Bom
 *     * P80 - 98: Muito bom
 *     * > P98: Excelência
 * 
 * Sentidos dos testes:
 * - Maior é melhor: Salto horizontal (cm), Arremesso medicine ball (m), Corrida 6 min (m)
 * - Menor é melhor: Quadrado (s), Velocidade 20m (s)
 * - Testes de saúde com corte único: Flexibilidade (cm), Abdominal (reps), Corrida 6 min saúde (m)
 * 
 * Unidade do Arremesso:
 * - Manual registra em centímetros (cm). O sistema ProMetric registra em metros (m).
 * - A conversão é estrita: valueCm = valueM * 100, sem arredondar.
 */

import type { Sex, Zone } from "./proesp";

export type MotorPerformanceCategory = "Fraco" | "Razoável" | "Bom" | "Muito Bom" | "Excelência";
export type HealthZone = "Zona Saudável" | "Zona de Risco à Saúde";

export const MOTOR_PERFORMANCE_CATEGORIES: MotorPerformanceCategory[] = [
  "Fraco",
  "Razoável",
  "Bom",
  "Muito Bom",
  "Excelência",
];

export const HEALTH_ZONES: HealthZone[] = [
  "Zona Saudável",
  "Zona de Risco à Saúde",
];

/**
 * [DECISÃO PENDENTE] Conversão das 5 faixas motoras do manual para a escala 0..100 do Índice ProMetric®.
 * Mantida em constante isolada para não arbitrar valores sem validação técnica formal.
 */
export const MOTOR_PERFORMANCE_TO_SCORE_MAP: Record<MotorPerformanceCategory, number> = {
  "Fraco": 20,
  "Razoável": 40,
  "Bom": 60,
  "Muito Bom": 80,
  "Excelência": 100,
};

/**
 * [DECISÃO PENDENTE] Conversão dos testes binários de saúde (corte único) para o Índice ProMetric® (0..100).
 * O manual define apenas dois graus: ZONA DE RISCO À SAÚDE e ZONA SAUDÁVEL.
 */
export const HEALTH_ZONE_TO_SCORE_MAP: Record<HealthZone, number> = {
  "Zona Saudável": 80,
  "Zona de Risco à Saúde": 30,
};

/**
 * Mapeamento de compatibilidade para a escala histórica de Zonas (6 níveis).
 */
export function motorCategoryToZone(cat: MotorPerformanceCategory | HealthZone | null | undefined): Zone | null {
  if (!cat) return null;
  switch (cat) {
    case "Excelência": return "Excelente";
    case "Muito Bom": return "Muito Bom";
    case "Bom": return "Bom";
    case "Razoável": return "Razoável";
    case "Fraco": return "Fraco";
    case "Zona Saudável": return "Bom";
    case "Zona de Risco à Saúde": return "Fraco";
    default: return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FORÇA EXPLOSIVA DE MEMBROS SUPERIORES — ARREMESSO MEDICINE BALL (2 kg)
// Manual páginas 12 e 13 (valores em cm).
// No sistema, a medida é fornecida em metros (m).
// ─────────────────────────────────────────────────────────────────────────────
export interface MedicineBallRow {
  age: number;
  p40: number; // Início Razoável
  p60: number; // Início Bom
  p80: number; // Início Muito Bom
  p98: number; // Início Excelência
}

export const MEDICINE_BALL_BOYS: Record<number, MedicineBallRow> = {
  6:  { age: 6,  p40: 145, p60: 160, p80: 183, p98: 239 },
  7:  { age: 7,  p40: 164, p60: 180, p80: 202, p98: 249 },
  8:  { age: 8,  p40: 180, p60: 200, p80: 225, p98: 269 },
  9:  { age: 9,  p40: 200, p60: 220, p80: 250, p98: 299 },
  10: { age: 10, p40: 213, p60: 240, p80: 270, p98: 329 }, // Nota manual: Fraco < 212, Razoável 213 a 239 (lacuna 212..213)
  11: { age: 11, p40: 238, p60: 261, p80: 294, p98: 361 },
  12: { age: 12, p40: 264, p60: 297, p80: 330, p98: 423 }, // Nota manual: M.Bom 330 a 422, Excelência > 423 (lacuna 422..423)
  13: { age: 13, p40: 300, p60: 340, p80: 390, p98: 499 },
  14: { age: 14, p40: 350, p60: 400, p80: 450, p98: 561 },
  15: { age: 15, p40: 400, p60: 440, p80: 500, p98: 608 },
  16: { age: 16, p40: 453, p60: 500, p80: 553, p98: 689 },
  17: { age: 17, p40: 480, p60: 520, p80: 590, p98: 699 }, // Nota manual: Razoável 480 a 521, Bom 520 a 589 (sobreposição 520..521)
};

export const MEDICINE_BALL_GIRLS: Record<number, MedicineBallRow> = {
  6:  { age: 6,  p40: 140, p60: 150, p80: 164, p98: 207 },
  7:  { age: 7,  p40: 153, p60: 162, p80: 180, p98: 216 },
  8:  { age: 8,  p40: 167, p60: 185, p80: 200, p98: 246 },
  9:  { age: 9,  p40: 185, p60: 201, p80: 226, p98: 279 },
  10: { age: 10, p40: 200, p60: 220, p80: 245, p98: 301 },
  11: { age: 11, p40: 220, p60: 247, p80: 276, p98: 329 },
  12: { age: 12, p40: 241, p60: 270, p80: 300, p98: 369 },
  13: { age: 13, p40: 265, p60: 295, p80: 323, p98: 399 },
  14: { age: 14, p40: 280, p60: 310, p80: 344, p98: 417 },
  15: { age: 15, p40: 300, p60: 330, p80: 360, p98: 429 },
  16: { age: 16, p40: 310, p60: 340, p80: 370, p98: 449 },
  17: { age: 17, p40: 320, p60: 340, p80: 375, p98: 450 },
};

export function classifyMedicineBall(meters: number | null | undefined, sex: Sex, ageYears: number): MotorPerformanceCategory | null {
  if (meters == null || ageYears < 6 || ageYears > 17) return null;
  // Conversão estrita m -> cm com normalização de ponto flutuante IEEE-754 (ex: 2.01 * 100 = 200.99999999999997)
  const cm = Math.round(meters * 100000) / 1000;
  const table = sex === "female" ? MEDICINE_BALL_GIRLS : MEDICINE_BALL_BOYS;
  const row = table[ageYears];
  if (!row) return null;

  if (cm > row.p98) return "Excelência";
  if (cm >= row.p80) return "Muito Bom";
  if (cm >= row.p60) return "Bom";
  if (cm >= row.p40) return "Razoável";
  return "Fraco";
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FORÇA EXPLOSIVA DE MEMBROS INFERIORES — SALTO HORIZONTAL (cm)
// Manual página 13 (valores em cm).
// ─────────────────────────────────────────────────────────────────────────────
export interface JumpRow {
  age: number;
  p40: number; // Início Razoável
  p60: number; // Início Bom
  p80: number; // Início Muito Bom
  p98: number; // Início Excelência
}

export const JUMP_BOYS: Record<number, JumpRow> = {
  6:  { age: 6,  p40: 105, p60: 115, p80: 128, p98: 151 },
  7:  { age: 7,  p40: 111, p60: 122, p80: 134, p98: 159 },
  8:  { age: 8,  p40: 118, p60: 128, p80: 140, p98: 165 },
  9:  { age: 9,  p40: 129, p60: 140, p80: 152, p98: 178 },
  10: { age: 10, p40: 135, p60: 147, p80: 158, p98: 187 },
  11: { age: 11, p40: 140, p60: 152, p80: 165, p98: 191 },
  12: { age: 12, p40: 149, p60: 160, p80: 174, p98: 203 },
  13: { age: 13, p40: 159, p60: 170, p80: 185, p98: 216 },
  14: { age: 14, p40: 170, p60: 184, p80: 200, p98: 230 },
  15: { age: 15, p40: 180, p60: 194, p80: 210, p98: 242 },
  16: { age: 16, p40: 186, p60: 200, p80: 215, p98: 248 },
  17: { age: 17, p40: 188, p60: 204, p80: 220, p98: 250 },
};

export const JUMP_GIRLS: Record<number, JumpRow> = {
  6:  { age: 6,  p40: 90,  p60: 101, p80: 112, p98: 143 }, // Nota manual: Bom 101 a 112, M.Bom 112 a 143 (sobreposição em 112)
  7:  { age: 7,  p40: 94,  p60: 106, p80: 116, p98: 146 },
  8:  { age: 8,  p40: 105, p60: 113, p80: 127, p98: 152 },
  9:  { age: 9,  p40: 116, p60: 127, p80: 140, p98: 165 },
  10: { age: 10, p40: 123, p60: 134, p80: 146, p98: 173 },
  11: { age: 11, p40: 127, p60: 138, p80: 150, p98: 179 },
  12: { age: 12, p40: 130, p60: 141, p80: 155, p98: 184 },
  13: { age: 13, p40: 133, p60: 145, p80: 160, p98: 189 },
  14: { age: 14, p40: 134, p60: 147, p80: 161, p98: 198 },
  15: { age: 15, p40: 135, p60: 148, p80: 163, p98: 199 },
  16: { age: 16, p40: 136, p60: 149, p80: 164, p98: 200 },
  17: { age: 17, p40: 137, p60: 151, p80: 165, p98: 201 },
};

export function classifyHorizontalJump(cm: number | null | undefined, sex: Sex, ageYears: number): MotorPerformanceCategory | null {
  if (cm == null || ageYears < 6 || ageYears > 17) return null;
  const table = sex === "female" ? JUMP_GIRLS : JUMP_BOYS;
  const row = table[ageYears];
  if (!row) return null;

  if (cm > row.p98) return "Excelência";
  if (cm >= row.p80) return "Muito Bom";
  if (cm >= row.p60) return "Bom";
  if (cm >= row.p40) return "Razoável";
  return "Fraco";
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AGILIDADE — TESTE DO QUADRADO (segundos)
// Manual página 14. Menor tempo é melhor.
// ─────────────────────────────────────────────────────────────────────────────
export interface SquareRow {
  age: number;
  p98: number; // Teto Excelência (< p98)
  p80: number; // Teto Muito Bom (<= p80)
  p60: number; // Teto Bom (<= p60)
  p40: number; // Teto Razoável (<= p40)
}

export const SQUARE_BOYS: Record<number, SquareRow> = {
  6:  { age: 6,  p98: 6.41, p80: 7.30, p60: 7.79, p40: 8.19 }, // Nota manual: Fraco > 8.20 (lacuna 8.19..8.20)
  7:  { age: 7,  p98: 6.08, p80: 7.00, p60: 7.43, p40: 7.76 },
  8:  { age: 8,  p98: 5.98, p80: 6.78, p60: 7.20, p40: 7.59 },
  9:  { age: 9,  p98: 5.82, p80: 6.50, p60: 6.89, p40: 7.19 },
  10: { age: 10, p98: 5.59, p80: 6.25, p60: 6.66, p40: 7.00 },
  11: { age: 11, p98: 5.40, p80: 6.10, p60: 6.50, p40: 6.87 },
  12: { age: 12, p98: 5.18, p80: 6.00, p60: 6.34, p40: 6.70 },
  13: { age: 13, p98: 5.01, p80: 5.86, p60: 6.16, p40: 6.53 },
  14: { age: 14, p98: 5.01, p80: 5.69, p60: 6.00, p40: 6.37 },
  15: { age: 15, p98: 4.91, p80: 5.59, p60: 5.99, p40: 6.26 }, // Nota manual: Excelência < 4.91, M.Bom 4.92..5.59 (lacuna 4.91..4.92)
  16: { age: 16, p98: 4.90, p80: 5.42, p60: 5.75, p40: 6.10 }, // Nota manual: Excelência < 4.90, M.Bom 4.91..5.42 (lacuna 4.90..4.91)
  17: { age: 17, p98: 4.85, p80: 5.40, p60: 5.73, p40: 6.03 },
};

export const SQUARE_GIRLS: Record<number, SquareRow> = {
  6:  { age: 6,  p98: 6.59, p80: 7.66, p60: 8.26, p40: 8.68 }, // Nota manual: Fraco > 8.69 (lacuna 8.68..8.69)
  7:  { age: 7,  p98: 6.57, p80: 7.56, p60: 8.00, p40: 8.40 },
  8:  { age: 8,  p98: 6.41, p80: 7.22, p60: 7.59, p40: 7.97 },
  9:  { age: 9,  p98: 6.04, p80: 6.89, p60: 7.25, p40: 7.62 },
  10: { age: 10, p98: 5.89, p80: 6.60, p60: 7.00, p40: 7.34 },
  11: { age: 11, p98: 5.73, p80: 6.49, p60: 6.90, p40: 7.23 },
  12: { age: 12, p98: 5.64, p80: 6.36, p60: 6.80, p40: 7.16 },
  13: { age: 13, p98: 5.58, p80: 6.28, p60: 6.70, p40: 7.09 },
  14: { age: 14, p98: 5.50, p80: 6.22, p60: 6.68, p40: 7.02 },
  15: { age: 15, p98: 5.34, p80: 6.19, p60: 6.66, p40: 6.99 },
  16: { age: 16, p98: 5.42, p80: 6.15, p60: 6.55, p40: 6.93 },
  17: { age: 17, p98: 5.27, p80: 6.05, p60: 6.46, p40: 6.80 },
};

export function classifySquareTest(seconds: number | null | undefined, sex: Sex, ageYears: number): MotorPerformanceCategory | null {
  if (seconds == null || ageYears < 6 || ageYears > 17) return null;
  const table = sex === "female" ? SQUARE_GIRLS : SQUARE_BOYS;
  const row = table[ageYears];
  if (!row) return null;

  if (seconds < row.p98) return "Excelência";
  if (seconds <= row.p80) return "Muito Bom";
  if (seconds <= row.p60) return "Bom";
  if (seconds <= row.p40) return "Razoável";
  return "Fraco";
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. VELOCIDADE DE DESLOCAMENTO — CORRIDA DE 20 METROS (segundos)
// Manual páginas 14 e 15. Menor tempo é melhor.
// ─────────────────────────────────────────────────────────────────────────────
export interface SprintRow {
  age: number;
  p98: number; // Teto Excelência (< p98)
  p80: number; // Teto Muito Bom (<= p80)
  p60: number; // Teto Bom (<= p60)
  p40: number; // Teto Razoável (<= p40)
}

export const SPRINT_BOYS: Record<number, SprintRow> = {
  6:  { age: 6,  p98: 3.73, p80: 4.20, p60: 4.53, p40: 4.80 },
  7:  { age: 7,  p98: 3.66, p80: 4.12, p60: 4.42, p40: 4.61 },
  8:  { age: 8,  p98: 3.51, p80: 4.00, p60: 4.21, p40: 4.46 },
  9:  { age: 9,  p98: 3.16, p80: 3.88, p60: 4.09, p40: 4.30 },
  10: { age: 10, p98: 3.08, p80: 3.74, p60: 3.98, p40: 4.14 },
  11: { age: 11, p98: 3.01, p80: 3.62, p60: 3.86, p40: 4.02 },
  12: { age: 12, p98: 3.00, p80: 3.50, p60: 3.74, p40: 3.95 },
  13: { age: 13, p98: 2.98, p80: 3.37, p60: 3.60, p40: 3.80 },
  14: { age: 14, p98: 2.91, p80: 3.23, p60: 3.46, p40: 3.66 },
  15: { age: 15, p98: 2.88, p80: 3.16, p60: 3.38, p40: 3.59 },
  16: { age: 16, p98: 2.82, p80: 3.12, p60: 3.33, p40: 3.50 }, // Nota manual: Bom 3.13 a 3.33, Razoável 3.33 a 3.50 (sobreposição 3.33)
  17: { age: 17, p98: 2.73, p80: 3.10, p60: 3.30, p40: 3.48 },
};

export const SPRINT_GIRLS: Record<number, SprintRow> = {
  6:  { age: 6,  p98: 4.01, p80: 4.54, p60: 4.83, p40: 5.11 }, // Nota manual: Excelência < 4.01, M.Bom 4.02..4.54 (lacuna 4.01..4.02)
  7:  { age: 7,  p98: 3.91, p80: 4.47, p60: 4.77, p40: 5.06 },
  8:  { age: 8,  p98: 3.87, p80: 4.27, p60: 4.53, p40: 4.74 }, // Nota manual: Excelência < 3.87, M.Bom 3.88..4.27 (lacuna 3.87..3.88)
  9:  { age: 9,  p98: 3.55, p80: 4.00, p60: 4.28, p40: 4.53 }, // Nota manual: Excelência < 3.55, M.Bom 3.56..4.00 (lacuna 3.55..3.56)
  10: { age: 10, p98: 3.44, p80: 3.97, p60: 4.16, p40: 4.40 },
  11: { age: 11, p98: 3.30, p80: 3.87, p60: 4.09, p40: 4.34 },
  12: { age: 12, p98: 3.11, p80: 3.78, p60: 4.00, p40: 4.31 },
  13: { age: 13, p98: 3.09, p80: 3.74, p60: 3.98, p40: 4.27 },
  14: { age: 14, p98: 3.06, p80: 3.72, p60: 3.94, p40: 4.26 },
  15: { age: 15, p98: 3.04, p80: 3.69, p60: 3.93, p40: 4.25 },
  16: { age: 16, p98: 3.02, p80: 3.68, p60: 3.91, p40: 4.22 },
  17: { age: 17, p98: 3.01, p80: 3.67, p60: 3.91, p40: 4.20 },
};

export function classifySprint20m(seconds: number | null | undefined, sex: Sex, ageYears: number): MotorPerformanceCategory | null {
  if (seconds == null || ageYears < 6 || ageYears > 17) return null;
  const table = sex === "female" ? SPRINT_GIRLS : SPRINT_BOYS;
  const row = table[ageYears];
  if (!row) return null;

  if (seconds < row.p98) return "Excelência";
  if (seconds <= row.p80) return "Muito Bom";
  if (seconds <= row.p60) return "Bom";
  if (seconds <= row.p40) return "Razoável";
  return "Fraco";
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. APTIDÃO CARDIORRESPIRATÓRIA — CORRIDA DE 6 MINUTOS (DESEMPENHO ESPORTIVO)
// Manual página 15 (valores em metros). Maior distância é melhor.
// ─────────────────────────────────────────────────────────────────────────────
export interface Run6PerformanceRow {
  age: number;
  p40: number; // Início Razoável
  p60: number; // Início Bom
  p80: number; // Início Muito Bom
  p98: number; // Início Excelência
}

export const RUN6_PERFORMANCE_BOYS: Record<number, Run6PerformanceRow> = {
  6:  { age: 6,  p40: 691,  p60: 741,  p80: 781,  p98: 878 }, // Nota manual: Fraco < 690, Razoável 691 a 740 (lacuna 690..691)
  7:  { age: 7,  p40: 735,  p60: 786,  p80: 825,  p98: 923 },
  8:  { age: 8,  p40: 773,  p60: 826,  p80: 879,  p98: 1009 },
  9:  { age: 9,  p40: 845,  p60: 900,  p80: 966,  p98: 1096 },
  10: { age: 10, p40: 880,  p60: 942,  p80: 1010, p98: 1157 },
  11: { age: 11, p40: 915,  p60: 978,  p80: 1050, p98: 1189 },
  12: { age: 12, p40: 965,  p60: 1030, p80: 1100, p98: 1254 }, // Nota manual: Bom 1030 a 1109, M.Bom 1100 a 1254 (sobreposição 1100..1109)
  13: { age: 13, p40: 983,  p60: 1083, p80: 1159, p98: 1319 },
  14: { age: 14, p40: 1068, p60: 1135, p80: 1210, p98: 1371 },
  15: { age: 15, p40: 1120, p60: 1187, p80: 1262, p98: 1434 },
  16: { age: 16, p40: 1150, p60: 1220, p80: 1289, p98: 1504 },
  17: { age: 17, p40: 1156, p60: 1220, p80: 1289, p98: 1505 },
};

export const RUN6_PERFORMANCE_GIRLS: Record<number, Run6PerformanceRow> = {
  6:  { age: 6,  p40: 612, p60: 641,  p80: 681,  p98: 831 },
  7:  { age: 7,  p40: 652, p60: 683,  p80: 730,  p98: 852 },
  8:  { age: 8,  p40: 700, p60: 735,  p80: 778,  p98: 875 },
  9:  { age: 9,  p40: 750, p60: 790,  p80: 841,  p98: 966 },
  10: { age: 10, p40: 783, p60: 832,  p80: 884,  p98: 1027 },
  11: { age: 11, p40: 822, p60: 868,  p80: 920,  p98: 1043 },
  12: { age: 12, p40: 855, p60: 901,  p80: 958,  p98: 1081 },
  13: { age: 13, p40: 887, p60: 935,  p80: 997,  p98: 1129 },
  14: { age: 14, p40: 920, p60: 967,  p80: 1024, p98: 1164 },
  15: { age: 15, p40: 955, p60: 1000, p80: 1044, p98: 1204 },
  16: { age: 16, p40: 970, p60: 1010, p80: 1055, p98: 1205 },
  17: { age: 17, p40: 982, p60: 1023, p80: 1063, p98: 1206 },
};

export function classifyRun6minPerformance(meters: number | null | undefined, sex: Sex, ageYears: number): MotorPerformanceCategory | null {
  if (meters == null || ageYears < 6 || ageYears > 17) return null;
  const table = sex === "female" ? RUN6_PERFORMANCE_GIRLS : RUN6_PERFORMANCE_BOYS;
  const row = table[ageYears];
  if (!row) return null;

  if (meters > row.p98) return "Excelência";
  if (meters >= row.p80) return "Muito Bom";
  if (meters >= row.p60) return "Bom";
  if (meters >= row.p40) return "Razoável";
  return "Fraco";
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. APTIDÃO CARDIORRESPIRATÓRIA PARA A SAÚDE — CORRIDA DE 6 MINUTOS (Quadro 3)
// Manual página 11. Ponto de corte único em metros:
// - Valores abaixo do corte: ZONA DE RISCO À SAÚDE
// - Valores acima ou iguais ao corte: ZONA SAUDÁVEL
// ─────────────────────────────────────────────────────────────────────────────
export const RUN6_HEALTH_CUTS_BOYS: Record<number, number> = {
  6: 675, 7: 730, 8: 768, 9: 820, 10: 856, 11: 930, 12: 966, 13: 995, 14: 1060, 15: 1130, 16: 1190, 17: 1190,
};

export const RUN6_HEALTH_CUTS_GIRLS: Record<number, number> = {
  6: 630, 7: 683, 8: 715, 9: 745, 10: 790, 11: 840, 12: 900, 13: 940, 14: 985, 15: 1005, 16: 1070, 17: 1110,
};

export function classifyRun6minHealth(meters: number | null | undefined, sex: Sex, ageYears: number): HealthZone | null {
  if (meters == null || ageYears < 6 || ageYears > 17) return null;
  const table = sex === "female" ? RUN6_HEALTH_CUTS_GIRLS : RUN6_HEALTH_CUTS_BOYS;
  const cut = table[ageYears];
  if (cut == null) return null;
  return meters >= cut ? "Zona Saudável" : "Zona de Risco à Saúde";
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. FLEXIBILIDADE PARA A SAÚDE — TESTE DE SENTAR E ALCANÇAR (Quadro 4)
// Manual página 11 (valores em cm, sem banco). Ponto de corte único:
// - Valores abaixo do corte: ZONA DE RISCO À SAÚDE
// - Valores acima ou iguais ao corte: ZONA SAUDÁVEL
// ─────────────────────────────────────────────────────────────────────────────
export const FLEXIBILITY_HEALTH_CUTS_BOYS: Record<number, number> = {
  6: 28.9, 7: 28.9, 8: 32.5, 9: 29.2, 10: 29.5, 11: 29.5, 12: 29.5, 13: 26.5, 14: 30.5, 15: 31.0, 16: 34.5, 17: 34.0,
};

export const FLEXIBILITY_HEALTH_CUTS_GIRLS: Record<number, number> = {
  6: 40.5, 7: 40.5, 8: 39.5, 9: 35.0, 10: 36.5, 11: 34.5, 12: 39.5, 13: 38.5, 14: 38.5, 15: 38.5, 16: 39.5, 17: 39.5,
};

export function classifyFlexibilityHealth(cm: number | null | undefined, sex: Sex, ageYears: number): HealthZone | null {
  if (cm == null || ageYears < 6 || ageYears > 17) return null;
  const table = sex === "female" ? FLEXIBILITY_HEALTH_CUTS_GIRLS : FLEXIBILITY_HEALTH_CUTS_BOYS;
  const cut = table[ageYears];
  if (cut == null) return null;
  return cm >= cut ? "Zona Saudável" : "Zona de Risco à Saúde";
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. RESISTÊNCIA ABDOMINAL PARA A SAÚDE — SIT-UP EM 1 MINUTO (Quadro 5)
// Manual página 12 (valores em repetições). Ponto de corte único:
// - Valores abaixo do corte: ZONA DE RISCO À SAÚDE
// - Valores acima ou iguais ao corte: ZONA SAUDÁVEL
// ─────────────────────────────────────────────────────────────────────────────
export const ABDOMINAL_HEALTH_CUTS_BOYS: Record<number, number> = {
  6: 18, 7: 18, 8: 24, 9: 26, 10: 31, 11: 37, 12: 41, 13: 42, 14: 43, 15: 45, 16: 46, 17: 47,
};

export const ABDOMINAL_HEALTH_CUTS_GIRLS: Record<number, number> = {
  6: 18, 7: 18, 8: 18, 9: 20, 10: 26, 11: 30, 12: 30, 13: 33, 14: 34, 15: 34, 16: 34, 17: 34,
};

export function classifyAbdominalHealth(reps: number | null | undefined, sex: Sex, ageYears: number): HealthZone | null {
  if (reps == null || ageYears < 6 || ageYears > 17) return null;
  const table = sex === "female" ? ABDOMINAL_HEALTH_CUTS_GIRLS : ABDOMINAL_HEALTH_CUTS_BOYS;
  const cut = table[ageYears];
  if (cut == null) return null;
  return reps >= cut ? "Zona Saudável" : "Zona de Risco à Saúde";
}

// ─────────────────────────────────────────────────────────────────────────────
// Faixas de Referência para UI (Cartões Clínicos do Dashboard do Aluno)
// ─────────────────────────────────────────────────────────────────────────────
export function getMotorExpectedRange(
  key: "jump" | "mball" | "square" | "sprint" | "run6" | "flex" | "abdo",
  sex: Sex,
  ageYears: number,
): { min: number; max: number; domainMin: number; domainMax: number; higherBetter: boolean } | null {
  if (ageYears < 6 || ageYears > 17) return null;

  switch (key) {
    case "jump": {
      const row = (sex === "female" ? JUMP_GIRLS : JUMP_BOYS)[ageYears];
      if (!row) return null;
      return { min: row.p40, max: row.p98, domainMin: row.p40 * 0.7, domainMax: row.p98 * 1.2, higherBetter: true };
    }
    case "mball": {
      const row = (sex === "female" ? MEDICINE_BALL_GIRLS : MEDICINE_BALL_BOYS)[ageYears];
      if (!row) return null;
      return { min: +(row.p40 / 100).toFixed(2), max: +(row.p98 / 100).toFixed(2), domainMin: +(row.p40 * 0.7 / 100).toFixed(2), domainMax: +(row.p98 * 1.2 / 100).toFixed(2), higherBetter: true };
    }
    case "square": {
      const row = (sex === "female" ? SQUARE_GIRLS : SQUARE_BOYS)[ageYears];
      if (!row) return null;
      return { min: row.p98, max: row.p40, domainMin: row.p98 * 0.8, domainMax: row.p40 * 1.2, higherBetter: false };
    }
    case "sprint": {
      const row = (sex === "female" ? SPRINT_GIRLS : SPRINT_BOYS)[ageYears];
      if (!row) return null;
      return { min: row.p98, max: row.p40, domainMin: row.p98 * 0.8, domainMax: row.p40 * 1.2, higherBetter: false };
    }
    case "run6": {
      const row = (sex === "female" ? RUN6_PERFORMANCE_GIRLS : RUN6_PERFORMANCE_BOYS)[ageYears];
      if (!row) return null;
      return { min: row.p40, max: row.p98, domainMin: row.p40 * 0.7, domainMax: row.p98 * 1.2, higherBetter: true };
    }
    case "flex": {
      const cut = (sex === "female" ? FLEXIBILITY_HEALTH_CUTS_GIRLS : FLEXIBILITY_HEALTH_CUTS_BOYS)[ageYears];
      if (cut == null) return null;
      return { min: cut, max: cut + 15, domainMin: cut - 10, domainMax: cut + 25, higherBetter: true };
    }
    case "abdo": {
      const cut = (sex === "female" ? ABDOMINAL_HEALTH_CUTS_GIRLS : ABDOMINAL_HEALTH_CUTS_BOYS)[ageYears];
      if (cut == null) return null;
      return { min: cut, max: cut + 20, domainMin: Math.max(0, cut - 15), domainMax: cut + 30, higherBetter: true };
    }
  }
}
