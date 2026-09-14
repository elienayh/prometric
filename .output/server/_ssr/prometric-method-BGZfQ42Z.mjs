import { u as zoneScore } from "./proesp-DU2T_E5l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prometric-method-BGZfQ42Z.js
var PM_CATEGORIES = [
	"Prioritário",
	"Atenção",
	"Em Desenvolvimento",
	"Bom",
	"Excelente"
];
function categoryColor(c) {
	switch (c) {
		case "Excelente": return "bg-success/20 text-success border-success/30";
		case "Bom": return "bg-primary/15 text-primary border-primary/30";
		case "Em Desenvolvimento": return "bg-accent/20 text-accent-foreground border-accent/30";
		case "Atenção": return "bg-warning/20 text-warning border-warning/30";
		case "Prioritário": return "bg-destructive/15 text-destructive border-destructive/30";
		default: return "bg-muted text-muted-foreground border-border";
	}
}
var PM_DIMENSIONS = [
	"Saúde Corporal",
	"Resistência",
	"Mobilidade",
	"Potência",
	"Velocidade e Agilidade"
];
var DIM_TO_KEYS = {
	"Saúde Corporal": ["imc", "rce"],
	"Resistência": ["run6", "abdo"],
	"Mobilidade": ["flex"],
	"Potência": ["jump", "mball"],
	"Velocidade e Agilidade": ["sprint", "square"]
};
function avgToScore100(scores) {
	if (scores.length === 0) return 0;
	const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
	return Math.round((avg - 1) / 5 * 100);
}
function scoreToCategory(score) {
	if (score < 25) return "Prioritário";
	if (score < 45) return "Atenção";
	if (score < 65) return "Em Desenvolvimento";
	if (score < 85) return "Bom";
	return "Excelente";
}
function dimensionScores(c) {
	return PM_DIMENSIONS.map((d) => {
		const scores = DIM_TO_KEYS[d].map((k) => c[k]).filter(Boolean).map((z) => zoneScore(z));
		if (scores.length === 0) return {
			dimension: d,
			score: 0,
			category: null
		};
		const s = avgToScore100(scores);
		return {
			dimension: d,
			score: s,
			category: scoreToCategory(s)
		};
	});
}
function prometricIndex(c) {
	const dims = dimensionScores(c);
	const filledTests = Object.values(c).filter(Boolean).length;
	const partial = filledTests < 4;
	const filled = dims.filter((d) => d.category !== null);
	if (filled.length === 0) return {
		score: 0,
		category: null,
		dimensions: dims,
		filledTests,
		partial: true
	};
	const avg = Math.round(filled.reduce((a, d) => a + d.score, 0) / filled.length);
	return {
		score: avg,
		category: partial ? null : scoreToCategory(avg),
		dimensions: dims,
		filledTests,
		partial
	};
}
//#endregion
export { prometricIndex as a, dimensionScores as i, PM_DIMENSIONS as n, scoreToCategory as o, categoryColor as r, PM_CATEGORIES as t };
