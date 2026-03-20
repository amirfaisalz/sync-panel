"use server";

import { redirect } from "next/navigation";
import { triggerSync, applyMockSync } from "@/services/sync.service";
import type { ApplicationID, SyncApiData, SyncChange } from "@/types/sync";

export async function syncIntegration(id: ApplicationID): Promise<SyncChange[]> {
    const result = await triggerSync(id);

    if (result.code !== "SUCCESS") {
        throw new Error(result.message || "Sync failed");
    }

    const syncData = result as { code: string; data: SyncApiData };
    return syncData.data.sync_approval?.changes ?? [];
}

export async function applySyncAction(
    id: ApplicationID,
    changes: SyncChange[],
): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    applyMockSync(id, changes);
    redirect(`/integrations/${id}/history`);
}
