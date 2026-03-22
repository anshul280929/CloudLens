"use client";

import {
  FolderGit2,
  Box,
  Bell,
  DollarSign,
  TrendingUp,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
  Info,
  ArrowRight,
  Scan,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  dashboardStats,
  repositories,
  alerts,
  costEstimates,
  services,
} from "@/lib/mock-data";

const severityConfig = {
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  critical: {
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
};

const statusColors: Record<string, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-yellow-500",
  partial_outage: "bg-orange-500",
  major_outage: "bg-red-500",
};

export default function DashboardPage() {
  const recentAlerts = alerts.filter((a) => !a.isDismissed).slice(0, 4);
  const topCosts = [...costEstimates]
    .sort((a, b) => b.estimatedMonthlyCost - a.estimatedMonthlyCost)
    .slice(0, 5);

  // Unique services across all repos
  const allDetectedServices = new Map<string, { service: typeof services[0]; repoCount: number }>();
  repositories.forEach((repo) => {
    repo.detectedServices.forEach((ds) => {
      const existing = allDetectedServices.get(ds.service.id);
      if (existing) {
        existing.repoCount += 1;
      } else {
        allDetectedServices.set(ds.service.id, { service: ds.service, repoCount: 1 });
      }
    });
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your services, alerts, and costs.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-indigo to-indigo-light hover:from-indigo-light hover:to-indigo text-white shadow-lg shadow-indigo/20 cursor-pointer w-fit">
          <Scan className="w-4 h-4 mr-2" />
          Scan All Repos
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Repositories",
            value: dashboardStats.totalRepos,
            icon: FolderGit2,
            gradient: "from-indigo to-indigo-light",
            href: "/dashboard/repos",
          },
          {
            label: "Services Found",
            value: dashboardStats.totalServices,
            icon: Box,
            gradient: "from-cyan to-cyan-light",
            href: "/dashboard/services",
          },
          {
            label: "Active Alerts",
            value: dashboardStats.activeAlerts,
            icon: Bell,
            gradient: "from-yellow-500 to-orange-500",
            href: "/dashboard/alerts",
          },
          {
            label: "Monthly Cost",
            value: `$${dashboardStats.estimatedMonthlyCost}`,
            icon: DollarSign,
            gradient: "from-emerald-500 to-green-500",
            href: "/dashboard/costs",
          },
        ].map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:border-indigo/20 transition-all duration-300 cursor-pointer group py-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Recent Alerts
            </h2>
            <Link href="/dashboard/alerts">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer">
                View all
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              return (
                <Card
                  key={alert.id}
                  className={`border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-200 py-0 ${
                    !alert.isRead ? "border-l-2 " + config.border.replace("border-", "border-l-") : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium leading-tight">
                            {alert.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-[10px] ${config.color} ${config.border}`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {alert.message}
                        </p>
                        {alert.repoName && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-2 font-mono bg-accent/50 px-1.5 py-0.5 rounded">
                            {alert.repoName}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Service Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan" />
              Services
            </h2>
            <Link href="/dashboard/services">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer">
                View all
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <Card className="border-border/50 bg-card/50 py-0">
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {Array.from(allDetectedServices.values())
                  .slice(0, 8)
                  .map(({ service, repoCount }) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={service.logoUrl}
                          alt={service.name}
                          className="w-5 h-5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {repoCount} {repoCount === 1 ? "repo" : "repos"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            statusColors[service.status] || "bg-gray-500"
                          }`}
                        />
                        <a
                          href={service.dashboardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cost Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Cost Breakdown
          </h2>
          <Link href="/dashboard/costs">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer">
              Full report
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topCosts.map((cost) => (
            <Card
              key={cost.serviceId}
              className="border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-200 py-0"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <img
                    src={cost.serviceIcon}
                    alt={cost.serviceName}
                    className="w-5 h-5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-sm font-medium">{cost.serviceName}</span>
                </div>
                <p className="text-2xl font-bold">
                  {cost.estimatedMonthlyCost === 0 ? (
                    <span className="text-emerald-400">Free</span>
                  ) : (
                    <span>${cost.estimatedMonthlyCost}</span>
                  )}
                  <span className="text-xs text-muted-foreground font-normal ml-1">/mo</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cost.estimatedTier} • {cost.repos.length}{" "}
                  {cost.repos.length === 1 ? "repo" : "repos"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
