import { n as toast } from "../_libs/sonner.mjs";
import { n as issueSheetTokens, t as generateSheetPDF } from "./sheet-pdf-0uGmF5lM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/print-batch-DI_e7iaY.js
async function printSheetsBatch(studentIds, label = "lote") {
	if (studentIds.length === 0) {
		toast.error("Nenhum aluno para imprimir");
		return;
	}
	if (studentIds.length > 100) {
		if (!window.confirm(`Você está prestes a gerar ${studentIds.length} fichas em um único PDF. Para grandes volumes recomendamos imprimir por turma. Deseja continuar mesmo assim?`)) return;
	}
	try {
		toast.loading(`Gerando fichas (${label})…`, { id: "sheet-batch" });
		const bundle = await issueSheetTokens({ data: { studentIds } });
		await generateSheetPDF(bundle);
		toast.success(`${bundle.students.length} ficha(s) gerada(s)`, { id: "sheet-batch" });
	} catch (e) {
		toast.error(e instanceof Error ? e.message : "Falha ao gerar fichas", { id: "sheet-batch" });
	}
}
//#endregion
export { printSheetsBatch as t };
