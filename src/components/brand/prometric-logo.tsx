import * as React from "react";
import { cn } from "@/lib/utils";

interface PrometricIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  rounded?: boolean;
}

/**
 * Ícone oficial ProMetric — pulso eletrocardiograma sobre gradiente violeta/azul/ciano
 */
export function PrometricIcon({
  className,
  size,
  rounded = true,
  ...props
}: PrometricIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size ?? "100%"}
      height={size ?? "100%"}
      className={cn("shrink-0 select-none shadow-glow", className)}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="pm-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B21A8" />
          <stop offset="25%" stopColor="#7C3AED" />
          <stop offset="55%" stopColor="#4F46E5" />
          <stop offset="80%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        <filter id="pm-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Fundo do ícone com cantos arredondados */}
      <rect
        width="512"
        height="512"
        rx={rounded ? "116" : "0"}
        ry={rounded ? "116" : "0"}
        fill="url(#pm-icon-grad)"
      />

      {/* Brilho translúcido em volta do pulso */}
      <path
        d="M 86 262 L 180 262 L 252 138 L 346 354 C 370 296 395 244 414 246 C 426 247 433 253 440 256"
        fill="none"
        stroke="#ffffff"
        strokeWidth="42"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.32"
      />

      {/* Linha de pulso nítida */}
      <path
        d="M 86 262 L 180 262 L 252 138 L 346 354 C 370 296 395 244 414 246 C 426 247 433 253 440 256"
        fill="none"
        stroke="#ffffff"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PrometricLogoProps {
  className?: string;
  iconClassName?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

export function PrometricLogo({
  className,
  iconClassName,
  subtitle,
  size = "md",
}: PrometricLogoProps) {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <PrometricIcon className={cn(iconSizes[size], iconClassName)} />
      <div className="min-w-0">
        <div className={cn("font-display font-bold leading-none tracking-tight", textSizes[size])}>
          Pro<span className="text-gradient-brand">Metric</span>
        </div>
        {subtitle && (
          <div className="mt-1 truncate text-[11px] text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
