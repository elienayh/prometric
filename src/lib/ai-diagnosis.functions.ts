import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildDeterministicDiagnosis,
  type EvaluationForDiagnosis,
} from "./deterministic-diagnosis";

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
      .from("evaluations" as never)
      .select("*, student:students(full_name,sex,birth_date)" as never)
      .eq("id" as never, data.evaluationId)
      .single();

    if (error || !ev) throw new Error("Avaliação não encontrada");

    const row = ev as unknown as EvaluationForDiagnosis;
    const result = buildDeterministicDiagnosis(row);

    await supabase
      .from("evaluations" as never)
      .update({
        ai_diagnosis: result.diagnosis + result.signature,
        ai_technical: result.technical + result.signature,
        ai_family: result.family + result.signature,
        ai_goals: result.goals,
      } as never)
      .eq("id" as never, data.evaluationId);

    return {
      diagnosis: result.diagnosis,
      technical: result.technical,
      family: result.family,
      goals: result.goals,
      provider: result.provider,
      source: result.source,
      promptVersion: result.promptVersion,
    };
  });
