import { n as buildSystemPrompt, t as PROMETRIC_PROMPT_VERSION } from "./prometric-system-prompt-8Pa-OU4j.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal-ai-report.functions-D81yA_03.js
var generatePortalReport_createServerFn_handler = createServerRpc({
	id: "c6337408bf63234de14ec66bd18b954055367b20153a1222bc755a49b42cc811",
	name: "generatePortalReport",
	filename: "src/lib/portal-ai-report.functions.ts"
}, (opts) => generatePortalReport.__executeServer(opts));
var generatePortalReport = createServerFn({ method: "POST" }).inputValidator((d) => {
	if (!d?.token || d.token.length < 4) throw new Error("Token inválido");
	return d;
}).handler(generatePortalReport_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
	const { data: student, error: sErr } = await supabaseAdmin.from("students").select("id,tenant_id,full_name,sex,birth_date,portal_enabled,is_active").or(`portal_token.eq.${data.token},portal_slug.eq.${data.token}`).limit(1).maybeSingle();
	if (sErr || !student) throw new Error("Portal não encontrado");
	const s = student;
	if (!s.portal_enabled || !s.is_active) throw new Error("Portal indisponível");
	const { data: evals, error: eErr } = await supabaseAdmin.from("evaluations").select("id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications").eq("student_id", s.id).order("evaluated_at", { ascending: true });
	if (eErr) throw eErr;
	if (!evals || evals.length === 0) throw new Error("Nenhuma avaliação disponível");
	const { resolveTenantModel, generateJSON } = await import("./unified-generate.server-DXjHwB1z.mjs");
	const resolved = await resolveTenantModel(supabaseAdmin, s.tenant_id);
	if (resolved.source !== "tenant") throw new Error("A IA do tenant não está configurada. Solicite ao administrador para ativar o provedor de IA nas configurações.");
	const userPrompt = `Gere um relatório evolutivo completo para a FAMÍLIA do aluno em JSON ESTRITO (sem markdown):
{
  "parecer": "Parecer interpretativo (até 220 palavras), linguagem acessível à família, baseado na Referência ProMetric®.",
  "evolucao": "Análise da evolução cronológica (até 200 palavras).",
  "recomendacoes_familia": ["recomendação prática 1", "...", "...", "..."],
  "plano_evolucao": ["passo 1", "passo 2", "passo 3", "passo 4"],
  "atividades_sugeridas": ["atividade 1", "atividade 2", "atividade 3", "atividade 4", "atividade 5"]
}

Aluno: ${s.full_name} | Sexo: ${s.sex} | Nascimento: ${s.birth_date}
Total de avaliações: ${evals.length}
Avaliações (cronológicas, com classificações): ${JSON.stringify(evals)}`;
	const raw = await generateJSON(resolved, buildSystemPrompt(), userPrompt);
	const clean = (t) => (t ?? "").replace(/\bPROESP(?:-BR)?\b/gi, "").replace(/\bz[\s-]?score\b/gi, "").replace(/\bpercentil\b/gi, "").replace(/\s{2,}/g, " ").trim();
	const cleanArr = (a) => (a ?? []).map(clean).filter(Boolean);
	return {
		parecer: clean(raw.parecer),
		evolucao: clean(raw.evolucao),
		recomendacoes_familia: cleanArr(raw.recomendacoes_familia),
		plano_evolucao: cleanArr(raw.plano_evolucao),
		atividades_sugeridas: cleanArr(raw.atividades_sugeridas),
		provider: resolved.provider,
		promptVersion: PROMETRIC_PROMPT_VERSION,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
});
//#endregion
export { generatePortalReport_createServerFn_handler };
