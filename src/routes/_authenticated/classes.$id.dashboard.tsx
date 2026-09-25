import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, Download, FileDown, GraduationCap, Plus, Printer, Users, Zap } from "lucide-react";
import { printSheetsBatch } from "@/lib/sheet/print-batch";
import { ActionBar, type ActionItem } from "@/components/layout/action-bar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { aggregateCohort, peerDimensions, topByIndicator, type CohortStudentLatest, type CohortFirst } from "@/lib/cohort-stats";
import { SummaryKPIs } from "@/components/analytics/summary-kpis";
import { CohortSummaryBanner } from "@/components/analytics/cohort-summary-banner";
import { DistributionChart } from "@/components/analytics/distribution-chart";
import { AggregateRadar } from "@/components/analytics/aggregate-radar";
import { RankingTable } from "@/components/analytics/ranking-table";
import { RiskMap } from "@/components/analytics/risk-map";
import { generateCohortPDF } from "@/lib/pdf-cohort-report";
import { categoryColor } from "@/lib/prometric-method";
import { SituationDistribution } from "@/components/prometric-reference";
import type { Classifications } from "@/lib/proesp";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { NoDataState } from "@/components/layout/no-data-state";

export const Route = createFileRoute("/_authenticated/classes/$id/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard da Turma — ProMetric" }] }),
  component: ClassDashboard,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-6 text-sm">Turma não encontrada.</div>,
});

type StatsPayload = {
  header: {
    id: string; name: string; grade: string | null; school_year: number | null;
    shift: string | null; school_id: string | null; school_name: string | null;
    students_count: number; evaluations_count: number; last_evaluation_at: string | null;
  };
  students_latest: CohortStudentLatest[];
  students_first: CohortFirst[];
  school_latest: (Record<string, string> | null)[];
};

function ClassDashboard() {
  const { id } = Route.useParams();
  const { tenant } = useCurrentTenant();

  const q = useQuery({
    queryKey: ["class-stats", id],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("class_stats", { _class: id });
      if (error) throw error;
      return data as unknown as StatsPayload | null;
    },
  });

  if (q.isLoading) return <div className="p-6 text-sm text-muted-foreground">Carregando dashboard…</div>;
  if (!q.data) return <div className="p-6 text-sm">Turma não encontrada.</div>;

  const { header, students_latest, students_first, school_latest } = q.data;
  const agg = aggregateCohort(students_latest, students_first);
  const schoolDims = peerDimensions(school_latest as never);

  const last = header.last_evaluation_at
    ? new Date(header.last_evaluation_at).toLocaleDateString("pt-BR")
    : "—";

  const handlePDF = () => {
    generateCohortPDF({
      kind: "Turma",
      tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
      cohortName: header.name,
      subtitle: [header.grade, header.school_name].filter(Boolean).join(" • ") || undefined,
      agg,
      rankings: [
        { title: "Top 10 — Índice ProMetric", rows: agg.students.slice(0, 10).map((s) => ({ full_name: s.full_name, value: s.score, unit: "/100" })) },
        { title: "Top 10 — Maior Evolução", rows: agg.topGains.map((s) => ({ full_name: s.full_name, value: `${(s.evolution ?? 0) >= 0 ? "+" : ""}${s.evolution}`, unit: "pts" })) },
        { title: "Top 10 — Velocidade 20m", rows: topByIndicator(students_latest, "sprint_20m_s", false).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(2), unit: "s" })) },
        { title: "Top 10 — Potência (Salto)", rows: topByIndicator(students_latest, "horizontal_jump_cm", true).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(0), unit: "cm" })) },
        { title: "Top 10 — Resistência (6min)", rows: topByIndicator(students_latest, "run_6min_m", true).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(0), unit: "m" })) },
      ],
    });
  };

  const exportCSV = () => {
    const headers = ["Aluno", "Score", "Categoria", "Evolução"];
    const rows = agg.students.map((s) => [s.full_name, String(s.score), s.category ?? "", String(s.evolution ?? "")]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `turma-${header.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintSheets = () =>
    printSheetsBatch(students_latest.map((s) => s.student_id).filter(Boolean) as string[], header.name);

  const actions: ActionItem[] = [
    { label: "Nova Avaliação em Lote", icon: Zap, primary: true, to: "/quick-eval", search: { class: id } },
    { label: "Adicionar Alunos", icon: Plus, to: "/students" },
    { label: "Visualizar Alunos", icon: Users, to: "/classes/$id", params: { id } },
    { label: "Imprimir Fichas da Turma", icon: Printer, onClick: handlePrintSheets },
    { label: "Relatório PDF", icon: FileDown, onClick: handlePDF },
    { label: "Exportar CSV", icon: Download, onClick: exportCSV },
    { label: "Avaliações da Turma", icon: ClipboardList, to: "/evaluations" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Turmas", to: "/classes" },
          ...(header.school_name ? [{ label: header.school_name }] : []),
          { label: header.name, to: "/classes/$id", params: { id } },
          { label: "Resumo" },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/classes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
              <h1 className="truncate font-display text-xl font-bold sm:text-2xl">{header.name}</h1>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {[header.grade, header.school_name, last && `Última avaliação: ${last}`].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        <ActionBar actions={actions} />
      </div>

      <CohortSummaryBanner
        kind="turma"
        cohortName={header.name}
        subtitle={[header.grade, header.school_name].filter(Boolean).join(" • ")}
        totalMembers={header.students_count}
        evaluatedCount={agg.evaluatedCount}
        avgScore={agg.avgScore}
        avgCategory={agg.avgCategory}
        dimensions={agg.dimensions}
        distribution={agg.distribution}
        atRiskCount={agg.atRisk.length}
        topGainsCount={agg.topGains.length}
        lastEvaluationAt={header.last_evaluation_at}
        onPrintSheets={handlePrintSheets}
        onGeneratePDF={handlePDF}
        onExportCSV={exportCSV}
        quickEvalTo="/quick-eval"
        quickEvalSearch={{ class: id }}
      />

      <SummaryKPIs
        items={[
          { label: "Alunos", value: header.students_count, hint: `${agg.evaluatedCount} avaliados` },
          { label: "Avaliações", value: header.evaluations_count },
          { label: "Índice médio", value: `${agg.avgScore}/100`, tone: "primary" },
          { label: "Classificação", value: agg.avgCategory ?? "—", tone: agg.avgCategory === "Excelente" ? "success" : agg.avgCategory === "Prioritário" ? "destructive" : "default" },
        ]}
      />

      {agg.evaluatedCount === 0 ? (
        <NoDataState
          title="Esta turma ainda não possui alunos avaliados"
          description="Realize a primeira avaliação para gerar indicadores, rankings e o relatório institucional desta turma."
          ctas={[
            { label: "Realizar avaliação", to: "/quick-eval", icon: "eval" },
            { label: "Ver alunos", to: "/students", icon: "students" },
          ]}
        />
      ) : (
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="attention">Atenção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SituationDistribution
            classifications={students_latest.map((s) => (s.classifications ?? {}) as Classifications)}
            title="Distribuição da turma vs Referência ProMetric®"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 font-display text-sm font-semibold">Radar — Turma vs Escola</h2>
              <AggregateRadar
                series={[
                  { name: "Turma", data: agg.dimensions, color: "hsl(217 91% 60%)" },
                  { name: "Escola", data: schoolDims, color: "hsl(280 70% 60%)" },
                ]}
              />
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 font-display text-sm font-semibold">Distribuição de perfis</h2>
              <DistributionChart rows={agg.distribution} />
            </div>
          </div>


          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold">Alunos da turma</h2>
              <span className="text-xs text-muted-foreground">({agg.evaluatedCount})</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {agg.students.map((s) => (
                <Link
                  key={s.student_id}
                  to="/students/$id"
                  params={{ id: s.student_id }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 hover:border-primary"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.full_name}</div>
                    <div className="text-[11px] text-muted-foreground">Índice {s.score}/100</div>
                  </div>
                  <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", categoryColor(s.category))}>
                    {s.category ?? "—"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <RankingTable
              title="Top 10 — Índice ProMetric"
              valueLabel="Score"
              rows={agg.students.slice(0, 10).map((s) => ({ student_id: s.student_id, full_name: s.full_name, value: s.score, unit: "/100", badge: s.category ?? undefined, badgeClass: categoryColor(s.category) }))}
            />
            <RankingTable
              title="Top 10 — Maior Evolução"
              valueLabel="Δ pts"
              rows={agg.topGains.map((s) => ({ student_id: s.student_id, full_name: s.full_name, value: `${(s.evolution ?? 0) >= 0 ? "+" : ""}${s.evolution}`, unit: "pts" }))}
            />
            <RankingTable
              title="Top 10 — Velocidade (20m)"
              valueLabel="Tempo"
              rows={topByIndicator(students_latest, "sprint_20m_s", false).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(2), unit: "s" }))}
            />
            <RankingTable
              title="Top 10 — Potência (Salto)"
              valueLabel="cm"
              rows={topByIndicator(students_latest, "horizontal_jump_cm", true).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(0), unit: "cm" }))}
            />
            <RankingTable
              title="Top 10 — Resistência (6min)"
              valueLabel="Distância"
              rows={topByIndicator(students_latest, "run_6min_m", true).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(0), unit: "m" }))}
            />
            <RankingTable
              title="Top 10 — Flexibilidade"
              valueLabel="cm"
              rows={topByIndicator(students_latest, "sit_and_reach_cm", true).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(0), unit: "cm" }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="attention" className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 font-display text-sm font-semibold">Mapa de Risco — {agg.atRisk.length} alunos</h2>
            <RiskMap students={agg.atRisk} />
          </div>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
