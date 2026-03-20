"use client";

import { Skeleton } from "@/components/ui/skeleton";

function HistoryRowSkeleton() {
  return (
    <div className="flex items-center px-4 py-4 border-b border-border/50 gap-4">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 flex-1 max-w-xs" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export default function HistoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Skeleton className="h-4 w-40 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="border border-border/60 rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-[12px_1fr_1fr_1fr_2fr_1fr] items-center px-4 py-3 border-b border-border/60 bg-white gap-4">
          <div></div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>

        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <HistoryRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
