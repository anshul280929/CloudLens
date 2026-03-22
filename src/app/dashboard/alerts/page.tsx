"use client";

import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Info,
  ExternalLink,
  Check,
  Clock,
  Filter,
  BellOff,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alerts as initialAlerts } from "@/lib/mock-data";
import { AlertSeverity } from "@/lib/types";
import { useState } from "react";

const severityConfig = {
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    label: "Warning",
  },
  critical: {
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    label: "Critical",
  },
};

const typeLabels: Record<string, { label: string; icon: React.ElementType }> = {
  expiry_warning: { label: "Expiry", icon: Clock },
  inactivity: { label: "Inactivity", icon: BellOff },
  quota_limit: { label: "Quota", icon: AlertTriangle },
  cost_spike: { label: "Cost Spike", icon: AlertTriangle },
  outage: { label: "Outage", icon: ShieldAlert },
  security: { label: "Security", icon: ShieldAlert },
  ai_suggestion: { label: "AI Insight", icon: Sparkles },
};

function timeAgo(dateStr: string) {
  const now = new Date("2026-03-22T22:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function AlertsPage() {
  const [alertList, setAlertList] = useState(initialAlerts);
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "all">("all");

  const visibleAlerts = alertList.filter((a) => !a.isDismissed);
  const filteredAlerts =
    filterSeverity === "all"
      ? visibleAlerts
      : visibleAlerts.filter((a) => a.severity === filterSeverity);

  const criticalCount = visibleAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = visibleAlerts.filter((a) => a.severity === "warning").length;
  const infoCount = visibleAlerts.filter((a) => a.severity === "info").length;

  const markAsRead = (id: string) => {
    setAlertList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
  };

  const dismiss = (id: string) => {
    setAlertList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDismissed: true } : a))
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Bell className="w-7 h-7 text-yellow-400" />
          Alerts
        </h1>
        <p className="text-muted-foreground mt-1">
          Stay on top of your service health, costs, and security.
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-medium text-red-400">
            {criticalCount} Critical
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-medium text-yellow-400">
            {warningCount} Warnings
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-400/10 border border-blue-400/20">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400">
            {infoCount} Info
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "critical", "warning", "info"] as const).map((sev) => (
          <Button
            key={sev}
            variant={filterSeverity === sev ? "default" : "outline"}
            size="sm"
            className={`cursor-pointer text-xs ${
              filterSeverity === sev
                ? "bg-indigo/20 text-indigo-light border-indigo/30 hover:bg-indigo/30"
                : "border-border/50"
            }`}
            onClick={() => setFilterSeverity(sev)}
          >
            {sev === "all"
              ? `All (${visibleAlerts.length})`
              : `${sev.charAt(0).toUpperCase() + sev.slice(1)}`}
          </Button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="border-border/50 bg-card/50 py-0">
            <CardContent className="p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No alerts to show.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            const typeConfig = typeLabels[alert.type];

            return (
              <Card
                key={alert.id}
                className={`border-border/50 bg-card/50 hover:bg-card/70 transition-all duration-200 py-0 ${
                  !alert.isRead
                    ? `border-l-2 ${config.border.replace("border-", "border-l-")}`
                    : "opacity-75"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold">{alert.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${config.color} ${config.border}`}
                            >
                              {config.label}
                            </Badge>
                            {typeConfig && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-border/50"
                              >
                                <typeConfig.icon className="w-2.5 h-2.5 mr-1" />
                                {typeConfig.label}
                              </Badge>
                            )}
                            {alert.repoName && (
                              <span className="text-[11px] text-muted-foreground font-mono bg-accent/50 px-1.5 py-0.5 rounded">
                                {alert.repoName}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {timeAgo(alert.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {alert.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        {alert.actionUrl && alert.actionUrl !== "#" && (
                          <a
                            href={alert.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              className="bg-indigo/20 text-indigo-light hover:bg-indigo/30 cursor-pointer text-xs"
                            >
                              Go to Dashboard
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </a>
                        )}
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() => dismiss(alert.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
