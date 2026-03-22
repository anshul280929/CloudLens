"use client";

import {
  FolderGit2,
  Lock,
  Globe,
  Star,
  Clock,
  Scan,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { repositories } from "@/lib/mock-data";
import { useState } from "react";

function timeAgo(dateStr: string) {
  const now = new Date("2026-03-22T22:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}

const scanStatusConfig = {
  completed: { icon: CheckCircle2, color: "text-emerald-400", label: "Scanned" },
  scanning: { icon: Loader2, color: "text-cyan", label: "Scanning..." },
  pending: { icon: Clock, color: "text-muted-foreground", label: "Pending" },
  failed: { icon: XCircle, color: "text-red-400", label: "Failed" },
};

const langColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan",
};

export default function ReposPage() {
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FolderGit2 className="w-7 h-7 text-indigo-light" />
            Repositories
          </h1>
          <p className="text-muted-foreground mt-1">
            {repositories.length} repos scanned •{" "}
            {repositories.reduce((sum, r) => sum + r.detectedServices.length, 0)}{" "}
            services detected
          </p>
        </div>
        <Button className="bg-gradient-to-r from-indigo to-indigo-light hover:from-indigo-light hover:to-indigo text-white shadow-lg shadow-indigo/20 cursor-pointer w-fit">
          <Scan className="w-4 h-4 mr-2" />
          Rescan All
        </Button>
      </div>

      {/* Repo Cards */}
      <div className="space-y-3">
        {repositories.map((repo) => {
          const isExpanded = expandedRepo === repo.id;
          const statusCfg = scanStatusConfig[repo.scanStatus];
          const StatusIcon = statusCfg.icon;
          const lastCommitAgo = timeAgo(repo.lastCommitAt);
          const isInactive =
            new Date("2026-03-22T22:00:00Z").getTime() -
              new Date(repo.lastCommitAt).getTime() >
            1000 * 60 * 60 * 24 * 90; // 90 days

          return (
            <Card
              key={repo.id}
              className={`border-border/50 bg-card/50 hover:bg-card/70 transition-all duration-200 py-0 ${
                isInactive ? "border-l-2 border-l-yellow-500/50" : ""
              }`}
            >
              <CardContent className="p-0">
                {/* Main row */}
                <button
                  className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
                  onClick={() =>
                    setExpandedRepo(isExpanded ? null : repo.id)
                  }
                >
                  {/* Repo info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{repo.name}</h3>
                      {repo.isPrivate ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            langColors[repo.language] || "bg-gray-500"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {repo.language}
                        </span>
                      </div>
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Star className="w-3 h-3" />
                          {repo.stars}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last commit {lastCommitAgo}
                      </span>
                      {isInactive && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-yellow-400 border-yellow-400/30"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Services count + status */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex -space-x-2">
                      {repo.detectedServices.slice(0, 4).map((ds) => (
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
                      {repo.detectedServices.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-accent border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                          +{repo.detectedServices.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <StatusIcon
                        className={`w-4 h-4 ${statusCfg.color} ${
                          repo.scanStatus === "scanning" ? "animate-spin" : ""
                        }`}
                      />
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {statusCfg.label}
                      </span>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/30 pt-3">
                    <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                      Detected Services ({repo.detectedServices.length})
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {repo.detectedServices.map((ds) => (
                        <div
                          key={ds.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-background/50 hover:bg-background/80 transition-colors"
                        >
                          <img
                            src={ds.service.logoUrl}
                            alt={ds.service.name}
                            className="w-6 h-6 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {ds.service.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {Math.round(ds.confidence * 100)}% confidence •{" "}
                              {ds.detectionDetails.length} signals
                            </p>
                          </div>
                          <a
                            href={ds.service.dashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-indigo-light transition-colors shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
