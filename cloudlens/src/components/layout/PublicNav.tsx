"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

function LogoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="8.5" height="8.5" rx="2" fill="var(--accent)" />
      <rect x="12.5" y="1" width="8.5" height="8.5" rx="2" fill="var(--accent)" opacity="0.6" />
      <rect x="1" y="12.5" width="8.5" height="8.5" rx="2" fill="var(--accent)" opacity="0.6" />
      <rect x="12.5" y="12.5" width="8.5" height="8.5" rx="2" fill="var(--accent)" opacity="0.3" />
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
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-sm border-b border-border">
      <nav className="max-w-[1280px] mx-auto px-10 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="CloudLens home">
          <LogoMark />
          <span
            className="text-[16px] font-extrabold tracking-tight text-text"
            style={{ fontFamily: "var(--ff-d)" }}
          >
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
                  "text-[13px] text-text2 hover:text-text transition-colors",
                  pathname === link.href && "text-text"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-radius bg-accent text-[#07090e] text-[13px] font-semibold hover:bg-[#52ffb4] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(46,255,160,0.3)] transition-all duration-150"
            >
              Dashboard →
            </Link>
          ) : (
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-radius bg-accent text-[#07090e] text-[13px] font-semibold hover:bg-[#52ffb4] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(46,255,160,0.3)] transition-all duration-150"
            >
              Connect GitHub →
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-radius text-text2 hover:text-text hover:bg-elevated transition-colors"
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
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-radius text-[13px] text-text2 hover:text-text hover:bg-elevated transition-colors"
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
