import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const LAP_METERS = 40;
const ADDITIONALS = [0, 10, 20, 30] as const;

type Parsed = { laps: string; extra: 0 | 10 | 20 | 30 };

/** Decompose total meters into laps × 40 + additional (0/10/20/30). */
function decompose(totalStr: string): Parsed {
  const total = parseFloat((totalStr ?? "").replace(",", "."));
  if (!isFinite(total) || total <= 0) return { laps: "", extra: 0 };
  const laps = Math.floor(total / LAP_METERS);
  const rem = Math.round(total - laps * LAP_METERS);
  // snap remainder to nearest allowed step
  const extra = (ADDITIONALS.reduce((best, v) =>
    Math.abs(v - rem) < Math.abs(best - rem) ? v : best, 0 as number)) as 0 | 10 | 20 | 30;
  return { laps: String(laps), extra };
}

function compose(laps: string, extra: 0 | 10 | 20 | 30): string {
  const n = parseInt(laps, 10);
  if (!isFinite(n) || n < 0) return "";
  return String(n * LAP_METERS + extra);
}

export type Run6MinInputProps = {
  value: string;
  onChange: (totalMeters: string) => void;
  className?: string;
  compact?: boolean;
  autoFocus?: boolean;
};

/**
 * Entrada assistida para Corrida 6min:
 *  - Voltas completas (× 40 m)
 *  - Distância adicional (0, 10, 20 ou 30 m)
 * Grava sempre o total em metros no `onChange` — nenhum cálculo do sistema é alterado.
 */
export function Run6MinInput({ value, onChange, className, compact, autoFocus }: Run6MinInputProps) {
  const initial = useMemo(() => decompose(value), [value]);
  const [laps, setLaps] = useState<string>(initial.laps);
  const [extra, setExtra] = useState<0 | 10 | 20 | 30>(initial.extra);

  // Re-sync when external value changes (e.g. edição de avaliação existente).
  useEffect(() => {
    const p = decompose(value);
    setLaps(p.laps);
    setExtra(p.extra);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const total = useMemo(() => {
    const t = compose(laps, extra);
    return t ? Number(t) : null;
  }, [laps, extra]);

  const emit = (l: string, e: 0 | 10 | 20 | 30) => {
    const composed = compose(l, e);
    if (composed !== value) onChange(composed);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Voltas completas</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            autoFocus={autoFocus}
            value={laps}
            placeholder="Ex.: 34"
            onChange={(ev) => {
              const v = ev.target.value.replace(/[^\d]/g, "");
              setLaps(v);
              emit(v, extra);
            }}
            className={compact ? "h-9 text-base" : "h-11 text-base"}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Distância adicional</Label>
          <Select
            value={String(extra)}
            onValueChange={(v) => {
              const e = Number(v) as 0 | 10 | 20 | 30;
              setExtra(e);
              emit(laps, e);
            }}
          >
            <SelectTrigger className={compact ? "h-9" : "h-11"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADDITIONALS.map((m) => (
                <SelectItem key={m} value={String(m)}>{m} m</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px]">
        <span className="text-muted-foreground">Distância total: </span>
        <span className="font-semibold text-foreground">
          {total != null ? `${total.toLocaleString("pt-BR")} m` : "—"}
        </span>
        <span className="ml-1 text-muted-foreground">
          ({laps || 0} × {LAP_METERS} m + {extra} m)
        </span>
      </div>
    </div>
  );
}
