import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * CloudLens Design System — Button
 *
 * Mapped to DESIGN.md button-* component tokens.
 * Variants: primary | secondary | tertiary | danger | product-terraform | product-vault | product-waypoint
 * Sizes:    default (40px) | sm (34px)
 */
const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-[7px]",
    "text-[14px] font-semibold whitespace-nowrap select-none",
    "rounded-md border border-transparent",
    "transition-all duration-[160ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
    "outline-none cursor-pointer",
    "focus-visible:ring-2 focus-visible:ring-accent-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /* button-primary: white bg, black text */
        primary: [
          "bg-inverse-canvas text-inverse-ink border-transparent",
          "hover:bg-white/90",
          "active:bg-white/80",
        ].join(" "),
        /* button-secondary: charcoal bg, white text */
        secondary: [
          "bg-surface-2 text-ink border-transparent",
          "hover:bg-surface-3",
          "active:bg-surface-2",
        ].join(" "),
        /* button-tertiary: ghost on canvas */
        tertiary: [
          "bg-transparent text-ink border-hairline",
          "hover:bg-surface-1 hover:border-surface-3",
          "active:bg-surface-2",
        ].join(" "),
        /* danger: semantic error */
        danger: [
          "bg-[rgba(230,43,30,0.09)] text-semantic-error border-[rgba(230,43,30,0.2)]",
          "hover:bg-[rgba(230,43,30,0.15)]",
          "active:bg-[rgba(230,43,30,0.2)]",
        ].join(" "),
        /* Per-product variants */
        "product-terraform": [
          "bg-product-terraform text-ink border-transparent",
          "hover:opacity-90",
          "active:opacity-80",
        ].join(" "),
        "product-vault": [
          "bg-product-vault text-inverse-ink border-transparent",
          "hover:opacity-90",
          "active:opacity-80",
        ].join(" "),
        "product-waypoint": [
          "bg-product-waypoint text-inverse-ink border-transparent",
          "hover:opacity-90",
          "active:opacity-80",
        ].join(" "),
        /* Ghost variant for dashboard use */
        ghost: [
          "bg-transparent text-ink-muted border-hairline",
          "hover:text-ink hover:bg-surface-1",
          "active:bg-surface-2",
        ].join(" "),
      },
      size: {
        default: "h-10 px-[18px] py-[10px] text-[14px]",
        sm: "h-[34px] px-3.5 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

/** 16×16 animated spinner SVG */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 00-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** When true, replaces the leading icon with a 16px spinner and disables pointer events without resizing. */
  loading?: boolean;
  /** Content rendered before the label. Replaced by spinner when loading. */
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading = false, icon, children, ...props },
    ref
  ) => {
    return (
      <button
        data-slot="button"
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "pointer-events-none"
        )}
        disabled={props.disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {/* Icon slot — spinner replaces icon during loading, preserving the same 16px box */}
        {(loading || icon) && (
          <span className="inline-flex items-center justify-center w-4 h-4 shrink-0">
            {loading ? <Spinner /> : icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants, Spinner };
