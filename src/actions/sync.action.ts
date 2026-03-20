"use server";

import { redirect } from "next/navigation";
import { triggerSync, applyMockSync } from "@/services/sync.service";
import type { ApplicationID, SyncApiData, SyncChange } from "@/types/sync";

interface SyncSuccessResult {
    isApiError?: false;
    changes: SyncChange[];
}

interface SyncErrorResult {
    isApiError: true;
    statusCode: number;
    message: string;
}

export async function syncIntegration(id: ApplicationID): Promise<SyncSuccessResult | SyncErrorResult> {
    const result = await triggerSync(id);

    if (result.code !== "SUCCESS") {
        const errorResult = result as { code?: string; message: string };
        let statusCode = 500;
        
        if (errorResult.message.includes("missing configuration") || errorResult.message.includes("Missing")) {
            statusCode = 400;
        } else if (errorResult.message.includes("Gateway")) {
            statusCode = 502;
        } else if (errorResult.message.includes("Internal server")) {
            statusCode = 500;
        }

        return {
            isApiError: true,
            statusCode,
            message: errorResult.message || "Sync failed",
        };
    }

    const syncData = result as { code: string; data: SyncApiData };
    return {
        isApiError: false,
        changes: syncData.data.sync_approval?.changes ?? [],
    };
}

export async function applySyncAction(
    id: ApplicationID,
    changes: SyncChange[],
): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    applyMockSync(id, changes);
    redirect(`/integrations/${id}/history`);
}
