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
  },
  {
    num: "02",
    title: "Scan & Detect",
    description:
      "Our detection engine analyses every file — dependencies, imports, config files, and environment variables — identifying all cloud services.",
  },
  {
    num: "03",
    title: "Monitor & Save",
    description:
      "Receive weekly digests, real-time alerts on outages and expiring tiers, and AI-driven cost-reduction recommendations.",
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
    <div className="relative min-h-screen w-full max-w-[100vw] bg-canvas text-ink overflow-x-hidden flex flex-col items-center">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1280px] mx-auto px-6 lg:px-12 pt-section pb-section flex flex-col items-center text-center">
        <FadeIn delay={0} className="mb-8">
          <span className="text-eyebrow inline-flex items-center gap-2 px-[10px] py-[4px] rounded-pill bg-surface-1 border border-[rgba(178,182,189,0.1)] text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-badge-pulse" />
            Now in Beta — Free while we build
          </span>
        </FadeIn>

        <FadeIn delay={0.05} className="mb-6">
          <h1 className="text-display-xl max-w-4xl text-ink">
            A lens into every{" "}
            <span className="text-accent-blue">cloud service</span>{" "}
            you use
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-10">
          <p className="text-body-lg text-ink-muted max-w-xl">
            CloudLens scans your GitHub repos, auto-detects every AWS, Stripe, Supabase,
            and 50+ other services, then keeps you warned about costs, outages, and expiring
            free tiers — from one unified dashboard.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="mb-28">
  <div className="flex flex-col sm:flex-row items-center gap-4">
    {session ? (
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 h-10 px-[18px] rounded-md bg-inverse-canvas text-inverse-ink text-[14px] font-semibold hover:bg-white/90 transition-all duration-150"
      >
        Go to Dashboard →
      </Link>
    ) : (
      <Link
        href="/api/auth/signin"
        className="inline-flex items-center gap-2 h-10 px-[18px] rounded-md bg-inverse-canvas text-inverse-ink text-[14px] font-semibold hover:bg-white/90 transition-all duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1C4.13 1 1 4.13 1 8c0 3.09 2.01 5.71 4.79 6.63.35.06.48-.15.48-.34v-1.2c-1.96.43-2.37-.94-2.37-.94-.32-.81-.78-1.03-.78-1.03-.64-.44.05-.43.05-.43.71.05 1.08.73 1.08.73.63 1.08 1.65.77 2.05.59.06-.46.25-.77.45-.95-1.56-.18-3.2-.78-3.2-3.47 0-.77.27-1.39.72-1.88-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.92.72A6.7 6.7 0 018 4.8c.6.003 1.2.08 1.77.24 1.33-.91 1.91-.72 1.91-.72.38.97.14 1.68.07 1.86.45.49.72 1.11.72 1.88 0 2.7-1.64 3.29-3.21 3.46.25.22.47.65.47 1.31v1.94c0 .19.13.41.48.34A7.012 7.012 0 0015 8c0-3.87-3.13-7-7-7z" />
        </svg>
        Connect GitHub — It&apos;s Free
      </Link>
    )}
    <Link
      href="/#how-it-works"
      className="inline-flex items-center gap-1.5 h-10 px-[18px] rounded-md bg-surface-2 text-ink text-[14px] font-semibold hover:bg-surface-3 transition-all duration-150"
    >
      See how it works
    </Link>
  </div>
</FadeIn>

{/* Terminal demo */}
<FadeIn delay={0.2} className="w-full max-w-2xl mt-8 overflow-x-auto rounded-lg">
  <TerminalCodeBlock title="cloudlens scan" language="bash" code={TERMINAL_CODE} />
</FadeIn>

        {/* Logo strip */}
        <FadeIn delay={0.25} className="mt-16 w-full">
          <p className="text-eyebrow text-ink-subtle mb-5">
            Detects services from 50+ providers including
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {LOGOS.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-3 py-1.5 bg-surface-1 border border-[rgba(178,182,189,0.1)] rounded-sm text-caption text-ink-muted hover:text-ink transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="w-full max-w-[1280px] mx-auto px-6 lg:px-12 py-section">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-eyebrow text-ink-muted mb-3 block">
              Features
            </span>
            <h2 className="text-display-md text-ink">
              Everything you need to stay on top of{" "}
              <span className="text-accent-blue">your cloud</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
      <section id="how-it-works" className="w-full max-w-[1280px] mx-auto px-6 lg:px-12 py-section border-t border-[rgba(178,182,189,0.1)]">
        <FadeIn>
          <div className="text-center mb-14">
            <span className="text-eyebrow text-ink-muted mb-3 block">
              How It Works
            </span>
            <h2 className="text-display-md text-ink">
              Up and running in{" "}
              <span className="text-accent-blue">3 minutes</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-8 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-hairline-soft"
          />

          {STEPS.map((step, i) => (
            <FadeIn key={step.num} delay={i * 0.1} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border border-[rgba(178,182,189,0.1)] bg-surface-1 flex items-center justify-center text-[14px] font-bold text-ink mb-5 relative z-10">
                {step.num}
              </div>
              <h3 className="text-subhead text-ink mb-2">{step.title}</h3>
              <p className="text-body-sm text-ink-muted max-w-xs">{step.description}</p>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-12 flex justify-center">
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 h-10 px-[18px] rounded-md bg-inverse-canvas text-inverse-ink text-[14px] font-semibold hover:bg-white/90 transition-all duration-150"
          >
            Get started for free →
          </Link>
        </FadeIn>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="w-full max-w-[1280px] mx-auto px-6 lg:px-12 py-section border-t border-[rgba(178,182,189,0.1)]">
        <FadeIn>
          <div className="text-center mb-14">
            <span className="text-eyebrow text-ink-muted mb-3 block">
              Pricing
            </span>
            <h2 className="text-display-md text-ink mb-3">
              Simple, transparent{" "}
              <span className="text-accent-blue">pricing</span>
            </h2>
            <p className="text-body text-ink-muted">
              Start free. Upgrade when you need more. No hidden fees.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.07}>
              <div
                className={`relative flex flex-col h-full rounded-lg border p-8 transition-colors duration-200 ${
                  plan.highlighted
                    ? "border-hairline bg-surface-2"
                    : "border-[rgba(178,182,189,0.1)] bg-surface-1 hover:border-hairline"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-pill text-eyebrow bg-inverse-canvas text-inverse-ink">
                    MOST POPULAR
                  </span>
                )}

                <div className="mb-5">
                  <p className="text-eyebrow text-ink-subtle mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-headline text-ink">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-caption text-ink-subtle">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-body-sm text-ink-muted mt-1.5">{plan.description}</p>
                </div>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-body-sm text-ink-muted">
                      <svg
                        className="shrink-0 mt-0.5 text-semantic-success"
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
                    className="inline-flex items-center justify-center h-10 px-[18px] rounded-md text-[14px] font-semibold border transition-all duration-150 border-hairline text-ink-muted hover:text-ink hover:bg-surface-2"
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href="/api/auth/signin"
                    className={`inline-flex items-center justify-center h-10 px-[18px] rounded-md text-[14px] font-semibold transition-all duration-150 ${
                      plan.highlighted
                        ? "bg-inverse-canvas text-inverse-ink hover:bg-white/90"
                        : "border border-hairline text-ink-muted hover:text-ink hover:bg-surface-2"
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
      <section className="w-full max-w-[1280px] mx-auto px-6 lg:px-12 py-section border-t border-[rgba(178,182,189,0.1)]">
        <FadeIn>
          <div className="relative rounded-2xl border border-[rgba(178,182,189,0.1)] bg-surface-1 px-8 py-16 lg:py-20 text-center overflow-hidden">
            <h2 className="text-display-md text-ink mb-4 relative">
              Start monitoring your cloud stack{" "}
              <span className="text-accent-blue">today</span>
            </h2>
            <p className="text-body text-ink-muted max-w-md mx-auto mb-8 relative">
              Join thousands of developers who&apos;ve already stopped paying for services
              they forgot about.
            </p>
            <Link
              href="/api/auth/signin"
              className="relative inline-flex items-center gap-2 h-10 px-[18px] rounded-md bg-inverse-canvas text-inverse-ink text-[14px] font-semibold hover:bg-white/90 transition-all duration-150"
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