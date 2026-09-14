import { cn } from "@/lib/utils";
import {
  PR_SITUATIONS,
  REFERENCE_LABEL,
  scoreToSituation,
  situationStyle,
  type PRSituation,
} from "@/lib/prometric-reference";
import { prometricIndex } from "@/lib/prometric-method";
import type { Classifications } from "@/lib/proesp";

export interface SituationDistributionProps {
  /** Conjunto de classificações (uma por aluno — geralmente a última avaliação). */
  classifications: Classifications[];
  title?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Distribuição de alunos por situação Referência ProMetric®.
 * Reutilizável em dashboards de Turma, Grupo e Escola.
 */
export function SituationDistribution({
  classifications,
  title = `Distribuição vs ${REFERENCE_LABEL}`,
  className,
  compact = false,
}: SituationDistributionProps) {
  const counts: Record<PRSituation, number> = {
    "Muito abaixo": 0,
    "Abaixo": 0,
    "Dentro do esperado": 0,
    "Acima do esperado": 0,
    "Muito acima do esperado": 0,
  };
  let total = 0;
  for (const c of classifications) {
    const pm = prometricIndex(c);
    const s = scoreToSituation(pm.score, pm.partial);
    if (!s) continue;
    counts[s] += 1;
    total += 1;
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-gradient-card p-5 shadow-soft", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold">{title}</h2>
        <span className="text-[10px] text-muted-foreground">
          {total} aluno{total === 1 ? "" : "s"} classificado{total === 1 ? "" : "s"}
        </span>
      </div>

      {total === 0 ? (
        <p className="text-xs text-muted-foreground">Sem dados suficientes para classificação.</p>
      ) : compact ? (
        <div className="grid grid-cols-5 gap-2">
          {PR_SITUATIONS.map((s) => {
            const c = counts[s];
            const style = situationStyle(s);
            return (
              <div key={s} className={cn("rounded-lg border p-2 text-center", style.className)}>
                <div className="font-display text-lg font-bold tabular-nums">{c}</div>
                <div className="text-[9px] leading-tight">{style.short}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {PR_SITUATIONS.map((s) => {
            const c = counts[s];
            const pct = total ? (c / total) * 100 : 0;
            const style = situationStyle(s);
            return (
              <div key={s} className="flex items-center gap-3 text-xs">
                <span className={cn("w-44 rounded-full border px-2 py-0.5 text-center text-[10px] font-medium", style.className)}>
                  <span aria-hidden className="mr-1">{style.icon}</span>{s}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full" style={{ width: `${pct}%`, backgroundColor: "currentColor" }} />
                </div>
                <span className="w-20 text-right tabular-nums text-muted-foreground">
                  {c} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
