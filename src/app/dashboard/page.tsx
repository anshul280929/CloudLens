"use client";

import { useEffect, useState } from "react";
import {
  FolderGit2,
  Box,
  Bell,
  DollarSign,
  ExternalLink,
  ArrowRight,
  Scan,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface DashboardData {
  totalRepos: number;
  totalServices: number;
  activeAlerts: number;
  estimatedMonthlyCost: number;
  servicesPerCategory: Record<string, number>;
  scanProgress: { completed: number; pending: number; scanning: number; failed: number };
}

interface RepoData {
  id: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  language: string | null;
  stars: number;
  scanStatus: string;
  lastCommitAt: string | null;
  lastScannedAt: string | null;
  detectedServices: {
    id: string;
    confidence: string;
    service: {
      id: string;
      name: string;
      slug: string;
      category: string;
      logoUrl: string;
      dashboardUrl: string;
      color: string;
    };
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [repos, setRepos] = useState<RepoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const fetchData = async () => {
    try {
      const [dashRes, reposRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/repos"),
      ]);
      if (dashRes.ok) setStats(await dashRes.json());
      if (reposRes.ok) setRepos(await reposRes.json());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const syncRepos = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/repos", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`✅ ${data.message}`);
        await fetchData();
      } else {
        setSyncMessage(`❌ ${data.error}`);
      }
    } catch {
      setSyncMessage("❌ Failed to sync repos");
    } finally {
      setSyncing(false);
    }
  };

  const scanAll = async () => {
    setScanning(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/repos/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`✅ ${data.message}`);
        await fetchData();
      } else {
        setSyncMessage(`❌ ${data.error}`);
      }
    } catch {
      setSyncMessage("❌ Failed to scan repos");
    } finally {
      setScanning(false);
    }
  };

  // Collect unique services
  const allServices = new Map<string, { service: RepoData["detectedServices"][0]["service"]; repoCount: number }>();
  repos.forEach((repo) => {
    repo.detectedServices?.forEach((ds) => {
      const existing = allServices.get(ds.service.id);
      if (existing) {
        existing.repoCount += 1;
      } else {
        allServices.set(ds.service.id, { service: ds.service, repoCount: 1 });
      }
    });
  });

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.totalRepos === 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {isEmpty
              ? "Get started by syncing your GitHub repos."
              : "Overview of your services, alerts, and costs."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={syncRepos}
            disabled={syncing}
            variant="outline"
            className="border-border/50 cursor-pointer"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {syncing ? "Syncing..." : "Sync Repos"}
          </Button>
          <Button
            onClick={scanAll}
            disabled={scanning || isEmpty}
            className="bg-gradient-to-r from-indigo to-indigo-light hover:from-indigo-light hover:to-indigo text-white shadow-lg shadow-indigo/20 cursor-pointer"
          >
            {scanning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Scan className="w-4 h-4 mr-2" />
            )}
            {scanning ? "Scanning..." : "Scan All Repos"}
          </Button>
        </div>
      </div>

      {/* Sync message */}
      {syncMessage && (
        <div className="px-4 py-3 rounded-lg border border-border/50 bg-card/50 text-sm">
          {syncMessage}
        </div>
      )}

      {/* Empty State */}
      {isEmpty ? (
        <Card className="border-border/50 bg-card/50 border-dashed py-0">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo to-cyan flex items-center justify-center mx-auto mb-6">
              <FolderGit2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">No repos synced yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Click &quot;Sync Repos&quot; to import your GitHub repositories, then &quot;Scan All Repos&quot; to detect services.
            </p>
            <Button
              onClick={syncRepos}
              disabled={syncing}
              className="bg-gradient-to-r from-indigo to-cyan text-white shadow-lg shadow-indigo/20 cursor-pointer"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync from GitHub
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Repositories",
                value: stats!.totalRepos,
                icon: FolderGit2,
                gradient: "from-indigo to-indigo-light",
                href: "/dashboard/repos",
              },
              {
                label: "Services Found",
                value: stats!.totalServices,
                icon: Box,
                gradient: "from-cyan to-cyan-light",
                href: "/dashboard/services",
              },
              {
                label: "Scanned",
                value: `${stats!.scanProgress.completed}/${stats!.totalRepos}`,
                icon: CheckCircle2,
                gradient: "from-emerald-500 to-green-500",
                href: "/dashboard/repos",
              },
              {
                label: "Pending Scans",
                value: stats!.scanProgress.pending + stats!.scanProgress.failed,
                icon: Bell,
                gradient: "from-yellow-500 to-orange-500",
                href: "/dashboard/repos",
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

          {/* Services + Recent Repos */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Repos */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-light" />
                  Repositories
                </h2>
                <Link href="/dashboard/repos">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer">
                    View all
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {repos.slice(0, 5).map((repo) => (
                  <Card key={repo.id} className="border-border/50 bg-card/50 hover:bg-card/70 transition-all py-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">{repo.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {repo.language && (
                              <span className="text-xs text-muted-foreground">{repo.language}</span>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                repo.scanStatus === "completed"
                                  ? "text-emerald-400 border-emerald-400/30"
                                  : repo.scanStatus === "failed"
                                  ? "text-red-400 border-red-400/30"
                                  : "text-muted-foreground border-border/50"
                              }`}
                            >
                              {repo.scanStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex -space-x-2">
                          {repo.detectedServices?.slice(0, 4).map((ds) => (
                            <div
                              key={ds.id}
                              className="w-7 h-7 rounded-full bg-background border-2 border-card flex items-center justify-center"
                            >
                              <img
                                src={ds.service.logoUrl}
                                alt={ds.service.name}
                                className="w-4 h-4"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          ))}
                          {(repo.detectedServices?.length || 0) > 4 && (
                            <div className="w-7 h-7 rounded-full bg-accent border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                              +{repo.detectedServices.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Detected Services */}
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
                  {allServices.size === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No services detected yet. Scan your repos first.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {Array.from(allServices.values())
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
                            <a
                              href={service.dashboardUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
