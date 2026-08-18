"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "@/components/ServiceCard";

/* ── Inline select — reuses the same pattern from RepositoryList ── */
function Select({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative flex items-center bg-surface-1 border border-[rgba(178,182,189,0.1)] rounded-md h-10 transition-all duration-150 focus-within:border-accent-blue focus-within:shadow-[0_0_0_1px_var(--accent-blue)] min-w-[140px]">
      <select
        className={
          "bg-transparent border-none outline-none text-ink text-[14px] font-medium pl-[14px] pr-8 cursor-pointer appearance-none w-full h-full " +
          (className ?? "")
        }
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-3.5 pointer-events-none text-ink-subtle flex items-center">
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* ── Types ── */
export interface AggregatedService {
  serviceName: string;
  provider: string;
  category: string;
  avgConfidence: number;
  maxConfidence: number;
  repoCount: number;
}

interface ServiceListProps {
  services: AggregatedService[];
}

/* ── Category labels for the filter dropdown ── */
const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "database", label: "Database" },
  { value: "auth", label: "Auth" },
  { value: "hosting", label: "Hosting" },
  { value: "payments", label: "Payments" },
  { value: "monitoring", label: "Monitoring" },
  { value: "email", label: "Email" },
  { value: "storage", label: "Storage" },
  { value: "compute", label: "Compute" },
  { value: "cdn", label: "CDN" },
  { value: "ci-cd", label: "CI/CD" },
  { value: "other", label: "Other" },
];

/* ── Confidence level filter ── */
const CONFIDENCE_LEVELS = [
  { value: "all", label: "All Confidence" },
  { value: "high", label: "High (≥ 80%)" },
  { value: "medium", label: "Medium (50–79%)" },
  { value: "low", label: "Low (< 50%)" },
];

export function ServiceList({ services }: ServiceListProps) {
  const [search, setSearch] = React.useState("");
  const [providerFilter, setProviderFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [confidenceFilter, setConfidenceFilter] = React.useState("all");

  // Extract unique providers for the dropdown
  const uniqueProviders = React.useMemo(() => {
    const providers = new Set<string>();
    services.forEach((s) => providers.add(s.provider));
    return Array.from(providers).sort();
  }, [services]);

  // Filter logic
  const filteredServices = React.useMemo(() => {
    let result = [...services];

    // Search by service name
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q),
      );
    }

    // Provider filter
    if (providerFilter !== "all") {
      result = result.filter((s) => s.provider === providerFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((s) => s.category === categoryFilter);
    }

    // Confidence filter
    if (confidenceFilter !== "all") {
      result = result.filter((s) => {
        if (confidenceFilter === "high") return s.maxConfidence >= 0.8;
        if (confidenceFilter === "medium")
          return s.maxConfidence >= 0.5 && s.maxConfidence < 0.8;
        if (confidenceFilter === "low") return s.maxConfidence < 0.5;
        return true;
      });
    }

    // Sort by confidence desc, then alphabetically
    result.sort((a, b) => {
      if (b.maxConfidence !== a.maxConfidence)
        return b.maxConfidence - a.maxConfidence;
      return a.serviceName.localeCompare(b.serviceName);
    });

    return result;
  }, [services, search, providerFilter, categoryFilter, confidenceFilter]);

  return (
    <div className="space-y-6">
      {/* ── Filter toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-surface-1/40 p-4 rounded-lg border border-[rgba(178,182,189,0.1)]">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Input
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs"
          />

          <Select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="all">All Providers</option>
            {uniqueProviders.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>

          <Select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
          >
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Result count */}
        <span className="text-caption text-ink-subtle whitespace-nowrap">
          {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Services grid ── */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((svc) => (
            <ServiceCard
              key={`${svc.serviceName}-${svc.provider}`}
              serviceName={svc.serviceName}
              provider={svc.provider}
              category={svc.category}
              confidenceScore={svc.maxConfidence}
              repoCount={svc.repoCount}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center border border-dashed border-hairline rounded-lg p-12 text-center bg-surface-1/10">
          <div className="w-12 h-12 rounded-full bg-surface-2 border border-[rgba(178,182,189,0.1)] flex items-center justify-center mb-4 text-ink-subtle">
            <svg
              width="22"
              height="22"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 12a3 3 0 01-.5-5.96A4.5 4.5 0 018 2.5a4.5 4.5 0 014.5 4 3 3 0 01-.5 5.96"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-subhead text-ink mb-2">No Services Found</h3>
          <p className="text-body-sm text-ink-subtle max-w-sm">
            {search || providerFilter !== "all" || categoryFilter !== "all" || confidenceFilter !== "all"
              ? "No services match your current filters. Try adjusting them."
              : "Scan your repositories to detect cloud services automatically."}
          </p>
        </div>
      )}
    </div>
  );
}
