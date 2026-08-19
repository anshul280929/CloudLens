"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { dismissAlert, snoozeAlert, resolveAlert, cancelServiceAlert } from "@/app/actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AlertItem {
  id: string;
  type: "expiry" | "inactivity" | "outage" | "security" | "cost";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  status: "active" | "dismissed" | "snoozed" | "resolved";
  createdAt: Date;
  repositoryName?: string | null;
  serviceName?: string | null;
}

interface NotificationBellProps {
  initialAlerts: AlertItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_COLORS: Record<AlertItem["severity"], string> = {
  critical: "bg-semantic-error text-white",
  warning: "bg-semantic-warning text-white",
  info: "bg-accent-blue text-white",
};

const SEVERITY_DOT: Record<AlertItem["severity"], string> = {
  critical: "bg-semantic-error",
  warning: "bg-semantic-warning",
  info: "bg-accent-blue",
};

const TYPE_LABELS: Record<AlertItem["type"], string> = {
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
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Bell icon
// ---------------------------------------------------------------------------

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2a4 4 0 00-4 4v3l-1 1.5h10L12 9V6a4 4 0 00-4-4zM6.5 13a1.5 1.5 0 003 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Alert row inside the dropdown
// ---------------------------------------------------------------------------

function AlertRow({
  alert,
  onAction,
}: {
  alert: AlertItem;
  onAction: (id: string) => void;
}) {
  const [loading, setLoading] = React.useState<string | null>(null);

  async function act(action: "dismiss" | "snooze" | "resolve" | "cancel", id: string) {
    setLoading(action);
    try {
      if (action === "dismiss") await dismissAlert(id);
      else if (action === "snooze") await snoozeAlert(id);
      else if (action === "resolve") await resolveAlert(id);
      else await cancelServiceAlert(id);
      onAction(id);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="px-4 py-3.5 border-b border-[rgba(178,182,189,0.06)] last:border-b-0 hover:bg-surface-2/50 transition-colors">
      {/* Header row */}
      <div className="flex items-start gap-2.5 mb-1.5">
        <span className={cn("mt-0.5 w-2 h-2 rounded-full flex-shrink-0", SEVERITY_DOT[alert.severity])} />
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-medium text-ink leading-snug">{alert.title}</p>
          <p className="text-caption text-ink-subtle mt-0.5 leading-relaxed line-clamp-2">{alert.message}</p>
        </div>
      </div>

      {/* Meta + actions */}
      <div className="flex items-center justify-between gap-2 mt-2 pl-4.5">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", SEVERITY_COLORS[alert.severity])}>
            {TYPE_LABELS[alert.type]}
          </span>
          <span className="text-caption text-ink-subtle">{timeAgo(alert.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => act("snooze", alert.id)}
            disabled={!!loading}
            title="Snooze 7 days"
            className="text-caption text-ink-subtle hover:text-ink px-1.5 py-0.5 rounded hover:bg-surface-3 transition-colors disabled:opacity-50"
          >
            {loading === "snooze" ? "…" : "Snooze"}
          </button>
          <button
            onClick={() => act("resolve", alert.id)}
            disabled={!!loading}
            title="Mark resolved"
            className="text-caption text-ink-subtle hover:text-semantic-success px-1.5 py-0.5 rounded hover:bg-surface-3 transition-colors disabled:opacity-50"
          >
            {loading === "resolve" ? "…" : "Resolve"}
          </button>
          <button
            onClick={() => act("dismiss", alert.id)}
            disabled={!!loading}
            title="Dismiss"
            className="text-caption text-ink-subtle hover:text-ink px-1.5 py-0.5 rounded hover:bg-surface-3 transition-colors disabled:opacity-50"
          >
            {loading === "dismiss" ? "…" : "✕"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main NotificationBell component
// ---------------------------------------------------------------------------

export function NotificationBell({ initialAlerts }: NotificationBellProps) {
  const [open, setOpen] = React.useState(false);
  const [alerts, setAlerts] = React.useState<AlertItem[]>(initialAlerts);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const unreadCount = activeAlerts.length;

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleAction(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "dismissed" as const } : a)),
    );
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        id="notification-bell-button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-md transition-colors border",
          open
            ? "text-ink bg-surface-2 border-[rgba(178,182,189,0.1)]"
            : "text-ink-muted hover:text-ink hover:bg-surface-2 border-transparent hover:border-[rgba(178,182,189,0.1)]",
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-semantic-error text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
            aria-hidden="true"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          id="notification-panel"
          role="dialog"
          aria-label="Notifications"
          className={cn(
            "absolute right-0 top-[calc(100%+8px)] z-50",
            "w-[380px] max-h-[480px] flex flex-col",
            "rounded-xl border border-[rgba(178,182,189,0.12)] bg-surface-1 shadow-2xl",
            "overflow-hidden",
          )}
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(178,182,189,0.08)" }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(178,182,189,0.1)] flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-semibold text-ink">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold text-white bg-semantic-error rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <a
              href="/dashboard/alerts"
              onClick={() => setOpen(false)}
              className="text-caption text-accent-blue hover:underline"
            >
              View all
            </a>
          </div>

          {/* Alert list */}
          <div className="overflow-y-auto flex-1">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path
                    d="M16 4a8 8 0 00-8 8v6l-2 3h20l-2-3v-6a8 8 0 00-8-8zM13 25a3 3 0 006 0"
                    stroke="var(--ink-subtle)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-body-sm text-ink-subtle">All caught up!</p>
                <p className="text-caption text-ink-subtle">No active notifications.</p>
              </div>
            ) : (
              activeAlerts
                .sort((a, b) => {
                  const order = { critical: 0, warning: 1, info: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map((alert) => (
                  <AlertRow key={alert.id} alert={alert} onAction={handleAction} />
                ))
            )}
          </div>

          {/* Footer */}
          {activeAlerts.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[rgba(178,182,189,0.08)] flex-shrink-0">
              <p className="text-caption text-ink-subtle text-center">
                Alerts sorted by severity · <a href="/dashboard/alerts" onClick={() => setOpen(false)} className="text-accent-blue hover:underline">See full history</a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
