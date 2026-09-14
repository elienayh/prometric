import { Link } from "@tanstack/react-router";
import type { StudentScore } from "@/lib/cohort-stats";
import { categoryColor } from "@/lib/prometric-method";
import { cn } from "@/lib/utils";

export function RiskMap({ students, className }: { students: StudentScore[]; className?: string }) {
  if (!students.length) return <p className="text-sm text-muted-foreground">Nenhum aluno em atenção.</p>;
  return (
    <div className={cn("space-y-1.5", className)}>
      {students.map((s) => (
        <Link
          key={s.student_id}
          to="/students/$id"
          params={{ id: s.student_id }}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 hover:border-primary"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{s.full_name}</div>
            <div className="text-[11px] text-muted-foreground">Índice {s.score}/100</div>
          </div>
          <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold", categoryColor(s.category))}>
            {s.category ?? "—"}
          </span>
        </Link>
      ))}
    </div>
  );
}
