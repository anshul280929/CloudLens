import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  dotColor?: "success" | "warning" | "error" | "blue" | "muted" | string;
  pulse?: boolean;
}

export const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  ({ className, label, dotColor = "success", pulse = false, ...props }, ref) => {
    // Map to DESIGN.md semantic/product colors
    const dotColors: Record<string, string> = {
      success: "bg-semantic-success",
      warning: "bg-semantic-warning",
      error: "bg-semantic-error",
      blue: "bg-accent-blue",
      muted: "bg-ink-subtle",
    };

    const isThemeColor = dotColors[dotColor] !== undefined;

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-[7px] bg-surface-2 border border-[rgba(178,182,189,0.1)] rounded-sm text-caption text-ink-muted select-none",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            isThemeColor ? dotColors[dotColor] : "",
            pulse && "animate-badge-pulse"
          )}
          style={!isThemeColor ? { backgroundColor: dotColor } : undefined}
          aria-hidden="true"
        />
        <span className="uppercase tracking-wider">{label}</span>
      </div>
    );
  }
);

StatusBar.displayName = "StatusBar";
