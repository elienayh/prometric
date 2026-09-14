import { t as PROMETRIC_PROMPT_VERSION } from "./prometric-system-prompt-8Pa-OU4j.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenant-ai.functions-1I_IFxB8.js
var VALID_PROVIDERS = [
	"openai",
	"google",
	"anthropic",
	"xai",
	"lovable"
];
var getTenantAiConfig_createServerFn_handler = createServerRpc({
	id: "98b53d8be3413f2d94862ceef79532dbb094c189f799ab1200e4d24fabdaa39b",
	name: "getTenantAiConfig",
	filename: "src/lib/tenant-ai.functions.ts"
}, (opts) => getTenantAiConfig.__executeServer(opts));
var getTenantAiConfig = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.tenantId) throw new Error("tenantId obrigatório");
	return data;
}).handler(getTenantAiConfig_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: cfg, error } = await supabase.rpc("get_tenant_ai_config", { _tenant: data.tenantId });
	if (error) throw new Error(error.message);
	return cfg;
});
var saveTenantAiCredential_createServerFn_handler = createServerRpc({
	id: "b4282c780f58a50d3891ee42d34e0df33731eed352a703b1d9f4574d9cd61d70",
	name: "saveTenantAiCredential",
	filename: "src/lib/tenant-ai.functions.ts"
}, (opts) => saveTenantAiCredential.__executeServer(opts));
var saveTenantAiCredential = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.tenantId) throw new Error("tenantId obrigatório");
	if (!VALID_PROVIDERS.includes(data.provider)) throw new Error("Provedor inválido");
	if (!data.model || data.model.length < 2) throw new Error("Modelo obrigatório");
	if (data.apiKey !== void 0 && data.apiKey.length > 0 && data.apiKey.length < 8) throw new Error("Chave de API muito curta");
	return data;
}).handler(saveTenantAiCredential_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("is_tenant_admin", { _tenant: data.tenantId });
	const { data: isPlatform } = await supabase.rpc("is_platform_admin", { _user: userId });
	if (!isAdmin && !isPlatform) throw new Error("Sem permissão para gerenciar IA deste espaço");
	const isLovable = data.provider === "lovable";
	let encrypted = null;
	if (!isLovable && data.apiKey && data.apiKey.length > 0) {
		const { encryptApiKey } = await import("./crypto.server-6EGdDl7D.mjs");
		encrypted = encryptApiKey(data.apiKey);
	}
	const { data: existing } = await supabase.from("tenant_ai_credentials").select("id, api_key_ciphertext, api_key_iv, api_key_tag, api_key_fingerprint").eq("tenant_id", data.tenantId).maybeSingle();
	const row = {
		tenant_id: data.tenantId,
		provider: data.provider,
		model: data.model,
		is_active: data.isActive ?? true,
		prompt_version: PROMETRIC_PROMPT_VERSION,
		...encrypted ? {
			api_key_ciphertext: encrypted.ciphertext,
			api_key_iv: encrypted.iv,
			api_key_tag: encrypted.tag,
			api_key_fingerprint: encrypted.fingerprint
		} : isLovable ? {
			api_key_ciphertext: null,
			api_key_iv: null,
			api_key_tag: null,
			api_key_fingerprint: null
		} : {},
		created_by: userId
	};
	if (existing) {
		const { error } = await supabase.from("tenant_ai_credentials").update(row).eq("id", existing.id);
		if (error) throw new Error(error.message);
	} else {
		const { error } = await supabase.from("tenant_ai_credentials").insert(row);
		if (error) throw new Error(error.message);
	}
	return { ok: true };
});
var testTenantAiCredential_createServerFn_handler = createServerRpc({
	id: "ab9ec8f8669caeed4094314d4cc7bfdba8f861bee25f77a24dc2442632ee7375",
	name: "testTenantAiCredential",
	filename: "src/lib/tenant-ai.functions.ts"
}, (opts) => testTenantAiCredential.__executeServer(opts));
var testTenantAiCredential = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.tenantId) throw new Error("tenantId obrigatório");
	return data;
}).handler(testTenantAiCredential_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("is_tenant_admin", { _tenant: data.tenantId });
	const { data: isPlatform } = await supabase.rpc("is_platform_admin", { _user: userId });
	if (!isAdmin && !isPlatform) throw new Error("Sem permissão");
	const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
	const { data: cred, error: credErr } = await supabaseAdmin.from("tenant_ai_credentials").select("provider, model, api_key_ciphertext, api_key_iv, api_key_tag").eq("tenant_id", data.tenantId).maybeSingle();
	if (credErr) throw new Error(credErr.message);
	if (!cred) throw new Error("Nenhuma credencial cadastrada — salve antes de testar");
	const row = cred;
	let apiKey = data.overrideApiKey ?? "";
	if (!apiKey && row.provider !== "lovable") {
		if (!row.api_key_ciphertext || !row.api_key_iv || !row.api_key_tag) throw new Error("Chave de API não cadastrada para este provedor");
		const { decryptApiKey } = await import("./crypto.server-6EGdDl7D.mjs");
		apiKey = decryptApiKey({
			ciphertext: row.api_key_ciphertext,
			iv: row.api_key_iv,
			tag: row.api_key_tag
		});
	}
	const { pingProvider } = await import("./providers.server-Bkck8fQI.mjs");
	const result = await pingProvider(row.provider, apiKey, row.model);
	await supabaseAdmin.from("tenant_ai_credentials").update({
		last_tested_at: (/* @__PURE__ */ new Date()).toISOString(),
		last_test_ok: result.ok,
		last_test_error: result.ok ? null : result.error ?? "Erro desconhecido",
		last_test_latency_ms: result.latencyMs
	}).eq("tenant_id", data.tenantId);
	return result;
});
var deleteTenantAiCredential_createServerFn_handler = createServerRpc({
	id: "45a68347b1966b9632093fee6cc58a5222ce18870212bdeffd7fea35139ed06e",
	name: "deleteTenantAiCredential",
	filename: "src/lib/tenant-ai.functions.ts"
}, (opts) => deleteTenantAiCredential.__executeServer(opts));
var deleteTenantAiCredential = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.tenantId) throw new Error("tenantId obrigatório");
	return data;
}).handler(deleteTenantAiCredential_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("is_tenant_admin", { _tenant: data.tenantId });
	const { data: isPlatform } = await supabase.rpc("is_platform_admin", { _user: userId });
	if (!isAdmin && !isPlatform) throw new Error("Sem permissão");
	const { error } = await supabase.from("tenant_ai_credentials").delete().eq("tenant_id", data.tenantId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { deleteTenantAiCredential_createServerFn_handler, getTenantAiConfig_createServerFn_handler, saveTenantAiCredential_createServerFn_handler, testTenantAiCredential_createServerFn_handler };
