import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Download,
  FileDown,
  Printer,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { categoryColor, type PMCategory, type PMDimension } from "@/lib/prometric-method";
import type { DimensionAvg, DistributionRow } from "@/lib/cohort-stats";
import { cn } from "@/lib/utils";

export interface CohortSummaryBannerProps {
  kind: "turma" | "grupo";
  cohortName: string;
  subtitle?: string;
  totalMembers: number;
  evaluatedCount: number;
  avgScore: number;
  avgCategory: PMCategory | null;
  dimensions: DimensionAvg[];
  distribution: DistributionRow[];
  atRiskCount: number;
  topGainsCount?: number;
  lastEvaluationAt?: string | null;
  onPrintSheets?: () => void;
  onGeneratePDF?: () => void;
  onExportCSV?: () => void;
  quickEvalTo?: string;
  quickEvalSearch?: Record<string, string>;
  viewDashboardTo?: string;
  viewDashboardParams?: Record<string, string>;
  className?: string;
}

const DIMENSION_ICONS: Record<PMDimension, string> = {
  "Saúde Corporal": "⚖️",
  "Resistência": "🫀",
  "Mobilidade": "🤸",
  "Potência": "💥",
  "Velocidade e Agilidade": "⚡",
};

export function CohortSummaryBanner({
  kind,
  cohortName,
  subtitle,
  totalMembers,
  evaluatedCount,
  avgScore,
  avgCategory,
  dimensions,
  distribution,
  atRiskCount,
  topGainsCount = 0,
  lastEvaluationAt,
  onPrintSheets,
  onGeneratePDF,
  onExportCSV,
  quickEvalTo = "/quick-eval",
  quickEvalSearch,
  viewDashboardTo,
  viewDashboardParams,
  className,
}: CohortSummaryBannerProps) {
  const coveragePct = totalMembers > 0 ? Math.round((evaluatedCount / totalMembers) * 100) : 0;

  // Diagnostic summary generated dynamically from existing cohort data
  const summary = useMemo(() => {
    if (evaluatedCount === 0) {
      return {
        text: kind === "turma"
          ? "Nenhum aluno desta turma possui avaliações concluídas até o momento. Realize uma avaliação diagnóstica para gerar a Nota ProMetric e o perfil motor da turma."
          : "Nenhum participante deste grupo possui avaliações registradas. Inicie a primeira rodada de testes para calcular o índice ProMetric e diagnosticar o condicionamento.",
        strongest: null,
        weakest: null,
      };
    }

    const validDims = dimensions.filter((d) => d.score > 0);
    const sorted = [...validDims].sort((a, b) => b.score - a.score);
    const strongest = sorted[0] ?? null;
    const weakest = sorted.length > 1 ? sorted[sorted.length - 1] : null;

    const subject = kind === "turma" ? "A turma" : "O grupo";
    const membersLabel = kind === "turma" ? "alunos" : "integrantes";

    let text = `${subject} registra Nota ProMetric média de ${avgScore}/100 (${avgCategory ?? "Regular"}), com cobertura avaliativa de ${coveragePct}% (${evaluatedCount} de ${totalMembers} ${membersLabel} avaliados). `;

    if (strongest && weakest && strongest.dimension !== weakest.dimension) {
      text += `A aptidão mais desenvolvida é ${strongest.dimension} (${strongest.score} pts), e o principal foco pedagógico para evolução é ${weakest.dimension} (${weakest.score} pts). `;
    } else if (strongest) {
      text += `O destaque motor coletivo é ${strongest.dimension} com média de ${strongest.score} pts. `;
    }

    if (atRiskCount > 0) {
      text += `${atRiskCount} ${membersLabel} demandam atenção prioritária no plano de atividades.`;
    } else {
      text += `Todos os ${membersLabel} avaliados encontram-se dentro ou acima das metas esperadas.`;
    }

    return { text, strongest, weakest };
  }, [evaluatedCount, kind, totalMembers, avgScore, avgCategory, coveragePct, dimensions, atRiskCount]);

  // Score badge ring tone
  const scoreRingClass =
    avgScore >= 85
      ? "from-emerald-500 to-teal-600 text-emerald-400"
      : avgScore >= 65
      ? "from-indigo-500 to-blue-600 text-indigo-400"
      : avgScore >= 45
      ? "from-purple-500 to-violet-600 text-purple-400"
      : avgScore >= 25
      ? "from-amber-500 to-orange-600 text-amber-400"
      : "from-rose-500 to-red-600 text-rose-400";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-muted/20 p-5 shadow-soft transition-all sm:p-6",
        className,
      )}
    >
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative space-y-5">
        {/* Main highlight grid: Nota ProMetric + Resumo Diagnóstico */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          {/* Card da Nota ProMetric */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-background/60 p-5 text-center backdrop-blur-sm sm:flex-row sm:text-left lg:col-span-4 lg:flex-col lg:text-center xl:col-span-3">
            <div className="relative mb-3 flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-muted to-muted/40 p-1.5 shadow-inner sm:mb-0 sm:mr-5 lg:mb-3 lg:mr-0">
              <div
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center rounded-full bg-card p-2 text-center shadow-soft",
                  "border-2 border-border/40",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Nota ProMetric
                </span>
                <div className="flex items-baseline justify-center">
                  <span className="font-display text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl">
                    {evaluatedCount > 0 ? avgScore : "—"}
                  </span>
                  {evaluatedCount > 0 && (
                    <span className="ml-0.5 text-xs font-semibold text-muted-foreground">/100</span>
                  )}
                </div>
                {evaluatedCount > 0 && avgCategory && (
                  <span
                    className={cn(
                      "mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wide",
                      categoryColor(avgCategory),
                    )}
                  >
                    {avgCategory}
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                {kind === "turma" ? "Média geral da turma" : "Média geral do grupo"}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start lg:justify-center">
                <span className="font-semibold text-foreground">
                  {evaluatedCount} de {totalMembers}
                </span>
                <span>avaliados ({coveragePct}%)</span>
              </div>
              <div className="mx-auto h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(coveragePct, 100)}%` }}
                />
              </div>
              {lastEvaluationAt && (
                <div className="text-[11px] text-muted-foreground/80">
                  Última avaliação: {new Date(lastEvaluationAt).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          </div>

          {/* Breve Resumo Diagnóstico & Dimensões */}
          <div className="space-y-4 lg:col-span-8 xl:col-span-9">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
                    Resumo Diagnóstico {kind === "turma" ? "da Turma" : "do Grupo"}
                  </h3>
                </div>
                {viewDashboardTo && (
                  <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-medium text-primary hover:text-primary/90">
                    <Link to={viewDashboardTo as any} params={viewDashboardParams as any}>
                      Ver análise analítica completa <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {summary.text}
              </p>
            </div>

            {/* As 5 Dimensões ProMetric */}
            {evaluatedCount > 0 && dimensions.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Médias por Dimensão Física & Motora
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {dimensions.map((dim) => {
                    const isStrong = summary.strongest?.dimension === dim.dimension;
                    const isWeak = summary.weakest?.dimension === dim.dimension;
                    return (
                      <div
                        key={dim.dimension}
                        className={cn(
                          "relative rounded-lg border bg-background/50 p-2.5 transition-colors",
                          isStrong
                            ? "border-primary/40 bg-primary/5"
                            : isWeak
                            ? "border-warning/40 bg-warning/5"
                            : "border-border/60",
                        )}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate font-medium text-foreground">
                            {DIMENSION_ICONS[dim.dimension] ?? "•"} {dim.dimension}
                          </span>
                          <span className="ml-1 font-display font-bold tabular-nums text-foreground">
                            {dim.score}
                            <span className="text-[10px] font-normal text-muted-foreground">/100</span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              dim.score >= 70
                                ? "bg-emerald-500"
                                : dim.score >= 50
                                ? "bg-indigo-500"
                                : dim.score >= 35
                                ? "bg-amber-500"
                                : "bg-rose-500",
                            )}
                            style={{ width: `${Math.min(dim.score, 100)}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          {isStrong ? (
                            <span className="font-semibold text-primary">★ Ponto Forte</span>
                          ) : isWeak ? (
                            <span className="font-semibold text-warning">⚠ Atenção</span>
                          ) : (
                            <span>{dim.score >= 65 ? "Bom" : dim.score >= 45 ? "Médio" : "A desenvolver"}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Distribuição rápida de perfis & Ações rápidas */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">Perfis:</span>
                {distribution.map((d) => (
                  <div key={d.category} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="font-medium text-foreground">{d.count}</span>
                    <span className="text-muted-foreground">{d.category}</span>
                  </div>
                ))}
                {atRiskCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 font-semibold text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> {atRiskCount} em atenção
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onPrintSheets && (
                  <Button variant="outline" size="sm" onClick={onPrintSheets} className="h-8 text-xs">
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Imprimir Fichas
                  </Button>
                )}
                {onGeneratePDF && (
                  <Button variant="outline" size="sm" onClick={onGeneratePDF} className="h-8 text-xs">
                    <FileDown className="mr-1.5 h-3.5 w-3.5" /> Relatório PDF
                  </Button>
                )}
                {onExportCSV && (
                  <Button variant="outline" size="sm" onClick={onExportCSV} className="h-8 text-xs">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
                  </Button>
                )}
                <Button size="sm" asChild className="h-8 bg-gradient-brand text-xs text-primary-foreground shadow-glow hover:opacity-90">
                  <Link to={quickEvalTo as any} search={quickEvalSearch as any}>
                    <Zap className="mr-1.5 h-3.5 w-3.5" /> Nova Avaliação
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
