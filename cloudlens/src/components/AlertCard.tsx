import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  provider: "aws" | "gcp" | "azure" | "vercel" | "stripe" | "supabase" | "statuspage" | string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: React.ReactNode;
  repoName: string;
  timestamp: string;
}

export const AlertCard = React.forwardRef<HTMLDivElement, AlertCardProps>(
  (
    {
      className,
      provider,
      severity,
      title,
      description,
      repoName,
      timestamp,
      ...props
    },
    ref
  ) => {
    // Map severity to left border color using semantic tokens
    const borderColors = {
      critical: "border-l-semantic-error",
      warning: "border-l-semantic-warning",
      info: "border-l-accent-blue",
    };

    // Determine badge variant for the provider
    const getBadgeVariant = (prov: string) => {
      const lower = prov.toLowerCase();
      const validVariants = ["aws", "gcp", "azure", "vercel", "stripe", "supabase"];
      
      if (validVariants.includes(lower)) {
        return lower as any;
      }
      
      if (lower === "statuspage") {
        return "scanning";
      }

      return "info";
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "bg-surface-1 border border-[rgba(178,182,189,0.1)] border-l-[3px] rounded-md p-4 px-5",
          borderColors[severity] || "border-l-accent-blue",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant={getBadgeVariant(provider)} size="sm">
            {provider}
          </Badge>
          <div className="text-body-sm font-semibold text-ink">
            {title}
          </div>
        </div>

        <div className="text-body-sm text-ink-muted">
          {description}
        </div>

        <div className="mt-3 text-caption text-ink-subtle flex items-center gap-3.5">
          <span>{repoName}</span>
          <span>{timestamp}</span>
        </div>
      </Card>
    );
  }
);

AlertCard.displayName = "AlertCard";
