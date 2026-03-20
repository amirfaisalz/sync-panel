import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getIntegrationById, getSyncHistory } from "@/services/sync.service";
import type { ApplicationID, ChangeType, SyncHistoryEvent } from "@/types/sync";
import { IntegrationIcon } from "@/components/integrations/IntegrationIcon";

const validIds: ApplicationID[] = [
  "salesforce",
  "hubspot",
  "stripe",
  "slack",
  "zendesk",
  "intercom",
];

const changeTypeConfig: Record<
  ChangeType,
  {
    label: string;
    icon: React.ReactNode;
    badgeClass: string;
  }
> = {
  ADD: {
    label: "Added",
    icon: <Plus className="size-3.5" />,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  UPDATE: {
    label: "Updated",
    icon: <Pencil className="size-3.5" />,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DELETE: {
    label: "Deleted",
    icon: <Trash2 className="size-3.5" />,
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
};

export default async function VersionDiffPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ version: string }>;
}) {
  const { id } = await params;
  const { version } = await searchParams;

  if (!validIds.includes(id as ApplicationID)) {
    notFound();
  }

  const appId = id as ApplicationID;
  const integration = getIntegrationById(appId);
  if (!integration) notFound();

  const history = getSyncHistory(appId);
  const targetEvent = version
    ? history.find((e) => e.version === version)
    : history[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href={`/integrations/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to {integration.name}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <IntegrationIcon id={integration.id} size="lg" />
          <h1 className="text-2xl font-bold tracking-tight">
            {integration.name} — Version{" "}
            {version ?? targetEvent?.version ?? "Diff"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {version && !targetEvent
            ? `Viewing latest — version "${version}" not found`
            : version
              ? `Viewing changes for ${version}`
              : "Viewing latest sync event"}
        </p>
      </div>

      {version && !targetEvent && history.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="size-4" />
          <AlertTitle>Version &quot;{version}&quot; not found</AlertTitle>
          <AlertDescription>
            No sync event matches that version. Showing the latest instead —{" "}
            <Link
              href={`/integrations/${id}/version-diff`}
              className="underline underline-offset-2 font-medium"
            >
              view latest without version filter
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      {!targetEvent ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No sync events found for this integration.
          </CardContent>
        </Card>
      ) : (
        <DiffView event={targetEvent} />
      )}
    </div>
  );
}

function DiffView({ event }: { event: SyncHistoryEvent }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3 mt-5">
        <div className="rounded-lg border border-border/40 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
            <Plus className="size-3" /> Added
          </p>
          <p className="text-xl font-bold mt-1">{event.stats.added}</p>
        </div>
        <div className="rounded-lg border border-border/40 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
            <Pencil className="size-3" /> Updated
          </p>
          <p className="text-xl font-bold mt-1">{event.stats.updated}</p>
        </div>
        <div className="rounded-lg border border-border/40 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
            <Trash2 className="size-3" /> Deleted
          </p>
          <p className="text-xl font-bold mt-1">{event.stats.deleted}</p>
        </div>
        <div className="rounded-lg border border-border/40 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total
          </p>
          <p className="text-xl font-bold mt-1">{event.stats.total}</p>
        </div>
      </div>

      {event.changes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            No change details available for this event.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Change Details — {event.changes.length}{" "}
            {event.changes.length === 1 ? "field" : "fields"}
          </h2>

          {event.changes.map((change) => {
            const config = changeTypeConfig[change.changeType];
            return (
              <Card
                key={change.id}
                className="border-border/50 overflow-hidden"
              >
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-base font-mono font-medium text-foreground">
                      {change.fieldName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs gap-1.5 ${config.badgeClass}`}
                    >
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-border/30 overflow-hidden">
                    {change.changeType === "UPDATE" && (
                      <div className="grid grid-cols-2 divide-x divide-border/30">
                        <div className="px-4 py-3 bg-red-50 dark:bg-red-950/20">
                          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-2">
                            Previous
                          </p>
                          <p className="text-sm font-mono text-red-700 line-through">
                            {change.previousValue}
                          </p>
                        </div>

                        <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20">
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                            New
                          </p>
                          <p className="text-sm font-mono font-medium text-emerald-700">
                            {change.newValue}
                          </p>
                        </div>
                      </div>
                    )}

                    {change.changeType === "ADD" && (
                      <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                          Added Value
                        </p>
                        <p className="text-sm font-mono font-medium text-emerald-700">
                          {change.newValue}
                        </p>
                      </div>
                    )}

                    {change.changeType === "DELETE" && (
                      <div className="px-4 py-3 bg-red-50 dark:bg-red-950/20">
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-2">
                          Removed Value
                        </p>
                        <p className="text-sm font-mono text-red-700 line-through">
                          {change.previousValue}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
