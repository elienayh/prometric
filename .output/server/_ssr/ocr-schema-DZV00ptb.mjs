import { a as objectType, i as numberType, o as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ocr-schema-DZV00ptb.js
var OCR_FIELD_KEYS = [
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
	"run_6min_m"
];
var fieldSchema = objectType({
	value: numberType().nullable(),
	confidence: numberType().min(0).max(1)
});
var OCRResultSchema = objectType({
	evaluated_at: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
	observations: stringType().max(2e3).nullable(),
	fields: objectType({
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
		run_6min_m: fieldSchema
	})
});
var OCR_FIELD_LABEL = {
	weight_kg: {
		label: "Peso",
		unit: "kg"
	},
	height_cm: {
		label: "Altura",
		unit: "cm"
	},
	waist_cm: {
		label: "Cintura",
		unit: "cm"
	},
	wingspan_cm: {
		label: "Envergadura",
		unit: "cm"
	},
	sit_and_reach_cm: {
		label: "Sentar e Alcançar",
		unit: "cm"
	},
	abdominal_reps: {
		label: "Abdominal 1 min",
		unit: "reps"
	},
	horizontal_jump_cm: {
		label: "Salto Horizontal",
		unit: "cm"
	},
	medicine_ball_m: {
		label: "Medicine Ball 2 kg",
		unit: "m"
	},
	square_test_s: {
		label: "Agilidade (quadrado)",
		unit: "s"
	},
	sprint_20m_s: {
		label: "Velocidade 20 m",
		unit: "s"
	},
	run_6min_m: {
		label: "Corrida 6 min",
		unit: "m"
	}
};
//#endregion
export { OCR_FIELD_KEYS as n, OCR_FIELD_LABEL as r, OCRResultSchema as t };
