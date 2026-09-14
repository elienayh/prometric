import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export type RankingRow = {
  student_id: string;
  full_name: string;
  value: number | string;
  unit?: string;
  badge?: string;
  badgeClass?: string;
};

export function RankingTable({
  title,
  rows,
  valueLabel,
  emptyText = "Sem dados suficientes",
  className,
}: {
  title: string;
  rows: RankingRow[];
  valueLabel: string;
  emptyText?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{valueLabel}</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <ol className="space-y-1.5">
          {rows.map((r, i) => (
            <li key={r.student_id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50">
              <span className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                i === 0 ? "bg-warning/20 text-warning" :
                i === 1 ? "bg-muted text-muted-foreground" :
                i === 2 ? "bg-accent/20 text-accent-foreground" : "bg-muted/50 text-muted-foreground",
              )}>{i + 1}</span>
              <Link
                to="/students/$id"
                params={{ id: r.student_id }}
                className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary hover:underline"
              >
                {r.full_name}
              </Link>
              {r.badge && (
                <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", r.badgeClass)}>{r.badge}</span>
              )}
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {typeof r.value === "number" ? r.value.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : r.value}
                {r.unit && <span className="ml-0.5 text-[10px] text-muted-foreground">{r.unit}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
