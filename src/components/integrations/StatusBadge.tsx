"use client";

import { Badge } from "@/components/ui/badge";
import type { IntegrationStatus } from "@/types/sync";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  IntegrationStatus,
  { label: string; className: string }
> = {
  synced: {
    label: "Synced",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  syncing: {
    label: "Syncing",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  },
  conflict: {
    label: "Conflict",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  error: {
    label: "Error",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: IntegrationStatus;
  className?: string;
}) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
