import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "accent" | "blue" | "amber" | string;
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, title, description, icon, variant = "default", ...props }, ref) => {
    // Map variant to icon container color styles using DESIGN.md tokens
    const iconColors: Record<string, string> = {
      default: "bg-surface-2 border border-[rgba(178,182,189,0.1)] text-ink",
      accent: "bg-[rgba(43,137,255,0.1)] border border-[rgba(43,137,255,0.2)] text-accent-blue",
      blue: "bg-[rgba(43,137,255,0.1)] border border-[rgba(43,137,255,0.2)] text-accent-blue",
      amber: "bg-[rgba(255,207,37,0.1)] border border-[rgba(255,207,37,0.2)] text-semantic-warning",
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "bg-surface-1 border border-[rgba(178,182,189,0.1)] rounded-lg p-6",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center mb-4",
            iconColors[variant] || iconColors.default
          )}
        >
          {icon}
        </div>
        <div className="text-card-title text-ink mb-2">
          {title}
        </div>
        <div className="text-body text-ink-muted">
          {description}
        </div>
      </Card>
    );
  }
);

FeatureCard.displayName = "FeatureCard";
