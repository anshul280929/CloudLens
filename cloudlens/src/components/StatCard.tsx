import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/* ── Trend direction type ── */
export type TrendDirection = "up" | "down" | "neutral";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small icon rendered in a coloured container */
  icon: React.ReactNode;
  /** Descriptive label, e.g. "Total Repositories" */
  label: string;
  /** The main numeric value to display */
  value: string | number;
  /** Optional trend percentage (e.g. "+12%") */
  trend?: string;
  /** Direction of the trend — determines colour */
  trendDirection?: TrendDirection;
  /** Colour tint applied to the icon container. Accepts any CSS colour. */
  iconColor?: string;
  /** If true, render a shimmer skeleton instead of real data */
  loading?: boolean;
}

/* ── Tiny arrow SVGs ── */
function TrendArrowUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 2v6M5 2L2.5 4.5M5 2l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendArrowDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 8V2M5 8l2.5-2.5M5 8L2.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const trendColors: Record<TrendDirection, string> = {
  up: "text-semantic-success",
  down: "text-semantic-error",
  neutral: "text-ink-subtle",
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      icon,
      label,
      value,
      trend,
      trendDirection = "neutral",
      iconColor = "var(--accent-blue)",
      loading = false,
      ...props
    },
    ref,
  ) => {
    if (loading) {
      return (
        <Card
          ref={ref}
          className={cn("p-5 space-y-3", className)}
          {...props}
        >
          {/* Icon skeleton */}
          <div className="w-9 h-9 rounded-md bg-surface-2 animate-skeleton" />
          {/* Label skeleton */}
          <div className="w-24 h-3 rounded bg-surface-2 animate-skeleton" />
          {/* Value skeleton */}
          <div className="w-16 h-7 rounded bg-surface-2 animate-skeleton" />
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "p-5 flex flex-col gap-3 transition-colors duration-200",
          "hover:border-hairline",
          className,
        )}
        {...props}
      >
        {/* Icon container */}
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `color-mix(in srgb, ${iconColor} 12%, transparent)`,
            color: iconColor,
          }}
        >
          {icon}
        </div>

        {/* Label */}
        <span className="text-caption text-ink-subtle">{label}</span>

        {/* Value + trend row */}
        <div className="flex items-end gap-2">
          <span className="text-card-title text-ink leading-none">{value}</span>

          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[12px] font-semibold leading-none pb-0.5",
                trendColors[trendDirection],
              )}
            >
              {trendDirection === "up" && <TrendArrowUp />}
              {trendDirection === "down" && <TrendArrowDown />}
              {trend}
            </span>
          )}
        </div>
      </Card>
    );
  },
);

StatCard.displayName = "StatCard";
