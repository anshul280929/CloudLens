"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  LayoutDashboard,
  FolderGit2,
  Box,
  Bell,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { mockUser, alerts } from "@/lib/mock-data";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/repos", icon: FolderGit2, label: "Repositories" },
  { href: "/dashboard/services", icon: Box, label: "Services" },
  { href: "/dashboard/alerts", icon: Bell, label: "Alerts" },
  { href: "/dashboard/costs", icon: DollarSign, label: "Costs" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.isRead && !a.isDismissed).length;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen flex flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[240px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border/50 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo to-cyan flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap">
                Cloudlens
              </span>
            )}
          </Link>
          {/* Mobile close */}
          <button
            className="ml-auto md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            const navLink = (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-indigo/10 text-indigo-light"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-light" />
                )}
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {item.label === "Alerts" && unreadAlerts > 0 && (
                  <span
                    className={`${
                      collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                    } flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1`}
                  >
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger render={navLink} />
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </nav>

        {/* Collapse toggle + user */}
        <div className="border-t border-border/50 p-2 space-y-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={mockUser.avatarUrl} />
              <AvatarFallback className="bg-indigo/20 text-indigo-light text-xs">
                {mockUser.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {mockUser.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {mockUser.plan} plan
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="h-14 flex items-center px-4 border-b border-border/50 md:hidden shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo to-cyan flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Cloudlens</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
