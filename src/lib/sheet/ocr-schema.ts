// Zod schema for OCR result from a printed Modo Prancheta sheet.
// Each field carries a numeric value (or null when illegible/empty) plus
// a 0..1 confidence score. The review UI highlights anything below 0.85.
import { z } from "zod";

export const OCR_FIELD_KEYS = [
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
] as const;

export type OCRFieldKey = (typeof OCR_FIELD_KEYS)[number];

const fieldSchema = z.object({
  value: z.number().nullable(),
  confidence: z.number().min(0).max(1),
});

export const OCRResultSchema = z.object({
  evaluated_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  observations: z.string().max(2000).nullable(),
  fields: z.object({
    weight_kg: fieldSchema,
    height_cm: fieldSchema,
    waist_cm: fieldSchema,
    wingspan_cm: fieldSchema,
    sit_and_reach_cm: fieldSchema,
    abdominal_reps: fieldSchema,
    horizontal_jump_cm: fieldSchema,
    medicine_ball_m: fieldSchema,
    square_test_s: fieldSchema,
    sprint_20m_s: fieldSchema,
    run_6min_m: fieldSchema,
  }),
});

export type OCRResult = z.infer<typeof OCRResultSchema>;

export const OCR_FIELD_LABEL: Record<OCRFieldKey, { label: string; unit: string }> = {
  weight_kg: { label: "Peso", unit: "kg" },
  height_cm: { label: "Altura", unit: "cm" },
  waist_cm: { label: "Cintura", unit: "cm" },
  wingspan_cm: { label: "Envergadura", unit: "cm" },
  sit_and_reach_cm: { label: "Sentar e Alcançar", unit: "cm" },
  abdominal_reps: { label: "Abdominal 1 min", unit: "reps" },
  horizontal_jump_cm: { label: "Salto Horizontal", unit: "cm" },
  medicine_ball_m: { label: "Medicine Ball 2 kg", unit: "m" },
  square_test_s: { label: "Agilidade (quadrado)", unit: "s" },
  sprint_20m_s: { label: "Velocidade 20 m", unit: "s" },
  run_6min_m: { label: "Corrida 6 min", unit: "m" },
};

export const OCR_CONFIDENCE_THRESHOLD = 0.85;
