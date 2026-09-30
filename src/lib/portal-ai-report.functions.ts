// Portal público — gera relatório interpretativo a partir do token do aluno.
// Utiliza motor determinístico especialista baseado no Método ProMetric®,
// sem depender de chaves de API externas ou cotas de terceiros.

import { createServerFn } from "@tanstack/react-start";
import { PROMETRIC_PROMPT_VERSION } from "@/lib/ai/prometric-system-prompt";
import {
  consolidatedClassifications,
  currentIndex,
  chronological,
  type EvalLike,
} from "@/lib/student-metrics";
import {
  zoneToCategory,
  type PMCategory,
} from "@/lib/prometric-method";
import { type ClassificationKey, type Zone } from "@/lib/proesp";

type Input = { token: string };

type StudentData = {
  id?: string;
  tenant_id: string;
  full_name: string;
  sex?: string;
  birth_date?: string;
  portal_enabled?: boolean;
  is_active?: boolean;
};

type EvalData = EvalLike & {
  id: string;
  evaluated_at: string;
  age_years: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  imc: number | null;
  rce: number | null;
  sit_and_reach_cm: number | null;
  abdominal_reps: number | null;
  horizontal_jump_cm: number | null;
  medicine_ball_m: number | null;
  square_test_s: number | null;
  sprint_20m_s: number | null;
  run_6min_m: number | null;
  classifications: Record<string, Zone> | null;
};

function buildDeterministicPortalReport(student: StudentData, rawEvals: EvalData[]) {
  const ordered = chronological(rawEvals) as EvalData[];
  const firstEval = ordered[0];
  const lastEval = ordered[ordered.length - 1];

  const firstName = student.full_name.trim().split(/\s+/)[0] ?? "Aluno(a)";
  const isFem = student.sex === "female";
  const art = isFem ? "A" : "O";
  const artLow = isFem ? "a" : "o";
  const pron = isFem ? "ela" : "ele";

  const totalEvals = ordered.length;
  const firstDate = new Date(firstEval.evaluated_at).toLocaleDateString("pt-BR");
  const lastDate = new Date(lastEval.evaluated_at).toLocaleDateString("pt-BR");

  // Classificações consolidadas e Índice ProMetric atual
  const consolidated = consolidatedClassifications(ordered);
  const index = currentIndex(ordered);
  const overallCategory = index.category ?? "Em Desenvolvimento";

  // Dimensões do ProMetric
  const dims = index.dimensions;
  const strongDims = dims.filter((d) => d.category === "Excelente" || d.category === "Bom");
  const attentionDims = dims.filter(
    (d) => d.category === "Prioritário" || d.category === "Atenção" || d.category === "Em Desenvolvimento"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // 1. PARECER (Linguagem acolhedora e acessível à família)
  // ───────────────────────────────────────────────────────────────────────────
  const parecerParts: string[] = [
    `Olá, família! É uma satisfação compartilhar o acompanhamento físico de ${firstName}. No Método ProMetric®, nosso foco é orientar a saúde, o bem-estar e o desenvolvimento motor de forma motivadora e acolhedora.`,
    `Atualmente, ${firstName} conta com ${totalEvals} avaliação(ões) registrada(s) na escola. Seu Índice ProMetric® consolidado é de ${index.score}/100 pontos, situando seu perfil geral na categoria '${overallCategory}'.`,
  ];

  if (strongDims.length > 0) {
    parecerParts.push(
      `${art} ${firstName} destaca-se especialmente em ${strongDims.map((d) => d.dimension.toLowerCase()).join(" e ")}, demonstrando excelente engajamento nessas capacidades corporais.`
    );
  }

  if (attentionDims.length > 0) {
    parecerParts.push(
      `Identificamos também ótimas oportunidades para estimular ${attentionDims.map((d) => d.dimension.toLowerCase()).join(" e ")}, que podem ser desenvolvidas de forma divertida através de brincadeiras ativas e jogos em família.`
    );
  } else {
    parecerParts.push(
      `Seu desenvolvimento motor encontra-se em ótimo equilíbrio em todas as dimensões avaliadas, refletindo um estilo de vida ativo e saudável.`
    );
  }

  parecerParts.push(
    `Lembramos que cada jovem possui seu próprio ritmo biológico de maturação e que a participação regular nas aulas de Educação Física e o incentivo familiar são os pilares essenciais para o seu crescimento saudável.`
  );

  const parecer = parecerParts.join(" ");

  // ───────────────────────────────────────────────────────────────────────────
  // 2. EVOLUÇÃO CRONOLÓGICA
  // ───────────────────────────────────────────────────────────────────────────
  let evolucao = "";
  if (totalEvals === 1) {
    evolucao = `Esta é a avaliação diagnóstica inicial de ${firstName}, registrada em ${lastDate}. Ela estabelece a linha de base oficial para acompanharmos o progresso futuro. As próximas avaliações escolares permitirão verificar a evolução temporal de cada capacidade física com clareza e precisão.`;
  } else {
    const firstIndex = currentIndex([firstEval]);
    const deltaIndex = index.score - firstIndex.score;
    const indexDirection =
      deltaIndex > 0
        ? `um ganho acumulado de +${deltaIndex} pontos no Índice ProMetric® (de ${firstIndex.score} para ${index.score} pontos)`
        : deltaIndex < 0
        ? `uma variação de ${deltaIndex} pontos no Índice ProMetric® (de ${firstIndex.score} para ${index.score} pontos)`
        : `a manutenção consistente do Índice ProMetric® em ${index.score} pontos`;

    const highlights: string[] = [];

    // Verificações de ganho nos testes
    if (firstEval.horizontal_jump_cm != null && lastEval.horizontal_jump_cm != null) {
      const diff = +(lastEval.horizontal_jump_cm - firstEval.horizontal_jump_cm).toFixed(1);
      if (diff > 0) highlights.push(`impulsão nos saltos (+${diff} cm)`);
    }
    if (firstEval.medicine_ball_m != null && lastEval.medicine_ball_m != null) {
      const diff = +(lastEval.medicine_ball_m - firstEval.medicine_ball_m).toFixed(2);
      if (diff > 0) highlights.push(`força de arremesso (+${diff} m)`);
    }
    if (firstEval.sit_and_reach_cm != null && lastEval.sit_and_reach_cm != null) {
      const diff = +(lastEval.sit_and_reach_cm - firstEval.sit_and_reach_cm).toFixed(1);
      if (diff > 0) highlights.push(`flexibilidade (+${diff} cm)`);
    }
    if (firstEval.abdominal_reps != null && lastEval.abdominal_reps != null) {
      const diff = lastEval.abdominal_reps - firstEval.abdominal_reps;
      if (diff > 0) highlights.push(`resistência abdominal (+${diff} repetições)`);
    }
    if (firstEval.sprint_20m_s != null && lastEval.sprint_20m_s != null) {
      const diff = +(firstEval.sprint_20m_s - lastEval.sprint_20m_s).toFixed(2);
      if (diff > 0) highlights.push(`velocidade de corrida (${diff}s mais veloz)`);
    }
    if (firstEval.square_test_s != null && lastEval.square_test_s != null) {
      const diff = +(firstEval.square_test_s - lastEval.square_test_s).toFixed(2);
      if (diff > 0) highlights.push(`agilidade nas trocas de direção (${diff}s mais ágil)`);
    }
    if (firstEval.run_6min_m != null && lastEval.run_6min_m != null) {
      const diff = +(lastEval.run_6min_m - firstEval.run_6min_m).toFixed(0);
      if (diff > 0) highlights.push(`resistência cardiorrespiratória (+${diff} m percorridos)`);
    }
    if (firstEval.height_cm != null && lastEval.height_cm != null && lastEval.height_cm > firstEval.height_cm) {
      const hDiff = +(lastEval.height_cm - firstEval.height_cm).toFixed(1);
      highlights.unshift(`crescimento estatural de +${hDiff} cm`);
    }

    evolucao = [
      `Entre a primeira avaliação (${firstDate}) e a mais recente (${lastDate}), ${artLow} ${firstName} apresentou ${indexDirection}.`,
      highlights.length > 0
        ? `Nesse intervalo, destacam-se avanços reais em: ${highlights.join(", ")}.`
        : `Os parâmetros motores mantiveram consistência e regularidade em todas as baterias realizadas.`,
      `Essa evolução confirma adaptações biológicas positivas e a importância da constância nas atividades corporais.`,
    ].join(" ");
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. RECOMENDAÇÕES PARA A FAMÍLIA (Práticas e construtivas)
  // ───────────────────────────────────────────────────────────────────────────
  const recomendacoes_familia: string[] = [
    `Incentive ao menos 60 minutos diários de movimento prazeroso (brincadeiras no quintal, passeios no parque, bicicleta ou esportes).`,
    `Priorize noites regulares de sono reparador (de 8 a 10 horas) e garanta hidratação frequente com água ao longo do dia.`,
    `Reduza o tempo sedentário diante de telas (celular, videogame e televisão), propondo momentos ativos em família nos fins de semana.`,
    `Valorize o esforço, a participação e a alegria de se movimentar, construindo uma autoestima corporal positiva para toda a vida.`,
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // 4. PLANO DE EVOLUÇÃO (4 passos progressivos)
  // ───────────────────────────────────────────────────────────────────────────
  const plano_evolucao: string[] = [
    "Passo 1 (Dias 1 a 30): Criar o hábito ativo — Estabelecer momentos diários sem telas dedicados a brincadeiras corporais e vivências motoras livres.",
    "Passo 2 (Dias 31 a 60): Estímulo às valências em desenvolvimento — Incorporar jogos de saltos, corridas curtas e alongamentos lúdicos na rotina familiar.",
    "Passo 3 (Dias 61 a 90): Desafios e cooperação — Participar de atividades esportivas coletivas ou passeios mais longos aos finais de semana para reforçar o fôlego e a coordenação.",
    "Passo 4 (Dias 91 a 120): Reavaliação escolar — Acompanhar a próxima bateria de testes do ProMetric® na escola para celebrar as conquistas e ajustar novas metas.",
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // 5. ATIVIDADES SUGERIDAS (5 sugestões lúdicas e divertidas)
  // ───────────────────────────────────────────────────────────────────────────
  const atividades_sugeridas: string[] = [
    "Circuitos motores em casa ou praça: Espalhar pequenos obstáculos no chão (almofadas, cones ou giz) para saltar, desviar em zigue-zague e agachar.",
    "Passeios ativos ao ar livre: Caminhadas, passeios de bicicleta, patins ou patinete em parques e ciclofaixas nos fins de semana.",
    "Jogos tradicionais de perseguição: Brincadeiras clássicas como pega-pega, esconde-esconde e mãe da rua, excelentes para velocidade e agilidade.",
    "Alongamento lúdico em família: Sessão de 5 a 10 minutos imitando posturas de animais (gato, sapo, cobra) para flexibilidade e relaxamento antes de dormir.",
    "Brincadeiras cooperativas com bola: Chutes a gol, arremessos ao cesto ou passar a bola sem deixar cair para desenvolver coordenação motora e precisão.",
  ];

  return {
    parecer,
    evolucao,
    recomendacoes_familia,
    plano_evolucao,
    atividades_sugeridas,
    provider: "ProMetric® Engine (Sistema Especialista)",
    source: "algoritmo determinístico",
    promptVersion: PROMETRIC_PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
  };
}

export const generatePortalReport = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d?.token || d.token.length < 4) throw new Error("Token inválido");
    return d;
  })
  .handler(async ({ data }) => {
    let s: StudentData | null = null;
    let evals: EvalData[] = [];

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
        s = student as unknown as StudentData;
        if (s.portal_enabled === false || s.is_active === false) {
          throw new Error("Portal indisponível");
        }
        const { data: evList } = await supabaseAdmin
          .from("evaluations" as never)
          .select("id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications")
          .eq("student_id" as never, (student as { id: string }).id)
          .order("evaluated_at" as never, { ascending: true });
        evals = (evList ?? []) as unknown as EvalData[];
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
        evals = (p.evaluations ?? []) as unknown as EvalData[];
      }
    }

    if (!s) throw new Error("Portal não encontrado");
    if (!evals || evals.length === 0) throw new Error("Nenhuma avaliação disponível para este aluno");

    // 3) Geração determinística sem dependência de APIs externas
    return buildDeterministicPortalReport(s, evals);
  });
