// Shared helper to trigger batch sheet generation with size-aware UX.
// Up to BATCH_LIMIT students: single PDF.
// Above: confirm with the user before downloading a heavy file.
import { toast } from "sonner";
import { issueSheetTokens } from "./sheet.functions";
import { generateSheetPDF } from "./sheet-pdf";

export const SHEET_BATCH_LIMIT = 100;

export async function printSheetsBatch(studentIds: string[], label = "lote") {
  if (studentIds.length === 0) {
    toast.error("Nenhum aluno para imprimir");
    return;
  }
  if (studentIds.length > SHEET_BATCH_LIMIT) {
    const proceed = window.confirm(
      `Você está prestes a gerar ${studentIds.length} fichas em um único PDF. ` +
        `Para grandes volumes recomendamos imprimir por turma. Deseja continuar mesmo assim?`,
    );
    if (!proceed) return;
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
