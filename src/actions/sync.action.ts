"use server";

import { triggerSync } from "@/services/sync.service";
import type { ApplicationID } from "@/types/sync";
import { redirect } from "next/navigation";

export async function syncIntegration(id: ApplicationID) {
    const result = await triggerSync(id);

    if (result.code === 'SUCCESS') {
        redirect(`/integrations/${id}/sync-approval`);
    }

    throw new Error(result.message || "Sync failed");
}