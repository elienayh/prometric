import type { DistributionRow } from "@/lib/cohort-stats";
import { cn } from "@/lib/utils";

export function DistributionChart({ rows, className }: { rows: DistributionRow[]; className?: string }) {
  const total = rows.reduce((a, r) => a + r.count, 0);
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {rows.map((r) => (
          <div
            key={r.category}
            title={`${r.category}: ${r.count} (${r.pct}%)`}
            style={{ width: `${r.pct}%`, background: r.color }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {rows.map((r) => (
          <div key={r.category} className="rounded-lg border border-border bg-card p-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
              <span className="text-xs font-medium">{r.category}</span>
            </div>
            <div className="mt-1 text-lg font-bold tabular-nums">{r.count}</div>
            <div className="text-[10px] text-muted-foreground">
              {r.pct}% de {total}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
