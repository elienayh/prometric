// Regiões de interesse (ROIs) normalizadas (0..1) da ficha impressa do
// ProMetric, derivadas de `sheet-pdf.ts`. Use para recortar áreas específicas
// antes de aplicar OCR tradicional (Tesseract.js).
//
// Coordenadas relativas à PÁGINA A4 (210×297 mm). O recorte feito por
// `cropSheetAroundQR` adiciona 2% de padding em cada lado — `roiInCrop()`
// abaixo já compensa esse offset.

import type { OCRFieldKey } from "./ocr-schema";

export type ROI = { x: number; y: number; w: number; h: number };

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 12;
const COL_W = (PAGE_W - MARGIN * 2 - 4) / 2; // 91
const ROW_H = 16;
const VBOX_W = 34;
const VBOX_H = ROW_H - 6; // 10

// y onde começa o grid de campos (depois do header + bloco do aluno + título)
const GRID_Y0 = MARGIN + 30 + 26 + 6 + 4; // 78

function valueBoxMM(index: number): ROI {
  const col = index % 2;
  const row = Math.floor(index / 2);
  const x = MARGIN + col * (COL_W + 4); // 12 ou 107
  const cy = GRID_Y0 + row * (ROW_H + 2); // 78, 96, 114, ...
  const valBoxX = x + COL_W - 38; // 65 ou 160
  const valBoxY = cy + 3;
  return { x: valBoxX, y: valBoxY, w: VBOX_W, h: VBOX_H };
}

function normalize(roi: ROI): ROI {
  return {
    x: roi.x / PAGE_W,
    y: roi.y / PAGE_H,
    w: roi.w / PAGE_W,
    h: roi.h / PAGE_H,
  };
}

// Ordem dos campos no PDF impresso (sheet-pdf.ts FIELDS) — casa com OCR_FIELD_KEYS.
const FIELD_ORDER: OCRFieldKey[] = [
  "weight_kg",
  "height_cm",
  "waist_cm",
  "wingspan_cm",
  "sit_and_reach_cm",
  "abdominal_reps",
  "horizontal_jump_cm",
  "medicine_ball_m",
  "square_test_s",
  "sprint_20m_s",
  "run_6min_m",
];

export const SHEET_FIELD_ROIS: Record<OCRFieldKey, ROI> = FIELD_ORDER.reduce(
  (acc, key, i) => {
    acc[key] = normalize(valueBoxMM(i));
    return acc;
  },
  {} as Record<OCRFieldKey, ROI>,
);

// Linha "Data da avaliação:" do bloco do aluno.
// y do bloco = MARGIN + 30 = 42; linha em y+8 ≈ 50; texto manuscrito ocupa 168..196 em x.
export const DATE_ROI: ROI = normalize({ x: 167, y: 44, w: 30, h: 9 });

// Faixas válidas por campo (alerta — não bloqueante).
export const FIELD_RANGES: Record<OCRFieldKey, { min: number; max: number }> = {
  weight_kg: { min: 20, max: 200 },
  height_cm: { min: 100, max: 230 },
  waist_cm: { min: 40, max: 160 },
  wingspan_cm: { min: 100, max: 230 },
  sit_and_reach_cm: { min: -20, max: 60 },
  abdominal_reps: { min: 0, max: 100 },
  horizontal_jump_cm: { min: 30, max: 350 },
  medicine_ball_m: { min: 0.5, max: 15 },
  square_test_s: { min: 4, max: 20 },
  sprint_20m_s: { min: 2, max: 15 },
  run_6min_m: { min: 300, max: 2500 },
};

/**
 * Converte uma ROI em coordenadas de página para coordenadas DENTRO do crop
 * gerado por `cropSheetAroundQR`, que adiciona ~2% de padding em cada lado.
 */
export function roiInCrop(roi: ROI, pad = 0.02): ROI {
  const scale = 1 / (1 + 2 * pad);
  const off = pad * scale;
  return {
    x: off + roi.x * scale,
    y: off + roi.y * scale,
    w: roi.w * scale,
    h: roi.h * scale,
  };
}

export function isOutOfRange(key: OCRFieldKey, value: number | null): boolean {
  if (value == null || !Number.isFinite(value)) return false;
  const r = FIELD_RANGES[key];
  return value < r.min || value > r.max;
}
