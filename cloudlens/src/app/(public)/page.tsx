import * as React from "react";
import Link from "next/link";
import { FeatureCard, TerminalCodeBlock } from "@/components";
import { FadeIn } from "@/components/FadeIn";
import { auth } from "@/lib/auth";

// ─── Hero terminal code ────────────────────────────────────────────────────────
const TERMINAL_CODE = `$ npx cloudlens scan --repo acme-corp/payments-api

── CloudLens v2.1.0 ─────────────────────────────────────
✓ Cloning repository…             done (1.2s)
✓ Parsing files…                  312 files scanned
✓ Running detection engine…

── Services Detected ────────────────────────────────────
  AWS         S3, SQS, Lambda, RDS          4 services
  Stripe      Payments API                  1 service
  Supabase    Auth, Storage                 2 services
  Vercel      Hosting, Edge Functions       2 services

── Alerts ───────────────────────────────────────────────
  ⚠  Supabase free-tier at 87% — expires in 6 days
  ⚠  Exposed API key found in src/config.ts:14

✓ Scan complete. 9 services · 3 providers · 2 alerts (3.4s)`;

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: "Auto-detect Services",
    description:
      "Scans package.json, config files, env vars, and imports to surface every cloud service in your repos — with confidence scores.",
    variant: "accent" as const,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "GitHub OAuth",
    description:
      "Connect your GitHub in one click. CloudLens fetches all repos — public and private — and runs scans in the background.",
    variant: "blue" as const,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2C5.13 2 2 5.13 2 9c0 3.09 2.01 5.71 4.79 6.63.35.06.48-.15.48-.34v-1.2c-1.96.43-2.37-.94-2.37-.94-.32-.81-.78-1.03-.78-1.03-.64-.44.05-.43.05-.43.71.05 1.08.73 1.08.73.63 1.08 1.65.77 2.05.59.06-.46.25-.77.45-.95-1.56-.18-3.2-.78-3.2-3.47 0-.77.27-1.39.72-1.88-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.92.72A6.7 6.7 0 019 5.8c.6.003 1.2.08 1.77.24 1.33-.91 1.91-.72 1.91-.72.38.97.14 1.68.07 1.86.45.49.72 1.11.72 1.88 0 2.7-1.64 3.29-3.21 3.46.25.22.47.65.47 1.31v1.94c0 .19.13.41.48.34A7.012 7.012 0 0016 9c0-3.87-3.13-7-7-7z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Smart Alerts",
    description:
      "Get notified before free-tier limits expire, services go down, or charges spike — so you're never caught off guard.",
    variant: "amber" as const,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2l1.5 4.5H15l-3.75 2.73 1.43 4.39L9 11.1l-3.68 2.52 1.43-4.39L3 6.5h4.5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Insights",
    description:
      "GPT-4o-mini deep scans your codebase to detect exposed API keys, architectural inefficiencies, and cost-saving opportunities.",
    variant: "accent" as const,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="3" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="3" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="10" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Cost Tracking",
    description:
      "Predicts your monthly cloud burn rate and flags wasted spend — unused buckets, idle instances, forgotten subscriptions.",
    variant: "blue" as const,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 13l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Architecture Maps",
    description:
      "Auto-generates interactive node graphs of your repo's cloud dependencies — visualise what talks to what at a glance.",
    variant: "amber" as const,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="3.5" cy="14" r="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14.5" cy="14" r="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 6v3M9 9l-4 3M9 9l4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Connect GitHub",
    description:
      "Sign in with GitHub OAuth in one click. CloudLens securely reads your repos — no tokens stored on our servers.",
    color: "accent",
  },
  {
    num: "02",
    title: "Scan & Detect",
    description:
      "Our detection engine analyses every file — dependencies, imports, config files, and environment variables — identifying all cloud services.",
    color: "blue",
  },
  {
    num: "03",
    title: "Monitor & Save",
    description:
      "Receive weekly digests, real-time alerts on outages and expiring tiers, and AI-driven cost-reduction recommendations.",
    color: "amber",
  },
];

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for indie devs with a few projects.",
    features: [
      "Up to 3 repositories",
      "Basic service detection",
      "Weekly digest emails",
      "7-day alert history",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For developers who ship seriously.",
    features: [
      "Unlimited repositories",
      "AI-powered deep scans",
      "Real-time alerts",
      "Cost & burn rate tracking",
      "90-day history",
      "Architecture maps",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "/month",
    description: "For startups and small engineering teams.",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared service inventory",
      "Role-based access",
      "Slack & Discord alerts",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For orgs that need full control and compliance.",
    features: [
      "Everything in Team",
      "Unlimited members",
      "SSO / SAML",
      "Audit logs",
      "SLA guarantee",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// ─── Logos ────────────────────────────────────────────────────────────────────
const LOGOS = ["AWS", "GCP", "Azure", "Vercel", "Stripe", "Supabase", "Neon", "Clerk"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="relative min-h-screen bg-bg text-text selection:bg-accent-glow overflow-x-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(46,255,160,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 flex flex-col items-center text-center">
        <FadeIn delay={0}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-accent-glow border border-accent-bdr text-accent mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-badge-pulse" />
            Now in Beta — Free while we build
          </span>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] max-w-3xl mb-6">
            A lens into every{" "}
            <span className="text-accent">cloud service</span>{" "}
            you use
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-[17px] text-text2 max-w-xl leading-relaxed mb-10">
            CloudLens scans your GitHub repos, auto-detects every AWS, Stripe, Supabase,
            and 50+ other services, then keeps you warned about costs, outages, and expiring
            free tiers — from one unified dashboard.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-radius bg-accent text-[#07090e] text-[14px] font-semibold hover:bg-[#52ffb4] hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(46,255,160,0.35)] transition-all duration-150"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-radius bg-accent text-[#07090e] text-[14px] font-semibold hover:bg-[#52ffb4] hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(46,255,160,0.35)] transition-all duration-150"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1C4.13 1 1 4.13 1 8c0 3.09 2.01 5.71 4.79 6.63.35.06.48-.15.48-.34v-1.2c-1.96.43-2.37-.94-2.37-.94-.32-.81-.78-1.03-.78-1.03-.64-.44.05-.43.05-.43.71.05 1.08.73 1.08.73.63 1.08 1.65.77 2.05.59.06-.46.25-.77.45-.95-1.56-.18-3.2-.78-3.2-3.47 0-.77.27-1.39.72-1.88-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.92.72A6.7 6.7 0 018 4.8c.6.003 1.2.08 1.77.24 1.33-.91 1.91-.72 1.91-.72.38.97.14 1.68.07 1.86.45.49.72 1.11.72 1.88 0 2.7-1.64 3.29-3.21 3.46.25.22.47.65.47 1.31v1.94c0 .19.13.41.48.34A7.012 7.012 0 0015 8c0-3.87-3.13-7-7-7z" />
                </svg>
                Connect GitHub — It&apos;s Free
              </Link>
            )}
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-1.5 h-11 px-5 rounded-radius border border-border2 text-[14px] text-text2 hover:text-text hover:border-border2 hover:bg-elevated transition-all duration-150"
            >
              See how it works
            </Link>
          </div>
        </FadeIn>

        {/* Terminal demo */}
        <FadeIn delay={0.2} className="w-full max-w-2xl">
          <TerminalCodeBlock title="cloudlens scan" language="bash" code={TERMINAL_CODE} />
        </FadeIn>

        {/* Logo strip */}
        <FadeIn delay={0.25} className="mt-14 w-full">
          <p className="text-[11px] text-text3 font-mono uppercase tracking-widest mb-5">
            Detects services from 50+ providers including
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {LOGOS.map((name) => (
              <span
                key={name}
                className="font-mono text-[12px] font-medium text-text3 hover:text-text2 transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="inline-block font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
              Features
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything you need to stay on top of{" "}
              <span className="text-accent">your cloud</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <FadeIn key={feat.title} delay={i * 0.06}>
              <FeatureCard
                title={feat.title}
                description={feat.description}
                icon={feat.icon}
                variant={feat.variant}
                className="h-full"
              />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-24 border-t border-border">
        <FadeIn>
          <div className="text-center mb-14">
            <span className="inline-block font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
              How It Works
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
              Up and running in{" "}
              <span className="text-accent">3 minutes</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-8 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-border2"
          />

          {STEPS.map((step, i) => {
            const colors: Record<string, string> = {
              accent: "bg-accent-glow border-accent-bdr text-accent",
              blue: "bg-[rgba(78,143,255,0.1)] border-[rgba(78,143,255,0.2)] text-blue",
              amber: "bg-[rgba(245,177,32,0.1)] border-[rgba(245,177,32,0.2)] text-amber",
            };
            return (
              <FadeIn key={step.num} delay={i * 0.1} className="flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-full border flex items-center justify-center font-mono text-[14px] font-bold mb-5 relative z-10 bg-bg ${colors[step.color]}`}
                >
                  {step.num}
                </div>
                <h3 className="font-heading text-[18px] font-bold text-text mb-2">{step.title}</h3>
                <p className="text-[13px] text-text2 leading-relaxed max-w-xs">{step.description}</p>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={0.3} className="mt-12 flex justify-center">
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-radius bg-accent text-[#07090e] text-[14px] font-semibold hover:bg-[#52ffb4] hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(46,255,160,0.35)] transition-all duration-150"
          >
            Get started for free →
          </Link>
        </FadeIn>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 py-24 border-t border-border">
        <FadeIn>
          <div className="text-center mb-14">
            <span className="inline-block font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
              Pricing
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Simple, transparent{" "}
              <span className="text-accent">pricing</span>
            </h2>
            <p className="text-[15px] text-text2">
              Start free. Upgrade when you need more. No hidden fees.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.07}>
              <div
                className={`relative flex flex-col h-full rounded-[12px] border p-6 transition-colors duration-200 ${
                  plan.highlighted
                    ? "border-accent-bdr bg-accent-glow shadow-[0_0_32px_rgba(46,255,160,0.08)]"
                    : "border-border bg-surface hover:border-border2"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent text-[#07090e]">
                    MOST POPULAR
                  </span>
                )}

                <div className="mb-5">
                  <p className="font-mono text-[12px] text-text3 mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-extrabold text-text">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-[13px] text-text3">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-[12px] text-text2 mt-1.5">{plan.description}</p>
                </div>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-[12px] text-text2">
                      <svg
                        className="shrink-0 mt-0.5 text-accent"
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                      >
                        <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M4 6.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                {plan.name === "Enterprise" ? (
                  <a
                    href="mailto:sales@cloudlens.dev"
                    className={`inline-flex items-center justify-center h-9 px-4 rounded-radius text-[13px] font-semibold border transition-all duration-150 border-border2 text-text2 hover:text-text hover:border-border2 hover:bg-elevated`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href="/api/auth/signin"
                    className={`inline-flex items-center justify-center h-9 px-4 rounded-radius text-[13px] font-semibold transition-all duration-150 ${
                      plan.highlighted
                        ? "bg-accent text-[#07090e] hover:bg-[#52ffb4] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(46,255,160,0.3)]"
                        : "border border-border2 text-text2 hover:text-text hover:bg-elevated"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 border-t border-border">
        <FadeIn>
          <div className="relative rounded-[16px] border border-accent-bdr bg-accent-glow px-8 py-14 text-center overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(46,255,160,0.15) 0%, transparent 60%)",
              }}
            />
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 relative">
              Start monitoring your cloud stack{" "}
              <span className="text-accent">today</span>
            </h2>
            <p className="text-[15px] text-text2 max-w-md mx-auto mb-8 relative">
              Join thousands of developers who&apos;ve already stopped paying for services
              they forgot about.
            </p>
            <Link
              href="/api/auth/signin"
              className="relative inline-flex items-center gap-2 h-11 px-7 rounded-radius bg-accent text-[#07090e] text-[14px] font-semibold hover:bg-[#52ffb4] hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(46,255,160,0.4)] transition-all duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1C4.13 1 1 4.13 1 8c0 3.09 2.01 5.71 4.79 6.63.35.06.48-.15.48-.34v-1.2c-1.96.43-2.37-.94-2.37-.94-.32-.81-.78-1.03-.78-1.03-.64-.44.05-.43.05-.43.71.05 1.08.73 1.08.73.63 1.08 1.65.77 2.05.59.06-.46.25-.77.45-.95-1.56-.18-3.2-.78-3.2-3.47 0-.77.27-1.39.72-1.88-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.92.72A6.7 6.7 0 018 4.8c.6.003 1.2.08 1.77.24 1.33-.91 1.91-.72 1.91-.72.38.97.14 1.68.07 1.86.45.49.72 1.11.72 1.88 0 2.7-1.64 3.29-3.21 3.46.25.22.47.65.47 1.31v1.94c0 .19.13.41.48.34A7.012 7.012 0 0015 8c0-3.87-3.13-7-7-7z" />
              </svg>
              Connect GitHub — It&apos;s Free
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
