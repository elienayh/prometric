import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  PROMETRIC_PROMPT_VERSION,
  buildSystemPrompt,
} from "@/lib/ai/prometric-system-prompt";

type DiagnosisInput = {
  evaluationId: string;
};

export const generateDiagnosis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: DiagnosisInput) => {
    if (!data?.evaluationId) throw new Error("evaluationId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: ev, error } = await supabase
      .from("evaluations")
      .select("*, student:students(full_name,sex,birth_date)")
      .eq("id", data.evaluationId)
      .single();
    if (error || !ev) throw new Error("Avaliação não encontrada");

    const studentName =
      (ev as { student?: { full_name?: string } }).student?.full_name ?? "—";
    const studentSex = (ev as { student?: { sex?: string } }).student?.sex ?? "—";

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
Nome: ${studentName} | Sexo: ${studentSex} | Idade: ${ev.age_years} anos
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

    // Resolve provedor: tenant > Lovable fallback
    const { resolveTenantModel, generateJSON } = await import("@/lib/ai/unified-generate.server");
    const resolved = await resolveTenantModel(supabase, (ev as { tenant_id: string }).tenant_id);

    let parsed: {
      technical?: string;
      family?: string;
      diagnosis?: string;
      goals?: Record<string, string[]>;
    } = {};

    try {
      const raw = (await generateJSON(resolved, buildSystemPrompt(), userPrompt)) as typeof parsed;
      parsed = raw ?? {};
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(message);
    }

    // Aplica guardrails básicos de texto (Camada 4 simplificada para shape legado)
    const sanitize = (s?: string) =>
      (s ?? "")
        .replace(/\bPROESP(?:-BR)?\b/gi, "")
        .replace(/\bz[\s-]?score\b/gi, "")
        .replace(/\bpercentil\b/gi, "")
        .replace(/\bdesvio[\s-]?padr[ãa]o\b/gi, "")
        .replace(/\bRegular\b/g, "Em Desenvolvimento")
        .replace(/\bMédio\b/g, "Em Desenvolvimento")
        .replace(/\bÓtimo\b/g, "Excelente")
        .replace(/\bRuim\b/g, "Atenção")
        .replace(/\s{2,}/g, " ")
        .trim();

    const technical = sanitize(parsed.technical);
    const family = sanitize(parsed.family);
    const diagnosis = sanitize(parsed.diagnosis ?? parsed.technical);
    const signature = `\n\n_Gerado pelo Modelo ProMetric® ${PROMETRIC_PROMPT_VERSION} • via ${resolved.provider} (${resolved.source})_`;

    const { error: upErr } = await supabase
      .from("evaluations")
      .update({
        ai_diagnosis: diagnosis + signature,
        ai_technical: technical + signature,
        ai_family: family + signature,
        ai_goals: parsed.goals ?? null,
      } as never)
      .eq("id", data.evaluationId);
    if (upErr) throw upErr;

    return {
      diagnosis,
      technical,
      family,
      goals: parsed.goals ?? {},
      provider: resolved.provider,
      source: resolved.source,
      promptVersion: PROMETRIC_PROMPT_VERSION,
    };
  });
