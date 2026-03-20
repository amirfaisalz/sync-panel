import {
  RefreshCw,
  History,
  AlertTriangle,
  Clock,
  Database,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "./StatusBadge";
import { IntegrationIcon } from "./IntegrationIcon";
import { StatCard } from "./StatCard";
import type { Integration } from "@/types/sync";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import { SyncButton } from "../sync/SyncButton";

export function IntegrationDetail({
  integration,
}: {
  integration: Integration;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <IntegrationIcon id={integration.id} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">{integration.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={integration.status} />
              <span className="text-sm text-muted-foreground">
                {integration.version}
              </span>
            </div>
          </div>
        </div>
        <SyncButton id={integration.id} integrationName={integration.name} />
      </div>

      {/* Conflict Alert */}
      {integration.status === "conflict" && (
        <Alert className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
          <AlertTriangle className="size-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">
            Conflict Detected
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-500">
            This integration has conflicting data that requires your attention.{" "}
            <br />
            <Link
              href={`/integrations/${integration.id}/conflicts`}
              className="no-underline font-medium"
            >
              Resolve Conflicts →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Database className="size-4" />}
          label="Total Records"
          value={integration.totalRecords.toLocaleString()}
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Last Sync Duration"
          value={integration.lastSyncDuration}
        />
        <StatCard
          icon={<RefreshCw className="size-4" />}
          label="Last Synced"
          value={formatTime(integration.lastSyncedAt)}
          subtext={formatDate(integration.lastSyncedAt)}
        />
      </div>

      {/* Sync Summary */}
      <Card className="border-border/50">
        <CardContent className="px-6 py-2">
          <h3 className="font-semibold mb-4">Sync Summary</h3>
          <div className="space-y-3">
            {[
              { label: "Integration Name", value: integration.name },
              {
                label: "Current Status",
                value: <StatusBadge status={integration.status} />,
              },
              { label: "Current Version", value: integration.version },
              {
                label: "Last Sync",
                value: `${formatDate(integration.lastSyncedAt)} ${formatTime(integration.lastSyncedAt)}`,
              },
            ].map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardContent className="px-6 py-2">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-3">
            <Link
              href={`/integrations/${integration.id}/history`}
              className="inline-flex items-center gap-1 text-sm text-black mb-6 border border-gray-200 rounded-md p-2"
            >
              <History className="size-3.5" />
              View History
            </Link>
            {integration.status === "conflict" && (
              <Link
                href={`/integrations/${integration.id}/conflicts`}
                className="inline-flex items-center gap-1 bg-yellow-50 text-sm text-yellow-800 mb-6 border border-yellow-800 rounded-md p-2"
              >
                <AlertTriangle className="size-3.5" />
                Resolve Conflicts
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
