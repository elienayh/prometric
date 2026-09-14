import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sheet.functions-DN0Dv-Gb.js
var issueSheetTokens_createServerFn_handler = createServerRpc({
	id: "7efb8b38bb24d75d7b4d5ff23cc6866822dd376589a7c5a0d560968d5e45bda9",
	name: "issueSheetTokens",
	filename: "src/lib/sheet/sheet.functions.ts"
}, (opts) => issueSheetTokens.__executeServer(opts));
var issueSheetTokens = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!Array.isArray(data?.studentIds) || data.studentIds.length === 0) throw new Error("Selecione ao menos um aluno");
	if (data.studentIds.length > 500) throw new Error("Limite de 500 fichas por lote");
	return data;
}).handler(issueSheetTokens_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: rows, error } = await supabase.from("students").select("id, tenant_id, full_name, sex, birth_date, photo_url, class:classes(name, school:schools(name))").in("id", data.studentIds);
	if (error) throw error;
	if (!rows || rows.length === 0) throw new Error("Nenhum aluno encontrado");
	const tenantId = rows[0].tenant_id;
	const { data: tenant, error: tErr } = await supabase.from("tenants").select("id, name, logo_url").eq("id", tenantId).single();
	if (tErr || !tenant) throw new Error("Tenant não encontrado");
	const { signSheetToken } = await import("./qr-payload.server-FjQi81hR.mjs");
	return {
		tenant,
		students: rows.map((r) => {
			const row = r;
			return {
				id: row.id,
				full_name: row.full_name,
				sex: row.sex,
				birth_date: row.birth_date,
				photo_url: row.photo_url,
				class_name: row.class?.name ?? null,
				school_name: row.class?.school?.name ?? null,
				token: signSheetToken(row.id, row.tenant_id)
			};
		})
	};
});
//#endregion
export { issueSheetTokens_createServerFn_handler };
