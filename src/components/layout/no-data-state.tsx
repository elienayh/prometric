import { Link } from "@tanstack/react-router";
import { ClipboardList, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type CTA = { label: string; to: string; params?: Record<string, string>; icon?: "eval" | "students" | "report" };

const iconMap = {
  eval: <ClipboardList className="mr-1.5 h-4 w-4" />,
  students: <Users className="mr-1.5 h-4 w-4" />,
  report: <FileText className="mr-1.5 h-4 w-4" />,
};

/**
 * Empty-state block for dashboards when there is no data to analyze.
 * Shows a clear message + actionable CTAs (eval / add students).
 */
export function NoDataState({
  title,
  description,
  ctas = [],
}: {
  title: string;
  description: string;
  ctas?: CTA[];
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>
      {ctas.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {ctas.map((c, i) => (
            <Button
              key={i}
              asChild
              variant={i === 0 ? "default" : "outline"}
              size="sm"
              className={i === 0 ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90" : ""}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Link to={c.to as never} params={c.params as never}>
                {c.icon && iconMap[c.icon]}
                {c.label}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
