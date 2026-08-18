import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/* ── Confidence level helpers ── */
type ConfidenceLevel = "high" | "medium" | "low";

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

/* ── Detection source display labels ── */
const sourceLabels: Record<string, string> = {
  dependency: "Dependency",
  config: "Config File",
  import: "Import",
  envVar: "Env Variable",
  cicd: "CI/CD",
};

const sourceIcons: Record<string, React.ReactNode> = {
  dependency: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  config: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 6v.01M8 9v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  import: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 3L2 8l3 5M11 3l3 5-3 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  envVar: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 7h6M5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cicd: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8a6 6 0 0111.2-3M14 8A6 6 0 012.8 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
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

/* ── Category labels ── */
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

export interface ServiceEvidenceRowProps {
  /** Service name, e.g. "Amazon S3" */
  serviceName: string;
  /** Cloud provider, e.g. "AWS" */
  provider: string;
  /** Service category, e.g. "storage" */
  category: string;
  /** Confidence score 0–1 */
  confidenceScore: number;
  /** How detection was made */
  detectionSource: string;
  /** File path where evidence was found */
  evidenceFile?: string | null;
  /** Line number in the file */
  evidenceLine?: number | null;
  /** Code snippet of the match */
  evidenceSnippet?: string | null;
}

export function ServiceEvidenceRow({
  serviceName,
  provider,
  category,
  confidenceScore,
  detectionSource,
  evidenceFile,
  evidenceLine,
  evidenceSnippet,
}: ServiceEvidenceRowProps) {
  const level = getConfidenceLevel(confidenceScore);
  const barColor = confidenceColors[level];

  return (
    <div className="group rounded-lg border border-[rgba(178,182,189,0.08)] bg-surface-1/60 hover:bg-surface-1 hover:border-[rgba(178,182,189,0.15)] transition-all duration-200 p-4">
      {/* ── Top row: service name + badges ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <h4 className="text-[15px] font-semibold text-ink truncate">
            {serviceName}
          </h4>
          <Badge variant={providerBadgeVariant(provider)} size="sm" showDot={false}>
            {provider}
          </Badge>
          <span className="text-[11px] font-medium text-ink-subtle bg-surface-2 px-2 py-0.5 rounded-full whitespace-nowrap">
            {categoryLabels[category] ?? category}
          </span>
        </div>

        {/* Confidence pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.round(confidenceScore * 100)}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
            <span
              className="text-[12px] font-semibold tabular-nums"
              style={{ color: barColor }}
            >
              {Math.round(confidenceScore * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Evidence details ── */}
      <div className="flex flex-col gap-2">
        {/* Detection source + file path */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-subtle">
          {/* Source badge */}
          <span className="inline-flex items-center gap-1">
            {sourceIcons[detectionSource] ?? null}
            <span className="font-medium">
              {sourceLabels[detectionSource] ?? detectionSource}
            </span>
          </span>

          {/* File path */}
          {evidenceFile && (
            <span className="font-mono text-[12px] text-ink-muted truncate max-w-[300px]" title={evidenceFile}>
              {evidenceFile}
              {evidenceLine != null && (
                <span className="text-accent-blue">:{evidenceLine}</span>
              )}
            </span>
          )}
        </div>

        {/* Code snippet */}
        {evidenceSnippet && (
          <div className="mt-1 rounded-md bg-[#090D17] border border-[rgba(178,182,189,0.06)] px-3 py-2 overflow-x-auto">
            <code className="text-[12px] font-mono text-ink-muted leading-relaxed whitespace-pre">
              {evidenceSnippet}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
