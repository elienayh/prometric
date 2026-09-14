import { Link } from "@tanstack/react-router";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ActionItem = {
  label: string;
  icon: LucideIcon;
  /** internal route */
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  /** external link */
  href?: string;
  /** click handler */
  onClick?: () => void;
  /** highlight as primary CTA */
  primary?: boolean;
  /** accent color for primary buttons */
  accent?: "brand" | "success" | "amber";
  /** pin to the right side of the bar (desktop) */
  pinnedEnd?: boolean;
  /** open external in new tab */
  external?: boolean;
};

function renderInner(a: ActionItem, full: boolean) {
  const Icon = a.icon;
  return (
    <>
      <Icon className={cn("h-4 w-4", full && "mr-2")} />
      {full && <span className="truncate">{a.label}</span>}
    </>
  );
}

function ActionButton({ a, compact = false }: { a: ActionItem; compact?: boolean }) {
  const variant = a.primary ? "default" : "outline";
  const accentClasses =
    a.primary && a.accent === "success"
      ? "bg-emerald-600 text-white shadow-glow hover:bg-emerald-500"
      : a.primary && a.accent === "amber"
        ? "bg-amber-500 text-white shadow-glow hover:bg-amber-400"
        : a.primary
          ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
          : "";
  const className = cn("min-h-9", accentClasses, compact && "px-2.5");
  const content = renderInner(a, !compact);

  if (a.to) {
    return (
      <Button asChild variant={variant} size="sm" className={className} title={a.label} aria-label={a.label}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Link to={a.to as never} params={a.params as never} search={a.search as never}>{content}</Link>
      </Button>
    );
  }
  if (a.href) {
    return (
      <Button asChild variant={variant} size="sm" className={className} title={a.label} aria-label={a.label}>
        <a href={a.href} target={a.external ? "_blank" : undefined} rel={a.external ? "noopener noreferrer" : undefined}>{content}</a>
      </Button>
    );
  }
  return (
    <Button variant={variant} size="sm" className={className} onClick={a.onClick} title={a.label} aria-label={a.label}>
      {content}
    </Button>
  );
}

function MobileMenuItem({ a }: { a: ActionItem }) {
  const Icon = a.icon;
  const inner = (
    <span className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      {a.label}
    </span>
  );
  if (a.to) {
    return (
      <DropdownMenuItem asChild>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Link to={a.to as never} params={a.params as never} search={a.search as never}>{inner}</Link>
      </DropdownMenuItem>
    );
  }
  if (a.href) {
    return (
      <DropdownMenuItem asChild>
        <a href={a.href} target={a.external ? "_blank" : undefined} rel={a.external ? "noopener noreferrer" : undefined}>{inner}</a>
      </DropdownMenuItem>
    );
  }
  return <DropdownMenuItem onClick={a.onClick}>{inner}</DropdownMenuItem>;
}

/**
 * Contextual action bar for entity dashboards (Aluno / Turma / Grupo / Escola).
 * Desktop: primary actions inline + remaining in overflow menu.
 * Mobile:  primary actions as icon-only + full menu for everything else.
 */
export function ActionBar({
  actions,
  trailing,
  /** number of actions shown inline on desktop (rest go to overflow) */
  inlineDesktop = 4,
  /** number of actions shown as compact icons on mobile (rest go to menu) */
  inlineMobile = 1,
}: {
  actions: ActionItem[];
  trailing?: ReactNode;
  inlineDesktop?: number;
  inlineMobile?: number;
}) {
  const pinnedEnd = actions.filter((a) => a.pinnedEnd);
  const normal = actions.filter((a) => !a.pinnedEnd);
  const desktopInline = normal.slice(0, inlineDesktop);
  const desktopOverflow = normal.slice(inlineDesktop);
  const mobileInline = actions.slice(0, inlineMobile);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Desktop */}
      <div className="hidden w-full flex-wrap items-center gap-2 sm:flex">
        {desktopInline.map((a) => <ActionButton key={a.label} a={a} />)}
        {(pinnedEnd.length > 0 || desktopOverflow.length > 0) && <div className="ml-auto flex flex-wrap items-center gap-2">
          {pinnedEnd.map((a) => <ActionButton key={a.label} a={a} />)}
          {desktopOverflow.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-h-9 px-2.5" aria-label="Mais ações">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {desktopOverflow.map((a) => <MobileMenuItem key={a.label} a={a} />)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>}
      </div>

      {/* Mobile */}
      <div className="flex w-full items-center gap-2 sm:hidden">
        {mobileInline.map((a) => <ActionButton key={a.label} a={a} compact />)}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto min-h-9 gap-1.5">
              <MoreHorizontal className="h-4 w-4" /> Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {actions.map((a, i) => (
              <span key={a.label}>
                {i > 0 && a.primary && <DropdownMenuSeparator />}
                <MobileMenuItem a={a} />
              </span>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {trailing}
    </div>
  );
}
