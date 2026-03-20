import 'server-only';

import type {
    ApplicationID,
    Integration,
    SyncHistoryEvent,
    ConflictField,
    SyncApiData,
} from '@/types/sync';
import {
    integrations,
    syncHistoryByIntegration,
    conflictsByIntegration,
    mockSyncApprovals,
} from '@/lib/mock-data';
import { apiFetch, createSuccessResponse, type ApiResponse } from '@/lib/api';

const API_BASE_URL =
    process.env.API_BASE_URL ||
    'https://portier-takehometest.onrender.com/api/v1';

export function getIntegrations(): Integration[] {
    return integrations;
}

export function getIntegrationById(id: ApplicationID): Integration | undefined {
    return integrations.find((i) => i.id === id);
}

export function getSyncHistory(integrationId: ApplicationID): SyncHistoryEvent[] {
    return syncHistoryByIntegration[integrationId] || [];
}

export function getConflicts(integrationId: ApplicationID): ConflictField[] {
    return (conflictsByIntegration[integrationId] || []).map((c) => ({ ...c }));
}

export async function triggerSync(
    applicationId: ApplicationID,
): Promise<ApiResponse<SyncApiData>> {
    const endpoint = `${API_BASE_URL}/data/sync?application_id=${applicationId}`;
    const result = await apiFetch<SyncApiData>(endpoint, {
        method: 'GET',
    });

    if (result.code === 'SUCCESS') {
        return result;
    }

    const mock = mockSyncApprovals[applicationId];
    if (mock) {
        return createSuccessResponse({
            message: 'Sync preview loaded (mock data — API unavailable)',
            data: mock,
            code: 'SUCCESS',
        });
    }

    return result;
}

export { applyMockSync, applyMockConflictMerge } from "@/lib/mock-data";
