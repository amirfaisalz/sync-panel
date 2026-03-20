"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function IntegrationRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
      <TableCell className="px-6">
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="px-6">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="px-6">
        <Skeleton className="h-5 w-12 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

export default function IntegrationsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and monitor your connected integrations
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 flex-1 max-w-md" />
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6">
                  Integration
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6">
                  Last Synced
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6">
                  Version
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <IntegrationRowSkeleton key={i} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
