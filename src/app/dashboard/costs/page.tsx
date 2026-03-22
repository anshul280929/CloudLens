"use client";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  PiggyBank,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { costEstimates, dashboardStats } from "@/lib/mock-data";

export default function CostsPage() {
  const totalCost = dashboardStats.estimatedMonthlyCost;
  const paidServices = costEstimates.filter((c) => c.estimatedMonthlyCost > 0);
  const freeServices = costEstimates.filter((c) => c.estimatedMonthlyCost === 0);
  const sortedByPrice = [...costEstimates].sort(
    (a, b) => b.estimatedMonthlyCost - a.estimatedMonthlyCost
  );

  // Mock cost bar max
  const maxCost = Math.max(...costEstimates.map((c) => c.estimatedMonthlyCost), 1);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <DollarSign className="w-7 h-7 text-emerald-400" />
          Cost Tracker
        </h1>
        <p className="text-muted-foreground mt-1">
          Estimated monthly burn rate across all your services.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/50 py-0">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Monthly Burn Rate
            </p>
            <p className="text-4xl font-bold mt-2 gradient-text">${totalCost}</p>
            <p className="text-xs text-muted-foreground mt-1">/month estimated</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 py-0">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Paid Services
            </p>
            <p className="text-4xl font-bold mt-2">{paidServices.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              of {costEstimates.length} total services
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 py-0">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Free Services
            </p>
            <p className="text-4xl font-bold mt-2 text-emerald-400">
              {freeServices.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">on free tier</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Savings Suggestion */}
      <Card className="border-indigo/20 bg-indigo/5 py-0">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo to-cyan flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                AI Cost Insight
                <Badge className="bg-indigo/20 text-indigo-light border-indigo/30 text-[10px]">
                  AI
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                You could save <span className="text-emerald-400 font-semibold">$25/mo</span> by
                moving your &quot;portfolio-v3&quot; Firebase project to the free Spark plan — it
                only uses 12 Firestore reads/day, well within free limits. Also consider
                downgrading your &quot;old-blog&quot; Firebase to free tier since the repo has
                been inactive for 11 months.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-indigo/20 text-indigo-light hover:bg-indigo/30 cursor-pointer text-xs"
                >
                  <PiggyBank className="w-3 h-3 mr-1" />
                  Apply Suggestions
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost breakdown chart (horizontal bars) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Cost Breakdown</h2>
        <Card className="border-border/50 bg-card/50 py-0">
          <CardContent className="p-5 space-y-4">
            {sortedByPrice.map((cost) => {
              const barWidth =
                cost.estimatedMonthlyCost === 0
                  ? 2
                  : Math.max((cost.estimatedMonthlyCost / maxCost) * 100, 4);
              return (
                <div key={cost.serviceId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={cost.serviceIcon}
                        alt={cost.serviceName}
                        className="w-5 h-5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-sm font-medium">{cost.serviceName}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-border/50"
                      >
                        {cost.estimatedTier}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold font-mono">
                      {cost.estimatedMonthlyCost === 0 ? (
                        <span className="text-emerald-400">Free</span>
                      ) : (
                        `$${cost.estimatedMonthlyCost}`
                      )}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-accent/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cost.estimatedMonthlyCost === 0
                          ? "bg-emerald-500/40"
                          : "bg-gradient-to-r from-indigo to-cyan"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Used in: {cost.repos.join(", ")}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Per-service cost cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Service Details</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedByPrice.map((cost) => (
            <Card
              key={cost.serviceId}
              className="border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-200 py-0"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-background/80 border border-border/30 flex items-center justify-center">
                    <img
                      src={cost.serviceIcon}
                      alt={cost.serviceName}
                      className="w-5 h-5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{cost.serviceName}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {cost.estimatedTier} plan
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold">
                    {cost.estimatedMonthlyCost === 0 ? (
                      <span className="text-emerald-400">$0</span>
                    ) : (
                      `$${cost.estimatedMonthlyCost}`
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cost.repos.map((repo) => (
                    <Badge
                      key={repo}
                      variant="outline"
                      className="text-[10px] border-border/50 font-mono"
                    >
                      {repo}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
