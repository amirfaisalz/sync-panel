import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getIntegrationById } from "@/services/sync.service";
import { IntegrationDetail } from "@/components/integrations/IntegrationDetail";
import type { ApplicationID } from "@/types/sync";

const validIds: ApplicationID[] = [
    "salesforce",
    "hubspot",
    "stripe",
    "slack",
    "zendesk",
    "intercom",
];

export default async function IntegrationDetailPage({
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

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <Link
                href="/integrations"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="size-3.5" />
                Back to integrations
            </Link>
            <IntegrationDetail integration={integration} />
        </div>
    );
}
