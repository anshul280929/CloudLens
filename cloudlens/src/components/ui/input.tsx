import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * CloudLens Design System — Input
 *
 * Mapped to DESIGN.md text-input + text-input-focused.
 * surface-1 bg, ink text, body typography, 8px rounded, 10px 14px padding.
 * Focus: 1px accent-blue outline ring.
 */
const inputWrapperVariants = cva(
  [
    "flex items-center gap-2",
    "bg-surface-1 border border-[rgba(178,182,189,0.1)] rounded-md",
    "px-[14px] h-10",
    "transition-all duration-150 ease-out",
    "focus-within:border-accent-blue focus-within:shadow-[0_0_0_1px_var(--accent-blue)]",
  ].join(" "),
  {
    variants: {
      size: {
        default: "h-10 py-[10px]",
        sm: "h-[34px] px-3 py-[7px]",
        lg: "h-12 px-4 py-[12px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

/** Search magnifying glass icon */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={cn("shrink-0 transition-colors duration-150", className)}
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9.5 9.5l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputWrapperVariants> {
  /** Show the search magnifying-glass icon. Defaults to true. */
  showSearchIcon?: boolean;
  /** Additional icon to render in the leading slot (replaces search icon when set). */
  icon?: React.ReactNode;
  /** Content rendered after the input (e.g., keyboard shortcut badge). */
  trailing?: React.ReactNode;
  /** Wrapper class name for the outer container. */
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size,
      showSearchIcon = true,
      icon,
      trailing,
      wrapperClassName,
      type = "text",
      ...props
    },
    ref
  ) => {
    return (
      <div
        data-slot="input-wrapper"
        className={cn(inputWrapperVariants({ size }), wrapperClassName)}
      >
        {/* Leading icon slot */}
        {(icon || showSearchIcon) && (
          <span className="text-ink-subtle group-focus-within:text-accent-blue transition-colors duration-150">
            {icon || <SearchIcon />}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            "flex-1 bg-transparent border-none outline-none",
            "text-ink text-[16px] font-medium",
            "placeholder:text-ink-subtle",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />

        {/* Trailing slot */}
        {trailing && (
          <span className="text-ink-subtle shrink-0">{trailing}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputWrapperVariants, SearchIcon };
