import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PROMETRIC_PROMPT_VERSION, buildSystemPrompt } from "@/lib/ai/prometric-system-prompt";

type Input = { studentId: string };

export const generateStudentReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Input) => {
    if (!data?.studentId) throw new Error("studentId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: student, error: sErr } = await supabase
      .from("students")
      .select("id,tenant_id,full_name,sex,birth_date")
      .eq("id", data.studentId)
      .single();
    if (sErr || !student) throw new Error("Aluno não encontrado");

    const { data: evals, error: eErr } = await supabase
      .from("evaluations")
      .select(
        "id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications",
      )
      .eq("student_id", data.studentId)
      .order("evaluated_at", { ascending: true });
    if (eErr) throw eErr;
    if (!evals || evals.length === 0) throw new Error("Nenhuma avaliação para analisar");

    const s = student as { id: string; tenant_id: string; full_name: string; sex: string; birth_date: string };

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

    const { resolveTenantModel, generateJSON } = await import("@/lib/ai/unified-generate.server");
    const resolved = await resolveTenantModel(supabase, s.tenant_id);

    const raw = (await generateJSON(resolved, buildSystemPrompt(), userPrompt)) as {
      resumo_geral?: string;
      evolucao?: string;
      pontos_fortes?: string[];
      pontos_atencao?: string[];
      recomendacoes?: string[];
      conclusao?: string;
    };

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
    const sanArr = (a?: string[]) => (a ?? []).map(sanitize).filter(Boolean);

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
      generatedAt: new Date().toISOString(),
    };
  });
