import { n as buildSystemPrompt, t as PROMETRIC_PROMPT_VERSION } from "./prometric-system-prompt-8Pa-OU4j.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-student-report.functions-DZpzJQR5.js
var generateStudentReport_createServerFn_handler = createServerRpc({
	id: "fdf65247fe2f9f9745b3b496219d517e34af9a3a471f8e87bfb2a840b10904e6",
	name: "generateStudentReport",
	filename: "src/lib/ai-student-report.functions.ts"
}, (opts) => generateStudentReport.__executeServer(opts));
var generateStudentReport = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.studentId) throw new Error("studentId obrigatório");
	return data;
}).handler(generateStudentReport_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: student, error: sErr } = await supabase.from("students").select("id,tenant_id,full_name,sex,birth_date").eq("id", data.studentId).single();
	if (sErr || !student) throw new Error("Aluno não encontrado");
	const { data: evals, error: eErr } = await supabase.from("evaluations").select("id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications").eq("student_id", data.studentId).order("evaluated_at", { ascending: true });
	if (eErr) throw eErr;
	if (!evals || evals.length === 0) throw new Error("Nenhuma avaliação para analisar");
	const s = student;
	const userPrompt = `Gere um relatório completo do aluno em JSON ESTRITO (sem markdown):
{
  "resumo_geral": "Situação atual em até 180 palavras, vocabulário ProMetric®.",
  "evolucao": "Evolução observada ao longo de todas as avaliações (até 200 palavras).",
  "pontos_fortes": ["bullet 1", "bullet 2", "bullet 3"],
  "pontos_atencao": ["bullet 1", "bullet 2", "bullet 3"],
  "recomendacoes": ["recomendação prática 1", "recomendação prática 2", "recomendação prática 3", "recomendação prática 4"],
  "conclusao": "Resumo executivo simples para professor e família (até 140 palavras)."
}

Dados do aluno (use APENAS estes valores):
Nome: ${s.full_name} | Sexo: ${s.sex} | Nascimento: ${s.birth_date}
Total de avaliações: ${evals.length}
Avaliações (cronológicas): ${JSON.stringify(evals)}`;
	const { resolveTenantModel, generateJSON } = await import("./unified-generate.server-DXjHwB1z.mjs");
	const resolved = await resolveTenantModel(supabase, s.tenant_id);
	const raw = await generateJSON(resolved, buildSystemPrompt(), userPrompt);
	const sanitize = (s) => (s ?? "").replace(/\bPROESP(?:-BR)?\b/gi, "").replace(/\bz[\s-]?score\b/gi, "").replace(/\bpercentil\b/gi, "").replace(/\bdesvio[\s-]?padr[ãa]o\b/gi, "").replace(/\bRegular\b/g, "Em Desenvolvimento").replace(/\bMédio\b/g, "Em Desenvolvimento").replace(/\bÓtimo\b/g, "Excelente").replace(/\bRuim\b/g, "Atenção").replace(/\s{2,}/g, " ").trim();
	const sanArr = (a) => (a ?? []).map(sanitize).filter(Boolean);
	return {
		resumo_geral: sanitize(raw.resumo_geral),
		evolucao: sanitize(raw.evolucao),
		pontos_fortes: sanArr(raw.pontos_fortes),
		pontos_atencao: sanArr(raw.pontos_atencao),
		recomendacoes: sanArr(raw.recomendacoes),
		conclusao: sanitize(raw.conclusao),
		provider: resolved.provider,
		source: resolved.source,
		promptVersion: PROMETRIC_PROMPT_VERSION,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
});
//#endregion
export { generateStudentReport_createServerFn_handler };
