import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileDown, Palette, Plus, Printer, Share2, Users, UsersRound, Zap } from "lucide-react";
import { printSheetsBatch } from "@/lib/sheet/print-batch";
import { toast } from "sonner";
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
import { BrandingForm } from "@/components/branding/branding-form";
import { resolveBrandingChain, hexToRgb, resolveLogoUrl, fetchImageDataUrl } from "@/lib/branding";

export const Route = createFileRoute("/_authenticated/groups/$id/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard do Grupo — ProMetric" }] }),
  component: GroupDashboard,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-6 text-sm">Grupo não encontrado.</div>,
});

type StatsPayload = {
  header: {
    id: string; name: string; description: string | null; color: string | null;
    students_count: number; evaluations_count: number; last_evaluation_at: string | null;
  };
  students_latest: CohortStudentLatest[];
  students_first: CohortFirst[];
  origin_classes_latest: (Record<string, string> | null)[];
  school_latest: (Record<string, string> | null)[];
};

function GroupDashboard() {
  const { id } = Route.useParams();
  const { tenant, tenantId } = useCurrentTenant();
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["group-stats", id],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("group_stats", { _group: id });
      if (error) throw error;
      return data as unknown as StatsPayload | null;
    },
  });

  const groupEntity = useQuery({
    queryKey: ["group-entity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id,tenant_id,name,display_name,primary_color,secondary_color,description,logo_url")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const brand = useMemo(
    () => resolveBrandingChain(groupEntity.data ?? null, null, tenant ?? null),
    [groupEntity.data, tenant],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const url = await resolveLogoUrl(brand.logoUrl);
      const data = url ? await fetchImageDataUrl(url) : null;
      if (alive) setLogoDataUrl(data);
    })();
    return () => { alive = false; };
  }, [brand.logoUrl]);

  if (q.isLoading) return <div className="p-6 text-sm text-muted-foreground">Carregando dashboard…</div>;
  if (!q.data) return <div className="p-6 text-sm">Grupo não encontrado.</div>;

  const { header, students_latest, students_first, origin_classes_latest, school_latest } = q.data;
  const agg = aggregateCohort(students_latest, students_first);
  const originDims = peerDimensions(origin_classes_latest as never);
  const schoolDims = peerDimensions(school_latest as never);
  const last = header.last_evaluation_at ? new Date(header.last_evaluation_at).toLocaleDateString("pt-BR") : "—";

  const handlePDF = () => {
    generateCohortPDF({
      kind: "Grupo",
      tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
      cohortName: brand.displayName === "ProMetric" ? header.name : brand.displayName,
      subtitle: header.description ?? undefined,
      agg,
      branding: {
        primaryColor: hexToRgb(brand.primaryColor),
        logoDataUrl,
        displayName: brand.displayName,
      },
      rankings: [
        { title: "Top 10 — Índice ProMetric", rows: agg.students.slice(0, 10).map((s) => ({ full_name: s.full_name, value: s.score, unit: "/100" })) },
        { title: "Top 10 — Velocidade 20m", rows: topByIndicator(students_latest, "sprint_20m_s", false).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(2), unit: "s" })) },
        { title: "Top 10 — Potência (Salto)", rows: topByIndicator(students_latest, "horizontal_jump_cm", true).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(0), unit: "cm" })) },
        { title: "Top 10 — Resistência (6min)", rows: topByIndicator(students_latest, "run_6min_m", true).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(0), unit: "m" })) },
      ],
    });
  };

  const accent = brand.primaryColor;

  const shareDashboard = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try { await navigator.clipboard.writeText(url); toast.success("Link do dashboard copiado"); }
    catch { toast.error("Não foi possível copiar o link"); }
  };

  const handlePrintSheets = () =>
    printSheetsBatch(students_latest.map((s) => s.student_id).filter(Boolean) as string[], header.name);

  const actions: ActionItem[] = [
    { label: "Nova Avaliação", icon: Zap, primary: true, to: "/quick-eval" },
    { label: "Adicionar Integrantes", icon: Plus, to: "/groups/$id", params: { id } },
    { label: "Visualizar Integrantes", icon: Users, to: "/groups/$id", params: { id } },
    { label: "Imprimir Fichas do Grupo", icon: Printer, onClick: handlePrintSheets },
    { label: "Relatório da Equipe (PDF)", icon: FileDown, onClick: handlePDF },
    { label: "Compartilhar Dashboard", icon: Share2, onClick: shareDashboard },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Grupos", to: "/groups" },
          { label: brand.displayName === "ProMetric" ? header.name : brand.displayName, to: "/groups/$id", params: { id } },
          { label: "Resumo" },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/groups"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          {logoDataUrl ? (
            <img src={logoDataUrl} alt={brand.displayName} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: `${accent}22`, color: accent }}>
              <UsersRound className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold sm:text-2xl" style={{ color: accent }}>{brand.displayName === "ProMetric" ? header.name : brand.displayName}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {[header.description, `Última avaliação: ${last}`].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        <ActionBar actions={actions} />
      </div>

      <CohortSummaryBanner
        kind="grupo"
        cohortName={brand.displayName === "ProMetric" ? header.name : brand.displayName}
        subtitle={header.description ?? undefined}
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
        quickEvalTo="/quick-eval"
      />

      <SummaryKPIs
        items={[
          { label: "Integrantes", value: header.students_count, hint: `${agg.evaluatedCount} avaliados` },
          { label: "Avaliações", value: header.evaluations_count },
          { label: "Índice médio", value: `${agg.avgScore}/100`, tone: "primary" },
          { label: "Classificação", value: agg.avgCategory ?? "—", tone: agg.avgCategory === "Excelente" ? "success" : agg.avgCategory === "Prioritário" ? "destructive" : "default" },
        ]}
      />

      {agg.evaluatedCount === 0 && (
        <NoDataState
          title="Este grupo ainda não possui avaliações suficientes"
          description="Vincule alunos ao grupo e realize avaliações para gerar indicadores, comparativos e relatórios."
          ctas={[
            { label: "Realizar avaliação", to: "/quick-eval", icon: "eval" },
            { label: "Gerenciar alunos", to: "/students", icon: "students" },
          ]}
        />
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="rankings">Rankings Esportivos</TabsTrigger>
          <TabsTrigger value="attention">Atenção</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="mr-1 h-3.5 w-3.5" /> Identidade Visual</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SituationDistribution
            classifications={students_latest.map((s) => (s.classifications ?? {}) as Classifications)}
            title="Distribuição do grupo vs Referência ProMetric®"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 font-display text-sm font-semibold">Radar — Grupo vs Turmas vs Escola</h2>
              <AggregateRadar
                series={[
                  { name: "Grupo", data: agg.dimensions, color: "hsl(160 70% 45%)" },
                  { name: "Turmas", data: originDims, color: "hsl(217 91% 60%)" },
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
            <h2 className="mb-3 font-display text-sm font-semibold">Atletas em destaque</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {agg.students.slice(0, 9).map((s) => (
                <Link key={s.student_id} to="/students/$id" params={{ id: s.student_id }} className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 hover:border-primary">
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
            <RankingTable title="Top 10 — Velocidade (20m)" valueLabel="Tempo"
              rows={topByIndicator(students_latest, "sprint_20m_s", false).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(2), unit: "s" }))} />
            <RankingTable title="Top 10 — Potência (Salto)" valueLabel="cm"
              rows={topByIndicator(students_latest, "horizontal_jump_cm", true).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(0), unit: "cm" }))} />
            <RankingTable title="Top 10 — Resistência (6min)" valueLabel="Distância"
              rows={topByIndicator(students_latest, "run_6min_m", true).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(0), unit: "m" }))} />
            <RankingTable title="Top 10 — Índice ProMetric" valueLabel="Score"
              rows={agg.students.slice(0, 10).map((s) => ({ student_id: s.student_id, full_name: s.full_name, value: s.score, unit: "/100", badge: s.category ?? undefined, badgeClass: categoryColor(s.category) }))} />
            <RankingTable title="Top 10 — Agilidade (Quadrado)" valueLabel="Tempo"
              rows={topByIndicator(students_latest, "square_test_s", false).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(2), unit: "s" }))} />
            <RankingTable title="Top 10 — Med. Ball" valueLabel="m"
              rows={topByIndicator(students_latest, "medicine_ball_m", true).map((r) => ({ student_id: r.student_id, full_name: r.full_name, value: r.value.toFixed(2), unit: "m" }))} />
          </div>
        </TabsContent>

        <TabsContent value="attention" className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 font-display text-sm font-semibold">Atletas em atenção — {agg.atRisk.length}</h2>
            <RiskMap students={agg.atRisk} />
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <BrandingForm
            entity={groupEntity.data ?? null}
            scope="group"
            table="groups"
            storageFolder={`${tenantId ?? "t"}/groups/${id}`}
            invalidateKeys={[["group-entity", id], ["group-stats", id]]}
            hint="Identidade visual deste grupo (equipe esportiva, projeto, treinamento). Herda da Escola/Tenant quando vazia."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
