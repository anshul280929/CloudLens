"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ── Derive page title from route ──────────────────────────
function usePageTitle(): string {
  const pathname = usePathname();
  const map: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/repositories": "Repositories",
    "/dashboard/services": "Services",
    "/dashboard/alerts": "Alerts",
    "/dashboard/costs": "Costs",
    "/dashboard/insights": "AI Insights",
    "/dashboard/settings": "Settings",
  };
  // Match exact first, then prefix
  if (map[pathname]) return map[pathname];
  const match = Object.keys(map)
    .filter((k) => k !== "/dashboard")
    .find((k) => pathname.startsWith(k));
  return match ? map[match] : "Dashboard";
}

// ── Search icon ───────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Bell icon ─────────────────────────────────────────────
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2a4 4 0 00-4 4v3l-1 1.5h10L12 9V6a4 4 0 00-4-4zM6.5 13a1.5 1.5 0 003 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Hamburger icon ────────────────────────────────────────
function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Header ────────────────────────────────────────────────
export interface HeaderProps {
  /** User's name from session */
  userName?: string | null;
  /** User's avatar URL from session */
  userImage?: string | null;
  /** Mobile sidebar toggle callback */
  onMenuClick?: () => void;
}

export function Header({ userName, userImage, onMenuClick }: HeaderProps) {
  const title = usePageTitle();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 h-16 px-4 md:px-6 bg-surface-1/80 backdrop-blur-sm border-b border-[rgba(178,182,189,0.1)] flex-shrink-0">
      {/* Mobile hamburger */}
      <button
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <HamburgerIcon />
      </button>

      {/* Page title */}
      <h1 className="text-[15px] font-semibold text-ink flex-1 min-w-0 truncate">
        {title}
      </h1>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 h-10 px-[14px] rounded-md bg-surface-1 border border-[rgba(178,182,189,0.1)] text-ink-subtle text-[14px] w-48 focus-within:border-accent-blue focus-within:shadow-[0_0_0_1px_var(--accent-blue)] transition-all">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search repos, services…"
          className="bg-transparent outline-none w-full text-ink placeholder:text-ink-subtle text-[14px]"
          aria-label="Search repositories and services"
        />
      </div>

      {/* Notification bell */}
      <button
        className="flex items-center justify-center w-10 h-10 rounded-md text-ink-muted hover:text-ink hover:bg-surface-2 border border-transparent hover:border-[rgba(178,182,189,0.1)] transition-colors"
        aria-label="Notifications"
      >
        <BellIcon />
      </button>

      {/* User avatar + name */}
      <div className="flex items-center gap-2 pl-1">
        {userImage ? (
          <Image
            src={userImage}
            alt={userName ?? "User avatar"}
            width={28}
            height={28}
            className="rounded-full border border-[rgba(178,182,189,0.1)] flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-surface-2 border border-[rgba(178,182,189,0.1)] flex-shrink-0" aria-hidden="true" />
        )}
        {userName && (
          <span className="hidden lg:block text-body-sm text-ink-muted max-w-[120px] truncate">
            {userName}
          </span>
        )}
      </div>
    </header>
  );
}
