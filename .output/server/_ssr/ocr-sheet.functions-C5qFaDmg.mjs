import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { n as OCR_FIELD_KEYS, t as OCRResultSchema } from "./ocr-schema-DZV00ptb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ocr-sheet.functions-C5qFaDmg.js
var ocrSheetImage_createServerFn_handler = createServerRpc({
	id: "aaf53dd3114d355800179ed77b4e41552a506ec2eba41394b7f417b2e9b39195",
	name: "ocrSheetImage",
	filename: "src/lib/sheet/ocr-sheet.functions.ts"
}, (opts) => ocrSheetImage.__executeServer(opts));
var ocrSheetImage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.token?.startsWith("PM1.")) throw new Error("Token de ficha inválido");
	if (!data.imageBase64 || data.imageBase64.length < 200) throw new Error("Imagem inválida ou vazia");
	if (data.imageBase64.length > 85e5) throw new Error("Imagem muito grande (máx ~6 MB)");
	if (![
		"image/jpeg",
		"image/png",
		"image/webp"
	].includes(data.mime)) throw new Error("Formato de imagem não suportado");
	return data;
}).handler(ocrSheetImage_createServerFn_handler, async ({ data, context }) => {
	const { verifySheetToken } = await import("./qr-payload.server-FjQi81hR.mjs");
	const payload = verifySheetToken(data.token);
	const { supabase } = context;
	const { data: student, error } = await supabase.from("students").select("id, tenant_id, full_name, sex, birth_date, class_id, group_id, class:classes(name)").eq("id", payload.s).maybeSingle();
	if (error) throw error;
	if (!student) throw new Error("Aluno da ficha não encontrado neste espaço");
	if (student.tenant_id !== payload.t) throw new Error("Ficha emitida em outro espaço — não pode ser processada aqui");
	const { resolveTenantModel } = await import("./unified-generate.server-DXjHwB1z.mjs");
	const resolved = await resolveTenantModel(supabase, payload.t);
	if (resolved.source === "fallback") throw new Error("Nenhuma IA configurada para este espaço. Cadastre um provedor em Configurações → Inteligência Artificial antes de usar o OCR de fichas.");
	const { buildSystemPrompt } = await import("./prometric-system-prompt-8Pa-OU4j.mjs").then((n) => n.r);
	const system = buildSystemPrompt("Tarefa: leitura óptica (OCR) de uma ficha ProMetric impressa preenchida à mão.");
	const fieldDescriptor = OCR_FIELD_KEYS.map((k) => `- ${k}`).join("\n");
	const userPrompt = `Você recebeu a foto de UMA ficha de avaliação física do ProMetric, preenchida à mão pelo professor.
Sua tarefa é extrair os valores numéricos manuscritos das CAIXAS de valor de cada teste e devolver JSON estrito.

Regras absolutas:
1. Responda APENAS um objeto JSON com este formato exato:
{
  "evaluated_at": "YYYY-MM-DD" | null,
  "observations": string | null,
  "fields": {
${OCR_FIELD_KEYS.map((k) => `    "${k}": { "value": number|null, "confidence": 0..1 }`).join(",\n")}
  }
}
2. Use ponto como separador decimal (ex.: 1.62). Converta vírgulas para ponto.
3. Se a caixa estiver vazia, ilegível ou rasurada, use value=null e confidence próxima de 0.
4. confidence reflete sua certeza visual (0 = chute, 1 = leitura inequívoca).
5. Não converta unidades — registre exatamente o número escrito.
6. Não invente valores. Não use placeholders.
7. Não inclua texto fora do JSON. Não use markdown.

Campos esperados (chaves exatas):
${fieldDescriptor}

Aluno da ficha: ${student.full_name}.
Idade na ficha pode estar impressa apenas como referência — ignore para o OCR.`;
	const { generateMultimodalJSON } = await import("./multimodal.server-C6AZbn4W.mjs");
	const raw = await generateMultimodalJSON(resolved, system, userPrompt, {
		base64: data.imageBase64,
		mime: data.mime
	});
	const parsed = OCRResultSchema.safeParse(raw);
	if (!parsed.success) throw new Error("A IA retornou um formato inesperado. Tente novamente ou ajuste o provedor em Configurações → IA.");
	const s = student;
	return {
		studentId: s.id,
		studentName: s.full_name,
		birthDate: s.birth_date,
		sex: s.sex,
		classId: s.class_id,
		groupId: s.group_id,
		className: s.class?.name ?? null,
		ocr: parsed.data,
		aiSource: resolved.source,
		aiProvider: resolved.provider,
		aiModel: resolved.model
	};
});
//#endregion
export { ocrSheetImage_createServerFn_handler };
