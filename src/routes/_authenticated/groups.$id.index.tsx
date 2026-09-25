import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileDown,
  Filter,
  LayoutGrid,
  List,
  Palette,
  Plus,
  Printer,
  Search,
  TrendingDown,
  TrendingUp,
  UserMinus,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  fetchGroupCohortStats,
  type CohortStudentLatest,
  type CohortFirst,
  type GroupStatsPayload,
} from "@/lib/cohort-stats";
import { CohortSummaryBanner } from "@/components/analytics/cohort-summary-banner";
import { AggregateRadar } from "@/components/analytics/aggregate-radar";
import { DistributionChart } from "@/components/analytics/distribution-chart";
import { RankingTable } from "@/components/analytics/ranking-table";
import { RiskMap } from "@/components/analytics/risk-map";
import { SituationDistribution } from "@/components/prometric-reference";
import { BrandingForm } from "@/components/branding/branding-form";
import { resolveBrandingChain, hexToRgb, resolveLogoUrl, fetchImageDataUrl } from "@/lib/branding";
import { generateCohortPDF } from "@/lib/pdf-cohort-report";
import { printSheetsBatch } from "@/lib/sheet/print-batch";
import { categoryColor, type PMCategory } from "@/lib/prometric-method";
import type { Classifications } from "@/lib/proesp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/groups/$id/")({
  head: () => ({ meta: [{ title: "Grupo & Médias dos Integrantes — ProMetric" }] }),
  component: GroupMembersPage,
});

type GroupInfo = {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  logo_url?: string | null;
  tenant_id?: string | null;
};

type StudentRow = {
  id: string;
  full_name: string;
  sex: "male" | "female";
  birth_date: string;
  group_id: string | null;
};

function ageFrom(birth: string) {
  const b = new Date(birth);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

function GroupMembersPage() {
  const { id } = Route.useParams();
  const { tenant, tenantId } = useCurrentTenant();
  const qc = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "dashboard">("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "evaluated" | "pending" | "atRisk">("all");
  const [sortBy, setSortBy] = useState<"name" | "scoreDesc" | "scoreAsc" | "gain" | "age">("name");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // Informações cadastrais do grupo
  const info = useQuery({
    queryKey: ["group-info", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id,tenant_id,name,display_name,description,primary_color,secondary_color,logo_url")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as GroupInfo | null;
    },
  });

  // Integrantes do grupo
  const members = useQuery({
    queryKey: ["group-members", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,sex,birth_date,group_id")
        .eq("group_id", id)
        .order("full_name");
      if (error) throw error;
      return data as StudentRow[];
    },
  });

  // Estatísticas e avaliações do grupo (alimentado de forma resiliente)
  const stats = useQuery({
    queryKey: ["group-stats", id],
    staleTime: 60 * 1000,
    queryFn: async () => fetchGroupCohortStats(id),
  });

  // Remover participante do grupo
  const remove = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase.from("students").update({ group_id: null }).eq("id", studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Participante removido do grupo");
      qc.invalidateQueries({ queryKey: ["group-members", id] });
      qc.invalidateQueries({ queryKey: ["group-stats", id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover"),
  });

  const g = info.data;
  const statsData = stats.data;
  const title = g?.display_name || g?.name || "Grupo";

  // Identidade visual / Branding do grupo
  const brand = useMemo(
    () => resolveBrandingChain(g ?? null, null, tenant ?? null),
    [g, tenant],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const url = await resolveLogoUrl(brand.logoUrl);
      const data = url ? await fetchImageDataUrl(url) : null;
      if (alive) setLogoDataUrl(data);
    })();
    return () => {
      alive = false;
    };
  }, [brand.logoUrl]);

  // Agregações de coorte para o grupo
  const agg = useMemo(() => {
    if (!statsData) return null;
    return aggregateCohort(statsData.students_latest, statsData.students_first);
  }, [statsData]);

  const originDims = useMemo(() => {
    if (!statsData?.origin_classes_latest) return [];
    return peerDimensions(statsData.origin_classes_latest as never);
  }, [statsData]);

  const schoolDims = useMemo(() => {
    if (!statsData?.school_latest) return [];
    return peerDimensions(statsData.school_latest as never);
  }, [statsData]);

  // Mesclar lista de membros com dados analíticos
  const mergedMembers = useMemo(() => {
    const list = members.data ?? [];
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
        jumpCm: latest?.horizontal_jump_cm ?? null,
        sprintS: latest?.sprint_20m_s ?? null,
        runM: latest?.run_6min_m ?? null,
        sitAndReachCm: latest?.sit_and_reach_cm ?? null,
        abdominalReps: latest?.abdominal_reps ?? null,
        medicineBallM: latest?.medicine_ball_m ?? null,
        squareTestS: latest?.square_test_s ?? null,
        imc: latest?.imc ?? null,
      };
    });
  }, [members.data, statsData, agg]);

  // Membros filtrados e ordenados
  const filteredMembers = useMemo(() => {
    return mergedMembers
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
  }, [mergedMembers, searchTerm, statusFilter, sortBy]);

  const handlePrintSheets = () => {
    if (!statsData) return;
    printSheetsBatch(
      statsData.students_latest.map((s) => s.student_id).filter(Boolean),
      title,
    );
  };

  const handleGeneratePDF = () => {
    if (!agg) return;
    generateCohortPDF({
      kind: "Grupo",
      tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
      cohortName: brand.displayName === "ProMetric" ? title : brand.displayName,
      subtitle: g?.description ?? undefined,
      agg,
      branding: {
        primaryColor: hexToRgb(brand.primaryColor),
        logoDataUrl,
        displayName: brand.displayName,
      },
      rankings: [
        {
          title: "Top 10 — Índice ProMetric",
          rows: agg.students.slice(0, 10).map((s) => ({ full_name: s.full_name, value: s.score, unit: "/100" })),
        },
        {
          title: "Top 10 — Velocidade 20m",
          rows: topByIndicator(statsData?.students_latest ?? [], "sprint_20m_s", false).map((r) => ({
            full_name: r.full_name,
            value: r.value.toFixed(2),
            unit: "s",
          })),
        },
        {
          title: "Top 10 — Potência (Salto)",
          rows: topByIndicator(statsData?.students_latest ?? [], "horizontal_jump_cm", true).map((r) => ({
            full_name: r.full_name,
            value: r.value.toFixed(0),
            unit: "cm",
          })),
        },
        {
          title: "Top 10 — Resistência (6min)",
          rows: topByIndicator(statsData?.students_latest ?? [], "run_6min_m", true).map((r) => ({
            full_name: r.full_name,
            value: r.value.toFixed(0),
            unit: "m",
          })),
        },
      ],
    });
  };

  const handleExportCSV = () => {
    if (!mergedMembers.length) return;
    const headers = [
      "Participante",
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
      "Med Ball (m)",
      "Agilidade Quadrado (s)",
      "IMC",
      "Última Avaliação",
    ];
    const rows = mergedMembers.map((s) => [
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
      s.medicineBallM ?? "",
      s.squareTestS ?? "",
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
    a.download = `grupo-${title}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const evaluatedCount = agg?.evaluatedCount ?? 0;
  const totalCount = members.data?.length ?? 0;
  const accent = brand.primaryColor;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Grupos", to: "/groups" }, { label: title }]} />

      {/* Header do Grupo */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {logoDataUrl ? (
            <img src={logoDataUrl} alt={title} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          ) : (
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-bold"
              style={{ background: `${accent}22`, color: accent }}
            >
              <UsersRound className="h-6 w-6" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-bold sm:text-3xl" style={{ color: accent }}>
              {title}
            </h1>
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
              {[g?.description, `${totalCount} participante(s) cadastrado(s)`].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/groups/$id/dashboard" params={{ id }}>
              <BarChart3 className="mr-1.5 h-4 w-4" /> Dashboard do Grupo
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/quick-eval">
              <Zap className="mr-1.5 h-4 w-4" /> Nova Avaliação
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Adicionar Integrantes
          </Button>
        </div>
      </div>

      {/* Banner Principal: Nota ProMetric do Grupo e Breve Resumo Diagnóstico */}
      {agg && (
        <CohortSummaryBanner
          kind="grupo"
          cohortName={title}
          subtitle={g?.description ?? undefined}
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
          onExportCSV={mergedMembers.length > 0 ? handleExportCSV : undefined}
          quickEvalTo="/quick-eval"
          viewDashboardTo="/groups/$id/dashboard"
          viewDashboardParams={{ id }}
        />
      )}

      {/* Abas: Integrantes & Médias vs Dashboard do Grupo */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "members" | "dashboard")} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <TabsList>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              <span>Participantes & Médias</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                {totalCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard Analítico do Grupo</span>
            </TabsTrigger>
          </TabsList>

          {activeTab === "members" && (
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddOpen(true)}
                className="h-8 text-xs"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar Alunos
              </Button>
            </div>
          )}
        </div>

        {/* Tab 1: Lista dos Participantes com Médias Individuais */}
        <TabsContent value="members" className="mt-4 space-y-4">
          {members.isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Carregando participantes e médias do grupo…
            </div>
          ) : totalCount === 0 ? (
            <EmptyState
              title="Nenhum participante neste grupo"
              description="Adicione alunos já cadastrados para compor o grupo e calcular suas médias ProMetric."
              actionLabel="Adicionar participantes"
              onAction={() => setAddOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              {/* Barra de Filtros e Busca */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar participante por nome…"
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
                      Todos ({mergedMembers.length})
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

              {filteredMembers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Nenhum integrante encontrado com os filtros atuais.
                </div>
              ) : viewMode === "cards" ? (
                /* Grid de Cards dos Integrantes com Médias */
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMembers.map((s) => (
                    <div
                      key={s.id}
                      className={cn(
                        "relative flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-soft",
                        s.isEvaluated ? "border-border" : "border-border/60 bg-card/60",
                      )}
                    >
                      <div>
                        {/* Header do Card */}
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/students/$id"
                            params={{ id: s.id }}
                            className="min-w-0 flex-1 hover:text-primary hover:underline"
                          >
                            <h3 className="truncate font-display text-sm font-semibold">{s.full_name}</h3>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {s.sex === "male" ? "Masc." : "Fem."} • {s.age} anos
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

                        {/* Indicadores Físicos do Atleta */}
                        {s.isEvaluated ? (
                          <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-border/50 pt-2.5 text-center text-xs">
                            <div className="rounded bg-muted/30 p-1.5">
                              <span className="block text-[10px] text-muted-foreground">Potência</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {s.jumpCm != null
                                  ? `${s.jumpCm} cm`
                                  : s.medicineBallM != null
                                  ? `${s.medicineBallM} m`
                                  : "—"}
                              </span>
                            </div>
                            <div className="rounded bg-muted/30 p-1.5">
                              <span className="block text-[10px] text-muted-foreground">Velocidade</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {s.sprintS != null
                                  ? `${s.sprintS.toFixed(2)}s`
                                  : s.squareTestS != null
                                  ? `${s.squareTestS.toFixed(2)}s`
                                  : "—"}
                              </span>
                            </div>
                            <div className="rounded bg-muted/30 p-1.5">
                              <span className="block text-[10px] text-muted-foreground">Resistência</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {s.runM != null
                                  ? `${s.runM} m`
                                  : s.abdominalReps != null
                                  ? `${s.abdominalReps} reps`
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-lg border border-dashed border-border/80 bg-muted/20 p-2.5 text-center text-xs text-muted-foreground">
                            Aguardando testes físicos
                          </div>
                        )}
                      </div>

                      {/* Footer do Card com Ações */}
                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
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
                          <Button variant="ghost" size="sm" asChild className="h-6 px-1.5 text-xs">
                            <Link to="/students/$id" params={{ id: s.id }}>
                              Ficha <ChevronRight className="ml-0.5 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:bg-destructive/10"
                          onClick={() => remove.mutate(s.id)}
                          aria-label={`Remover ${s.full_name} do grupo`}
                        >
                          <UserMinus className="mr-1 h-3.5 w-3.5" /> Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Visualização em Tabela Completa de Indicadores */
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Participante</th>
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
                        {filteredMembers.map((s) => (
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
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                                  <Link to="/students/$id" params={{ id: s.id }}>
                                    Ver
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                  onClick={() => remove.mutate(s.id)}
                                >
                                  Remover
                                </Button>
                              </div>
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

        {/* Tab 2: Dashboard Analítico Próprio do Grupo */}
        <TabsContent value="dashboard" className="mt-4 space-y-5">
          {!agg || agg.evaluatedCount === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Este grupo ainda não possui participantes com avaliações para gerar o radar e distribuição analítica.
              <div className="mt-3">
                <Button size="sm" asChild className="bg-gradient-brand text-primary-foreground">
                  <Link to="/quick-eval">
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
                title="Distribuição do grupo vs Referência ProMetric®"
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold">
                    Radar — Grupo vs Turmas vs Escola
                  </h3>
                  <AggregateRadar
                    series={[
                      { name: "Grupo", data: agg.dimensions, color: "hsl(160 70% 45%)" },
                      { name: "Turmas", data: originDims, color: "hsl(217 91% 60%)" },
                      { name: "Escola", data: schoolDims, color: "hsl(280 70% 60%)" },
                    ]}
                  />
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold">Distribuição de perfis</h3>
                  <DistributionChart rows={agg.distribution} />
                </div>
              </div>

              {/* Rankings Esportivos do Grupo */}
              <div className="grid gap-4 lg:grid-cols-2">
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
                <RankingTable
                  title="Top 10 — Potência (Salto)"
                  valueLabel="cm"
                  rows={topByIndicator(statsData!.students_latest, "horizontal_jump_cm", true).map((r) => ({
                    student_id: r.student_id,
                    full_name: r.full_name,
                    value: r.value.toFixed(0),
                    unit: "cm",
                  }))}
                />
                <RankingTable
                  title="Top 10 — Resistência (6min)"
                  valueLabel="Distância"
                  rows={topByIndicator(statsData!.students_latest, "run_6min_m", true).map((r) => ({
                    student_id: r.student_id,
                    full_name: r.full_name,
                    value: r.value.toFixed(0),
                    unit: "m",
                  }))}
                />
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
                  title="Top 10 — Agilidade (Quadrado)"
                  valueLabel="Tempo"
                  rows={topByIndicator(statsData!.students_latest, "square_test_s", false).map((r) => ({
                    student_id: r.student_id,
                    full_name: r.full_name,
                    value: r.value.toFixed(2),
                    unit: "s",
                  }))}
                />
                <RankingTable
                  title="Top 10 — Arremesso Medicine Ball"
                  valueLabel="m"
                  rows={topByIndicator(statsData!.students_latest, "medicine_ball_m", true).map((r) => ({
                    student_id: r.student_id,
                    full_name: r.full_name,
                    value: r.value.toFixed(2),
                    unit: "m",
                  }))}
                />
              </div>

              {/* Atletas em atenção */}
              {agg.atRisk.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold">
                    Atletas em Atenção — {agg.atRisk.length}
                  </h3>
                  <RiskMap students={agg.atRisk} />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal para adicionar participantes */}
      <AddMembersDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        groupId={id}
        tenantId={tenantId}
      />
    </div>
  );
}

function AddMembersDialog({
  open,
  onOpenChange,
  groupId,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  groupId: string;
  tenantId: string | null;
}) {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const pool = useQuery({
    queryKey: ["group-candidates", tenantId, groupId],
    enabled: open && !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,sex,birth_date,group_id")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return (data as StudentRow[]).filter((s) => s.group_id !== groupId);
    },
  });

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    const rows = pool.data ?? [];
    return t ? rows.filter((s) => s.full_name.toLowerCase().includes(t)) : rows;
  }, [pool.data, term]);

  const save = useMutation({
    mutationFn: async () => {
      if (selected.length === 0) throw new Error("Selecione ao menos um aluno");
      const { error } = await supabase.from("students").update({ group_id: groupId }).in("id", selected);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Participantes adicionados ao grupo");
      qc.invalidateQueries({ queryKey: ["group-members", groupId] });
      qc.invalidateQueries({ queryKey: ["group-stats", groupId] });
      qc.invalidateQueries({ queryKey: ["group-candidates"] });
      setSelected([]);
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao adicionar"),
  });

  const toggle = (sid: string) =>
    setSelected((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));

  return (
    <Dialog
      open={open}
      onOpenChange={(b) => {
        if (!b) {
          setTerm("");
          setSelected([]);
        }
        onOpenChange(b);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar participantes</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Selecione alunos já cadastrados no sistema. Nenhum cadastro duplicado será criado.
        </p>
        <Input placeholder="Buscar aluno por nome…" value={term} onChange={(e) => setTerm(e.target.value)} />
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
          {pool.isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Carregando alunos disponíveis…</div>
          ) : filtered.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">Nenhum aluno disponível para inclusão.</div>
          ) : (
            filtered.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
              >
                <Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{s.full_name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {ageFrom(s.birth_date)} anos{s.group_id ? " • já vinculado a outro grupo" : ""}
                  </span>
                </span>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || selected.length === 0}
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            {save.isPending ? "Adicionando…" : `Adicionar (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
