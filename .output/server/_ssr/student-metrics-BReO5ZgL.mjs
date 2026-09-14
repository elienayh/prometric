//#region node_modules/.nitro/vite/services/ssr/assets/student-metrics-BReO5ZgL.js
/** Ordena avaliações cronologicamente (mais antiga → mais recente). */
function chronological(evals) {
	return [...evals].sort((a, b) => a.evaluated_at.localeCompare(b.evaluated_at));
}
function hasClassifications(c) {
	return !!c && Object.values(c).some(Boolean);
}
/** Avaliação clínica atual: registro mais recente com alguma classificação. */
function currentEvaluation(evals) {
	const ordered = chronological(evals);
	for (let i = ordered.length - 1; i >= 0; i--) if (hasClassifications(ordered[i].classifications)) return ordered[i];
	return ordered[ordered.length - 1] ?? null;
}
/** Classificações da avaliação clínica atual, sem mesclar datas. */
function consolidatedClassifications(evals) {
	return { ...currentEvaluation(evals)?.classifications ?? {} };
}
/**
* Normaliza apenas a ordem e preserva exatamente as classificações registradas
* em cada avaliação. O campo auxiliar explicita o valor original para telas de
* auditoria, sem mudar os dados clínicos.
*/
function withConsolidatedView(evals) {
	return chronological(evals).map((ev) => {
		return {
			...ev,
			recorded_classifications: { ...ev.classifications ?? {} },
			classifications: { ...ev.classifications ?? {} }
		};
	});
}
//#endregion
export { currentEvaluation as n, withConsolidatedView as r, consolidatedClassifications as t };
