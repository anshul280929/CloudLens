"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { scanRepositoryAction } from "@/app/actions";

/**
 * RescanButton — client component that triggers a re-scan for a single repo.
 */
export function RescanButton({ repoId }: { repoId: string }) {
  const router = useRouter();
  const [isScanning, setIsScanning] = React.useState(false);

  const handleRescan = async () => {
    try {
      setIsScanning(true);
      await scanRepositoryAction(repoId);
      router.refresh();
    } catch (err) {
      console.error("Re-scan failed:", err);
      router.refresh();
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleRescan}
      loading={isScanning}
      disabled={isScanning}
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
      {isScanning ? "Scanning…" : "Re-scan"}
    </Button>
  );
}
