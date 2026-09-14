import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, Download, FileDown, GraduationCap, Palette, TrendingUp, UserPlus, Users, UsersRound, Zap } from "lucide-react";
import { ActionBar, type ActionItem } from "@/components/layout/action-bar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentTenant } from "@/hooks/use-tenant";
import {
  aggregateCohort, peerDimensions, topByIndicator,
  type CohortStudentLatest, type CohortFirst,
} from "@/lib/cohort-stats";
import { SummaryKPIs } from "@/components/analytics/summary-kpis";
import { DistributionChart } from "@/components/analytics/distribution-chart";
import { AggregateRadar } from "@/components/analytics/aggregate-radar";
import { RankingTable } from "@/components/analytics/ranking-table";
import { RiskMap } from "@/components/analytics/risk-map";
import { generateCohortPDF } from "@/lib/pdf-cohort-report";
import { categoryColor, prometricIndex, scoreToCategory, type PMCategory } from "@/lib/prometric-method";
import type { Classifications } from "@/lib/proesp";
import { cn } from "@/lib/utils";
import { SituationDistribution } from "@/components/prometric-reference";
import { BrandingForm } from "@/components/branding/branding-form";
import { resolveBrandingChain, hexToRgb, resolveLogoUrl, fetchImageDataUrl } from "@/lib/branding";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { NoDataState } from "@/components/layout/no-data-state";

export const Route = createFileRoute("/_authenticated/schools/$id")({
  head: () => ({ meta: [{ title: "Dashboard da Escola — ProMetric" }] }),
  component: SchoolDashboard,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-6 text-sm">Escola não encontrada.</div>,
});

type ClassRollup = {
  class_id: string; class_name: string; grade: string | null;
  students_count: number; classifications: (Classifications | null)[];
};
type GroupRollup = {
  group_id: string; group_name: string; color: string | null;
  students_count: number; classifications: (Classifications | null)[];
};

type StatsPayload = {
  header: {
    id: string; name: string; city: string | null; state: string | null;
    network: string | null; logo_url: string | null;
    classes_count: number; students_count: number; groups_count: number;
    evaluations_count: number; last_evaluation_at: string | null;
  };
  students_latest: CohortStudentLatest[];
  students_first: CohortFirst[];
  classes: ClassRollup[];
  groups: GroupRollup[];
};

type RankRow = { id: string; name: string; meta: string; score: number; category: PMCategory | null; students: number };

function rollupRank(rows: { id: string; name: string; meta: string; students: number; classifications: (Classifications | null)[] }[]): RankRow[] {
  return rows.map((r) => {
    const scores = r.classifications
      .filter(Boolean)
      .map((c) => prometricIndex(c as Classifications).score);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { id: r.id, name: r.name, meta: r.meta, students: r.students, score: avg, category: scores.length ? scoreToCategory(avg) : null };
  }).sort((a, b) => b.score - a.score);
}

function SchoolDashboard() {
  const { id } = Route.useParams();
  const { tenant, tenantId } = useCurrentTenant();
  const [sortClasses, setSortClasses] = useState<"score" | "students" | "name">("score");
  const [sortGroups, setSortGroups] = useState<"score" | "students" | "name">("score");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["school-stats", id],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("school_stats", { _school: id });
      if (error) throw error;
      return data as unknown as StatsPayload | null;
    },
  });

  const schoolEntity = useQuery({
    queryKey: ["school-entity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("id,tenant_id,name,display_name,primary_color,secondary_color,description,logo_url")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const brand = useMemo(
    () => resolveBrandingChain(null, schoolEntity.data ?? null, tenant ?? null),
    [schoolEntity.data, tenant],
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

  const agg = useMemo(() => q.data ? aggregateCohort(q.data.students_latest, q.data.students_first) : null, [q.data]);
  const allClassifications = useMemo(() =>
    q.data ? q.data.students_latest.map((s) => s.classifications) : [],
    [q.data]);
  const schoolDims = useMemo(() => peerDimensions(allClassifications), [allClassifications]);

  const classRank = useMemo(() => {
    if (!q.data) return [];
    const rows = rollupRank(q.data.classes.map((c) => ({
      id: c.class_id, name: c.class_name, meta: c.grade ?? "—",
      students: c.students_count, classifications: c.classifications,
    })));
    if (sortClasses === "students") rows.sort((a, b) => b.students - a.students);
    if (sortClasses === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [q.data, sortClasses]);

  const groupRank = useMemo(() => {
    if (!q.data) return [];
    const rows = rollupRank(q.data.groups.map((g) => ({
      id: g.group_id, name: g.group_name, meta: g.color ?? "—",
      students: g.students_count, classifications: g.classifications,
    })));
    if (sortGroups === "students") rows.sort((a, b) => b.students - a.students);
    if (sortGroups === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [q.data, sortGroups]);

  if (q.isLoading) return <div className="p-6 text-sm text-muted-foreground">Carregando dashboard…</div>;
  if (!q.data || !agg) return <div className="p-6 text-sm">Escola não encontrada.</div>;

  const { header, students_latest } = q.data;
  const last = header.last_evaluation_at
    ? new Date(header.last_evaluation_at).toLocaleDateString("pt-BR")
    : "—";

  const distCounts = agg.distribution.reduce<Record<string, number>>((acc, d) => { acc[d.category] = d.count; return acc; }, {});

  const handlePDF = () => {
    generateCohortPDF({
      kind: "Escola",
      tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
      cohortName: brand.displayName === "ProMetric" ? header.name : brand.displayName,
      subtitle: [header.network, [header.city, header.state].filter(Boolean).join("/")].filter(Boolean).join(" • ") || undefined,
      agg,
      branding: {
        primaryColor: hexToRgb(brand.primaryColor),
        logoDataUrl,
        displayName: brand.displayName,
      },
      rankings: [
        { title: "Ranking de Turmas", rows: classRank.slice(0, 15).map((r) => ({ full_name: r.name, value: r.score, unit: `/100 (${r.students} alunos)` })) },
        { title: "Ranking de Grupos", rows: groupRank.slice(0, 15).map((r) => ({ full_name: r.name, value: r.score, unit: `/100 (${r.students} integrantes)` })) },
        { title: "Top 10 — Índice ProMetric", rows: agg.students.slice(0, 10).map((s) => ({ full_name: s.full_name, value: s.score, unit: "/100" })) },
        { title: "Top 10 — Maior Evolução", rows: agg.topGains.map((s) => ({ full_name: s.full_name, value: `${(s.evolution ?? 0) >= 0 ? "+" : ""}${s.evolution}`, unit: "pts" })) },
        { title: "Top 10 — Resistência (6min)", rows: topByIndicator(students_latest, "run_6min_m", true).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(0), unit: "m" })) },
      ],
    });
  };

  const accent = brand.primaryColor;

  const exportData = () => {
    const headers = ["Aluno", "Score", "Categoria"];
    const rows = agg.students.map((s) => [s.full_name, String(s.score), s.category ?? ""]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `escola-${header.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const actions: ActionItem[] = [
    { label: "Relatório Institucional", icon: FileDown, primary: true, onClick: handlePDF },
    { label: "Nova Turma", icon: GraduationCap, to: "/classes" },
    { label: "Novo Grupo", icon: UsersRound, to: "/groups" },
    { label: "Cadastrar Aluno", icon: UserPlus, to: "/students" },
    { label: "Nova Avaliação", icon: Zap, to: "/quick-eval", search: { school: id } },
    { label: "Dashboard Executivo", icon: TrendingUp, to: "/executive" },
    { label: "Exportar Dados (CSV)", icon: Download, onClick: exportData },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Escolas", to: "/schools" },
          { label: brand.displayName === "ProMetric" ? header.name : brand.displayName },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/schools"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          {logoDataUrl ? (
            <img src={logoDataUrl} alt={brand.displayName} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: `${accent}22`, color: accent }}>
              <Building2 className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold sm:text-2xl" style={{ color: accent }}>{brand.displayName === "ProMetric" ? header.name : brand.displayName}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {[header.network, [header.city, header.state].filter(Boolean).join("/"), last && `Última avaliação: ${last}`].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        <ActionBar actions={actions} />
      </div>

      <SummaryKPIs
        items={[
          { label: "Turmas", value: header.classes_count },
          { label: "Grupos", value: header.groups_count },
          { label: "Alunos", value: header.students_count, hint: `${agg.evaluatedCount} avaliados` },
          { label: "Avaliações", value: header.evaluations_count },
          { label: "Índice médio", value: `${agg.avgScore}/100`, tone: "primary" },
          { label: "Classificação", value: agg.avgCategory ?? "—", tone: agg.avgCategory === "Excelente" ? "success" : agg.avgCategory === "Prioritário" ? "destructive" : "default" },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="Saudáveis" value={(distCounts["Excelente"] ?? 0) + (distCounts["Bom"] ?? 0)} tone="text-emerald-500" />
        <KpiTile label="Em Desenvolvimento" value={distCounts["Em Desenvolvimento"] ?? 0} tone="text-violet-500" />
        <KpiTile label="Atenção" value={distCounts["Atenção"] ?? 0} tone="text-amber-500" />
        <KpiTile label="Prioritários" value={distCounts["Prioritário"] ?? 0} tone="text-red-500" />
      </div>

      {agg.evaluatedCount === 0 && (
        <NoDataState
          title="Esta escola ainda não possui dados para comparação"
          description="Cadastre turmas, vincule alunos e realize avaliações para gerar o dashboard institucional."
          ctas={[
            { label: "Realizar avaliação", to: "/quick-eval", icon: "eval" },
            { label: "Cadastrar turmas", to: "/classes", icon: "students" },
          ]}
        />
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="classes">Turmas</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="attention">Atenção</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="mr-1 h-3.5 w-3.5" /> Identidade Visual</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SituationDistribution
            classifications={students_latest.map((s) => (s.classifications ?? {}) as Classifications)}
            title="Distribuição da escola vs Referência ProMetric®"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 font-display text-sm font-semibold">Radar Institucional</h2>
              <AggregateRadar
                series={[{ name: "Escola", data: schoolDims, color: "hsl(217 91% 60%)" }]}
              />
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 font-display text-sm font-semibold">Distribuição de perfis</h2>
              <DistributionChart rows={agg.distribution} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm font-semibold">Comparação entre turmas</h2>
                <span className="text-xs text-muted-foreground">({classRank.length})</span>
              </div>
              <div className="flex gap-1 text-xs">
                <SortBtn active={sortClasses === "score"} onClick={() => setSortClasses("score")}>Índice</SortBtn>
                <SortBtn active={sortClasses === "students"} onClick={() => setSortClasses("students")}>Alunos</SortBtn>
                <SortBtn active={sortClasses === "name"} onClick={() => setSortClasses("name")}>Nome</SortBtn>
              </div>
            </div>
            <RankList rows={classRank} to="/classes/$id" />
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm font-semibold">Comparação entre grupos</h2>
                <span className="text-xs text-muted-foreground">({groupRank.length})</span>
              </div>
              <div className="flex gap-1 text-xs">
                <SortBtn active={sortGroups === "score"} onClick={() => setSortGroups("score")}>Índice</SortBtn>
                <SortBtn active={sortGroups === "students"} onClick={() => setSortGroups("students")}>Integrantes</SortBtn>
                <SortBtn active={sortGroups === "name"} onClick={() => setSortGroups("name")}>Nome</SortBtn>
              </div>
            </div>
            <RankList rows={groupRank} to="/groups/$id" />
          </div>
        </TabsContent>

        <TabsContent value="attention" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 font-display text-sm font-semibold">Mapa de Risco — {agg.atRisk.length} alunos</h2>
              <RiskMap students={agg.atRisk} />
            </div>
            <RankingTable
              title="Alunos em atenção"
              valueLabel="Score"
              rows={agg.atRisk.slice(0, 20).map((s) => ({ student_id: s.student_id, full_name: s.full_name, value: s.score, unit: "/100", badge: s.category ?? undefined, badgeClass: categoryColor(s.category) }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <BrandingForm
            entity={schoolEntity.data ?? null}
            scope="school"
            table="schools"
            storageFolder={`${tenantId ?? "t"}/schools/${id}`}
            invalidateKeys={[["school-entity", id], ["school-stats", id]]}
            hint="Identidade visual desta escola. Caso vazia, herda automaticamente do Tenant. Aplicada em dashboards, portal do aluno e PDFs."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-2xl font-bold", tone)}>{value}</div>
    </div>
  );
}

function SortBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-md border px-2 py-1", active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
      {children}
    </button>
  );
}

function RankList({ rows, to }: { rows: RankRow[]; to: "/classes/$id" | "/groups/$id" }) {
  if (!rows.length) return <div className="text-xs text-muted-foreground">Sem dados ainda.</div>;
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Nome</th>
            <th className="px-3 py-2 text-right">Alunos</th>
            <th className="px-3 py-2 text-right">Índice</th>
            <th className="px-3 py-2 text-right">Classificação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
              <td className="px-3 py-2">
                <Link to={to} params={{ id: r.id }} className="font-medium hover:text-primary">{r.name}</Link>
                <div className="text-[11px] text-muted-foreground">{r.meta}</div>
              </td>
              <td className="px-3 py-2 text-right">{r.students}</td>
              <td className="px-3 py-2 text-right font-semibold">{r.score}/100</td>
              <td className="px-3 py-2 text-right">
                <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", categoryColor(r.category))}>
                  {r.category ?? "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
