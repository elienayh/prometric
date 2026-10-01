// Portal público — gera relatório interpretativo a partir do token do aluno.
// Utiliza motor determinístico especialista baseado no Método ProMetric®,
// sem depender de chaves de API externas ou cotas de terceiros.

import { createServerFn } from "@tanstack/react-start";
import {
  buildDeterministicPortalReport,
  type PortalStudentData,
  type PortalEvalData,
} from "./deterministic-portal-report";

const PORTAL_KEY_REGEX = /^[a-zA-Z0-9_-]{4,80}$/;

type Input = { token: string };

export const generatePortalReport = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d?.token || typeof d.token !== "string" || !PORTAL_KEY_REGEX.test(d.token.trim())) {
      throw new Error("Token de acesso inválido ou formato incorreto");
    }
    return { token: d.token.trim() };
  })
  .handler(async ({ data }) => {
    let s: PortalStudentData | null = null;
    let evals: PortalEvalData[] = [];

    // 1) Tenta resolver aluno via supabaseAdmin de forma segura e parametrizada (sem interpolação)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: byToken } = await supabaseAdmin
        .from("students" as never)
        .select("id,tenant_id,full_name,sex,birth_date,portal_enabled,is_active")
        .eq("portal_token" as never, data.token)
        .limit(1)
        .maybeSingle();

      let student = byToken;
      if (!student) {
        const { data: bySlug } = await supabaseAdmin
          .from("students" as never)
          .select("id,tenant_id,full_name,sex,birth_date,portal_enabled,is_active")
          .eq("portal_slug" as never, data.token)
          .limit(1)
          .maybeSingle();
        student = bySlug;
      }

      if (student) {
        s = student as unknown as PortalStudentData;
        if (s.portal_enabled === false || s.is_active === false) {
          throw new Error("Portal indisponível");
        }

        // Verifica se já existe parecer salvo no banco para este aluno
        const { data: existingReport } = await supabaseAdmin
          .from("student_reports" as never)
          .select("full_report")
          .eq("student_id" as never, (student as { id: string }).id)
          .order("generated_at" as never, { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingReport && (existingReport as any).full_report?.parecer) {
          return (existingReport as any).full_report;
        }

        const { data: evList } = await supabaseAdmin
          .from("evaluations" as never)
          .select("id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications")
          .eq("student_id" as never, (student as { id: string }).id)
          .order("evaluated_at" as never, { ascending: true });
        evals = (evList ?? []) as unknown as PortalEvalData[];
      }
    } catch (adminErr) {
      if (adminErr instanceof Error && adminErr.message === "Portal indisponível") throw adminErr;
      console.warn("[portal-ai-report] Busca via admin não concluída, tentando via RPC pública:", adminErr);
    }

    // 2) Se necessário, resolve via RPC público portal_get_data
    if (!s) {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: portalRes } = await supabase.rpc("portal_get_data" as never, { _token: data.token } as never);
      const p = portalRes as {
        student?: { id?: string; full_name: string; sex: string; birth_date: string; tenant_id?: string };
        evaluations?: unknown[];
        saved_report?: { full_report?: unknown };
      } | null;

      if (p?.saved_report?.full_report && (p.saved_report.full_report as any).parecer) {
        return (p.saved_report.full_report as any);
      }

      if (p?.student) {
        s = {
          full_name: p.student.full_name,
          sex: p.student.sex,
          birth_date: p.student.birth_date,
          tenant_id: p.student.tenant_id ?? "",
        };
        evals = (p.evaluations ?? []) as unknown as PortalEvalData[];
      }
    }

    if (!s) throw new Error("Portal não encontrado");
    if (!evals || evals.length === 0) throw new Error("Nenhuma avaliação disponível para este aluno");

    // 3) Geração determinística sem dependência de APIs externas
    const report = buildDeterministicPortalReport(s, evals);

    // 4) Persistência automática do parecer gerado na tabela student_reports
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const studentId = (s as any).id;
      const tenantId = s.tenant_id;
      if (studentId && tenantId) {
        const latestEval = evals[evals.length - 1];
        await supabaseAdmin.from("student_reports" as never).insert({
          tenant_id: tenantId,
          student_id: studentId,
          evaluation_id: latestEval?.id ?? null,
          engine_version: "v1.0.0",
          generated_at: report.generatedAt || new Date().toISOString(),
          diagnosis: report.parecer,
          technical: report.parecer,
          family: report.evolucao,
          goals: {
            "30_days": report.plano_evolucao,
            "60_days": report.atividades_sugeridas,
            "90_days": report.recomendacoes_familia,
          },
          full_report: report,
        } as never);
      }
    } catch (saveErr) {
      console.warn("[portal-ai-report] Erro ao persistir parecer gerado:", saveErr);
    }

    return report;
  });
