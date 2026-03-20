"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { IntegrationIcon } from "./IntegrationIcon";
import type { Integration, IntegrationStatus } from "@/types/sync";
import { cn, formatRelative } from "@/lib/utils";

const allStatuses: IntegrationStatus[] = [
  "synced",
  "syncing",
  "conflict",
  "error",
];

export function IntegrationsClient({
  integrations,
}: {
  integrations: Integration[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | "all">(
    "all",
  );

  const filtered = useMemo(() => {
    return integrations.filter((i) => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [integrations, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            id="search-integrations"
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as IntegrationStatus | "all")
            }
            className="h-9 pl-3 pr-8 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            {allStatuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Integrations Table */}
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-muted-foreground"
                >
                  No integrations found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((integration) => (
              <TableRow
                key={integration.id}
                className={cn(
                  "transition-colors hover:bg-muted/40",
                  integration.status === "conflict" && "bg-yellow-300/10",
                )}
              >
                <TableCell className="px-6">
                  <Link
                    href={`/integrations/${integration.id}`}
                    className="flex items-center gap-3"
                  >
                    <IntegrationIcon id={integration.id} size="sm" />
                    <span className="font-medium">{integration.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="px-6">
                  <StatusBadge status={integration.status} />
                </TableCell>
                <TableCell className="text-muted-foreground px-6">
                  {formatRelative(integration.lastSyncedAt)}
                </TableCell>
                <TableCell className="px-6">
                  <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {integration.version}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
