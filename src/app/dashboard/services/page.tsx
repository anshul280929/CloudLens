"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  category: string;
  logoUrl: string;
  websiteUrl: string;
  dashboardUrl: string;
  statusPageUrl: string;
  color: string;
  freeTierLimits: Record<string, string> | null;
  pricingTiers: { name: string; price: number }[] | null;
  status: string;
  repoCount: number;
  repos: { id: string; name: string; confidence: string }[];
}

const categoryIcons: Record<string, React.ElementType> = {
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

const categoryLabels: Record<string, string> = {
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

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredServices =
    filterCategory === "all"
      ? services
      : services.filter((s) => s.category === filterCategory);

  const activeCategories = [...new Set(services.map((s) => s.category))];

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Box className="w-7 h-7 text-cyan" />
          Services
        </h1>
        <p className="text-muted-foreground mt-1">
          {services.length} services detected across your repos
        </p>
      </div>

      {services.length === 0 ? (
        <Card className="border-border/50 bg-card/50 border-dashed py-0">
          <CardContent className="p-8 text-center">
            <Box className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No services detected yet. Sync and scan your repos first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
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
              All ({services.length})
            </Button>
            {activeCategories.map((cat) => {
              const Icon = categoryIcons[cat] || Layers;
              const count = services.filter((s) => s.category === cat).length;
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
                  {categoryLabels[cat] || cat} ({count})
                </Button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const CatIcon = categoryIcons[service.category] || Layers;
              return (
                <Card
                  key={service.id}
                  className="border-border/50 bg-card/50 hover:bg-card/80 hover:border-indigo/20 transition-all duration-300 group py-0"
                >
                  <CardContent className="p-5">
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
                              {categoryLabels[service.category] || service.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-400">Operational</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Used in</p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.repos.map((repo) => (
                          <Badge key={repo.id} variant="outline" className="text-[11px] border-border/50 font-mono">
                            {repo.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {service.freeTierLimits && Object.keys(service.freeTierLimits).length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Free tier limits</p>
                        <div className="space-y-1">
                          {Object.entries(service.freeTierLimits).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{key}</span>
                              <span className="font-mono text-foreground/80">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator className="my-3 bg-border/30" />

                    <div className="flex items-center gap-2">
                      <a href={service.dashboardUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs border-border/50 hover:border-indigo/30 hover:text-indigo-light cursor-pointer">
                          Open Dashboard <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                      {service.statusPageUrl && (
                        <a href={service.statusPageUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                            Status
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
