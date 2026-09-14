import { cn } from "@/lib/utils";
import type { Zone } from "@/lib/proesp";
import {
  EXPECTED_BAR_RANGE,
  EXPECTED_ZONES_LABEL,
  REFERENCE_LABEL,
  zoneToBarPosition,
  zoneToSituation,
} from "@/lib/prometric-reference";
import { SituationBadge } from "./situation-badge";

export interface ReferenceBarProps {
  /** Zona PROESP atual (será mapeada para a situação Referência ProMetric®). */
  zone: Zone | null | undefined;
  /** Valor atual exibido acima do marker. */
  value?: number | string | null;
  /** Unidade do valor (ex.: "cm", "s"). */
  unit?: string;
  /** Faixa numérica esperada (opcional — quando conhecida para o teste). */
  expectedRange?: { min: number; max: number } | null;
  /** Texto auxiliar opcional. */
  caption?: string;
  className?: string;
  /** Renderiza versão compacta (sem rótulos das 5 zonas). */
  compact?: boolean;
}

const SEGMENTS = [
  { label: "Muito ↓", color: "#dc2626" }, // Muito Fraco
  { label: "↓",       color: "#f97316" }, // Fraco
  { label: "Esp.",    color: "#22c55e" }, // Razoável
  { label: "Esp.",    color: "#22c55e" }, // Bom
  { label: "Esp.",    color: "#22c55e" }, // Muito Bom
  { label: "↑",       color: "#3b82f6" }, // Excelente
];

/**
 * Barra de referência inspirada em exames laboratoriais.
 * Exibe 6 segmentos coloridos (zonas PROESP), faixa esperada destacada e
 * marker indicando a posição do aluno.
 */
export function ReferenceBar({
  zone,
  value,
  unit,
  expectedRange,
  caption,
  className,
  compact = false,
}: ReferenceBarProps) {
  const pos = zoneToBarPosition(zone);
  const situation = zoneToSituation(zone);

  return (
    <div className={cn("w-full", className)}>
      {/* Barra */}
      <div className="relative h-3 w-full overflow-hidden rounded-full border border-border bg-muted">
        {/* Segmentos */}
        <div className="absolute inset-0 flex">
          {SEGMENTS.map((seg, i) => (
            <div key={i} className="h-full flex-1" style={{ backgroundColor: seg.color, opacity: 0.35 }} />
          ))}
        </div>
        {/* Destaque faixa esperada (Razoável + Bom + Muito Bom) */}
        <div
          aria-hidden
          className="absolute inset-y-0 border-x-2 border-[#22c55e]/80"
          style={{
            left:  `${EXPECTED_BAR_RANGE.start}%`,
            width: `${EXPECTED_BAR_RANGE.end - EXPECTED_BAR_RANGE.start}%`,
          }}
        />
        {/* Marker */}
        {pos != null && (
          <div
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos}%` }}
            aria-label={`Posição do aluno: ${situation ?? "sem classificação"}`}
          >
            <div className="h-5 w-5 rounded-full border-2 border-background bg-foreground shadow-[0_0_0_2px_hsl(var(--foreground))] dark:bg-background dark:shadow-[0_0_0_2px_hsl(var(--background))]" />
          </div>
        )}
      </div>

      {/* Rótulos das extremidades */}
      {!compact && (
        <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wide text-muted-foreground">
          <span>Prioritário</span>
          <span>Atenção</span>
          <span className="font-semibold text-[#16a34a]">{REFERENCE_LABEL}</span>
          <span>Bom</span>
          <span>Excelente</span>
        </div>
      )}

      {/* Resumo abaixo da barra */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {value != null && value !== "" && (
            <span className="font-mono text-sm font-semibold tabular-nums">
              {value}
              {unit ? <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{unit}</span> : null}
            </span>
          )}
          <SituationBadge situation={situation} />
        </div>
        <div className="text-right text-[10px] text-muted-foreground">
          Faixa esperada:{" "}
          <span className="font-medium text-foreground">
            {expectedRange
              ? `${expectedRange.min}–${expectedRange.max}${unit ? ` ${unit}` : ""}`
              : EXPECTED_ZONES_LABEL}
          </span>
        </div>
      </div>

      {caption && <p className="mt-1 text-[10px] text-muted-foreground">{caption}</p>}
    </div>
  );
}
