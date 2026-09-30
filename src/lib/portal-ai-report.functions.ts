// Portal público — gera relatório interpretativo a partir do token do aluno.
// Utiliza motor determinístico especialista baseado no Método ProMetric®,
// sem depender de chaves de API externas ou cotas de terceiros.

import { createServerFn } from "@tanstack/react-start";
import {
  buildDeterministicPortalReport,
  type PortalStudentData,
  type PortalEvalData,
} from "./deterministic-portal-report";

type Input = { token: string };

export const generatePortalReport = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d?.token || d.token.length < 4) throw new Error("Token inválido");
    return d;
  })
  .handler(async ({ data }) => {
    let s: PortalStudentData | null = null;
    let evals: PortalEvalData[] = [];

    // 1) Tenta resolver aluno via supabaseAdmin
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: student } = await supabaseAdmin
        .from("students" as never)
        .select("id,tenant_id,full_name,sex,birth_date,portal_enabled,is_active")
        .or(`portal_token.eq.${data.token},portal_slug.eq.${data.token}`)
        .limit(1)
        .maybeSingle();

      if (student) {
        s = student as unknown as PortalStudentData;
        if (s.portal_enabled === false || s.is_active === false) {
          throw new Error("Portal indisponível");
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
      const p = portalRes as { student?: { full_name: string; sex: string; birth_date: string; tenant_id?: string }; evaluations?: unknown[] } | null;
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
    return buildDeterministicPortalReport(s, evals);
  });
