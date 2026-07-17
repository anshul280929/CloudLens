"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ── CloudLens 4-square logo mark ──────────────────────────
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" />
      <rect x="12.5" y="1" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.6" />
      <rect x="1" y="12.5" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.6" />
      <rect x="12.5" y="12.5" width="8.5" height="8.5" rx="2" fill="var(--accent-blue)" opacity="0.3" />
    </svg>
  );
}

// ── Nav items ─────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Main",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: <Icon d="M2 3h12M2 8h12M2 13h7" />,
      },
      {
        label: "Repositories",
        href: "/dashboard/repositories",
        icon: <Icon d="M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h6M5 9h4" />,
      },
      {
        label: "Services",
        href: "/dashboard/services",
        icon: <Icon d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v3l2 2" />,
      },
      {
        label: "Alerts",
        href: "/dashboard/alerts",
        icon: <Icon d="M8 2L2 13h12L8 2zM8 9v-3M8 11h.01" />,
      },
    ],
  },
  {
    title: "Finance & AI",
    items: [
      {
        label: "Costs",
        href: "/dashboard/costs",
        icon: <Icon d="M3 8h10M6 5l2-3 2 3M6 11l2 3 2-3" />,
      },
      {
        label: "AI Insights",
        href: "/dashboard/insights",
        icon: <Icon d="M2 8c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6S2 11.3 2 8zM8 5v3l1.5 1.5" />,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: <Icon d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 6v.01M8 9v3" />,
      },
    ],
  },
];

// ── Single nav link ───────────────────────────────────────
function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-md text-body-sm transition-colors duration-150",
        isActive
          ? "bg-surface-2 text-ink border border-[rgba(178,182,189,0.1)]"
          : "text-ink-muted hover:text-ink hover:bg-surface-2 border border-transparent"
      )}
    >
      <span className={cn("flex-shrink-0", isActive ? "text-ink" : "text-ink-subtle")}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

// ── Sidebar (desktop — always visible, mobile — slide-in) ──
export interface SidebarProps {
  /** Mobile: whether the drawer is open */
  mobileOpen?: boolean;
  /** Mobile: close callback */
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Base
          "fixed top-0 left-0 h-full z-40 flex flex-col",
          "w-56 bg-surface-1 border-r border-[rgba(178,182,189,0.1)]",
          // Desktop: always visible
          "md:sticky md:top-0 md:z-auto",
          // Mobile: slide-in drawer
          "transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Dashboard navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[rgba(178,182,189,0.1)] flex-shrink-0">
          <LogoMark />
          <span className="text-[17px] font-bold tracking-tight text-ink">
            CloudLens
          </span>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-eyebrow px-3 mb-1.5 text-ink-subtle">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} onClick={onMobileClose} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer version tag */}
        <div className="px-5 py-3.5 border-t border-[rgba(178,182,189,0.1)] flex-shrink-0">
          <span className="text-caption text-ink-subtle">CloudLens v1.0.0</span>
        </div>
      </aside>
    </>
  );
}
