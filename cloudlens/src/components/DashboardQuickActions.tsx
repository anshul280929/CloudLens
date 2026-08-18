"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { syncRepositories, scanAllRepositories } from "@/app/actions";

/**
 * DashboardQuickActions — client island for the Dashboard Overview page.
 * Handles the "Sync Repos" and "Scan All" buttons with loading states.
 */
export function DashboardQuickActions() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncRepositories();
      router.refresh();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleScanAll = async () => {
    try {
      setIsScanning(true);
      const result = await scanAllRepositories();
      console.log("[CloudLens] Scan All complete:", result);
      router.refresh();
    } catch (err) {
      console.error("Scan All failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="primary"
        size="sm"
        onClick={handleSync}
        loading={isSyncing}
        disabled={isSyncing || isScanning}
        icon={
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 8a6 6 0 0111.2-3M14 8A6 6 0 012.8 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 3v4h-4M2 13V9h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      >
        Sync Repos
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleScanAll}
        loading={isScanning}
        disabled={isSyncing || isScanning}
        icon={
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 2v12M2 8h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        }
      >
        Scan All
      </Button>
    </div>
  );
}
