import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ── Confidence level helpers ── */
export type ConfidenceLevel = "high" | "medium" | "low";

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

const confidenceColors: Record<ConfidenceLevel, string> = {
  high: "var(--semantic-success)",
  medium: "var(--semantic-warning)",
  low: "var(--semantic-error)",
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/* ── Provider → badge variant mapping ── */
function providerBadgeVariant(
  provider: string,
): "aws" | "gcp" | "azure" | "vercel" | "stripe" | "supabase" | "default" {
  const p = provider.toLowerCase();
  if (p === "aws") return "aws";
  if (p === "gcp" || p === "google" || p === "firebase") return "gcp";
  if (p === "azure" || p === "microsoft") return "azure";
  if (p === "vercel") return "vercel";
  if (p === "stripe") return "stripe";
  if (p === "supabase") return "supabase";
  return "default";
}

/* ── Category display labels ── */
const categoryLabels: Record<string, string> = {
  database: "Database",
  auth: "Auth",
  hosting: "Hosting",
  payments: "Payments",
  monitoring: "Monitoring",
  email: "Email",
  storage: "Storage",
  compute: "Compute",
  cdn: "CDN",
  "ci-cd": "CI/CD",
  other: "Other",
};

export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Service name, e.g. "Amazon S3" */
  serviceName: string;
  /** Cloud provider, e.g. "AWS" */
  provider: string;
  /** Service category, e.g. "storage" */
  category: string;
  /** Confidence score 0–1 */
  confidenceScore: number;
  /** Number of repositories this service was detected in */
  repoCount: number;
  /** Click handler for "View Details" */
  onViewDetails?: () => void;
}

export const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  (
    {
      className,
      serviceName,
      provider,
      category,
      confidenceScore,
      repoCount,
      onViewDetails,
      ...props
    },
    ref,
  ) => {
    const level = getConfidenceLevel(confidenceScore);
    const barColor = confidenceColors[level];
    const barWidth = `${Math.round(confidenceScore * 100)}%`;

    return (
      <Card
        ref={ref}
        variant="interactive"
        className={cn(
          "p-5 flex flex-col gap-4 transition-colors duration-200 cursor-pointer group",
          className,
        )}
        onClick={onViewDetails}
        {...props}
      >
        {/* ── Header: name + provider badge ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-ink truncate">
              {serviceName}
            </h3>
            <span className="text-caption text-ink-subtle">
              {categoryLabels[category] ?? category}
            </span>
          </div>
          <Badge variant={providerBadgeVariant(provider)} size="sm" showDot={false}>
            {provider}
          </Badge>
        </div>

        {/* ── Confidence bar ── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">
              Confidence
            </span>
            <span
              className="text-[12px] font-semibold"
              style={{ color: barColor }}
            >
              {Math.round(confidenceScore * 100)}% · {confidenceLabels[level]}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: barWidth,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>

        {/* ── Footer: repo count + View Details ── */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(178,182,189,0.08)]">
          <span className="text-caption text-ink-subtle">
            <strong className="text-ink-muted font-medium">{repoCount}</strong>{" "}
            {repoCount === 1 ? "repo" : "repos"}
          </span>
          <span className="text-caption text-ink-subtle group-hover:text-ink transition-colors duration-150">
            View Details →
          </span>
        </div>
      </Card>
    );
  },
);

ServiceCard.displayName = "ServiceCard";
