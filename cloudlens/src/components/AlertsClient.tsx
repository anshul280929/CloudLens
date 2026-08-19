"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { dismissAlert, snoozeAlert, resolveAlert, cancelServiceAlert } from "@/app/actions";
import type { AlertItem } from "@/components/NotificationBell";

// ---------------------------------------------------------------------------
// Re-export types needed here
// ---------------------------------------------------------------------------

type AlertType = AlertItem["type"];
type AlertSeverity = AlertItem["severity"];
type AlertStatus = AlertItem["status"];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: "text-semantic-error bg-[rgba(230,43,30,0.1)] border-[rgba(230,43,30,0.2)]",
  warning: "text-semantic-warning bg-[rgba(234,179,8,0.1)] border-[rgba(234,179,8,0.2)]",
  info: "text-accent-blue bg-[rgba(37,99,235,0.1)] border-[rgba(37,99,235,0.2)]",
};

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  critical: "bg-semantic-error",
  warning: "bg-semantic-warning",
  info: "bg-accent-blue",
};

const STATUS_BADGE: Record<AlertStatus, string> = {
  active: "text-semantic-success bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)]",
  dismissed: "text-ink-subtle bg-surface-2 border-[rgba(178,182,189,0.1)]",
  snoozed: "text-accent-blue bg-[rgba(37,99,235,0.08)] border-[rgba(37,99,235,0.15)]",
  resolved: "text-ink-subtle bg-surface-2 border-[rgba(178,182,189,0.1)]",
};

const TYPE_LABELS: Record<AlertType, string> = {
  expiry: "Expiry",
  inactivity: "Inactivity",
  outage: "Outage",
  security: "Security",
  cost: "Cost",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Alert row
// ---------------------------------------------------------------------------

function AlertRow({
  alert,
  onStatusChange,
}: {
  alert: AlertItem;
  onStatusChange: (id: string, status: AlertStatus) => void;
}) {
  const [loading, setLoading] = React.useState<string | null>(null);

  async function act(action: "dismiss" | "snooze" | "resolve" | "cancel", id: string) {
    setLoading(action);
    try {
      if (action === "dismiss") { await dismissAlert(id); onStatusChange(id, "dismissed"); }
      else if (action === "snooze") { await snoozeAlert(id); onStatusChange(id, "snoozed"); }
      else if (action === "resolve") { await resolveAlert(id); onStatusChange(id, "resolved"); }
      else { await cancelServiceAlert(id); onStatusChange(id, "resolved"); }
    } finally {
      setLoading(null);
    }
  }

  const isActive = alert.status === "active";

  return (
    <div className={cn(
      "rounded-lg border p-4 transition-opacity",
      "border-[rgba(178,182,189,0.1)] bg-surface-1",
      !isActive && "opacity-60",
    )}>
      <div className="flex items-start gap-3">
        {/* Severity dot */}
        <span className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0", SEVERITY_DOT[alert.severity])} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <p className="text-body-sm font-medium text-ink leading-snug">{alert.title}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded border", SEVERITY_COLORS[alert.severity])}>
                {alert.severity}
              </span>
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded border", STATUS_BADGE[alert.status])}>
                {alert.status}
              </span>
              <span className="text-[11px] font-medium text-ink-subtle px-2 py-0.5 rounded border border-[rgba(178,182,189,0.1)] bg-surface-2">
                {TYPE_LABELS[alert.type]}
              </span>
            </div>
          </div>

          <p className="text-body-sm text-ink-muted mt-1 leading-relaxed">{alert.message}</p>

          <div className="flex items-center justify-between gap-3 mt-3">
            <span className="text-caption text-ink-subtle">{timeAgo(alert.createdAt)}</span>

            {isActive && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => act("snooze", alert.id)}
                  disabled={!!loading}
                  className="text-[12px] font-medium text-ink-muted hover:text-ink px-2.5 py-1 rounded-md hover:bg-surface-2 border border-transparent hover:border-[rgba(178,182,189,0.1)] transition-colors disabled:opacity-50"
                >
                  {loading === "snooze" ? "…" : "Snooze 7d"}
                </button>
                <button
                  onClick={() => act("cancel", alert.id)}
                  disabled={!!loading}
                  className="text-[12px] font-medium text-ink-muted hover:text-ink px-2.5 py-1 rounded-md hover:bg-surface-2 border border-transparent hover:border-[rgba(178,182,189,0.1)] transition-colors disabled:opacity-50"
                >
                  {loading === "cancel" ? "…" : "I cancelled this"}
                </button>
                <button
                  onClick={() => act("resolve", alert.id)}
                  disabled={!!loading}
                  className="text-[12px] font-medium text-semantic-success hover:opacity-80 px-2.5 py-1 rounded-md bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)] transition-opacity disabled:opacity-50"
                >
                  {loading === "resolve" ? "…" : "Mark Resolved"}
                </button>
                <button
                  onClick={() => act("dismiss", alert.id)}
                  disabled={!!loading}
                  className="text-[12px] font-medium text-ink-subtle hover:text-semantic-error px-2.5 py-1 rounded-md hover:bg-surface-2 border border-transparent hover:border-[rgba(178,182,189,0.1)] transition-colors disabled:opacity-50"
                >
                  {loading === "dismiss" ? "…" : "Dismiss"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AlertsClient component
// ---------------------------------------------------------------------------

interface AlertsClientProps {
  initialAlerts: AlertItem[];
}

export function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const [alerts, setAlerts] = React.useState<AlertItem[]>(initialAlerts);

  // Filter state
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<AlertStatus | "all">("all");
  const [filterType, setFilterType] = React.useState<AlertType | "all">("all");
  const [filterSeverity, setFilterSeverity] = React.useState<AlertSeverity | "all">("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "severity">("newest");

  function handleStatusChange(id: string, status: AlertStatus) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  // Filter + sort
  const filtered = alerts
    .filter((a) => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterType !== "all" && a.type !== filterType) return false;
      if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "severity") {
        const order = { critical: 0, warning: 1, info: 2 };
        const diff = order[a.severity] - order[b.severity];
        if (diff !== 0) return diff;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const activeCount = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="flex items-center gap-4 flex-wrap">
        {(["active", "snoozed", "resolved", "dismissed"] as AlertStatus[]).map((s) => {
          const count = alerts.filter((a) => a.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus((prev) => (prev === s ? "all" : s))}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-body-sm transition-colors",
                filterStatus === s
                  ? "border-accent-blue bg-[rgba(37,99,235,0.1)] text-accent-blue"
                  : "border-[rgba(178,182,189,0.1)] bg-surface-1 text-ink-muted hover:text-ink hover:bg-surface-2",
              )}
            >
              <span className="font-semibold text-ink">{count}</span>
              <span className="capitalize">{s}</span>
            </button>
          );
        })}
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-surface-1 border border-[rgba(178,182,189,0.1)] text-ink-subtle text-[13px] flex-1 min-w-[200px] max-w-[320px]">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search alerts…"
            className="bg-transparent outline-none w-full text-ink placeholder:text-ink-subtle text-[13px]"
            aria-label="Search alerts"
          />
        </div>

        {/* Type filter */}
        <select
          id="alert-type-filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as AlertType | "all")}
          className="h-9 px-3 rounded-md bg-surface-1 border border-[rgba(178,182,189,0.1)] text-ink text-[13px] outline-none focus:border-accent-blue cursor-pointer"
        >
          <option value="all">All types</option>
          {(Object.keys(TYPE_LABELS) as AlertType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        {/* Severity filter */}
        <select
          id="alert-severity-filter"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | "all")}
          className="h-9 px-3 rounded-md bg-surface-1 border border-[rgba(178,182,189,0.1)] text-ink text-[13px] outline-none focus:border-accent-blue cursor-pointer"
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        {/* Sort */}
        <select
          id="alert-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "severity")}
          className="h-9 px-3 rounded-md bg-surface-1 border border-[rgba(178,182,189,0.1)] text-ink text-[13px] outline-none focus:border-accent-blue cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="severity">By severity</option>
        </select>

        <span className="ml-auto text-caption text-ink-subtle">
          {filtered.length} of {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-lg border border-[rgba(178,182,189,0.08)] bg-surface-1">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path
              d="M20 5a10 10 0 00-10 10v7.5l-2.5 3.75h25L30 22.5V15A10 10 0 0020 5zM16.25 31.25a3.75 3.75 0 007.5 0"
              stroke="var(--ink-subtle)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-body-sm text-ink-muted">No alerts match your filters</p>
          <button
            onClick={() => { setSearch(""); setFilterStatus("all"); setFilterType("all"); setFilterSeverity("all"); }}
            className="text-caption text-accent-blue hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <AlertRow key={alert.id} alert={alert} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
