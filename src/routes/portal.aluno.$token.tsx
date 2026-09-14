import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  RadarChart, Radar, PolarAngleAxis, PolarGrid, Legend, PolarRadiusAxis,
  ReferenceArea,
} from "recharts";
import {
  Copy, Download, Mail, MessageCircle, QrCode, Share2, TrendingUp,
  User, Sparkles, Calendar, Award, AlertCircle, Target, Activity, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  ageFromBirth, overallScore, zoneScore, ZONES, TEST_META,
  type Classifications, type Zone, type ClassificationKey,
} from "@/lib/proesp";
import { prometricIndex, categoryColor, type PMDimension } from "@/lib/prometric-method";
import {
  consolidatedClassifications,
  currentEvaluation,
  withConsolidatedView,
} from "@/lib/student-metrics";
import {
  DevelopmentSummary, ReferenceBar, SituationBadge,
} from "@/components/prometric-reference";
import {
  REFERENCE_LABEL, scoreToSituation, situationSentence, situationStyle,
  EXPECTED_INDEX_RANGE, type PRSituation,
} from "@/lib/prometric-reference";
import { resolveBrandingChain, resolveLogoUrl } from "@/lib/branding";
import { generateEvaluationPDF, type ReportEval } from "@/lib/pdf-report";
import { generatePortalReport } from "@/lib/portal-ai-report.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/aluno/$token")({
  head: () => ({ meta: [{ title: "Portal do Aluno — ProMetric" }] }),
  component: PortalAlunoRoute,
});

function PortalAlunoRoute() {
  const { token } = Route.useParams();
  return <PortalAluno lookupKey={token} />;
}

type EvalRow = {
  id: string; evaluated_at: string; age_years: number | null;
  weight_kg: number | null; height_cm: number | null; imc: number | null; rce: number | null;
  sit_and_reach_cm: number | null; abdominal_reps: number | null; horizontal_jump_cm: number | null;
  medicine_ball_m: number | null; square_test_s: number | null; sprint_20m_s: number | null;
  run_6min_m: number | null; classifications: Classifications;
};

type BrandRow = {
  name?: string | null;
  display_name?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  description?: string | null;
  logo_url?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
} | null;

type PortalData = {
  student: {
    id: string; full_name: string; sex: "male" | "female"; birth_date: string;
    photo_url: string | null; class_name: string | null;
    school_name: string | null; school_logo: string | null;
    group_id: string | null;
  };
  evaluations: EvalRow[];
  class_latest: Classifications[];
  school_latest: Classifications[];
  branding?: { tenant: BrandRow; school: BrandRow; group: BrandRow };
};

const INDICATORS: { key: ClassificationKey; label: string; valueField: keyof EvalRow }[] = [
  { key: "imc", label: "IMC", valueField: "imc" },
  { key: "rce", label: "RCE", valueField: "rce" },
  { key: "flex", label: "Flexibilidade", valueField: "sit_and_reach_cm" },
  { key: "abdo", label: "Resistência abdominal", valueField: "abdominal_reps" },
  { key: "run6", label: "Corrida 6min", valueField: "run_6min_m" },
  { key: "jump", label: "Salto horizontal", valueField: "horizontal_jump_cm" },
  { key: "mball", label: "Potência (medicine ball)", valueField: "medicine_ball_m" },
  { key: "square", label: "Agilidade", valueField: "square_test_s" },
  { key: "sprint", label: "Velocidade 20m", valueField: "sprint_20m_s" },
];

function avgScore(rows: Classifications[], key: ClassificationKey): number {
  const xs = rows.map((c) => c?.[key]).filter(Boolean) as Zone[];
  if (!xs.length) return 0;
  return xs.reduce((a, z) => a + zoneScore(z), 0) / xs.length;
}

function familyRecommendations(situation: PRSituation | null, weak: string[]): string[] {
  const base: string[] = [];
  if (situation === "Muito abaixo" || situation === "Abaixo") {
    base.push("Estabeleça uma rotina diária de 30–60 min de movimento ativo (caminhar, correr, brincar).");
    base.push("Reduza o tempo sentado e em telas; faça pausas ativas a cada 1 hora.");
    base.push("Procure atividades em grupo ou esportivas que o aluno goste — prazer é o motor da constância.");
  } else if (situation === "Dentro do esperado") {
    base.push("Mantenha a frequência atual de atividade física e estimule novas modalidades.");
    base.push("Inclua alongamentos diários para preservar a flexibilidade.");
    base.push("Valorize cada pequeno progresso — reconhecimento sustenta motivação.");
  } else {
    base.push("Continue incentivando a prática esportiva — o aluno está em ótimo nível.");
    base.push("Estimule desafios novos e variados para evolução contínua.");
    base.push("Atenção ao descanso e à hidratação para sustentar o desempenho.");
  }
  if (weak.includes("Flexibilidade")) base.push("Inclua 10 min de alongamento diário (após acordar ou antes de dormir).");
  if (weak.includes("Corrida 6min")) base.push("Caminhadas e corridas leves 3×/semana melhoram a resistência cardiorrespiratória.");
  if (weak.includes("IMC")) base.push("Reforce hábitos alimentares equilibrados — frutas, legumes e refeições caseiras.");
  return base.slice(0, 6);
}

export function PortalAluno({ lookupKey }: { lookupKey: string }) {
  const token = lookupKey;
  const [showQR, setShowQR] = useState(false);

  const q = useQuery({
    queryKey: ["portal", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_get_data", { _token: token });
      if (error) throw error;
      return data as PortalData | null;
    },
  });

  const [resolvedLogo, setResolvedLogo] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("portal_log_access", { _token: token, _ua: navigator.userAgent }).then(() => {});
  }, [token]);

  const brandSources = q.data?.branding;
  const brand = useMemo(
    () => resolveBrandingChain(brandSources?.group, brandSources?.school, brandSources?.tenant),
    [brandSources],
  );
  useEffect(() => {
    let alive = true;
    resolveLogoUrl(brand.logoUrl).then((u) => { if (alive) setResolvedLogo(u); });
    return () => { alive = false; };
  }, [brand.logoUrl]);

  const portalReportFn = useServerFn(generatePortalReport);
  const aiReport = useMutation({
    mutationFn: () => portalReportFn({ data: { token } }),
    onError: (e: Error) => toast.error(e.message || "Não foi possível gerar o relatório."),
  });

  if (q.isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando portal…</div>;
  }
  if (!q.data) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-display font-bold">Link inválido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este portal não está disponível. Solicite ao professor um novo link.
          </p>
        </div>
      </div>
    );
  }

  const { student, evaluations: rawEvaluations, class_latest, school_latest } = q.data;
  const evaluations = withConsolidatedView(rawEvaluations) as EvalRow[];
  const clinicalEvaluations = evaluations.filter((e) => Object.values(e.classifications ?? {}).some(Boolean));
  const first = clinicalEvaluations[0] ?? null;
  const last = currentEvaluation(clinicalEvaluations) as EvalRow | null;
  const currentClassifications = consolidatedClassifications(rawEvaluations);
  const overall = last ? overallScore(currentClassifications) : null;
  const pm = last ? prometricIndex(currentClassifications) : null;
  const pmFirst = first ? prometricIndex(first.classifications ?? {}) : null;
  const age = ageFromBirth(student.birth_date);
  const portalUrl = typeof window !== "undefined" ? window.location.href : "";
  const firstName = student.full_name.split(" ")[0];
  const situation = pm ? scoreToSituation(pm.score, pm.partial) : null;
  const headerGradient = `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})`;

  // Evolução
  const evolution = clinicalEvaluations.map((e) => ({
    date: new Date(e.evaluated_at).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    score: prometricIndex(e.classifications ?? {}).score,
  }));
  const diff = pm && pmFirst ? pm.score - pmFirst.score : 0;

  // Insights
  const insights = (() => {
    if (!last) return { strong: [] as string[], weak: [] as string[] };
    const strong: string[] = []; const weak: string[] = [];
    for (const i of INDICATORS) {
      const z = last.classifications?.[i.key] as Zone | undefined;
      if (!z) continue;
      if (z === "Excelente" || z === "Muito Bom") strong.push(i.label);
      if (z === "Fraco" || z === "Muito Fraco") weak.push(i.label);
    }
    return { strong, weak };
  })();

  // Destaques (dimensões)
  const highlight = (() => {
    if (!pm) return null;
    const dims = pm.dimensions.filter((d) => d.category !== null);
    if (dims.length === 0) return null;
    const firstDims = pmFirst?.dimensions ?? [];
    const evoluiu = dims
      .map((d, i) => ({ d, delta: d.score - (firstDims[i]?.score ?? d.score) }))
      .sort((a, b) => b.delta - a.delta)[0];
    const potencial = [...dims].sort((a, b) => b.score - a.score)[0];
    const atencao = [...dims].sort((a, b) => a.score - b.score)[0];
    return {
      evoluiu, potencial, atencao,
      perfil: pm.category,
    };
  })();

  // Radar comparativo (Ref / Aluno / Turma / Escola)
  const radarData = INDICATORS.map((i) => ({
    metric: i.label.split(" ")[0],
    Referência: 4, // zoneScore "Bom" como referência mínima esperada
    Aluno: last ? zoneScore(last.classifications?.[i.key] as Zone) : 0,
    Turma: avgScore(class_latest ?? [], i.key),
    Escola: avgScore(school_latest ?? [], i.key),
  }));

  const share = (kind: "copy" | "whatsapp" | "email") => {
    const msg = `Acompanhe a evolução de ${student.full_name} no ProMetric: ${portalUrl}`;
    if (kind === "copy") { navigator.clipboard.writeText(portalUrl); toast.success("Link copiado"); }
    else if (kind === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    else window.open(`mailto:?subject=${encodeURIComponent("Evolução " + student.full_name)}&body=${encodeURIComponent(msg)}`);
  };

  const recomendacoes = familyRecommendations(situation, insights.weak);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <header className="text-primary-foreground" style={{ background: headerGradient }}>
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="flex items-center gap-3">
            {resolvedLogo && (
              <img src={resolvedLogo} alt={brand.displayName} className="h-9 w-9 rounded-lg bg-white/10 object-contain p-1" />
            )}
            <div className="text-xs opacity-90">{brand.displayName}</div>
          </div>

          <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/15 sm:h-20 sm:w-20">
              {student.photo_url
                ? <img src={student.photo_url} alt="" className="h-full w-full object-cover" />
                : <User className="h-9 w-9" />}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-black sm:text-2xl">{student.full_name}</h1>
              <p className="mt-0.5 text-xs opacity-90">
                {age} anos • {student.sex === "male" ? "Masculino" : "Feminino"}
                {student.school_name && ` • ${student.school_name}`}
                {student.class_name && ` • ${student.class_name}`}
              </p>
              {last && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] opacity-80">
                  <Calendar className="h-3 w-3" />
                  Última avaliação: {new Date(last.evaluated_at).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>

          {/* Destaque principal: Índice + situação */}
          {pm && (
            <div className="mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">Índice ProMetric®</div>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-black sm:text-5xl">{pm.partial ? "—" : pm.score}</span>
                    {!pm.partial && <span className="text-sm opacity-80">/100</span>}
                  </div>
                </div>
                <SituationBadge situation={situation} size="md" className="bg-white/95 !text-foreground" />
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                {situationSentence(situation, `O desenvolvimento físico de ${firstName}`)}
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 pt-5">
        {!last ? (
          <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhuma avaliação registrada ainda.
          </div>
        ) : (
          <>
            {/* ─── 2. DESENVOLVIMENTO GERAL ──────────────────────── */}
            <DevelopmentSummary
              classifications={currentClassifications}
              studentFirstName={firstName}
            />
            <LegendBar />

            {/* ─── 3. EVOLUÇÃO ───────────────────────────────────── */}
            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold">
                <TrendingUp className="h-5 w-5 text-primary" /> Evolução
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Como o Índice ProMetric® de {firstName} se transformou ao longo do tempo.
              </p>

              {evolution.length < 2 ? (
                <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                  A evolução será apresentada automaticamente após a próxima avaliação.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <StatBox label="Primeira" value={pmFirst?.score ?? 0} suffix="/100"
                      hint={new Date(first!.evaluated_at).toLocaleDateString("pt-BR")} />
                    <StatBox label="Atual" value={pm?.score ?? 0} suffix="/100"
                      hint={new Date(last.evaluated_at).toLocaleDateString("pt-BR")} />
                    <StatBox
                      label="Diferença"
                      value={`${diff > 0 ? "+" : ""}${diff}`}
                      suffix="pts"
                      tone={diff > 0 ? "success" : diff < 0 ? "destructive" : "default"}
                      hint={diff > 0 ? "Evolução consistente" : diff < 0 ? "Atenção" : "Estável"}
                    />
                  </div>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolution} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                        <YAxis domain={[0, 100]} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                        <ReferenceArea y1={EXPECTED_INDEX_RANGE.min} y2={EXPECTED_INDEX_RANGE.max} fill="#22c55e" fillOpacity={0.08} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                        <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3}
                          dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6 }} connectNulls isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </section>

            {/* ─── 4. PERFIL POR DIMENSÃO ────────────────────────── */}
            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <h2 className="mb-1 font-display text-lg font-bold">Perfil por dimensão</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Como {firstName} está em cada uma das 5 grandes dimensões do método ProMetric®.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {pm?.dimensions.map((d) => (
                  <div key={d.dimension} className="rounded-xl border bg-card/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{d.dimension}</div>
                        <div className="text-[11px] text-muted-foreground">Faixa esperada: {EXPECTED_INDEX_RANGE.min}–{EXPECTED_INDEX_RANGE.max}/100</div>
                      </div>
                      {d.category && (
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", categoryColor(d.category))}>
                          {d.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-gradient-brand" style={{ width: `${d.score}%` }} />
                      </div>
                      <span className="font-display text-sm font-bold tabular-nums">{d.score}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testes individuais com barras de referência */}
              <div className="mt-5 space-y-4">
                <h3 className="text-sm font-semibold">Capacidades individuais</h3>
                {INDICATORS.map((i) => {
                  const z = last.classifications?.[i.key] as Zone | undefined;
                  if (!z) return null;
                   const raw = last[i.valueField];
                  return (
                    <div key={i.key}>
                      <div className="mb-1 text-xs font-medium">{i.label}</div>
                      <ReferenceBar zone={z} value={raw as number | null} unit={TEST_META[i.key].unit} />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ─── 5+6. RADAR + COMPARATIVOS ─────────────────────── */}
            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <h2 className="mb-1 font-display text-lg font-bold">Comparativo</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                {firstName} comparado à {REFERENCE_LABEL} (referência principal), à turma e à escola.
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" fontSize={10} />
                    <PolarRadiusAxis domain={[0, 6]} tick={false} axisLine={false} />
                    <Radar name={REFERENCE_LABEL} dataKey="Referência" stroke="#22c55e" strokeDasharray="4 4" fill="#22c55e" fillOpacity={0.12} />
                    <Radar name="Aluno" dataKey="Aluno" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.45} />
                    <Radar name="Turma" dataKey="Turma" stroke="#a855f7" fill="#a855f7" fillOpacity={0.12} />
                    <Radar name="Escola" dataKey="Escola" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.08} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Comparação anônima — colegas não são identificados.
              </p>
            </section>

            {/* ─── 7. DESTAQUES ──────────────────────────────────── */}
            {highlight && (
              <section className="rounded-2xl border bg-gradient-card p-5 shadow-soft">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <Award className="h-5 w-5 text-primary" /> Destaques
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <HighlightCard icon={<TrendingUp className="h-4 w-4" />} title="Maior evolução"
                    value={highlight.evoluiu.d.dimension}
                    detail={`${highlight.evoluiu.delta > 0 ? "+" : ""}${highlight.evoluiu.delta} pts`} tone="success" />
                  <HighlightCard icon={<Target className="h-4 w-4" />} title="Maior potencial"
                    value={highlight.potencial.dimension}
                    detail={`${highlight.potencial.score}/100`} tone="primary" />
                  <HighlightCard icon={<AlertCircle className="h-4 w-4" />} title="Principal atenção"
                    value={highlight.atencao.dimension}
                    detail={`${highlight.atencao.score}/100`} tone="warning" />
                  <HighlightCard icon={<Activity className="h-4 w-4" />} title="Perfil predominante"
                    value={highlight.perfil ?? "—"} detail="categoria geral" tone="default" />
                </div>
              </section>
            )}

            {/* ─── 8. RECOMENDAÇÕES ──────────────────────────────── */}
            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <h2 className="mb-1 font-display text-lg font-bold">Recomendações para a família</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Sugestões baseadas na situação atual de {firstName}.
              </p>
              <ul className="space-y-2 text-sm">
                {recomendacoes.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-success">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              {/* IA opcional */}
              <div className="mt-6 rounded-xl border bg-gradient-card p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <h3 className="font-semibold">Parecer personalizado com IA</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Análise completa com plano de evolução e atividades sugeridas, gerada pela IA configurada pela sua escola.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => aiReport.mutate()}
                  disabled={aiReport.isPending}
                  className="mt-3 bg-gradient-brand text-primary-foreground hover:opacity-90"
                  size="sm"
                >
                  {aiReport.isPending
                    ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Gerando…</>
                    : <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> {aiReport.data ? "Atualizar parecer" : "Gerar parecer com IA"}</>}
                </Button>

                {aiReport.data && (
                  <div className="mt-4 space-y-4 rounded-xl border bg-background/60 p-4 text-sm">
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parecer</h4>
                      <p className="whitespace-pre-line leading-relaxed">{aiReport.data.parecer}</p>
                    </div>
                    {aiReport.data.evolucao && (
                      <div>
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evolução</h4>
                        <p className="whitespace-pre-line leading-relaxed">{aiReport.data.evolucao}</p>
                      </div>
                    )}
                    {aiReport.data.plano_evolucao?.length > 0 && (
                      <div>
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plano de evolução</h4>
                        <ol className="ml-4 list-decimal space-y-1">
                          {aiReport.data.plano_evolucao.map((p, i) => <li key={i}>{p}</li>)}
                        </ol>
                      </div>
                    )}
                    {aiReport.data.atividades_sugeridas?.length > 0 && (
                      <div>
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Atividades sugeridas</h4>
                        <ul className="ml-4 list-disc space-y-1">
                          {aiReport.data.atividades_sugeridas.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    )}
                    {aiReport.data.recomendacoes_familia?.length > 0 && (
                      <div>
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recomendações personalizadas</h4>
                        <ul className="ml-4 list-disc space-y-1">
                          {aiReport.data.recomendacoes_familia.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Gerado em {new Date(aiReport.data.generatedAt).toLocaleString("pt-BR")} • IA: {aiReport.data.provider}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ─── 9. HISTÓRICO ──────────────────────────────────── */}
            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <h2 className="mb-1 font-display text-lg font-bold">Histórico de avaliações</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Linha do tempo com todas as avaliações realizadas.
              </p>
              <ol className="relative ml-3 space-y-4 border-l border-border pl-5">
                 {[...clinicalEvaluations].reverse().map((e) => {
                  const epm = prometricIndex(e.classifications ?? {});
                  const esit = scoreToSituation(epm.score, epm.partial);
                  const eo = overallScore(e.classifications ?? {});
                  return (
                    <li key={e.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">
                            {new Date(e.evaluated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono font-semibold tabular-nums text-foreground">{epm.score}/100</span>
                            <SituationBadge situation={esit} />
                            {eo.label && <span className="text-[10px]">{eo.label}</span>}
                          </div>
                        </div>
                        <Button
                          size="sm" variant="outline"
                          onClick={() => generateEvaluationPDF(brand.displayName, {
                            ...e,
                            waist_cm: null, hip_cm: null, wingspan_cm: null,
                            ai_diagnosis: null, notes: null,
                            student: { full_name: student.full_name, sex: student.sex, birth_date: student.birth_date },
                          } as ReportEval)}
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Ver
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </>
        )}

        {/* Compartilhar */}
        <section className="rounded-2xl border bg-card p-4 shadow-soft">
          <h2 className="mb-3 flex items-center gap-2 font-display font-semibold">
            <Share2 className="h-4 w-4" /> Compartilhar este portal
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => share("copy")}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar</Button>
            <Button size="sm" variant="outline" onClick={() => share("whatsapp")}><MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp</Button>
            <Button size="sm" variant="outline" onClick={() => share("email")}><Mail className="mr-1.5 h-3.5 w-3.5" /> E-mail</Button>
            <Button size="sm" variant="outline" onClick={() => setShowQR((v) => !v)}><QrCode className="mr-1.5 h-3.5 w-3.5" /> QR Code</Button>
          </div>
          {showQR && (
            <div className="mt-4 grid place-items-center rounded-xl bg-white p-4">
              <QRCodeCanvas value={portalUrl} size={180} />
            </div>
          )}
        </section>

        {/* ─── 10. FOOTER ───────────────────────────────────────── */}
        <footer className="pt-4 text-center text-[11px] text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <span>{evaluations.length} avaliação{evaluations.length === 1 ? "" : "ões"}</span>
            {last && <><span>•</span><span>Atualizado em {new Date(last.evaluated_at).toLocaleDateString("pt-BR")}</span></>}
          </div>
          <div className="mt-2 font-display font-semibold">ProMetric®</div>
          <div className="mt-0.5">Acompanhamento contínuo da evolução física</div>
        </footer>
      </main>
    </div>
  );
}

function StatBox({ label, value, suffix, hint, tone = "default" }: {
  label: string; value: string | number; suffix?: string; hint?: string;
  tone?: "default" | "success" | "destructive";
}) {
  const toneCls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-xl border bg-card/60 p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-display text-xl font-bold tabular-nums", toneCls)}>
        {value}{suffix && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function HighlightCard({ icon, title, value, detail, tone }: {
  icon: React.ReactNode; title: string; value: string; detail: string;
  tone: "success" | "primary" | "warning" | "default";
}) {
  const tones = {
    success: "border-success/30 bg-success/5",
    primary: "border-primary/30 bg-primary/5",
    warning: "border-warning/30 bg-warning/5",
    default: "border-border bg-card/60",
  };
  return (
    <div className={cn("rounded-xl border p-3", tones[tone])}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}{title}
      </div>
      <div className="mt-1 font-display text-base font-bold leading-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground">{detail}</div>
    </div>
  );
}

function LegendBar() {
  const items: { label: string; color: string }[] = [
    { label: "Muito abaixo", color: "#dc2626" },
    { label: "Abaixo", color: "#f97316" },
    { label: "Dentro do esperado", color: "#22c55e" },
    { label: "Acima", color: "#3b82f6" },
    { label: "Muito acima", color: "#7c3aed" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border bg-card/60 px-3 py-2 text-[10px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: i.color, opacity: 0.7 }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
