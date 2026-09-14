import * as React from "react";
import { cn } from "@/lib/utils";
import { situationStyle, type PRSituation } from "@/lib/prometric-reference";

export interface SituationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  situation: PRSituation | null | undefined;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function SituationBadge({
  situation,
  size = "sm",
  showIcon = true,
  className,
  ...rest
}: SituationBadgeProps) {
  const s = situationStyle(situation);
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        s.className,
        className,
      )}
    >
      {showIcon && <span aria-hidden>{s.icon}</span>}
      <span>{situation ?? "—"}</span>
    </span>
  );
}
