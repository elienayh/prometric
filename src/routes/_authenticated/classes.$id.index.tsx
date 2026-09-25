import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileDown,
  Filter,
  GraduationCap,
  LayoutGrid,
  List,
  Printer,
  Search,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentTenant } from "@/hooks/use-tenant";
import {
  aggregateCohort,
  peerDimensions,
  topByIndicator,
  fetchClassCohortStats,
  type CohortStudentLatest,
  type CohortFirst,
  type StatsPayload,
} from "@/lib/cohort-stats";
import { CohortSummaryBanner } from "@/components/analytics/cohort-summary-banner";
import { AggregateRadar } from "@/components/analytics/aggregate-radar";
import { DistributionChart } from "@/components/analytics/distribution-chart";
import { RankingTable } from "@/components/analytics/ranking-table";
import { RiskMap } from "@/components/analytics/risk-map";
import { SituationDistribution } from "@/components/prometric-reference";
import { generateCohortPDF } from "@/lib/pdf-cohort-report";
import { printSheetsBatch } from "@/lib/sheet/print-batch";
import { categoryColor, type PMCategory } from "@/lib/prometric-method";
import type { Classifications } from "@/lib/proesp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/classes/$id/")({
  head: () => ({ meta: [{ title: "Turma & Médias dos Alunos — ProMetric" }] }),
  component: ClassStudentsPage,
});

type ClassInfo = {
  id: string;
  name: string;
  grade: string | null;
  school_year: number | null;
  shift: string | null;
  school_id: string | null;
  school: { name: string } | null;
};

type StudentRow = {
  id: string;
  full_name: string;
  sex: "male" | "female";
  birth_date: string;
  is_active: boolean;
};

function ageFrom(birth: string) {
  const b = new Date(birth);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

const shiftLabels: Record<string, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
  full: "Integral",
};

function ClassStudentsPage() {
  const { id } = Route.useParams();
  const { tenant } = useCurrentTenant();

  const [activeTab, setActiveTab] = useState<"students" | "dashboard">("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "evaluated" | "pending" | "atRisk">("all");
  const [sortBy, setSortBy] = useState<"name" | "scoreDesc" | "scoreAsc" | "gain" | "age">("name");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Basic class information
  const info = useQuery({
    queryKey: ["class-info", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id,name,grade,school_year,shift,school_id,school:schools(name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ClassInfo | null;
    },
  });

  // All registered students for this class
  const students = useQuery({
    queryKey: ["class-students", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,sex,birth_date,is_active")
        .eq("class_id", id)
        .order("full_name");
      if (error) throw error;
      return data as StudentRow[];
    },
  });

  // Cohort statistics & evaluations (alimentado de forma resiliente)
  const stats = useQuery({
    queryKey: ["class-stats", id],
    staleTime: 60 * 1000,
    queryFn: async () => fetchClassCohortStats(id),
  });

  const c = info.data;
  const statsData = stats.data;

  // Aggregate stats using existing helper
  const agg = useMemo(() => {
    if (!statsData) return null;
    return aggregateCohort(statsData.students_latest, statsData.students_first);
  }, [statsData]);

  const schoolDims = useMemo(() => {
    if (!statsData?.school_latest) return [];
    return peerDimensions(statsData.school_latest as never);
  }, [statsData]);

  // Merge full roster with latest evaluation data
  const mergedStudents = useMemo(() => {
    const list = students.data ?? [];
    const latestMap = new Map<string, CohortStudentLatest>();
    statsData?.students_latest.forEach((s) => latestMap.set(s.student_id, s));

    const aggStudentMap = new Map<string, { score: number; category: PMCategory | null; evolution: number | null }>();
    agg?.students.forEach((s) => aggStudentMap.set(s.student_id, s));

    return list.map((student) => {
      const latest = latestMap.get(student.id) ?? null;
      const scoreInfo = aggStudentMap.get(student.id) ?? null;
      return {
        ...student,
        age: ageFrom(student.birth_date),
        isEvaluated: !!latest,
        score: scoreInfo?.score ?? null,
        category: scoreInfo?.category ?? null,
        evolution: scoreInfo?.evolution ?? null,
        latestEvaluationAt: latest?.evaluated_at ?? null,
        // Detailed indicators for average display
        jumpCm: latest?.horizontal_jump_cm ?? null,
        sprintS: latest?.sprint_20m_s ?? null,
        runM: latest?.run_6min_m ?? null,
        sitAndReachCm: latest?.sit_and_reach_cm ?? null,
        abdominalReps: latest?.abdominal_reps ?? null,
        medicineBallM: latest?.medicine_ball_m ?? null,
        imc: latest?.imc ?? null,
      };
    });
  }, [students.data, statsData, agg]);

  // Filtered & sorted student list
  const filteredStudents = useMemo(() => {
    return mergedStudents
      .filter((s) => {
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          if (!s.full_name.toLowerCase().includes(term)) return false;
        }
        if (statusFilter === "evaluated" && !s.isEvaluated) return false;
        if (statusFilter === "pending" && s.isEvaluated) return false;
        if (statusFilter === "atRisk" && !(s.category === "Prioritário" || s.category === "Atenção")) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.full_name.localeCompare(b.full_name);
        if (sortBy === "scoreDesc") return (b.score ?? -1) - (a.score ?? -1);
        if (sortBy === "scoreAsc") return (a.score ?? 999) - (b.score ?? 999);
        if (sortBy === "gain") return (b.evolution ?? -999) - (a.evolution ?? -999);
        if (sortBy === "age") return b.age - a.age;
        return 0;
      });
  }, [mergedStudents, searchTerm, statusFilter, sortBy]);

  // Handlers for exporting and printing
  const handlePrintSheets = () => {
    if (!statsData) return;
    printSheetsBatch(
      statsData.students_latest.map((s) => s.student_id).filter(Boolean),
      c?.name ?? "Turma",
    );
  };

  const handleGeneratePDF = () => {
    if (!agg || !c) return;
    generateCohortPDF({
      kind: "Turma",
      tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
      cohortName: c.name,
      subtitle: [c.grade, c.school?.name].filter(Boolean).join(" • ") || undefined,
      agg,
      rankings: [
        {
          title: "Top 10 — Índice ProMetric",
          rows: agg.students.slice(0, 10).map((s) => ({ full_name: s.full_name, value: s.score, unit: "/100" })),
        },
        {
          title: "Top 10 — Maior Evolução",
          rows: agg.topGains.map((s) => ({ full_name: s.full_name, value: `${(s.evolution ?? 0) >= 0 ? "+" : ""}${s.evolution}`, unit: "pts" })),
        },
        {
          title: "Top 10 — Velocidade 20m",
          rows: topByIndicator(statsData?.students_latest ?? [], "sprint_20m_s", false).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(2), unit: "s" })),
        },
        {
          title: "Top 10 — Potência (Salto)",
          rows: topByIndicator(statsData?.students_latest ?? [], "horizontal_jump_cm", true).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(0), unit: "cm" })),
        },
        {
          title: "Top 10 — Resistência (6min)",
          rows: topByIndicator(statsData?.students_latest ?? [], "run_6min_m", true).map((r) => ({ full_name: r.full_name, value: r.value.toFixed(0), unit: "m" })),
        },
      ],
    });
  };

  const handleExportCSV = () => {
    if (!mergedStudents.length) return;
    const headers = [
      "Aluno",
      "Sexo",
      "Idade",
      "Status",
      "Nota ProMetric",
      "Categoria",
      "Evolução (pts)",
      "Salto Horizontal (cm)",
      "Sprint 20m (s)",
      "Corrida 6min (m)",
      "Flexibilidade (cm)",
      "IMC",
      "Última Avaliação",
    ];
    const rows = mergedStudents.map((s) => [
      s.full_name,
      s.sex === "male" ? "M" : "F",
      s.age,
      s.isEvaluated ? "Avaliado" : "Pendente",
      s.score ?? "",
      s.category ?? "",
      s.evolution ?? "",
      s.jumpCm ?? "",
      s.sprintS ?? "",
      s.runM ?? "",
      s.sitAndReachCm ?? "",
      s.imc ?? "",
      s.latestEvaluationAt ? new Date(s.latestEvaluationAt).toLocaleDateString("pt-BR") : "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turma-${c?.name ?? id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const evaluatedCount = agg?.evaluatedCount ?? 0;
  const totalCount = students.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Turmas", to: "/classes" },
          ...(c?.school?.name ? [{ label: c.school.name }] : []),
          { label: c?.name ?? "Turma" },
        ]}
      />

      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/classes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 shrink-0 text-primary" />
              <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
                {c?.name ?? "Turma"}
              </h1>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
              {[
                c?.grade,
                c?.school?.name,
                c?.shift ? shiftLabels[c.shift] : null,
                c?.school_year ? `Ano ${c.school_year}` : null,
                `${totalCount} aluno(s) cadastrado(s)`,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/classes/$id/dashboard" params={{ id }}>
              <BarChart3 className="mr-1.5 h-4 w-4" /> Dashboard Detalhado
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/quick-eval" search={{ class: id }}>
              <Zap className="mr-1.5 h-4 w-4" /> Nova Avaliação
            </Link>
          </Button>
        </div>
      </div>

      {/* Banner Principal: Nota ProMetric da Turma e Breve Resumo Diagnóstico */}
      {agg && (
        <CohortSummaryBanner
          kind="turma"
          cohortName={c?.name ?? "Turma"}
          subtitle={[c?.grade, c?.school?.name].filter(Boolean).join(" • ")}
          totalMembers={totalCount}
          evaluatedCount={evaluatedCount}
          avgScore={agg.avgScore}
          avgCategory={agg.avgCategory}
          dimensions={agg.dimensions}
          distribution={agg.distribution}
          atRiskCount={agg.atRisk.length}
          topGainsCount={agg.topGains.length}
          lastEvaluationAt={statsData?.header.last_evaluation_at}
          onPrintSheets={statsData?.students_latest?.length ? handlePrintSheets : undefined}
          onGeneratePDF={agg.evaluatedCount > 0 ? handleGeneratePDF : undefined}
          onExportCSV={mergedStudents.length > 0 ? handleExportCSV : undefined}
          quickEvalTo="/quick-eval"
          quickEvalSearch={{ class: id }}
          viewDashboardTo="/classes/$id/dashboard"
          viewDashboardParams={{ id }}
        />
      )}

      {/* Navegação entre Visão de Alunos/Médias e Visão Analítica da Turma */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "students" | "dashboard")} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <TabsList>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              <span>Alunos & Médias</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                {totalCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard Analítico</span>
            </TabsTrigger>
          </TabsList>

          {activeTab === "students" && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("cards")}
                aria-label="Visualização em cartões"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("table")}
                aria-label="Visualização em tabela"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                <Link to="/students">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Gerenciar Alunos
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Tab 1: Alunos Cadastrados com suas Médias e Indicadores */}
        <TabsContent value="students" className="mt-4 space-y-4">
          {students.isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Carregando dados dos alunos e médias da turma…
            </div>
          ) : totalCount === 0 ? (
            <EmptyState
              title="Nenhum aluno cadastrado nesta turma"
              description="Vincule alunos a esta turma para visualizar as médias e notas ProMetric."
              actionLabel="Cadastrar ou vincular alunos"
              onAction={() => {}}
            />
          ) : (
            <div className="space-y-4">
              {/* Barra de Filtros e Busca */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar aluno por nome…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={cn(
                        "rounded px-2.5 py-1 font-medium transition-colors",
                        statusFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Todos ({mergedStudents.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("evaluated")}
                      className={cn(
                        "rounded px-2.5 py-1 font-medium transition-colors",
                        statusFilter === "evaluated" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Avaliados ({evaluatedCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter("pending")}
                      className={cn(
                        "rounded px-2.5 py-1 font-medium transition-colors",
                        statusFilter === "pending" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Pendentes ({totalCount - evaluatedCount})
                    </button>
                    {(agg?.atRisk.length ?? 0) > 0 && (
                      <button
                        onClick={() => setStatusFilter("atRisk")}
                        className={cn(
                          "rounded px-2.5 py-1 font-medium transition-colors",
                          statusFilter === "atRisk" ? "bg-destructive text-destructive-foreground" : "text-destructive hover:bg-destructive/10",
                        )}
                      >
                        Atenção ({agg!.atRisk.length})
                      </button>
                    )}
                  </div>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="h-9 w-[180px] text-xs">
                      <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome (A-Z)</SelectItem>
                      <SelectItem value="scoreDesc">Maior Nota ProMetric</SelectItem>
                      <SelectItem value="scoreAsc">Menor Nota ProMetric</SelectItem>
                      <SelectItem value="gain">Maior Evolução</SelectItem>
                      <SelectItem value="age">Idade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Nenhum aluno encontrado com os filtros atuais.
                </div>
              ) : viewMode === "cards" ? (
                /* Cards Grid com Médias de Cada Aluno */
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      className={cn(
                        "relative flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-soft",
                        s.isEvaluated ? "border-border" : "border-border/60 bg-card/60",
                      )}
                    >
                      <div>
                        {/* Header do Card do Aluno */}
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/students/$id"
                            params={{ id: s.id }}
                            className="min-w-0 flex-1 hover:text-primary hover:underline"
                          >
                            <h3 className="truncate font-display text-sm font-semibold">{s.full_name}</h3>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {s.sex === "male" ? "M" : "F"} • {s.age} anos
                              {!s.is_active && " • inativo"}
                            </div>
                          </Link>

                          {/* Nota ProMetric Individual */}
                          {s.isEvaluated && s.score != null ? (
                            <div className="text-right shrink-0">
                              <div className="flex items-baseline justify-end gap-1">
                                <span className="font-display text-lg font-bold tabular-nums text-foreground">
                                  {s.score}
                                </span>
                                <span className="text-[10px] text-muted-foreground">/100</span>
                              </div>
                              <span
                                className={cn(
                                  "inline-block rounded px-1.5 py-0.2 text-[10px] font-semibold",
                                  categoryColor(s.category),
                                )}
                              >
                                {s.category ?? "—"}
                              </span>
                            </div>
                          ) : (
                            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Sem nota
                            </span>
                          )}
                        </div>

                        {/* Indicadores Físicos e Médias do Aluno */}
                        {s.isEvaluated ? (
                          <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-border/50 pt-2.5 text-center text-xs">
                            <div className="rounded bg-muted/30 p-1.5">
                              <span className="block text-[10px] text-muted-foreground">Potência</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {s.jumpCm != null ? `${s.jumpCm} cm` : "—"}
                              </span>
                            </div>
                            <div className="rounded bg-muted/30 p-1.5">
                              <span className="block text-[10px] text-muted-foreground">Velocidade</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {s.sprintS != null ? `${s.sprintS.toFixed(2)}s` : "—"}
                              </span>
                            </div>
                            <div className="rounded bg-muted/30 p-1.5">
                              <span className="block text-[10px] text-muted-foreground">Resistência</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {s.runM != null ? `${s.runM} m` : "—"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-lg border border-dashed border-border/80 bg-muted/20 p-2.5 text-center text-xs text-muted-foreground">
                            Aguardando primeira avaliação diagnóstica
                          </div>
                        )}
                      </div>

                      {/* Footer do Card */}
                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
                        {s.isEvaluated ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {s.evolution != null && (
                              <span
                                className={cn(
                                  "flex items-center font-medium",
                                  s.evolution > 0
                                    ? "text-success"
                                    : s.evolution < 0
                                    ? "text-destructive"
                                    : "text-muted-foreground",
                                )}
                              >
                                {s.evolution > 0 ? (
                                  <TrendingUp className="mr-0.5 h-3 w-3" />
                                ) : s.evolution < 0 ? (
                                  <TrendingDown className="mr-0.5 h-3 w-3" />
                                ) : null}
                                {s.evolution > 0 ? `+${s.evolution}` : s.evolution} pts
                              </span>
                            )}
                            {s.latestEvaluationAt && (
                              <span>
                                Avaliado em {new Date(s.latestEvaluationAt).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-xs text-primary">
                            <Link to="/quick-eval" search={{ class: id }}>
                              <Zap className="mr-1 h-3 w-3" /> Avaliar agora
                            </Link>
                          </Button>
                        )}

                        <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-xs">
                          <Link to="/students/$id" params={{ id: s.id }}>
                            Ficha completa <ChevronRight className="ml-0.5 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Visualização em Tabela Completa de Indicadores e Médias */
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Aluno</th>
                          <th className="px-3 py-3 font-semibold text-center">Nota ProMetric</th>
                          <th className="px-3 py-3 font-semibold text-center">Evolução</th>
                          <th className="px-3 py-3 font-semibold text-center">Salto (Potência)</th>
                          <th className="px-3 py-3 font-semibold text-center">20m (Velocidade)</th>
                          <th className="px-3 py-3 font-semibold text-center">6min (Resistência)</th>
                          <th className="px-3 py-3 font-semibold text-center">Flexibilidade</th>
                          <th className="px-3 py-3 font-semibold text-center">IMC</th>
                          <th className="px-4 py-3 font-semibold text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <Link
                                to="/students/$id"
                                params={{ id: s.id }}
                                className="font-medium text-foreground hover:text-primary hover:underline"
                              >
                                {s.full_name}
                              </Link>
                              <div className="text-[11px] text-muted-foreground">
                                {s.sex === "male" ? "Masc." : "Fem."} • {s.age} anos
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              {s.isEvaluated && s.score != null ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-display font-bold tabular-nums text-foreground">
                                    {s.score}/100
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded px-1.5 py-0.2 text-[9px] font-semibold",
                                      categoryColor(s.category),
                                    )}
                                  >
                                    {s.category ?? "—"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Pendente</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {s.evolution != null ? (
                                <span
                                  className={cn(
                                    "font-semibold tabular-nums",
                                    s.evolution > 0
                                      ? "text-success"
                                      : s.evolution < 0
                                      ? "text-destructive"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {s.evolution > 0 ? `+${s.evolution}` : s.evolution}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-center tabular-nums">
                              {s.jumpCm != null ? `${s.jumpCm} cm` : "—"}
                            </td>
                            <td className="px-3 py-3 text-center tabular-nums">
                              {s.sprintS != null ? `${s.sprintS.toFixed(2)} s` : "—"}
                            </td>
                            <td className="px-3 py-3 text-center tabular-nums">
                              {s.runM != null ? `${s.runM} m` : "—"}
                            </td>
                            <td className="px-3 py-3 text-center tabular-nums">
                              {s.sitAndReachCm != null ? `${s.sitAndReachCm} cm` : "—"}
                            </td>
                            <td className="px-3 py-3 text-center tabular-nums">
                              {s.imc != null ? s.imc.toFixed(1) : "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                                <Link to="/students/$id" params={{ id: s.id }}>
                                  Ver Ficha
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Dashboard Analítico Completo da Turma */}
        <TabsContent value="dashboard" className="mt-4 space-y-5">
          {!agg || agg.evaluatedCount === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Esta turma ainda não possui avaliações concluídas para gerar o radar e distribuição analítica.
              <div className="mt-3">
                <Button size="sm" asChild className="bg-gradient-brand text-primary-foreground">
                  <Link to="/quick-eval" search={{ class: id }}>
                    <Zap className="mr-1.5 h-4 w-4" /> Realizar Avaliação
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <SituationDistribution
                classifications={statsData!.students_latest.map(
                  (s) => (s.classifications ?? {}) as Classifications,
                )}
                title="Distribuição da turma vs Referência ProMetric®"
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold">Radar — Turma vs Escola</h3>
                  <AggregateRadar
                    series={[
                      { name: "Turma", data: agg.dimensions, color: "hsl(217 91% 60%)" },
                      { name: "Escola", data: schoolDims, color: "hsl(280 70% 60%)" },
                    ]}
                  />
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold">Distribuição de perfis</h3>
                  <DistributionChart rows={agg.distribution} />
                </div>
              </div>

              {/* Rankings Top 10 */}
              <div className="grid gap-4 lg:grid-cols-2">
                <RankingTable
                  title="Top 10 — Índice ProMetric"
                  valueLabel="Score"
                  rows={agg.students.slice(0, 10).map((s) => ({
                    student_id: s.student_id,
                    full_name: s.full_name,
                    value: s.score,
                    unit: "/100",
                    badge: s.category ?? undefined,
                    badgeClass: categoryColor(s.category),
                  }))}
                />
                <RankingTable
                  title="Top 10 — Maior Evolução"
                  valueLabel="Δ pts"
                  rows={agg.topGains.map((s) => ({
                    student_id: s.student_id,
                    full_name: s.full_name,
                    value: `${(s.evolution ?? 0) >= 0 ? "+" : ""}${s.evolution}`,
                    unit: "pts",
                  }))}
                />
                <RankingTable
                  title="Top 10 — Potência (Salto Horizontal)"
                  valueLabel="cm"
                  rows={topByIndicator(statsData!.students_latest, "horizontal_jump_cm", true).map((r) => ({
                    student_id: r.student_id,
                    full_name: r.full_name,
                    value: r.value.toFixed(0),
                    unit: "cm",
                  }))}
                />
                <RankingTable
                  title="Top 10 — Velocidade (20m)"
                  valueLabel="Tempo"
                  rows={topByIndicator(statsData!.students_latest, "sprint_20m_s", false).map((r) => ({
                    student_id: r.student_id,
                    full_name: r.full_name,
                    value: r.value.toFixed(2),
                    unit: "s",
                  }))}
                />
              </div>

              {/* Mapa de Risco */}
              {agg.atRisk.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold">
                    Alunos em Atenção — {agg.atRisk.length}
                  </h3>
                  <RiskMap students={agg.atRisk} />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
