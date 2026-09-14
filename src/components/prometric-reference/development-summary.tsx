import { Activity } from "lucide-react";
import { prometricIndex, type PMOverall } from "@/lib/prometric-method";
import type { Classifications } from "@/lib/proesp";
import {
  EXPECTED_INDEX_RANGE,
  REFERENCE_LABEL,
  scoreToSituation,
  situationSentence,
} from "@/lib/prometric-reference";
import { SituationBadge } from "./situation-badge";

export interface DevelopmentSummaryProps {
  classifications: Classifications;
  /** Nome curto do aluno para o texto interpretativo. */
  studentFirstName?: string;
  /** Esconde o texto interpretativo (útil em PDFs com layout próprio). */
  hideSentence?: boolean;
}

/**
 * Seção "Desenvolvimento Geral" — bloco central da Referência ProMetric®.
 * Reusada no Dashboard do Aluno, Portal, PDFs e dashboards analíticos.
 */
export function DevelopmentSummary({
  classifications,
  studentFirstName,
  hideSentence,
}: DevelopmentSummaryProps) {
  const pm: PMOverall = prometricIndex(classifications);
  const situation = scoreToSituation(pm.score, pm.partial);
  const subject = studentFirstName
    ? `O desenvolvimento físico de ${studentFirstName}`
    : "O desenvolvimento físico";

  return (
    <section
      aria-label="Desenvolvimento Geral — Referência ProMetric®"
      className="rounded-2xl border border-[#22c55e]/30 bg-gradient-to-br from-[#f0fdf4] to-card p-5 shadow-soft dark:from-[#14532d]/15 dark:to-card"
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#16a34a]">
            <Activity className="h-3.5 w-3.5" />
            {REFERENCE_LABEL}
          </div>
          <h2 className="mt-1 font-display text-lg font-bold">Desenvolvimento Geral</h2>
        </div>
        <SituationBadge situation={situation} size="md" />
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Índice ProMetric"
          value={pm.partial ? "—" : `${pm.score}`}
          suffix={pm.partial ? "" : "/100"}
          hint={pm.partial ? `${pm.filledTests}/9 testes • dados insuficientes` : `${pm.filledTests}/9 testes`}
        />
        <Metric
          label="Perfil"
          value={pm.category ?? "—"}
          hint="categoria geral"
        />
        <Metric
          label="Faixa esperada"
          value={`${EXPECTED_INDEX_RANGE.min}–${EXPECTED_INDEX_RANGE.max}`}
          suffix="/100"
          hint="para idade e sexo"
        />
      </div>

      {/* Barra de referência do índice geral */}
      <div className="mt-5">
        <IndexBar score={pm.partial ? null : pm.score} />
      </div>

      {!hideSentence && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
          {situationSentence(situation, subject)}
        </p>
      )}
    </section>
  );
}

function Metric({ label, value, suffix, hint }: { label: string; value: string | number; suffix?: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-2xl font-bold tabular-nums">
        {value}
        {suffix && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function IndexBar({ score }: { score: number | null }) {
  const pct = score == null ? null : Math.max(0, Math.min(100, score));
  return (
    <div>
      <div className="relative h-3 w-full overflow-hidden rounded-full border border-border bg-muted">
        {/* segmentos por situação */}
        <div className="absolute inset-0 flex">
          <div className="h-full" style={{ width: "25%", backgroundColor: "#dc2626", opacity: 0.3 }} />
          <div className="h-full" style={{ width: "20%", backgroundColor: "#f97316", opacity: 0.3 }} />
          <div className="h-full" style={{ width: "30%", backgroundColor: "#22c55e", opacity: 0.35 }} />
          <div className="h-full" style={{ width: "15%", backgroundColor: "#3b82f6", opacity: 0.3 }} />
          <div className="h-full" style={{ width: "10%", backgroundColor: "#7c3aed", opacity: 0.3 }} />
        </div>
        {/* destaque faixa esperada */}
        <div
          aria-hidden
          className="absolute inset-y-0 border-x-2 border-[#22c55e]/80"
          style={{
            left: `${EXPECTED_INDEX_RANGE.min}%`,
            width: `${EXPECTED_INDEX_RANGE.max - EXPECTED_INDEX_RANGE.min}%`,
          }}
        />
        {/* marker */}
        {pct != null && (
          <div className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct}%` }}>
            <div className="h-5 w-5 rounded-full border-2 border-background bg-foreground shadow" />
          </div>
        )}
      </div>
      <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wide text-muted-foreground">
        <span>0</span>
        <span className="font-semibold text-[#16a34a]">
          {EXPECTED_INDEX_RANGE.min}–{EXPECTED_INDEX_RANGE.max} {REFERENCE_LABEL}
        </span>
        <span>100</span>
      </div>
    </div>
  );
}
