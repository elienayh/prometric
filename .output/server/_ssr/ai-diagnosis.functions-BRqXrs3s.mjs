import { n as buildSystemPrompt, t as PROMETRIC_PROMPT_VERSION } from "./prometric-system-prompt-8Pa-OU4j.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-diagnosis.functions-BRqXrs3s.js
var generateDiagnosis_createServerFn_handler = createServerRpc({
	id: "fa62531b566d3095b56ec514c128f5ee9540f1d16500db1ac84e47386936457c",
	name: "generateDiagnosis",
	filename: "src/lib/ai-diagnosis.functions.ts"
}, (opts) => generateDiagnosis.__executeServer(opts));
var generateDiagnosis = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.evaluationId) throw new Error("evaluationId obrigatório");
	return data;
}).handler(generateDiagnosis_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: ev, error } = await supabase.from("evaluations").select("*, student:students(full_name,sex,birth_date)").eq("id", data.evaluationId).single();
	if (error || !ev) throw new Error("Avaliação não encontrada");
	const userPrompt = `Gere uma resposta em JSON ESTRITO (sem markdown, sem texto fora do JSON) seguindo a estrutura:
{
  "technical": "Parecer técnico em linguagem profissional (até 220 palavras): perfil físico, pontos fortes, pontos a desenvolver e recomendações pedagógicas. Use as 5 categorias e 5 dimensões oficiais ProMetric®.",
  "family": "Parecer para a família em linguagem simples e acolhedora (até 180 palavras): como está a saúde física do estudante, o que pode ser melhorado e como a família pode apoiar. Sem termos técnicos.",
  "diagnosis": "Resumo curto (até 120 palavras) consolidando o diagnóstico geral no vocabulário ProMetric®.",
  "goals": {
    "30_days":  ["meta 1", "meta 2", "meta 3"],
    "60_days":  ["meta 1", "meta 2", "meta 3"],
    "90_days":  ["meta 1", "meta 2", "meta 3"]
  }
}

Dados do aluno (use APENAS estes valores — não invente):
Nome: ${ev.student?.full_name ?? "—"} | Sexo: ${ev.student?.sex ?? "—"} | Idade: ${ev.age_years} anos
Antropometria: peso ${ev.weight_kg}kg, estatura ${ev.height_cm}cm, IMC ${ev.imc}, RCE ${ev.rce}
Testes:
- Mobilidade (sentar/alcançar): ${ev.sit_and_reach_cm} cm
- Resistência muscular (abdominal 1min): ${ev.abdominal_reps} reps
- Potência inferior (salto horizontal): ${ev.horizontal_jump_cm} cm
- Potência superior (medicine ball 2kg): ${ev.medicine_ball_m} m
- Agilidade (quadrado): ${ev.square_test_s} s
- Velocidade (20m): ${ev.sprint_20m_s} s
- Resistência cardiorrespiratória (corrida 6min): ${ev.run_6min_m} m
Classificações já calculadas pelo Modelo ProMetric® (fonte da verdade): ${JSON.stringify(ev.classifications)}`;
	const { resolveTenantModel, generateJSON } = await import("./unified-generate.server-DXjHwB1z.mjs");
	const resolved = await resolveTenantModel(supabase, ev.tenant_id);
	let parsed = {};
	try {
		parsed = await generateJSON(resolved, buildSystemPrompt(), userPrompt) ?? {};
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		throw new Error(message);
	}
	const sanitize = (s) => (s ?? "").replace(/\bPROESP(?:-BR)?\b/gi, "").replace(/\bz[\s-]?score\b/gi, "").replace(/\bpercentil\b/gi, "").replace(/\bdesvio[\s-]?padr[ãa]o\b/gi, "").replace(/\bRegular\b/g, "Em Desenvolvimento").replace(/\bMédio\b/g, "Em Desenvolvimento").replace(/\bÓtimo\b/g, "Excelente").replace(/\bRuim\b/g, "Atenção").replace(/\s{2,}/g, " ").trim();
	const technical = sanitize(parsed.technical);
	const family = sanitize(parsed.family);
	const diagnosis = sanitize(parsed.diagnosis ?? parsed.technical);
	const signature = `\n\n_Gerado pelo Modelo ProMetric® ${PROMETRIC_PROMPT_VERSION} • via ${resolved.provider} (${resolved.source})_`;
	const { error: upErr } = await supabase.from("evaluations").update({
		ai_diagnosis: diagnosis + signature,
		ai_technical: technical + signature,
		ai_family: family + signature,
		ai_goals: parsed.goals ?? null
	}).eq("id", data.evaluationId);
	if (upErr) throw upErr;
	return {
		diagnosis,
		technical,
		family,
		goals: parsed.goals ?? {},
		provider: resolved.provider,
		source: resolved.source,
		promptVersion: PROMETRIC_PROMPT_VERSION
	};
});
//#endregion
export { generateDiagnosis_createServerFn_handler };
