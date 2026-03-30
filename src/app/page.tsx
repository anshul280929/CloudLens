import Link from "next/link";
import {
  Cloud,
  Shield,
  DollarSign,
  Bell,
  Github,
  ArrowRight,
  Scan,
  LayoutDashboard,
  Zap,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid + gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo to-cyan flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Cloudlens</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="default"
                className="bg-gradient-to-r from-indigo to-indigo-light hover:from-indigo-light hover:to-indigo text-white shadow-lg shadow-indigo/25 cursor-pointer"
              >
                <Github className="w-4 h-4 mr-2" />
                Sign in with GitHub
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo/30 bg-indigo/5 text-sm text-indigo-light mb-8 animate-fade-up">
            <Zap className="w-3.5 h-3.5" />
            AI-powered service detection for developers
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-up stagger-1">
            A lens into{" "}
            <span className="gradient-text">every cloud service</span>
            <br />
            you use.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
            Connect your GitHub. We scan your repos, detect every service — from
            Supabase to Stripe — track costs, and warn you before things expire.
            All from one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-3">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo to-cyan hover:from-indigo-light hover:to-cyan-light text-white shadow-xl shadow-indigo/30 px-8 h-12 text-base cursor-pointer"
              >
                <Github className="w-5 h-5 mr-2" />
                Get Started — It&apos;s Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 h-12 text-base px-8 cursor-pointer"
            >
              See Demo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Dashboard preview */}
          <div className="mt-20 relative animate-fade-up stagger-4">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border/50 glass overflow-hidden p-1 glow-indigo">
              <div className="rounded-lg bg-card/80 p-6">
                {/* Mock dashboard header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    cloudlens.dev/dashboard
                  </div>
                  <div className="w-16" />
                </div>
                {/* Mock stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Repos Scanned", value: "12", color: "text-indigo-light" },
                    { label: "Services Found", value: "24", color: "text-cyan" },
                    { label: "Active Alerts", value: "5", color: "text-yellow-400" },
                    { label: "Monthly Cost", value: "$68", color: "text-emerald-400" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border/50 bg-background/50 p-4 text-left"
                    >
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                {/* Mock service list */}
                <div className="mt-4 space-y-2">
                  {[
                    { name: "Supabase", status: "Operational", color: "bg-emerald-500" },
                    { name: "Vercel", status: "Operational", color: "bg-emerald-500" },
                    { name: "Firebase", status: "Degraded", color: "bg-yellow-500" },
                  ].map((svc) => (
                    <div
                      key={svc.name}
                      className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 px-4 py-3"
                    >
                      <span className="text-sm font-medium">{svc.name}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${svc.color}`} />
                        <span className="text-xs text-muted-foreground">{svc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">track your stack</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Stop losing track of services. Cloudlens gives you a complete view of
              your tech infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Scan,
                title: "Auto-Detection",
                description:
                  "Scans package.json, config files, imports, and CI/CD pipelines to find every service you use.",
                gradient: "from-indigo to-indigo-light",
              },
              {
                icon: Bell,
                title: "Smart Alerts",
                description:
                  "Get warned before services expire, quotas hit, or forgotten projects cost you money.",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: DollarSign,
                title: "Cost Tracking",
                description:
                  "See your estimated monthly burn rate across all services. Find savings opportunities.",
                gradient: "from-emerald-500 to-green-500",
              },
              {
                icon: Eye,
                title: "Status Monitoring",
                description:
                  "Real-time service status monitoring. Know when Supabase or Vercel goes down before your users do.",
                gradient: "from-cyan to-cyan-light",
              },
              {
                icon: Shield,
                title: "Security Scan",
                description:
                  "Detect exposed API keys, hardcoded secrets, and security misconfigurations in your repos.",
                gradient: "from-red-500 to-pink-500",
              },
              {
                icon: LayoutDashboard,
                title: "Visual Map",
                description:
                  "Interactive architecture diagram showing how your services connect across projects.",
                gradient: "from-purple-500 to-violet-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/50 bg-card/50 p-6 hover:border-indigo/30 hover:bg-card/80 transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three steps to{" "}
              <span className="gradient-text">full visibility</span>
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Connect GitHub",
                description:
                  "Sign in with GitHub and grant access to your repos. We only read code — never write or modify anything.",
              },
              {
                step: "02",
                title: "We Scan Everything",
                description:
                  "Our detection engine analyzes dependencies, configs, imports, and CI/CD pipelines to identify every service you use.",
              },
              {
                step: "03",
                title: "Get Insights & Alerts",
                description:
                  "See your complete service inventory, estimated costs, health status, and get proactive alerts about issues.",
              },
            ].map((item, idx) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo to-cyan flex items-center justify-center text-sm font-bold text-white">
                  {item.step}
                </div>
                <div className={`pt-1 ${idx < 2 ? "border-l border-border/30 ml-[-30px] pl-[54px] pb-6" : "ml-[-30px] pl-[54px]"}`}>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent{" "}
              <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                description: "For individual developers getting started.",
                features: [
                  "Up to 5 repos",
                  "Basic service detection",
                  "Weekly email digest",
                  "Public status monitoring",
                ],
                cta: "Get Started",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$12",
                period: "/month",
                description: "For developers who want full visibility.",
                features: [
                  "Unlimited repos",
                  "AI-powered insights",
                  "Cost tracking",
                  "Real-time alerts",
                  "CLI access",
                  "Deep integrations",
                ],
                cta: "Start Free Trial",
                highlighted: true,
              },
              {
                name: "Team",
                price: "$24",
                period: "/user/month",
                description: "For teams managing shared infrastructure.",
                features: [
                  "Everything in Pro",
                  "Org-wide dashboard",
                  "Offboarding checklists",
                  "Policy enforcement",
                  "Audit logs",
                  "SSO / SAML",
                ],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 border ${
                  plan.highlighted
                    ? "border-indigo/50 bg-indigo/5 glow-indigo relative"
                    : "border-border/50 bg-card/50"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo to-cyan text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <Button
                  className={`w-full cursor-pointer ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-indigo to-indigo-light hover:from-indigo-light hover:to-indigo text-white"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-light" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop forgetting about services.
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of developers who use Cloudlens to keep their tech stack under control.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo to-cyan hover:from-indigo-light hover:to-cyan-light text-white shadow-xl shadow-indigo/30 px-8 h-12 text-base cursor-pointer"
            >
              <Github className="w-5 h-5 mr-2" />
              Get Started with GitHub
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo to-cyan flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-foreground">Cloudlens</span>
          </div>
          <p>&copy; 2026 Cloudlens. A lens into every cloud service you use.</p>
        </div>
      </footer>
    </div>
  );
}
