import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resolve-token.functions-DwoXAyKi.js
var resolveSheetToken_createServerFn_handler = createServerRpc({
	id: "e7994dafb508e73edf489fca048a2eac0fb340fee4a6332ec1e5fe4131960bca",
	name: "resolveSheetToken",
	filename: "src/lib/sheet/resolve-token.functions.ts"
}, (opts) => resolveSheetToken.__executeServer(opts));
var resolveSheetToken = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.token?.startsWith("PM1.")) throw new Error("Token de ficha inválido");
	return data;
}).handler(resolveSheetToken_createServerFn_handler, async ({ data, context }) => {
	const { verifySheetToken } = await import("./qr-payload.server-FjQi81hR.mjs");
	const payload = verifySheetToken(data.token);
	const { supabase } = context;
	const { data: student, error } = await supabase.from("students").select("id, tenant_id, full_name, sex, birth_date, class_id, group_id, class:classes(name)").eq("id", payload.s).maybeSingle();
	if (error) throw error;
	if (!student) throw new Error("Aluno da ficha não encontrado neste espaço");
	const s = student;
	if (s.tenant_id !== payload.t) throw new Error("Ficha emitida em outro espaço — não pode ser processada aqui");
	return {
		studentId: s.id,
		studentName: s.full_name,
		birthDate: s.birth_date,
		sex: s.sex,
		classId: s.class_id,
		groupId: s.group_id,
		className: s.class?.name ?? null,
		tenantId: s.tenant_id
	};
});
//#endregion
export { resolveSheetToken_createServerFn_handler };
