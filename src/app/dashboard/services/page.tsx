"use client";

import {
  Box,
  ExternalLink,
  Database,
  Shield,
  Globe,
  HardDrive,
  Mail,
  CreditCard,
  BarChart3,
  Cloud,
  Activity,
  Bot,
  Layers,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { repositories, services } from "@/lib/mock-data";
import { ServiceCategory } from "@/lib/types";
import { useState } from "react";

const categoryIcons: Record<ServiceCategory, React.ElementType> = {
  database: Database,
  auth: Shield,
  hosting: Globe,
  storage: HardDrive,
  email: Mail,
  payments: CreditCard,
  analytics: BarChart3,
  cdn: Cloud,
  monitoring: Activity,
  ai: Bot,
  other: Layers,
};

const categoryLabels: Record<ServiceCategory, string> = {
  database: "Database",
  auth: "Authentication",
  hosting: "Hosting",
  storage: "Storage",
  email: "Email",
  payments: "Payments",
  analytics: "Analytics",
  cdn: "CDN",
  monitoring: "Monitoring",
  ai: "AI / ML",
  other: "Other",
};

const statusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  operational: { label: "Operational", color: "text-emerald-400", dotColor: "bg-emerald-500" },
  degraded: { label: "Degraded", color: "text-yellow-400", dotColor: "bg-yellow-500" },
  partial_outage: { label: "Partial Outage", color: "text-orange-400", dotColor: "bg-orange-500" },
  major_outage: { label: "Major Outage", color: "text-red-400", dotColor: "bg-red-500" },
};

export default function ServicesPage() {
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | "all">("all");

  // Build service usage map
  const serviceUsage = new Map<string, string[]>();
  repositories.forEach((repo) => {
    repo.detectedServices.forEach((ds) => {
      const existing = serviceUsage.get(ds.service.id) || [];
      existing.push(repo.name);
      serviceUsage.set(ds.service.id, existing);
    });
  });

  // Only show detected services
  const detectedServiceIds = new Set(serviceUsage.keys());
  const detectedServices = services.filter((s) => detectedServiceIds.has(s.id));

  const filteredServices =
    filterCategory === "all"
      ? detectedServices
      : detectedServices.filter((s) => s.category === filterCategory);

  // Get unique categories from detected services
  const activeCategories = [...new Set(detectedServices.map((s) => s.category))];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Box className="w-7 h-7 text-cyan" />
          Services
        </h1>
        <p className="text-muted-foreground mt-1">
          {detectedServices.length} services detected across{" "}
          {repositories.length} repos
        </p>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filterCategory === "all" ? "default" : "outline"}
          size="sm"
          className={`cursor-pointer text-xs ${
            filterCategory === "all"
              ? "bg-indigo/20 text-indigo-light border-indigo/30 hover:bg-indigo/30"
              : "border-border/50"
          }`}
          onClick={() => setFilterCategory("all")}
        >
          All ({detectedServices.length})
        </Button>
        {activeCategories.map((cat) => {
          const Icon = categoryIcons[cat];
          const count = detectedServices.filter((s) => s.category === cat).length;
          return (
            <Button
              key={cat}
              variant={filterCategory === cat ? "default" : "outline"}
              size="sm"
              className={`cursor-pointer text-xs ${
                filterCategory === cat
                  ? "bg-indigo/20 text-indigo-light border-indigo/30 hover:bg-indigo/30"
                  : "border-border/50"
              }`}
              onClick={() => setFilterCategory(cat)}
            >
              <Icon className="w-3.5 h-3.5 mr-1" />
              {categoryLabels[cat]} ({count})
            </Button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const status = statusConfig[service.status];
          const repos = serviceUsage.get(service.id) || [];
          const CatIcon = categoryIcons[service.category];

          return (
            <Card
              key={service.id}
              className="border-border/50 bg-card/50 hover:bg-card/80 hover:border-indigo/20 transition-all duration-300 group py-0"
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background/80 border border-border/30 flex items-center justify-center">
                      <img
                        src={service.logoUrl}
                        alt={service.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CatIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {categoryLabels[service.category]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${status.dotColor}`} />
                    <span className={`text-xs ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Used in repos */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Used in</p>
                  <div className="flex flex-wrap gap-1.5">
                    {repos.map((repo) => (
                      <Badge
                        key={repo}
                        variant="outline"
                        className="text-[11px] border-border/50 font-mono"
                      >
                        {repo}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Free tier limits */}
                {service.freeTierLimits && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Free tier limits</p>
                    <div className="space-y-1">
                      {Object.entries(service.freeTierLimits)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground">{key}</span>
                            <span className="font-mono text-foreground/80">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <Separator className="my-3 bg-border/30" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={service.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-border/50 hover:border-indigo/30 hover:text-indigo-light cursor-pointer"
                    >
                      Open Dashboard
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                  <a
                    href={service.statusPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Status
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
