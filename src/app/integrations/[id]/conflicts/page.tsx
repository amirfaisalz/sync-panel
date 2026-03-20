import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import type { ApplicationID } from "@/types/sync";
import { getConflicts, getIntegrationById } from "@/services/sync.service";
import { Card, CardContent } from "@/components/ui/card";
import { ConflictsClient } from "@/components/conflict/ConflictsClient";

const validIds: ApplicationID[] = [
  "salesforce",
  "hubspot",
  "stripe",
  "slack",
  "zendesk",
  "intercom",
];

export default async function ConflictsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!validIds.includes(id as ApplicationID)) {
    notFound();
  }

  const appId = id as ApplicationID;
  const integration = getIntegrationById(appId);
  if (!integration) notFound();

  const conflicts = getConflicts(appId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {conflicts.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="px-6 py-8">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md border border-border/60 p-2 bg-muted/40">
                <AlertTriangle className="size-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-semibold">No conflicts found</h1>
                <p className="text-sm text-muted-foreground">
                  There aren&apos;t any pending conflicts for {integration.name}
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ConflictsClient
          integration={{
            id: appId,
            name: integration.name,
          }}
          conflicts={conflicts}
        />
      )}
    </div>
  );
}
