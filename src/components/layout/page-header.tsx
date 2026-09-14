import { type ReactNode } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  icon,
  eyebrow,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        {icon && (
          <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 sm:grid">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-[28px]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-gradient-card p-10 text-center shadow-card">
      <div className="pointer-events-none absolute inset-0 opacity-50 bg-gradient-mesh" aria-hidden />
      <div className="relative">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
          {icon ?? <Sparkles className="h-6 w-6" />}
        </div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="mt-5 bg-gradient-brand text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
