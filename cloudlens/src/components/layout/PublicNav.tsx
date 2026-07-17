"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" />
      <rect x="12.5" y="1" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.6" />
      <rect x="1" y="12.5" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.6" />
      <rect x="12.5" y="12.5" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.3" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur-sm border-b border-[rgba(178,182,189,0.1)]">
      <nav className="max-w-[1280px] mx-auto px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="CloudLens home">
          <LogoMark />
          <span className="text-[16px] font-bold tracking-tight text-ink">
            CloudLens
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-body-sm text-ink-muted hover:text-ink transition-colors",
                  pathname === link.href && "text-ink"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 h-10 px-[18px] rounded-md bg-inverse-canvas text-inverse-ink text-[14px] font-semibold hover:bg-white/90 transition-all duration-150"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/api/auth/signin"
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-[18px] rounded-md bg-surface-2 text-ink text-[14px] font-semibold hover:bg-surface-3 transition-all duration-150"
              >
                Sign in
              </Link>
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center gap-1.5 h-10 px-[18px] rounded-md bg-inverse-canvas text-inverse-ink text-[14px] font-semibold hover:bg-white/90 transition-all duration-150"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-ink-muted hover:text-ink hover:bg-surface-1 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[rgba(178,182,189,0.1)] bg-surface-1 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-body-sm text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
