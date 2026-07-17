import * as React from "react";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";

export function SkeletonRepoCard() {
  return (
    <Card className="p-6 animate-pulse">
      <CardHeader className="flex items-start justify-between mb-3 p-0">
        <div className="space-y-2">
          {/* Title skeleton */}
          <div className="h-4 w-32 bg-surface-2 rounded border border-[rgba(178,182,189,0.1)]" />
          {/* Owner skeleton */}
          <div className="h-3.5 w-20 bg-surface-2 rounded border border-[rgba(178,182,189,0.1)]" />
        </div>
        {/* Status badge skeleton */}
        <div className="h-[22px] w-20 bg-surface-2 rounded-full border border-[rgba(178,182,189,0.1)]" />
      </CardHeader>

      <div className="p-0 mb-3.5 flex gap-1.5 flex-wrap">
        {/* Service badges skeletons */}
        <div className="h-[22px] w-16 bg-surface-2 rounded-full border border-[rgba(178,182,189,0.1)]" />
        <div className="h-[22px] w-20 bg-surface-2 rounded-full border border-[rgba(178,182,189,0.1)]" />
      </div>

      <CardFooter className="flex items-center justify-between pt-3 mt-3.5 border-t border-[rgba(178,182,189,0.1)] p-0">
        <div className="h-3 w-16 bg-surface-2 rounded border border-[rgba(178,182,189,0.1)]" />
        <div className="h-3 w-20 bg-surface-2 rounded border border-[rgba(178,182,189,0.1)]" />
        <div className="h-[30px] w-14 bg-surface-2 rounded border border-[rgba(178,182,189,0.1)]" />
      </CardFooter>
    </Card>
  );
}
