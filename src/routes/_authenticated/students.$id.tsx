import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Download, ExternalLink, Eye, FileDown, MessageSquarePlus, Pencil, Printer, Ruler, Save, Share2, Sparkles, Trash2, TrendingDown, TrendingUp, User, Zap } from "lucide-react";
import { issueSheetTokens } from "@/lib/sheet/sheet.functions";
import { generateSheetPDF } from "@/lib/sheet/sheet-pdf";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ActionBar, type ActionItem } from "@/components/layout/action-bar";
import { downloadStudentEvolutionPDF } from "@/lib/pdf-evolution-report";

import { useCurrentTenant } from "@/hooks/use-tenant";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis,
  RadarChart, Radar, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Legend,
} from "recharts";
import { DevelopmentSummary, ReferenceBar, ReferenceRadar } from "@/components/prometric-reference";
import { EXPECTED_INDEX_RANGE, REFERENCE_LABEL } from "@/lib/prometric-reference";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  TEST_META, ageFromBirth, expectedRangeFor, overallScore, zoneColor, zoneScore,
  type Classifications, type ClassificationKey, type Zone,
} from "@/lib/proesp";
import { prometricIndex, dimensionScores, categoryColor } from "@/lib/prometric-method";
import { consolidatedClassifications, currentEvaluation, withConsolidatedView } from "@/lib/student-metrics";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/students/$id")({
  head: () => ({ meta: [{ title: "Perfil do aluno — ProMetric" }] }),
  component: StudentDetail,
});

type EvalRow = {
  id: string; evaluated_at: string; student_id?: string; age_years: number | null;
  weight_kg: number | null; height_cm: number | null; imc: number | null; rce: number | null;
  sit_and_reach_cm: number | null; abdominal_reps: number | null; horizontal_jump_cm: number | null;
  medicine_ball_m: number | null; square_test_s: number | null; sprint_20m_s: number | null; run_6min_m: number | null;
  /** Estado consolidado até a data desta avaliação (fonte única de leitura). */
  classifications: Classifications;
  /** Zonas efetivamente registradas nesta avaliação (histórico/auditoria). */
  recorded_classifications?: Classifications;
  recorded_values?: Record<string, number | null>;
};

type Indicator = { key: ClassificationKey; field: keyof EvalRow; label: string; unit: string; higherBetter: boolean };

const INDICATORS: Indicator[] = [
  { key: "imc",    field: "imc",                label: "IMC",           unit: "kg/m²", higherBetter: false },
  { key: "rce",    field: "rce",                label: "RCE",           unit: "",      higherBetter: false },
  { key: "flex",   field: "sit_and_reach_cm",   label: "Flexibilidade", unit: "cm",    higherBetter: true  },
  { key: "abdo",   field: "abdominal_reps",     label: "Resistência",   unit: "reps",  higherBetter: true  },
  { key: "run6",   field: "run_6min_m",         label: "Corrida 6min",  unit: "m",     higherBetter: true  },
  { key: "jump",   field: "horizontal_jump_cm", label: "Salto",         unit: "cm",    higherBetter: true  },
  { key: "mball",  field: "medicine_ball_m",    label: "Potência",      unit: "m",     higherBetter: true  },
  { key: "square", field: "square_test_s",      label: "Agilidade",     unit: "s",     higherBetter: false },
  { key: "sprint", field: "sprint_20m_s",       label: "Velocidade",    unit: "s",     higherBetter: false },
];

function num(ev: EvalRow | null | undefined, f: keyof EvalRow): number | null {
  if (!ev) return null;
  const v = (ev as unknown as Record<string, unknown>)[f as string];
  return typeof v === "number" ? v : null;
}

// A leitura oficial dos resultados vive em `@/lib/student-metrics`
// (fonte única de verdade usada por todas as telas e relatórios).



function pct(curr: number | null, base: number | null, higherBetter: boolean) {
  if (curr == null || base == null || base === 0) return { diff: null as number | null, positive: null as boolean | null };
  const diff = ((curr - base) / Math.abs(base)) * 100;
  return { diff, positive: higherBetter ? diff >= 0 : diff <= 0 };
}

function trendIcon(diff: number | null, positive: boolean | null) {
  if (diff == null || positive == null) return "🟡";
  if (Math.abs(diff) < 2) return "🟡";
  return positive ? "🟢" : "🔴";
}

function StudentDetail() {
  const { id } = Route.useParams();

  const student = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,sex,birth_date,phone,email,class_id,class:classes(name,school_id,school:schools(name))")
        .eq("id", id).single();
      if (error) throw error;
      return data as unknown as {
        id: string; full_name: string; sex: "male" | "female"; birth_date: string;
        phone: string | null; email: string | null; class_id: string | null;
        class: { name: string; school_id: string | null; school: { name: string } | null } | null;
      };
    },
  });

  const evals = useQuery({
    queryKey: ["student-evals", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications")
        .eq("student_id", id)
        .order("evaluated_at", { ascending: true });
      if (error) throw error;
      return data as unknown as EvalRow[];
    },
  });

  const classId = student.data?.class_id ?? null;
  const schoolId = student.data?.class?.school_id ?? null;

  // Última avaliação por aluno da turma + escola
  const classmates = useQuery({
    queryKey: ["class-evals", classId], enabled: !!classId,
    queryFn: async () => fetchLatestEvalsByClass(classId!),
  });
  const schoolmates = useQuery({
    queryKey: ["school-evals", schoolId], enabled: !!schoolId,
    queryFn: async () => fetchLatestEvalsBySchool(schoolId!),
  });

  // FONTE ÚNICA: cada ponto histórico conserva `evaluations.classifications`.
  // O painel atual usa a avaliação mais recente com classificações, ignorando
  // apenas registros de atualização de medidas que não possuem resultado.
  const raw = evals.data ?? [];
  const data = useMemo(() => withConsolidatedView(raw) as EvalRow[], [raw]);
  const first = data.find((e) => Object.values(e.classifications ?? {}).some(Boolean)) ?? null;
  const last = data[data.length - 1] ?? null;
  const current = currentEvaluation(data) as EvalRow | null;
  const clinicalEvals = data.filter((e) => Object.values(e.classifications ?? {}).some(Boolean));
  const prev = clinicalEvals.length >= 2 ? clinicalEvals[clinicalEvals.length - 2] : null;
  const effective = consolidatedClassifications(raw);
  const overall = current ? overallScore(effective) : null;
  const pmIndex = current ? prometricIndex(effective) : null;


  const { tenant } = useCurrentTenant();
  const portalQ = useQuery({
    queryKey: ["student-portal-min", id],
    queryFn: async () => {
      const { data } = await supabase.from("students")
        .select("portal_enabled,portal_token,portal_slug").eq("id", id).maybeSingle();
      return data as { portal_enabled: boolean; portal_token: string | null; portal_slug: string | null } | null;
    },
  });
  const portalKey = portalQ.data?.portal_slug ?? portalQ.data?.portal_token ?? null;
  const portalActive = !!portalQ.data?.portal_enabled && !!portalKey;
  const portalUrl = portalActive && typeof window !== "undefined"
    ? `${window.location.origin}${portalQ.data?.portal_slug ? "/p/" : "/portal/aluno/"}${portalKey}` : "";

  const [tab, setTab] = useState("painel");
  const [quickMeasureOpen, setQuickMeasureOpen] = useState(false);
  const [viewEval, setViewEval] = useState<EvalRow | null>(null);
  const [testKey, setTestKey] = useState<ClassificationKey | null>(null);
  const s = student.data;


  const handlePDF = async () => {
    if (!last || !s) { toast.error("Sem avaliação para gerar PDF"); return; }
    if (!tenant?.id) { toast.error("Tenant não identificado"); return; }
    try {
      await downloadStudentEvolutionPDF(
        id,
        tenant.id,
        tenant?.display_name ?? tenant?.name ?? "ProMetric",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar Relatório Evolutivo");
    }
  };

  const handlePrintSheet = async () => {
    try {
      toast.loading("Gerando ficha…", { id: "sheet-pdf" });
      const bundle = await issueSheetTokens({ data: { studentIds: [id] } });
      await generateSheetPDF(bundle);
      toast.success("Ficha gerada", { id: "sheet-pdf" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar ficha", { id: "sheet-pdf" });
    }
  };

  const actions: ActionItem[] = [
    { label: "Nova Avaliação", icon: Zap, primary: true, accent: "brand", to: "/quick-eval", search: { student: id } },
    portalUrl
      ? { label: "Portal do Aluno", icon: Share2, primary: true, accent: "success", href: portalUrl, external: true }
      : { label: "Portal do Aluno", icon: Share2, primary: true, accent: "success", onClick: () => { toast.error("Ative o Portal do Aluno primeiro"); setTab("portal"); } },
    { label: "Imprimir Ficha", icon: Printer, onClick: handlePrintSheet },
    { label: "Atualizar Peso e Altura", icon: Ruler, onClick: () => setQuickMeasureOpen(true) },
    { label: "PDF", icon: Download, primary: true, accent: "amber", pinnedEnd: true, onClick: handlePDF },
  ];


  return (
    <div className="space-y-6">
      <Link to="/students" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para alunos
      </Link>

      <PageHeader
        title={s?.full_name ?? "Aluno"}
        description={
          s
            ? [
                s.sex === "male" ? "Masculino" : "Feminino",
                `${ageFromBirth(s.birth_date)} anos`,
                s.class?.name,
                s.class?.school?.name,
                last ? `Última avaliação: ${new Date(last.evaluated_at).toLocaleDateString("pt-BR")}` : null,
              ].filter(Boolean).join(" • ")
            : "—"
        }
        action={
          pmIndex && (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Índice ProMetric: {pmIndex.score}
              </span>
              {overall?.label && (
                <span className={cn("rounded-full border px-3 py-1 text-xs", zoneColor(overall.label))}>
                  {overall.label}
                </span>
              )}
            </div>
          )
        }
      />

      <ActionBar actions={actions} />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="dados">Dados pessoais</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
          <TabsTrigger value="portal">Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-4 space-y-4">
          <PersonalDataTab studentId={id} onSaved={() => student.refetch()} />
        </TabsContent>

        <TabsContent value="observacoes" className="mt-4 space-y-4">
          <NotesTab studentId={id} />
        </TabsContent>

        <TabsContent value="portal" className="mt-4 space-y-4">
          <PortalTab studentId={id} studentName={s?.full_name ?? ""} />
        </TabsContent>

        <TabsContent value="painel" className="mt-4 space-y-6">
          {current && data.length > 0 ? (
            <>
              <DevelopmentSummary
                classifications={effective}
                studentFirstName={s?.full_name?.split(" ")[0]}
              />
              <ProMetricHero last={current} effective={effective} />
              <IndicatorsGrid last={current} first={first} data={data} sex={s!.sex} onSelectTest={(k) => setTestKey(k)} />
              <EvolutionChart data={clinicalEvals} />
              <ReferenceRadar
                classifications={effective}
                firstClassifications={first && first.id !== current.id ? first.classifications ?? null : null}
              />

              {first && <RadarEvolutivo first={first} last={current} />}
              <ComparativeTab last={current} classEvals={classmates.data ?? []} schoolEvals={schoolmates.data ?? []} />
              <RankingPanel last={current} classEvals={classmates.data ?? []} />
              <TimelineTab data={data} studentId={id} student={s!} tenantName={tenant?.display_name ?? tenant?.name ?? "ProMetric"} onOpenPortal={() => setTab("portal")} onView={(ev) => setViewEval(ev)} />
              <InsightsPanel data={clinicalEvals} last={current} prev={prev} classEvals={classmates.data ?? []} />
              <AIReportSection studentId={id} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-gradient-card p-10 text-center">
              <User className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Este aluno ainda não possui avaliações cadastradas.</p>
              <p className="mt-1 text-xs text-muted-foreground">Realize a primeira avaliação para gerar o painel, evolução e comparativos.</p>
              <Button asChild className="mt-5 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/quick-eval" search={{ student: id }}>
                  Realizar primeira avaliação
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {s && (
        <QuickMeasureDialog
          open={quickMeasureOpen}
          onOpenChange={setQuickMeasureOpen}
          studentId={id}
          tenantId={tenant?.id ?? null}
          student={{ full_name: s.full_name, sex: s.sex, birth_date: s.birth_date }}
          onSaved={() => { evals.refetch(); }}
        />
      )}

      {s && (
        <>
          <EvaluationDetailDialog
            ev={viewEval}
            sex={s.sex}
            open={!!viewEval}
            onOpenChange={(v) => { if (!v) setViewEval(null); }}
            onOpenTest={(k) => { setViewEval(null); setTestKey(k); }}
          />
          <TestEvolutionDialog
            testKey={testKey}
            data={data}
            sex={s.sex}
            open={!!testKey}
            onOpenChange={(v) => { if (!v) setTestKey(null); }}
          />
        </>
      )}
    </div>
  );
}


// ===========================================================================
// Helpers — fetch latest eval per student in class/school
// ===========================================================================
async function fetchLatestEvalsByClass(classId: string): Promise<EvalRow[]> {
  const { data: studs } = await supabase.from("students").select("id").eq("class_id", classId).eq("is_active", true);
  return fetchLatestForStudents((studs ?? []).map((x) => x.id));
}
async function fetchLatestEvalsBySchool(schoolId: string): Promise<EvalRow[]> {
  const { data: cls } = await supabase.from("classes").select("id").eq("school_id", schoolId);
  const classIds = (cls ?? []).map((c) => c.id);
  if (!classIds.length) return [];
  const { data: studs } = await supabase.from("students").select("id").in("class_id", classIds).eq("is_active", true);
  return fetchLatestForStudents((studs ?? []).map((x) => x.id));
}
async function fetchLatestForStudents(sids: string[]): Promise<EvalRow[]> {
  if (!sids.length) return [];
  const { data } = await supabase
    .from("evaluations")
    .select("id,student_id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications")
    .in("student_id", sids).order("evaluated_at", { ascending: false });
  const rows = ((data ?? []) as unknown as EvalRow[]);
  // Mesma fonte única do painel individual: a avaliação clínica mais recente
  // de cada colega, sem combinar classificações de datas diferentes.
  const byStudent = new Map<string, EvalRow[]>();
  for (const e of rows) {
    const sid = e.student_id as unknown as string;
    const arr = byStudent.get(sid) ?? [];
    arr.push(e);
    byStudent.set(sid, arr);
  }
  const latest: EvalRow[] = [];
  for (const arr of byStudent.values()) {
    const consolidated = withConsolidatedView(arr);
    const current = consolidated[consolidated.length - 1] as EvalRow | null;
    if (current) latest.push(current);
  }
  return latest;
}


// ===========================================================================
// PAINEL — Indicadores em estilo CLÍNICO
// ---------------------------------------------------------------------------
// Reorganiza os 9 indicadores em grupos funcionais (Saúde Corporal, Mobilidade,
// Resistência, Potência, Velocidade & Agilidade) usando apenas neutros +
// identidade roxa. As cores semânticas se limitam a 3 estados: adequado
// (verde), atenção (laranja) e crítico (vermelho). Sem gradientes, sem
// elementos decorativos — inspiração em laudos laboratoriais.
// ===========================================================================
type ClinicalStatus = "adequate" | "attention" | "critical" | "unknown";

function zoneToClinical(z: Zone | null | undefined): ClinicalStatus {
  if (!z) return "unknown";
  if (z === "Muito Fraco") return "critical";
  if (z === "Fraco") return "attention";
  return "adequate"; // Razoável, Bom, Muito Bom, Excelente
}

const STATUS_STYLE: Record<ClinicalStatus, { dot: string; text: string; label: string; bar: string }> = {
  adequate:  { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", label: "Adequado",  bar: "bg-emerald-500" },
  attention: { dot: "bg-amber-500",   text: "text-amber-700  dark:text-amber-400",    label: "Atenção",   bar: "bg-amber-500" },
  critical:  { dot: "bg-rose-500",    text: "text-rose-700   dark:text-rose-400",     label: "Crítico",   bar: "bg-rose-500" },
  unknown:   { dot: "bg-muted-foreground/40", text: "text-muted-foreground",          label: "Sem dado",  bar: "bg-muted-foreground/40" },
};

const CLINICAL_GROUPS: { title: string; keys: ClassificationKey[] }[] = [
  { title: "Saúde Corporal",       keys: ["imc", "rce"] },
  { title: "Mobilidade",           keys: ["flex"] },
  { title: "Resistência",          keys: ["abdo", "run6"] },
  { title: "Potência",             keys: ["jump", "mball"] },
  { title: "Velocidade & Agilidade", keys: ["square", "sprint"] },
];

function formatNumber(v: number, unit: string): string {
  if (unit === "kg/m²" || unit === "" || unit === "s" || unit === "m") return v.toFixed(unit === "" ? 2 : 1);
  return String(Math.round(v));
}

function IndicatorsGrid({ last, first, data, sex, onSelectTest }: { last: EvalRow; first: EvalRow | null; data: EvalRow[]; sex: "male" | "female"; onSelectTest: (k: ClassificationKey) => void }) {
  const age = last.age_years ?? 0;
  return (
    <section className="rounded-2xl border border-border bg-card shadow-soft">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <span className="inline-block h-1 w-6 rounded-full bg-primary" />
            Painel Clínico
          </div>
          <h2 className="mt-0.5 font-display text-base font-semibold">Indicadores por Capacidade</h2>
        </div>
        <ClinicalLegend />
      </header>

      <div className="divide-y divide-border">
        {CLINICAL_GROUPS.map((g) => {
          const inds = g.keys.map((k) => INDICATORS.find((i) => i.key === k)!).filter(Boolean);
          return (
            <div key={g.title} className="px-5 py-4">
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {g.title}
                </span>
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground/70">{inds.length} indicador{inds.length > 1 ? "es" : ""}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {inds.map((ind) => (
                  <ClinicalCard key={ind.key} ind={ind} last={last} first={first} data={data} age={age} sex={sex} onClick={() => onSelectTest(ind.key)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ClinicalLegend() {
  return (
    <div className="hidden items-center gap-3 text-[10px] text-muted-foreground sm:flex">
      <LegendDot cls="bg-emerald-500" label="Adequado" />
      <LegendDot cls="bg-amber-500"   label="Atenção" />
      <LegendDot cls="bg-rose-500"    label="Crítico" />
    </div>
  );
}
function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", cls)} />
      {label}
    </span>
  );
}

function ClinicalCard({
  ind, last, first, data, age, sex, onClick,
}: {
  ind: Indicator; last: EvalRow; first: EvalRow | null; data: EvalRow[]; age: number; sex: "male" | "female";
  onClick?: () => void;
}) {
  // Mesma origem de dados do modal "Evolução": registros que possuem valor
  // para este teste. A última avaliação pode ser apenas de peso/altura e não
  // conter este teste — nesse caso usamos o registro mais recente que o contém.
  const withValue = data.filter((ev) => {
    const rec = ev.recorded_values;
    if (rec) return rec[ind.field] != null;
    return num(ev, ind.field) != null;
  });
  const source = withValue[withValue.length - 1] ?? last;
  const baseline = withValue.length > 1 ? withValue[0] : (first && first.id !== source.id ? first : null);

  const value = num(source, ind.field);
  const base = baseline && baseline.id !== source.id ? num(baseline, ind.field) : null;
  const { diff, positive } = pct(value, base, ind.higherBetter);
  const zone = source.classifications?.[ind.key];
  const status = zoneToClinical(zone);
  const styles = STATUS_STYLE[status];
  const range = expectedRangeFor(ind.key, source.age_years ?? age, sex);

  const rangeLabel = range
    ? `${formatNumber(range.min, ind.unit)}–${formatNumber(range.max, ind.unit)}${ind.unit ? ` ${ind.unit}` : ""}`
    : "—";

  const interpretation =
    status === "adequate"  ? "Dentro do esperado para idade e sexo."
    : status === "attention" ? "Abaixo do esperado — recomenda-se estímulo direcionado."
    : status === "critical" ? "Muito abaixo do esperado — atenção prioritária."
    : "Sem dado registrado nesta avaliação.";

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Ver evolução de ${ind.label}`}
      className="group w-full rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {ind.label}
          </div>
        </div>
        {diff != null && (
          <span
            className={cn(
              "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
              positive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
              "bg-muted/50",
            )}
            title="Variação desde a avaliação anterior"
          >
            {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Valor */}
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-bold tabular-nums text-foreground">
          {value != null ? formatNumber(value, ind.unit) : "—"}
        </span>
        <span className="text-xs text-muted-foreground">{ind.unit}</span>
      </div>
      {value != null && source.id !== last.id && (
        <div className="mt-0.5 text-[10px] text-muted-foreground/80">
          Registrado em {new Date(source.evaluated_at).toLocaleDateString("pt-BR")}
        </div>
      )}

      {/* Barra clínica */}
      <div className="mt-4">
        <ClinicalBar value={value} range={range} status={status} />
        <div className="mt-1.5 flex items-center justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>Referência</span>
          <span className="font-medium text-foreground/80">{rangeLabel}</span>
        </div>
      </div>

      {/* Estado + interpretação */}
      <div className="mt-3 flex items-start gap-2 border-t border-border pt-2.5">
        <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", styles.dot)} />
        <div className="min-w-0">
          <div className={cn("text-[11px] font-semibold", styles.text)}>{styles.label}</div>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{interpretation}</p>
        </div>
      </div>
    </button>
  );
}

function ClinicalBar({
  value, range, status,
}: {
  value: number | null;
  range: ReturnType<typeof expectedRangeFor>;
  status: ClinicalStatus;
}) {
  if (!range) {
    return <div className="h-1.5 w-full rounded-full bg-muted" />;
  }
  const { min, max, domainMin, domainMax } = range;
  const span = domainMax - domainMin;
  const bandStart = ((min - domainMin) / span) * 100;
  const bandWidth = ((max - min) / span) * 100;
  const markerPct = value != null
    ? Math.max(0, Math.min(100, ((value - domainMin) / span) * 100))
    : null;
  const markerBar = STATUS_STYLE[status].bar;

  return (
    <div className="relative h-2 w-full rounded-full bg-muted/60">
      {/* Faixa esperada em cinza neutro (destacada) */}
      <div
        aria-hidden
        className="absolute inset-y-0 rounded-full bg-foreground/15 dark:bg-foreground/20"
        style={{ left: `${bandStart}%`, width: `${bandWidth}%` }}
      />
      {/* Marcador do aluno */}
      {markerPct != null && (
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${markerPct}%` }}
          aria-label="Posição do aluno na faixa de referência"
        >
          <div className={cn("h-3 w-[3px] rounded-sm shadow-sm", markerBar)} />
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// DETALHE DE UMA AVALIAÇÃO ESPECÍFICA
// Apenas leitura — nenhum cálculo é refeito aqui.
// ===========================================================================
function EvaluationDetailDialog({
  ev, sex, open, onOpenChange, onOpenTest,
}: {
  ev: EvalRow | null;
  sex: "male" | "female";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenTest: (key: ClassificationKey) => void;
}) {
  if (!ev) return null;
  const idx = prometricIndex(ev.classifications ?? {});
  const ov = overallScore(ev.classifications ?? {});
  const age = ev.age_years ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            Avaliação de {new Date(ev.evaluated_at).toLocaleDateString("pt-BR")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary">
            Índice ProMetric {idx.score}
          </span>
          {ov.label && (
            <span className={cn("rounded-full border px-2.5 py-1", zoneColor(ov.label))}>Perfil: {ov.label}</span>
          )}
          {ev.weight_kg != null && <span className="text-muted-foreground">Peso {ev.weight_kg} kg</span>}
          {ev.height_cm != null && <span className="text-muted-foreground">Altura {ev.height_cm} cm</span>}
          {age ? <span className="text-muted-foreground">{age} anos</span> : null}
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {INDICATORS.map((ind) => {
            const value = num(ev, ind.field);
            // Zona exibida por teste = a efetivamente registrada nesta avaliação.
            const zone = (ev.recorded_classifications ?? ev.classifications)?.[ind.key];

            const status = zoneToClinical(zone);
            const styles = STATUS_STYLE[status];
            const range = expectedRangeFor(ind.key, age, sex);
            return (
              <button
                key={ind.key}
                type="button"
                onClick={() => onOpenTest(ind.key)}
                className="rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {ind.label}
                  </span>
                  <span className={cn("text-[10px] font-semibold", styles.text)}>{styles.label}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold tabular-nums">
                    {value != null ? formatNumber(value, ind.unit) : "—"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{ind.unit}</span>
                </div>
                <div className="mt-2">
                  <ClinicalBar value={value} range={range} status={status} />
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Referência: {range ? `${formatNumber(range.min, ind.unit)}–${formatNumber(range.max, ind.unit)}` : "—"} • ver evolução
                </p>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================================
// EVOLUÇÃO DE UM TESTE ESPECÍFICO
// ===========================================================================
function TestEvolutionDialog({
  testKey, data, sex, open, onOpenChange,
}: {
  testKey: ClassificationKey | null;
  data: EvalRow[];
  sex: "male" | "female";
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const ind = testKey ? INDICATORS.find((i) => i.key === testKey) ?? null : null;
  const rows = useMemo(() => {
    if (!ind) return [] as { id: string; date: string; label: string; value: number | null; zone: Zone | undefined }[];
    return data
      .filter((ev) => {
        const rec = ev.recorded_values;
        if (rec) return rec[ind.field] != null;
        return num(ev, ind.field) != null;
      })
      .map((ev) => {
        const rec = ev.recorded_values;
        const v = rec ? rec[ind.field] : num(ev, ind.field);
        return {
          id: ev.id,
          date: ev.evaluated_at,
          label: new Date(ev.evaluated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }),
          value: v,
          zone: (ev.recorded_classifications ?? ev.classifications)?.[ind.key],
        };
      });
  }, [data, ind]);

  if (!ind) return null;
  const lastEv = data[data.length - 1];
  const range = expectedRangeFor(ind.key, lastEv?.age_years ?? 0, sex);
  const first = rows[0]?.value ?? null;
  const latest = rows[rows.length - 1]?.value ?? null;
  const { diff, positive } = pct(latest, rows.length > 1 ? first : null, ind.higherBetter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Evolução — {ind.label}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span>{rows.length} registro{rows.length === 1 ? "" : "s"}</span>
          {range && <span>Referência: {formatNumber(range.min, ind.unit)}–{formatNumber(range.max, ind.unit)} {ind.unit}</span>}
          {diff != null && (
            <span className={cn("font-mono", positive ? "text-emerald-600" : "text-rose-600")}>
              {diff > 0 ? "+" : ""}{diff.toFixed(1)}% desde a primeira
            </span>
          )}
        </div>

        {rows.length >= 2 ? (
          <div className="mt-2 rounded-xl border border-border bg-background p-3">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={["auto", "auto"]} />
                {range && (
                  <ReferenceArea y1={range.min} y2={range.max} fill="var(--primary)" fillOpacity={0.08} />
                )}
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="value" name={ind.label} stroke="var(--primary)" strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--primary)" }} connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            É necessário pelo menos duas avaliações com este teste para exibir o gráfico de evolução.
          </p>
        )}

        <div className="mt-3 divide-y divide-border rounded-xl border border-border">
          {rows.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">Nenhum resultado registrado para este teste.</p>
          )}
          {[...rows].reverse().map((r) => {
            const styles = STATUS_STYLE[zoneToClinical(r.zone)];
            return (
              <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                <span className="text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                <span className="font-mono font-semibold tabular-nums">
                  {r.value != null ? formatNumber(r.value, ind.unit) : "—"} {ind.unit}
                </span>
                <span className={cn("text-[10px] font-semibold", styles.text)}>{r.zone ?? styles.label}</span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}


// ===========================================================================
// PAINEL — Insights automáticos
// ===========================================================================
function InsightsPanel({ data, last, prev, classEvals }: { data: EvalRow[]; last: EvalRow; prev: EvalRow | null; classEvals: EvalRow[] }) {
  const insights = useMemo(() => {
    const out: { tone: "good" | "warn" | "bad" | "info"; text: string }[] = [];

    // Score geral
    const lastScore = prometricIndex(last.classifications ?? {}).score;
    if (prev) {
      const prevScore = prometricIndex(prev.classifications ?? {}).score;
      const delta = lastScore - prevScore;
      if (delta >= 5) out.push({ tone: "good", text: `Índice ProMetric subiu de ${prevScore} para ${lastScore} desde a última avaliação.` });
      else if (delta <= -5) out.push({ tone: "bad", text: `Índice ProMetric caiu de ${prevScore} para ${lastScore} desde a última avaliação.` });
      else out.push({ tone: "info", text: `Índice ProMetric estável (${lastScore}) em relação à avaliação anterior.` });
    }

    // Pontos fortes / atenção
    const dims = dimensionScores(last.classifications ?? {});
    const sorted = [...dims].filter((d) => d.category).sort((a, b) => b.score - a.score);
    if (sorted[0]) out.push({ tone: "good", text: `Ponto forte: ${sorted[0].dimension} (${sorted[0].score}/100 — ${sorted[0].category}).` });
    const weakest = sorted[sorted.length - 1];
    if (weakest && weakest.score < 50) out.push({ tone: "warn", text: `Ponto de atenção: ${weakest.dimension} (${weakest.score}/100 — ${weakest.category}).` });

    // Comparativo turma
    if (classEvals.length >= 2) {
      for (const ind of INDICATORS) {
        const v = num(last, ind.field);
        const vals = classEvals.map((e) => num(e, ind.field)).filter((x): x is number => x != null);
        if (v == null || !vals.length) continue;
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        if (avg === 0) continue;
        const diff = ((v - avg) / avg) * 100;
        const better = ind.higherBetter ? diff >= 10 : diff <= -10;
        const worse  = ind.higherBetter ? diff <= -10 : diff >= 10;
        if (better) { out.push({ tone: "good", text: `${ind.label}: ${Math.abs(diff).toFixed(0)}% acima da média da turma.` }); break; }
        if (worse)  { out.push({ tone: "warn", text: `${ind.label}: ${Math.abs(diff).toFixed(0)}% abaixo da média da turma.` }); break; }
      }
    }

    if (data.length >= 3) out.push({ tone: "info", text: `Acompanhamento consistente: ${data.length} avaliações registradas.` });
    return out;
  }, [data, last, prev, classEvals]);

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-primary" /> Análise automática
      </h2>
      <ul className="space-y-2">
        {insights.map((i, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span aria-hidden>{i.tone === "good" ? "🟢" : i.tone === "warn" ? "🟡" : i.tone === "bad" ? "🔴" : "🔵"}</span>
            <span className="text-foreground/90">{i.text}</span>
          </li>
        ))}
        {!insights.length && <li className="text-xs text-muted-foreground">Sem dados suficientes para gerar insights.</li>}
      </ul>
    </div>
  );
}

// ===========================================================================
// EVOLUÇÃO — Gráfico com seletor de métrica
// ===========================================================================
function EvolutionChart({ data }: { data: EvalRow[] }) {
  const [metric, setMetric] = useState<ClassificationKey | "prometric">("prometric");
  const ind = metric === "prometric" ? null : INDICATORS.find((i) => i.key === metric)!;
  const label = ind ? ind.label : "Índice ProMetric";
  const unit = ind ? ind.unit : "/100";
  const higherBetter = ind ? ind.higherBetter : true;

  const series = data.map((e) => {
    let valor: number | null = null;
    if (ind) {
      const rec = e.recorded_values;
      valor = rec ? rec[ind.field] : num(e, ind.field);
    } else {
      valor = prometricIndex(e.classifications ?? {}).score;
    }
    return {
      date: new Date(e.evaluated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" }),
      valor,
    };
  });

  const first = series.find((s) => s.valor != null)?.valor ?? null;
  const last = [...series].reverse().find((s) => s.valor != null)?.valor ?? null;
  const { diff, positive } = pct(last, first, higherBetter);

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
            <Calendar className="h-4 w-4 text-primary" /> Evolução — {label}
          </h2>
          {diff != null && (
            <p className="mt-1 text-xs text-muted-foreground">
              {first} {unit} → {last} {unit}{" "}
              <span className={cn("ml-1 font-medium", positive ? "text-success" : "text-destructive")}>
                ({diff > 0 ? "+" : ""}{diff.toFixed(1)}%)
              </span>
            </p>
          )}
        </div>
        <Select value={metric} onValueChange={(v) => setMetric(v as ClassificationKey | "prometric")}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="prometric">Índice ProMetric</SelectItem>
            {INDICATORS.map((i) => (
              <SelectItem key={i.key} value={i.key}>{i.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={metric === "prometric" ? [0, 100] : ["auto", "auto"]} />
            {metric === "prometric" && (
              <ReferenceArea
                y1={EXPECTED_INDEX_RANGE.min}
                y2={EXPECTED_INDEX_RANGE.max}
                fill="#22c55e"
                fillOpacity={0.12}
                stroke="#22c55e"
                strokeOpacity={0.4}
                strokeDasharray="4 4"
                label={{ value: REFERENCE_LABEL, position: "insideTopRight", fontSize: 10, fill: "#16a34a" }}
              />
            )}
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} ${unit}`, label]} />
            <Line type="monotone" dataKey="valor" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)" }} activeDot={{ r: 6 }} connectNulls isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ===========================================================================
// RADAR EVOLUTIVO — Primeira × Última avaliação
// ===========================================================================
function RadarEvolutivo({ first, last }: { first: EvalRow; last: EvalRow }) {
  const firstDims = dimensionScores(first.classifications ?? {});
  const lastDims = dimensionScores(last.classifications ?? {});
  const chartData = lastDims.map((d, i) => ({
    dim: d.dimension.split(" ")[0],
    Inicial: firstDims[i]?.score ?? 0,
    Atual: d.score,
  }));
  const sameEval = first.id === last.id;
  const fDate = new Date(first.evaluated_at).toLocaleDateString("pt-BR");
  const lDate = new Date(last.evaluated_at).toLocaleDateString("pt-BR");
  const firstScore = prometricIndex(first.classifications ?? {}).score;
  const lastScore = prometricIndex(last.classifications ?? {}).score;
  const delta = lastScore - firstScore;

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" /> Radar Evolutivo — Inicial × Atual
        </h2>
        {!sameEval && (
          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium",
            delta >= 0 ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive")}>
            {delta >= 0 ? "+" : ""}{delta} pts no Índice ProMetric
          </span>
        )}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        {sameEval
          ? `Apenas uma avaliação registrada (${lDate}). Realize uma nova avaliação para visualizar a evolução.`
          : `Inicial: ${fDate} (${firstScore}/100) • Atual: ${lDate} (${lastScore}/100)`}
      </p>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <RadarChart data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="dim" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
            {!sameEval && (
              <Radar name={`Inicial (${fDate})`} dataKey="Inicial" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
            )}
            <Radar name={`Atual (${lDate})`} dataKey="Atual" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.45} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ===========================================================================
// COMPARATIVO — Aluno × Turma × Escola
// ===========================================================================
function ComparativeTab({ last, classEvals, schoolEvals }: { last: EvalRow; classEvals: EvalRow[]; schoolEvals: EvalRow[] }) {
  const dims = dimensionScores(last.classifications ?? {});
  const radarData = dims.map((d) => ({
    dim: d.dimension.split(" ")[0],
    Aluno: d.score,
    Turma: avgDimension(classEvals, d.dimension),
    Escola: avgDimension(schoolEvals, d.dimension),
  }));

  const rows = INDICATORS.map((ind) => {
    const v = num(last, ind.field);
    const cVals = classEvals.map((e) => num(e, ind.field)).filter((x): x is number => x != null);
    const sVals = schoolEvals.map((e) => num(e, ind.field)).filter((x): x is number => x != null);
    const cAvg = cVals.length ? cVals.reduce((a, b) => a + b, 0) / cVals.length : null;
    const sAvg = sVals.length ? sVals.reduce((a, b) => a + b, 0) / sVals.length : null;
    const cDiff = pct(v, cAvg, ind.higherBetter);
    return { ...ind, v, cAvg, sAvg, cDiff };
  });

  return (
    <>
      <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
        <h2 className="mb-3 font-display text-sm font-semibold">Radar ProMetric — Aluno × Turma × Escola</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dim" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Radar name="Aluno"  dataKey="Aluno"  stroke="#6366f1" fill="#6366f1" fillOpacity={0.45} />
              <Radar name="Turma"  dataKey="Turma"  stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.18} />
              <Radar name="Escola" dataKey="Escola" stroke="#10b981" fill="#10b981" fillOpacity={0.12} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">Escala 0–100 do Índice ProMetric por dimensão.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Indicador</th>
              <th className="px-4 py-3 text-right font-medium">Aluno</th>
              <th className="px-4 py-3 text-right font-medium">Turma</th>
              <th className="px-4 py-3 text-right font-medium">Escola</th>
              <th className="px-4 py-3 text-right font-medium">vs Turma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="px-4 py-3 font-medium">{r.label}</td>
                <td className="px-4 py-3 text-right font-mono">{r.v != null ? `${r.v} ${r.unit}` : "—"}</td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">{r.cAvg != null ? `${r.cAvg.toFixed(1)} ${r.unit}` : "—"}</td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">{r.sAvg != null ? `${r.sAvg.toFixed(1)} ${r.unit}` : "—"}</td>
                <td className="px-4 py-3 text-right">
                  {r.cDiff.diff != null ? (
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      r.cDiff.positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                    )}>
                      {r.cDiff.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {r.cDiff.diff > 0 ? "+" : ""}{r.cDiff.diff.toFixed(1)}%
                    </span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function avgDimension(evals: EvalRow[], dimension: string): number {
  if (!evals.length) return 0;
  const scores = evals.map((e) => {
    const dims = dimensionScores(e.classifications ?? {});
    return dims.find((d) => d.dimension === dimension)?.score ?? 0;
  }).filter((x) => x > 0);
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

// ===========================================================================
// HISTÓRICO / TIMELINE
// ===========================================================================
function TimelineTab({ data, studentId, student, tenantName, onOpenPortal, onView }: {
  data: EvalRow[];
  studentId: string;
  student: { full_name: string; sex: "male" | "female"; birth_date: string };
  tenantName: string;
  onView: (ev: EvalRow) => void;
  onOpenPortal: () => void;
}) {
  const navigate = useNavigate();
  const ordered = useMemo(() => [...data].reverse(), [data]);

  // Per-evaluation PDFs were removed by design: o sistema possui apenas UM
  // relatório oficial (Relatório Evolutivo ProMetric). As avaliações
  // permanecem como histórico/auditoria, mas não geram PDFs independentes.
  void student; void tenantName;


  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
        <Calendar className="h-4 w-4 text-primary" /> Histórico de Avaliações
      </h2>
      <ol className="relative space-y-4 border-l border-border pl-5">
        {ordered.map((ev, idx) => {
          const cls = ev.classifications ?? {};
          const filled = Object.values(cls).filter(Boolean).length;
          const hasResult = filled > 0;
          const score = hasResult ? prometricIndex(cls).score : null;
          const ov = hasResult ? overallScore(cls) : null;
          const partial = filled < 9;
          return (
            <li key={ev.id} className="relative">
              <span aria-hidden className="absolute -left-[26px] top-1 grid h-4 w-4 place-items-center rounded-full border border-border bg-card text-[10px]">
                {partial ? "🟡" : "🟢"}
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xs font-semibold">{new Date(ev.evaluated_at).toLocaleDateString("pt-BR")}</span>
                {idx === 0 && <span className="text-[10px] uppercase text-primary">mais recente</span>}
                {ov?.label && (
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", zoneColor(ov.label))}>
                    Perfil: {ov.label}
                  </span>
                )}
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                  {score == null ? "Sem classificação" : `Índice ${score}`}
                </span>
                {partial && (
                  <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] text-warning">
                    Parcial {filled}/9
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => onView(ev)}>
                  <Eye className="mr-1 h-3 w-3" /> Visualizar
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => navigate({ to: "/quick-eval", search: { evaluation: ev.id } })}>
                  <Pencil className="mr-1 h-3 w-3" /> Editar
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onOpenPortal}>
                  <ExternalLink className="mr-1 h-3 w-3" /> Portal
                </Button>
              </div>
            </li>
          );
        })}
        {!ordered.length && (
          <li className="text-xs text-muted-foreground">Sem avaliações registradas.</li>
        )}
      </ol>
      <div className="mt-4 flex justify-end">
        <Button size="sm" className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          onClick={() => navigate({ to: "/quick-eval", search: { student: studentId } })}>
          <Zap className="mr-1 h-3.5 w-3.5" /> Nova avaliação
        </Button>
      </div>
    </div>
  );
}

// keep imports referenced
void categoryColor;

// ===========================================================================
// DADOS PESSOAIS — edição completa do prontuário
// ===========================================================================
type PersonalRow = {
  id: string;
  full_name: string; sex: "male" | "female"; birth_date: string;
  cpf: string | null; rg: string | null;
  phone: string | null; email: string | null;
  guardian_name: string | null; guardian_relationship: string | null;
  guardian_phone: string | null; guardian_email: string | null;
  address_zip: string | null; address_street: string | null; address_number: string | null;
  address_complement: string | null; address_neighborhood: string | null;
  address_city: string | null; address_state: string | null;
};

function PersonalDataTab({ studentId, onSaved }: { studentId: string; onSaved: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["student-personal", studentId],
    queryFn: async () => {
      const cols = "id,full_name,sex,birth_date,cpf,rg,phone,email,guardian_name,guardian_relationship,guardian_phone,guardian_email,address_zip,address_street,address_number,address_complement,address_neighborhood,address_city,address_state";
      const { data, error } = await supabase.from("students").select(cols).eq("id", studentId).single();
      if (error) throw error;
      return data as unknown as PersonalRow;
    },
  });

  const [form, setForm] = useState<Partial<PersonalRow>>({});
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (q.data) { setForm(q.data); setDirty(false); } }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.full_name || !form.birth_date || !form.sex) throw new Error("Nome, sexo e data de nascimento são obrigatórios");
      const payload = {
        full_name: form.full_name, sex: form.sex, birth_date: form.birth_date,
        cpf: form.cpf ?? null, rg: form.rg ?? null,
        phone: form.phone ?? null, email: form.email ?? null,
        guardian_name: form.guardian_name ?? null, guardian_relationship: form.guardian_relationship ?? null,
        guardian_phone: form.guardian_phone ?? null, guardian_email: form.guardian_email ?? null,
        address_zip: form.address_zip ?? null, address_street: form.address_street ?? null,
        address_number: form.address_number ?? null, address_complement: form.address_complement ?? null,
        address_neighborhood: form.address_neighborhood ?? null,
        address_city: form.address_city ?? null, address_state: form.address_state ?? null,
      };
      const { data: updated, error } = await supabase
        .from("students")
        .update(payload)
        .eq("id", studentId)
        .select("id");
      if (error) throw error;
      if (!updated || updated.length === 0) {
        throw new Error("Sem permissão para editar este aluno (perfil somente leitura).");
      }
    },
    onSuccess: () => {
      toast.success("Dados atualizados");
      qc.invalidateQueries({ queryKey: ["student-personal", studentId] });
      qc.invalidateQueries({ queryKey: ["student", studentId] });
      qc.invalidateQueries({ queryKey: ["student-portal", studentId] });
      qc.invalidateQueries({ queryKey: ["student-portal-min", studentId] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["class-stats"] });
      qc.invalidateQueries({ queryKey: ["group-stats"] });

      onSaved();
    },

    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  // Autosave: debounce 800ms quando houver alterações e campos obrigatórios válidos.
  // Hook DEVE ficar antes de qualquer return condicional.
  useEffect(() => {
    if (!dirty) return;
    if (!form.full_name || !form.birth_date || !form.sex) return;
    const t = setTimeout(() => { save.mutate(); }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, dirty]);

  if (q.isLoading) return <div className="text-sm text-muted-foreground">Carregando…</div>;
  const f = form;
  const set = (patch: Partial<PersonalRow>) => { setForm((p) => ({ ...p, ...patch })); setDirty(true); };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
      className="space-y-6"
    >
      <Section title="Identificação">
        <Field label="Nome completo *" className="md:col-span-2">
          <Input required value={f.full_name ?? ""} onChange={(e) => set({ full_name: e.target.value })} />
        </Field>
        <Field label="Sexo *">
          <Select value={f.sex ?? "male"} onValueChange={(v) => set({ sex: v as "male" | "female" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Feminino</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Data de nascimento *">
          <Input type="date" required value={f.birth_date ?? ""} onChange={(e) => set({ birth_date: e.target.value })} />
        </Field>
        <Field label="CPF">
          <Input value={f.cpf ?? ""} onChange={(e) => set({ cpf: e.target.value })} placeholder="000.000.000-00" maxLength={20} />
        </Field>
        <Field label="RG">
          <Input value={f.rg ?? ""} onChange={(e) => set({ rg: e.target.value })} maxLength={20} />
        </Field>
        <Field label="Telefone">
          <Input value={f.phone ?? ""} onChange={(e) => set({ phone: e.target.value })} maxLength={20} />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={f.email ?? ""} onChange={(e) => set({ email: e.target.value })} maxLength={255} />
        </Field>
      </Section>

      <Section title="Responsável">
        <Field label="Nome" className="md:col-span-2">
          <Input value={f.guardian_name ?? ""} onChange={(e) => set({ guardian_name: e.target.value })} maxLength={120} />
        </Field>
        <Field label="Parentesco">
          <Input value={f.guardian_relationship ?? ""} onChange={(e) => set({ guardian_relationship: e.target.value })} placeholder="Pai, mãe, responsável…" maxLength={50} />
        </Field>
        <Field label="Telefone">
          <Input value={f.guardian_phone ?? ""} onChange={(e) => set({ guardian_phone: e.target.value })} maxLength={20} />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={f.guardian_email ?? ""} onChange={(e) => set({ guardian_email: e.target.value })} maxLength={255} />
        </Field>
      </Section>

      <Section title="Endereço">
        <Field label="CEP">
          <Input value={f.address_zip ?? ""} onChange={(e) => set({ address_zip: e.target.value })} maxLength={15} />
        </Field>
        <Field label="Endereço" className="md:col-span-2">
          <Input value={f.address_street ?? ""} onChange={(e) => set({ address_street: e.target.value })} maxLength={160} />
        </Field>
        <Field label="Número">
          <Input value={f.address_number ?? ""} onChange={(e) => set({ address_number: e.target.value })} maxLength={20} />
        </Field>
        <Field label="Complemento">
          <Input value={f.address_complement ?? ""} onChange={(e) => set({ address_complement: e.target.value })} maxLength={80} />
        </Field>
        <Field label="Bairro">
          <Input value={f.address_neighborhood ?? ""} onChange={(e) => set({ address_neighborhood: e.target.value })} maxLength={80} />
        </Field>
        <Field label="Cidade">
          <Input value={f.address_city ?? ""} onChange={(e) => set({ address_city: e.target.value })} maxLength={80} />
        </Field>
        <Field label="Estado">
          <Input value={f.address_state ?? ""} onChange={(e) => set({ address_state: e.target.value })} maxLength={2} placeholder="UF" />
        </Field>
      </Section>

      <div className="flex justify-end">
        <Button type="submit" disabled={save.isPending} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <Save className="mr-1.5 h-4 w-4" /> {save.isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <h2 className="mb-4 font-display text-sm font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

// ===========================================================================
// OBSERVAÇÕES — anotações cronológicas do professor
// ===========================================================================
type NoteRow = {
  id: string; content: string; created_at: string; author_id: string | null;
  author?: { full_name: string | null; email: string | null } | null;
};

function NotesTab({ studentId }: { studentId: string }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");

  const notes = useQuery({
    queryKey: ["student-notes", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_notes")
        .select("id,content,created_at,author_id,author:profiles!student_notes_author_id_fkey(full_name,email)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      if (error) {
        // profile join pode falhar se a FK não existir — fallback sem join
        const r = await supabase.from("student_notes").select("id,content,created_at,author_id").eq("student_id", studentId).order("created_at", { ascending: false });
        if (r.error) throw r.error;
        return r.data as unknown as NoteRow[];
      }
      return data as unknown as NoteRow[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (text.length < 2) throw new Error("Conteúdo muito curto");
      if (text.length > 4000) throw new Error("Limite de 4000 caracteres");
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sem sessão");
      // descobre tenant_id do aluno
      const { data: s, error: se } = await supabase.from("students").select("tenant_id").eq("id", studentId).single();
      if (se) throw se;
      const { error } = await supabase.from("student_notes").insert([{
        student_id: studentId, tenant_id: (s as { tenant_id: string }).tenant_id,
        author_id: u.user.id, content: text,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      toast.success("Observação registrada");
      qc.invalidateQueries({ queryKey: ["student-notes", studentId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("student_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Observação removida");
      qc.invalidateQueries({ queryKey: ["student-notes", studentId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
          <MessageSquarePlus className="h-4 w-4 text-primary" /> Nova observação
        </h2>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Anotação do professor, evolução, conduta, próximos passos…"
          rows={4}
          maxLength={4000}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{content.length}/4000</span>
          <Button
            type="button"
            onClick={() => create.mutate()}
            disabled={create.isPending || content.trim().length < 2}
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            {create.isPending ? "Salvando…" : "Adicionar observação"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : (notes.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-gradient-card p-8 text-center text-sm text-muted-foreground">
            Nenhuma observação registrada ainda.
          </div>
        ) : (
          (notes.data ?? []).map((n) => (
            <div key={n.id} className="rounded-2xl border border-border bg-gradient-card p-4 shadow-soft">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="text-[11px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("pt-BR")} ·{" "}
                  {n.author?.full_name ?? n.author?.email ?? "—"}
                </div>
                <Button
                  type="button" variant="ghost" size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove.mutate(n.id)}
                  title="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{n.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// HERO — Card grande do Índice ProMetric no topo do Painel
// ===========================================================================
function ProMetricHero({ last, effective }: { last: EvalRow; effective?: Classifications }) {
  const pm = prometricIndex(effective ?? last.classifications ?? {});
  const dims = pm.dimensions;
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
      <div className="rounded-2xl border border-primary/30 bg-gradient-brand p-6 text-primary-foreground shadow-glow">
        <div className="text-[10px] uppercase tracking-wide opacity-80">Índice ProMetric</div>
        <div className="mt-1 font-display text-5xl font-bold leading-none">{pm.score}</div>
        <div className="mt-1 text-xs opacity-80">de 100</div>
        {pm.category ? (
          <div className="mt-4 inline-flex rounded-full bg-background/15 px-3 py-1 text-xs font-medium backdrop-blur">
            {pm.category}
          </div>
        ) : (
          <div className="mt-4 inline-flex max-w-[240px] rounded-full bg-background/15 px-3 py-1 text-[11px] font-medium backdrop-blur">
            Dados insuficientes ({pm.filledTests}/9 testes)
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
        <h3 className="mb-3 font-display text-sm font-semibold">Dimensões</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {dims.map((d) => (
            <div key={d.dimension} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">{d.dimension}</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${d.score}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums">{d.score}</span>
              {d.category && (
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", categoryColor(d.category))}>
                  {d.category}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// RANKING — Posição do aluno na turma por indicador + Índice geral
// ===========================================================================
function RankingPanel({ last, classEvals }: { last: EvalRow; classEvals: EvalRow[] }) {
  const rows = useMemo(() => {
    if (classEvals.length === 0) return [];
    // Inclui o próprio aluno se não estiver presente
    const pool = classEvals.some((e) => e.id === last.id) ? classEvals : [...classEvals, last];
    const total = pool.length;

    // Por indicador
    const indRows = INDICATORS.map((ind) => {
      const vals = pool
        .map((e) => ({ id: e.id, v: num(e, ind.field) }))
        .filter((x): x is { id: string; v: number } => x.v != null);
      if (!vals.length) return { label: ind.label, position: null as number | null, total: vals.length, unit: ind.unit, value: num(last, ind.field) };
      vals.sort((a, b) => (ind.higherBetter ? b.v - a.v : a.v - b.v));
      const idx = vals.findIndex((x) => x.id === last.id);
      return { label: ind.label, position: idx >= 0 ? idx + 1 : null, total: vals.length, unit: ind.unit, value: num(last, ind.field) };
    });

    // Índice geral
    const scored = pool.map((e) => ({ id: e.id, s: prometricIndex(e.classifications ?? {}).score }));
    scored.sort((a, b) => b.s - a.s);
    const idxOverall = scored.findIndex((x) => x.id === last.id);
    const overallRow = {
      label: "Índice ProMetric (geral)",
      position: idxOverall >= 0 ? idxOverall + 1 : null,
      total,
      unit: "",
      value: prometricIndex(last.classifications ?? {}).score,
    };

    return [overallRow, ...indRows];
  }, [last, classEvals]);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-gradient-card p-8 text-center text-sm text-muted-foreground">
        Sem colegas avaliados na turma para gerar ranking.
      </div>
    );
  }

  const podiumTone = (pos: number | null, total: number) => {
    if (pos == null || total === 0) return "bg-muted text-muted-foreground border-border";
    const pct = pos / total;
    if (pct <= 0.2) return "bg-success/15 text-success border-success/30";
    if (pct <= 0.5) return "bg-primary/10 text-primary border-primary/30";
    if (pct <= 0.8) return "bg-warning/15 text-warning border-warning/30";
    return "bg-destructive/15 text-destructive border-destructive/30";
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <h2 className="mb-3 font-display text-sm font-semibold">Ranking na turma</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-xs text-muted-foreground">{r.label}</div>
              <div className="font-display text-sm font-semibold">
                {r.value != null ? `${r.value}${r.unit ? ` ${r.unit}` : ""}` : "—"}
              </div>
            </div>
            <span className={cn("ml-2 shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold", podiumTone(r.position, r.total))}>
              {r.position != null ? `${r.position}º de ${r.total}` : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Portal do Aluno — gerenciamento do link público da família
// ===========================================================================
function PortalTab({ studentId, studentName }: { studentId: string; studentName: string }) {
  const qc = useQueryClient();
  const portal = useQuery({
    queryKey: ["student-portal", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("portal_enabled,portal_token,portal_slug,portal_token_created_at,portal_last_access,portal_views,tenant_id")
        .eq("id", studentId).single();
      if (error) throw error;
      return data as {
        portal_enabled: boolean; portal_token: string | null; portal_slug: string | null;
        portal_token_created_at: string | null; portal_last_access: string | null;
        portal_views: number; tenant_id: string;
      };
    },
  });

  const logs = useQuery({
    queryKey: ["portal-logs", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_access_logs")
        .select("accessed_at,ip,user_agent")
        .eq("student_id", studentId)
        .order("accessed_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as { accessed_at: string; ip: string | null; user_agent: string | null }[];
    },
  });

  const setEnabled = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase.rpc("portal_set_enabled", { _student: studentId, _enabled: enabled });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-portal", studentId] });
      qc.invalidateQueries({ queryKey: ["student-portal-min", studentId] });
      toast.success("Atualizado");
    },
    onError: (e: any) => {
      console.error("[portal_set_enabled]", e);
      const msg = e?.message || e?.error_description || e?.hint || e?.details || (typeof e === "string" ? e : JSON.stringify(e, null, 2));
      toast.error(msg);
    },
  });

  const regenerate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("portal_regenerate_token", { _student: studentId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-portal", studentId] });
      qc.invalidateQueries({ queryKey: ["student-portal-min", studentId] });
      toast.success("Novo link gerado");
    },
    onError: (e: any) => {
      console.error("[portal_regenerate_token]", e);
      const msg = e?.message || e?.error_description || e?.hint || e?.details || (typeof e === "string" ? e : JSON.stringify(e, null, 2));
      toast.error(msg);
    },
  });

  const tok = portal.data?.portal_token;
  const slug = portal.data?.portal_slug;
  const key = slug ?? tok;
  const url = key ? `${typeof window !== "undefined" ? window.location.origin : ""}${slug ? "/p/" : "/portal/aluno/"}${key}` : "";
  const active = !!portal.data?.portal_enabled && !!key;

  const copy = () => { navigator.clipboard.writeText(url); toast.success("Link copiado"); };
  const wapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Acompanhe ${studentName}: ${url}`)}`, "_blank");

  if (portal.isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-gradient-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold">Portal do Aluno</h3>
            <p className="text-xs text-muted-foreground">
              Link público para a família acompanhar a evolução, sem necessidade de login.
            </p>
          </div>
          <span className={cn("rounded-full border px-3 py-1 text-xs font-medium",
            active ? "border-success/40 bg-success/15 text-success" : "border-border bg-muted text-muted-foreground")}>
            {active ? "Ativo" : "Inativo"}
          </span>
        </div>

        {!key ? (
          <Button className="mt-4 bg-gradient-brand text-primary-foreground hover:opacity-90" onClick={() => setEnabled.mutate(true)} disabled={setEnabled.isPending}>
            Ativar portal
          </Button>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Input readOnly value={url} className="flex-1 min-w-[240px] font-mono text-xs" />
              <Button variant="outline" size="sm" onClick={copy}>Copiar</Button>
              <Button variant="outline" size="sm" onClick={wapp}>WhatsApp</Button>
              <Button variant="outline" size="sm" onClick={() => regenerate.mutate()} disabled={regenerate.isPending}>Regenerar</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setEnabled.mutate(!active)}>
                {active ? "Desativar" : "Reativar"}
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Acessos" value={String(portal.data?.portal_views ?? 0)} />
              <Stat label="Último acesso" value={portal.data?.portal_last_access ? new Date(portal.data.portal_last_access).toLocaleString("pt-BR") : "—"} />
              <Stat label="Token criado" value={portal.data?.portal_token_created_at ? new Date(portal.data.portal_token_created_at).toLocaleDateString("pt-BR") : "—"} />
              <Stat label="Status" value={active ? "Ativo" : "Inativo"} />
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <h4 className="mb-2 text-sm font-display font-semibold">Histórico de acessos</h4>
        {!logs.data || logs.data.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sem acessos registrados.</p>
        ) : (
          <ul className="divide-y divide-border text-xs">
            {logs.data.map((l, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span>{new Date(l.accessed_at).toLocaleString("pt-BR")}</span>
                <span className="text-muted-foreground">{l.ip ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card/60 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

// ===========================================================================
// Quick Measure Dialog — atualização rápida de peso/altura/cintura
// ===========================================================================
function QuickMeasureDialog({
  open, onOpenChange, studentId, tenantId, student, onSaved,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  studentId: string;
  tenantId: string | null;
  student: { full_name: string; sex: "male" | "female"; birth_date: string };
  onSaved?: () => void;
}) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setWeight(""); setHeight(""); setWaist("");
    (async () => {
      const { data } = await supabase
        .from("evaluations")
        .select("weight_kg,height_cm,waist_cm")
        .eq("student_id", studentId)
        .order("evaluated_at", { ascending: false })
        .limit(1).maybeSingle();
      if (data) {
        if (data.weight_kg != null) setWeight(String(data.weight_kg));
        if (data.height_cm != null) setHeight(String(data.height_cm));
        const w = (data as { waist_cm: number | null }).waist_cm;
        if (w != null) setWaist(String(w));
      }
    })();
  }, [open, studentId]);

  const save = async () => {
    if (!tenantId) { toast.error("Sem tenant"); return; }
    const w = weight ? Number(weight) : null;
    const h = height ? Number(height) : null;
    const c = waist ? Number(waist) : null;
    if (w == null && h == null && c == null) { toast.error("Preencha ao menos um campo"); return; }
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const age = ageFromBirth(student.birth_date, new Date(today));
      const imc = w && h ? +(w / Math.pow(h / 100, 2)).toFixed(2) : null;
      const rce = c && h ? +(c / h).toFixed(3) : null;
      const payload: Record<string, unknown> = {
        tenant_id: tenantId, student_id: studentId, evaluated_at: today, age_years: age, sex: student.sex,
      };
      if (w != null) payload.weight_kg = w;
      if (h != null) payload.height_cm = h;
      if (c != null) payload.waist_cm = c;
      if (imc != null) payload.imc = imc;
      if (rce != null) payload.rce = rce;
      const { error } = await supabase
        .from("evaluations")
        .upsert(payload as never, { onConflict: "student_id,evaluated_at" });
      if (error) throw error;
      toast.success("Medidas atualizadas");
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar peso, altura e cintura</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{student.full_name} — registro de hoje</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Peso (kg)</Label>
              <Input type="number" step="0.1" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Altura (cm)</Label>
              <Input type="number" step="0.1" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cintura (cm)</Label>
              <Input type="number" step="0.1" inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================================
// AI REPORT — Análise holística do aluno via IA (ProMetric Model)
// ===========================================================================
function AIReportSection({ studentId }: { studentId: string }) {
  type Report = {
    resumo_geral: string;
    evolucao: string;
    pontos_fortes: string[];
    pontos_atencao: string[];
    recomendacoes: string[];
    conclusao: string;
    provider: string;
    source: string;
    promptVersion: string;
    generatedAt: string;
  };
  const storageKey = `ai-student-report:${studentId}`;
  const [report, setReport] = useState<Report | null>(() => {
    if (typeof window === "undefined") return null;
    try { const raw = window.localStorage.getItem(storageKey); return raw ? JSON.parse(raw) as Report : null; } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { generateStudentReport } = await import("@/lib/ai-student-report.functions");
      const r = await generateStudentReport({ data: { studentId } }) as Report;
      setReport(r);
      try { window.localStorage.setItem(storageKey, JSON.stringify(r)); } catch { /* noop */ }
      toast.success("Relatório gerado pela IA");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-card p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" /> Análise Automática (IA)
        </h2>
        <Button onClick={run} disabled={loading} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <Sparkles className="mr-1.5 h-4 w-4" />
          {loading ? "Analisando…" : report ? "Regenerar Relatório" : "Gerar Relatório com IA"}
        </Button>
      </div>
      {!report ? (
        <p className="text-xs text-muted-foreground">
          A IA configurada irá analisar todo o histórico do aluno seguindo a metodologia ProMetric® e produzir um parecer estruturado (resumo, evolução, pontos fortes, atenção, recomendações e conclusão).
        </p>
      ) : (
        <div className="space-y-4 text-sm">
          <ReportBlock title="Resumo Geral" text={report.resumo_geral} />
          <ReportBlock title="Evolução" text={report.evolucao} />
          <ReportList title="Pontos Fortes" items={report.pontos_fortes} tone="good" />
          <ReportList title="Pontos de Atenção" items={report.pontos_atencao} tone="warn" />
          <ReportList title="Recomendações" items={report.recomendacoes} tone="info" />
          <ReportBlock title="Conclusão" text={report.conclusao} />
          <p className="text-[10px] text-muted-foreground">
            Gerado em {new Date(report.generatedAt).toLocaleString("pt-BR")} • Modelo ProMetric® {report.promptVersion} • via {report.provider} ({report.source})
          </p>
        </div>
      )}
    </div>
  );
}

function ReportBlock({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="mb-1 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <p className="whitespace-pre-wrap text-foreground/90">{text}</p>
    </div>
  );
}

function ReportList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "warn" | "info" }) {
  if (!items?.length) return null;
  const icon = tone === "good" ? "🟢" : tone === "warn" ? "🟡" : "🔵";
  return (
    <div>
      <h3 className="mb-1 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex items-start gap-2"><span aria-hidden>{icon}</span><span className="text-foreground/90">{t}</span></li>
        ))}
      </ul>
    </div>
  );
}
