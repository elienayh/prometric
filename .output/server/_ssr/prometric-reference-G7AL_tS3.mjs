import { n as ZONES } from "./proesp-DU2T_E5l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prometric-reference-G7AL_tS3.js
var PR_SITUATIONS = [
	"Muito abaixo",
	"Abaixo",
	"Dentro do esperado",
	"Acima do esperado",
	"Muito acima do esperado"
];
/**
* Mapeia zona PROESP → situação Referência ProMetric®.
* Faixa esperada para idade/sexo = zonas {Razoável, Bom, Muito Bom}.
*/
function zoneToSituation(z) {
	switch (z) {
		case "Muito Fraco": return "Muito abaixo";
		case "Fraco": return "Abaixo";
		case "Razoável":
		case "Bom":
		case "Muito Bom": return "Dentro do esperado";
		case "Excelente": return "Acima do esperado";
		default: return null;
	}
}
/**
* Mapeia Índice ProMetric (0–100) → situação Referência ProMetric®.
* Limites derivados das mesmas categorias usadas em prometric-method:
*   <25 Prioritário, 25–44 Atenção, 45–64 Em Desenvolvimento,
*   65–84 Bom, ≥85 Excelente
* Faixa esperada do Índice = 45..85 (Em Desenvolvimento → Bom → Excelente parcial).
*/
function scoreToSituation(score, partial = false) {
	if (partial) return null;
	if (score < 25) return "Muito abaixo";
	if (score < 45) return "Abaixo";
	if (score < 75) return "Dentro do esperado";
	if (score < 90) return "Acima do esperado";
	return "Muito acima do esperado";
}
/** Faixa esperada do Índice ProMetric® (0–100). */
var EXPECTED_INDEX_RANGE = {
	min: 45,
	max: 85
};
/** Faixa esperada por dimensão (mesma referência usada no Índice). */
var EXPECTED_DIMENSION_RANGE = {
	min: 45,
	max: 85
};
/** Texto curto descrevendo a zona esperada em barras por teste. */
var EXPECTED_ZONES_LABEL = "Razoável a Muito Bom";
/**
* Posição (0..100%) do marker na barra de referência a partir da zona PROESP.
* Cada uma das 6 zonas ocupa 1/6 da barra; o marker é centrado no segmento.
*/
function zoneToBarPosition(z) {
	if (!z) return null;
	const idx = ZONES.indexOf(z);
	if (idx < 0) return null;
	return (idx + .5) / ZONES.length * 100;
}
/** Faixa esperada na barra (0..100%) — cobre Razoável + Bom + Muito Bom. */
var EXPECTED_BAR_RANGE = {
	start: ZONES.indexOf("Razoável") / ZONES.length * 100,
	end: (ZONES.indexOf("Muito Bom") + 1) / ZONES.length * 100
};
/**
* Estilo identitário da Referência ProMetric® por situação.
* Paleta clínica/laboratorial (vermelho → laranja → verde → azul → roxo)
* — distinta das zonas PROESP brutas, para que o usuário reconheça a
* Referência ProMetric® em qualquer parte do sistema.
*/
function situationStyle(s) {
	switch (s) {
		case "Muito abaixo": return {
			className: "bg-[#fee2e2] text-[#991b1b] border-[#fecaca] dark:bg-[#7f1d1d]/30 dark:text-[#fecaca] dark:border-[#7f1d1d]/60",
			icon: "▼▼",
			short: "Muito abaixo"
		};
		case "Abaixo": return {
			className: "bg-[#ffedd5] text-[#9a3412] border-[#fed7aa] dark:bg-[#7c2d12]/30 dark:text-[#fed7aa] dark:border-[#7c2d12]/60",
			icon: "▼",
			short: "Abaixo"
		};
		case "Dentro do esperado": return {
			className: "bg-[#dcfce7] text-[#166534] border-[#bbf7d0] dark:bg-[#14532d]/30 dark:text-[#bbf7d0] dark:border-[#14532d]/60",
			icon: "✓",
			short: "Dentro do esperado"
		};
		case "Acima do esperado": return {
			className: "bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe] dark:bg-[#1e3a8a]/30 dark:text-[#bfdbfe] dark:border-[#1e3a8a]/60",
			icon: "▲",
			short: "Acima do esperado"
		};
		case "Muito acima do esperado": return {
			className: "bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe] dark:bg-[#4c1d95]/30 dark:text-[#ddd6fe] dark:border-[#4c1d95]/60",
			icon: "▲▲",
			short: "Muito acima"
		};
		default: return {
			className: "bg-muted text-muted-foreground border-border",
			icon: "—",
			short: "—"
		};
	}
}
/** Texto interpretativo curto da situação (para Portal e PDFs). */
function situationSentence(s, subject = "O desenvolvimento físico") {
	switch (s) {
		case "Muito abaixo": return `${subject} encontra-se muito abaixo do esperado para a idade. Recomendamos atenção prioritária.`;
		case "Abaixo": return `${subject} encontra-se abaixo do esperado para a idade. Há espaço importante para evolução.`;
		case "Dentro do esperado": return `${subject} encontra-se dentro do esperado para a idade.`;
		case "Acima do esperado": return `${subject} encontra-se acima do esperado para a idade.`;
		case "Muito acima do esperado": return `${subject} encontra-se muito acima do esperado para a idade — desempenho excepcional.`;
		default: return `Dados insuficientes para situar ${subject.toLowerCase()} em relação à Referência ProMetric®.`;
	}
}
/** Marca identitária para títulos/legendas. */
var REFERENCE_LABEL = "Referência ProMetric®";
//#endregion
export { PR_SITUATIONS as a, situationSentence as c, zoneToSituation as d, EXPECTED_ZONES_LABEL as i, situationStyle as l, EXPECTED_DIMENSION_RANGE as n, REFERENCE_LABEL as o, EXPECTED_INDEX_RANGE as r, scoreToSituation as s, EXPECTED_BAR_RANGE as t, zoneToBarPosition as u };
