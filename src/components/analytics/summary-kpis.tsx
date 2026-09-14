import { cn } from "@/lib/utils";

export type KPI = { label: string; value: string | number; hint?: string; tone?: "default" | "success" | "warning" | "destructive" | "primary" };

const toneClass: Record<NonNullable<KPI["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  primary: "text-primary",
};

export function SummaryKPIs({ items, className }: { items: KPI[]; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((k) => (
        <div key={k.label} className="rounded-2xl border border-border bg-gradient-card p-4 shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
          <div className={cn("mt-1 font-display text-2xl font-bold tabular-nums", toneClass[k.tone ?? "default"])}>{k.value}</div>
          {k.hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{k.hint}</div>}
        </div>
      ))}
    </div>
  );
}
