import type { ReactNode } from "react";
import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api-docs" },
      { label: "GitHub", href: "https://github.com", rel: "noopener noreferrer" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <PublicNav />
      <main className="flex-1">{children}</main>

      {/* ── Footer ─── DESIGN.md: canvas bg, ink-muted caption, dense link grid, 64px 32px padding ── */}
      <footer className="border-t border-[rgba(178,182,189,0.1)] py-16 px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Top row: Logo + link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {/* Logo + tagline spanning 2 cols */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" />
                  <rect x="12.5" y="1" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.6" />
                  <rect x="1" y="12.5" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.6" />
                  <rect x="12.5" y="12.5" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.3" />
                </svg>
                <span className="text-[15px] font-bold text-ink">CloudLens</span>
              </div>
              <p className="text-caption text-ink-subtle">
                A lens into every cloud service you use.
              </p>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-eyebrow text-ink-muted mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        rel={"rel" in link ? (link as { rel: string }).rel : undefined}
                        className="text-caption text-ink-subtle hover:text-ink-muted transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="border-t border-[rgba(178,182,189,0.1)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-caption text-ink-subtle">
            <span>© 2026 CloudLens. All rights reserved.</span>
            <span>
              Built for developers who ship.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
