import { getIntegrations } from "@/services/sync.service";
import { IntegrationsClient } from "@/components/integrations/IntegrationsClient";

export default function IntegrationsPage() {
  const integrations = getIntegrations();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and monitor your connected integrations
        </p>
      </div>
      <IntegrationsClient integrations={integrations} />
    </div>
  );
}
