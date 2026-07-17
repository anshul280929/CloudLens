import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * CloudLens Design System — Badge
 *
 * Mapped to DESIGN.md product-pill + semantic states.
 * Product badges use per-product identity colors.
 * Scan status badges use semantic tokens.
 */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-[5px]",
    "px-[10px] py-[4px] rounded-pill",
    "text-[12px] font-semibold leading-none whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ── Cloud Providers (product identity) ── */
        aws: "bg-[rgba(255,207,37,0.10)] text-product-vault border border-[rgba(255,207,37,0.2)]",
        gcp: "bg-[rgba(43,137,255,0.10)] text-accent-blue border border-[rgba(43,137,255,0.2)]",
        azure:
          "bg-[rgba(24,104,242,0.10)] text-product-vagrant border border-[rgba(24,104,242,0.2)]",
        vercel:
          "bg-surface-2 text-ink border border-[rgba(178,182,189,0.1)]",
        stripe:
          "bg-[rgba(123,66,188,0.10)] text-product-terraform border border-[rgba(123,66,188,0.2)]",
        supabase:
          "bg-[rgba(0,202,142,0.10)] text-product-nomad border border-[rgba(0,202,142,0.2)]",

        /* ── Scan Status (semantic) ── */
        complete:
          "bg-[rgba(0,202,142,0.10)] text-semantic-success border border-[rgba(0,202,142,0.2)]",
        scanning:
          "bg-[rgba(255,207,37,0.10)] text-semantic-warning border border-[rgba(255,207,37,0.2)]",
        failed:
          "bg-[rgba(230,43,30,0.09)] text-semantic-error border border-[rgba(230,43,30,0.2)]",
        "never-scanned":
          "bg-surface-2 text-ink-subtle border border-[rgba(178,182,189,0.1)]",

        /* ── Generic ── */
        default:
          "bg-surface-1 text-ink-muted border border-[rgba(178,182,189,0.1)]",
        info: "bg-[rgba(43,137,255,0.10)] text-accent-blue border border-[rgba(43,137,255,0.2)]",
      },
      size: {
        default: "px-[10px] py-[4px] text-[12px]",
        sm: "px-[8px] py-[3px] text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/** Static dot indicator — 6×6 circle inheriting text color */
function BadgeDot({ pulse = false, className }: { pulse?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "w-1.5 h-1.5 rounded-full bg-current shrink-0",
        pulse && "animate-badge-pulse",
        className
      )}
      aria-hidden="true"
    />
  );
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Show the leading dot indicator. Defaults to true for all variants except never-scanned. */
  showDot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, showDot, children, ...props }, ref) => {
    const isScanning = variant === "scanning";
    const isNeverScanned = variant === "never-scanned";

    // Default: show dot for everything except never-scanned
    const shouldShowDot = showDot ?? !isNeverScanned;

    return (
      <span
        ref={ref}
        data-slot="badge"
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {shouldShowDot && <BadgeDot pulse={isScanning} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants, BadgeDot };
