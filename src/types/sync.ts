// ─── Integration Types ───────────────────────────────────────────────

export type ApplicationID = 'salesforce' | 'hubspot' | 'stripe' | 'slack' | 'zendesk' | 'intercom';

export type IntegrationStatus = 'synced' | 'syncing' | 'conflict' | 'error';

export interface Integration {
    id: ApplicationID;
    name: string;
    status: IntegrationStatus;
    lastSyncedAt: string;
    version: string;
    totalRecords: number;
    lastSyncDuration: string;
}

// ─── Sync API Types ──────────────────────────────────────────────────

export type ChangeType = 'ADD' | 'UPDATE' | 'DELETE';

export interface SyncChange {
    id: string;
    field_name: string;
    change_type: ChangeType;
    current_value?: string;
    new_value?: string;
}

export interface SyncApproval {
    application_name: string;
    changes: SyncChange[];
}

export interface SyncApiData {
    sync_approval: SyncApproval;
    metadata: Record<string, unknown>;
}

// ─── Sync History Types ──────────────────────────────────────────────

export type SyncSource = 'system' | 'external';

export interface SyncHistoryChange {
    id: string;
    fieldName: string;
    changeType: ChangeType;
    previousValue?: string;
    newValue?: string;
}

export interface SyncHistoryEvent {
    id: string;
    timestamp: string;
    source: SyncSource;
    version: string;
    summary: string;
    changes: SyncHistoryChange[];
    stats: {
        added: number;
        updated: number;
        deleted: number;
        total: number;
    };
}

// ─── Conflict Resolution Types ───────────────────────────────────────

export type ResolutionChoice = 'local' | 'external' | null;

export interface ConflictField {
    id: string;
    fieldName: string;
    localValue: string;
    externalValue: string;
    resolution: ResolutionChoice;
}