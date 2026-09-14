import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { Fragment, type ReactNode } from "react";

export type Crumb = {
  label: string;
  to?: string;
  params?: Record<string, string>;
  icon?: ReactNode;
};

/**
 * Breadcrumb navigation for analytical pages.
 * Always starts with "Dashboard" linking to /dashboard.
 *
 * Example:
 * <Breadcrumbs items={[
 *   { label: "Escolas", to: "/schools" },
 *   { label: "Escola Horizonte", to: "/schools/$id", params: { id } },
 *   { label: "2º Ano A" },
 * ]} />
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [
    { label: "Dashboard", to: "/dashboard", icon: <Home className="h-3 w-3" /> },
    ...items,
  ];
  return (
    <nav aria-label="Navegação" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {all.map((c, i) => {
        const isLast = i === all.length - 1;
        const inner = (
          <span className="inline-flex items-center gap-1">
            {c.icon}
            {c.label}
          </span>
        );
        return (
          <Fragment key={`${c.label}-${i}`}>
            {c.to && !isLast ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <Link to={c.to as never} params={c.params as never} className="rounded px-1 py-0.5 hover:bg-muted hover:text-foreground">
                {inner}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-foreground" : "px-1"}>{inner}</span>
            )}
            {!isLast && <ChevronRight className="h-3 w-3 opacity-50" />}
          </Fragment>
        );
      })}
    </nav>
  );
}
