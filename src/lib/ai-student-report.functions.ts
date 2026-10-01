import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildDeterministicStudentReport,
  type StudentReportData,
  type StudentEvalData,
} from "./deterministic-student-report";

type Input = { studentId: string };

export const generateStudentReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Input) => {
    if (!data?.studentId) throw new Error("studentId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // 1. Busca dados cadastrais do aluno respeitando RLS da tenant autenticada
    const { data: student, error: sErr } = await supabase
      .from("students" as never)
      .select("id,tenant_id,full_name,sex,birth_date")
      .eq("id" as never, data.studentId)
      .single();

    if (sErr || !student) {
      throw new Error("Aluno não encontrado ou sem permissão de acesso");
    }

    // 2. Busca histórico completo de avaliações do aluno (ordenado cronologicamente)
    const { data: evals, error: eErr } = await supabase
      .from("evaluations" as never)
      .select(
        "id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications",
      )
      .eq("student_id" as never, data.studentId)
      .order("evaluated_at" as never, { ascending: true });

    if (eErr) {
      throw new Error(`Erro ao consultar avaliações: ${eErr.message}`);
    }

    if (!evals || (evals as unknown[]).length === 0) {
      throw new Error("Nenhuma avaliação registrada para este aluno. Realize ao menos uma avaliação para gerar o parecer.");
    }

    const s = student as unknown as StudentReportData;
    const evList = evals as unknown as StudentEvalData[];

    // 3. Gera parecer completo de forma determinística e imediata sem dependência de APIs externas
    const report = buildDeterministicStudentReport(s, evList);

    // 4. Persiste no banco de dados na tabela student_reports
    try {
      const latestEval = evList[evList.length - 1];
      await supabase.from("student_reports" as never).insert({
        tenant_id: (student as { tenant_id: string }).tenant_id,
        student_id: data.studentId,
        evaluation_id: latestEval?.id ?? null,
        engine_version: "v1.0.0",
        generated_at: report.generatedAt || new Date().toISOString(),
        diagnosis: report.conclusao || report.resumoGeral || "",
        technical: report.parecerTecnico || report.conclusao || "",
        family: report.parecerFamilia || report.evolucao || "",
        goals: report.metas || {},
        full_report: report,
      } as never);
    } catch (saveErr) {
      console.warn("[generateStudentReport] Erro ao persistir na tabela student_reports:", saveErr);
    }

    return report;
  });
