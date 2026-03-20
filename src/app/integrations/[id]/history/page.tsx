import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getIntegrationById, getSyncHistory } from "@/services/sync.service";
import type { ApplicationID } from "@/types/sync";
import { IntegrationIcon } from "@/components/integrations/IntegrationIcon";
import { HistoryTable } from "@/components/integrations/hystory/HistoryTable";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate basic ids
  const validIds: ApplicationID[] = [
    "salesforce",
    "hubspot",
    "stripe",
    "slack",
    "zendesk",
    "intercom",
  ];
  if (!validIds.includes(id as ApplicationID)) {
    notFound();
  }

  const appId = id as ApplicationID;
  const integration = getIntegrationById(appId);
  if (!integration) notFound();

  const history = getSyncHistory(appId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href={`/integrations/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors font-medium"
      >
        <ArrowLeft className="size-4" />
        Back to integration
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <IntegrationIcon id={integration.id} size="lg" />
          <h1 className="text-2xl font-bold tracking-tight">
            {integration.name} - Sync History
          </h1>
        </div>
        <p className="text-muted-foreground">
          Track version changes and sync events over time
        </p>
      </div>

      <HistoryTable events={history} />
    </div>
  );
}
