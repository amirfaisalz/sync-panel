import type {
    Integration,
    SyncHistoryEvent,
    ConflictField,
    SyncApiData,
    SyncChange,
} from "@/types/sync";

// ─── Integrations ────────────────────────────────────────────────────

export const integrations: Integration[] = [
    {
        id: "salesforce",
        name: "Salesforce",
        status: "synced",
        lastSyncedAt: "2026-03-02T07:15:00Z",
        version: "v2.4.1",
        totalRecords: 12453,
        lastSyncDuration: "45s",
    },
    {
        id: "hubspot",
        name: "HubSpot",
        status: "conflict",
        lastSyncedAt: "2026-03-02T07:15:00Z",
        version: "v1.8.3",
        totalRecords: 8921,
        lastSyncDuration: "32s",
    },
    {
        id: "stripe",
        name: "Stripe",
        status: "syncing",
        lastSyncedAt: "2026-03-02T07:15:00Z",
        version: "v3.1.0",
        totalRecords: 34102,
        lastSyncDuration: "1m 12s",
    },
    {
        id: "slack",
        name: "Slack",
        status: "synced",
        lastSyncedAt: "2026-03-02T07:15:00Z",
        version: "v1.2.5",
        totalRecords: 5231,
        lastSyncDuration: "18s",
    },
    {
        id: "zendesk",
        name: "Zendesk",
        status: "error",
        lastSyncedAt: "2026-03-02T07:15:00Z",
        version: "v2.0.8",
        totalRecords: 19874,
        lastSyncDuration: "55s",
    },
    {
        id: "intercom",
        name: "Intercom",
        status: "synced",
        lastSyncedAt: "2026-03-02T07:15:00Z",
        version: "v1.5.2",
        totalRecords: 7643,
        lastSyncDuration: "28s",
    },
];

// ─── Sync History ────────────────────────────────────────────────────

export const syncHistoryByIntegration: Record<string, SyncHistoryEvent[]> = {
    salesforce: [
        {
            id: "evt-sf-001",
            timestamp: "2026-03-02T07:15:00Z",
            source: "system",
            version: "v2.4.1",
            summary: "Scheduled sync completed — 3 records updated",
            changes: [
                {
                    id: "c1",
                    fieldName: "user.email",
                    changeType: "UPDATE",
                    previousValue: "john@old.com",
                    newValue: "john@company.com",
                },
                {
                    id: "c2",
                    fieldName: "user.phone",
                    changeType: "UPDATE",
                    previousValue: "+1-555-0100",
                    newValue: "+1-555-0199",
                },
                {
                    id: "c3",
                    fieldName: "door.status",
                    changeType: "UPDATE",
                    previousValue: "offline",
                    newValue: "online",
                },
            ],
            stats: { added: 0, updated: 3, deleted: 0, total: 3 },
        },
        {
            id: "evt-sf-002",
            timestamp: "2026-02-28T14:30:00Z",
            source: "external",
            version: "v2.4.0",
            summary: "External push — 1 user added, 2 fields updated",
            changes: [
                {
                    id: "c4",
                    fieldName: "user.id",
                    changeType: "ADD",
                    newValue: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                },
                {
                    id: "c5",
                    fieldName: "user.name",
                    changeType: "UPDATE",
                    previousValue: "Jane D.",
                    newValue: "Jane Doe",
                },
                {
                    id: "c6",
                    fieldName: "key.access_end",
                    changeType: "UPDATE",
                    previousValue: "2026-06-30T00:00:00Z",
                    newValue: "2026-12-31T00:00:00Z",
                },
            ],
            stats: { added: 1, updated: 2, deleted: 0, total: 3 },
        },
        {
            id: "evt-sf-003",
            timestamp: "2026-02-25T09:00:00Z",
            source: "system",
            version: "v2.3.9",
            summary: "Scheduled sync — 1 key revoked",
            changes: [
                {
                    id: "c7",
                    fieldName: "key.status",
                    changeType: "UPDATE",
                    previousValue: "active",
                    newValue: "revoked",
                },
            ],
            stats: { added: 0, updated: 1, deleted: 0, total: 1 },
        },
    ],
    hubspot: [
        {
            id: "evt-hs-001",
            timestamp: "2026-03-02T07:15:00Z",
            source: "external",
            version: "v1.8.3",
            summary: "External push — 145 updates, 8 additions, 2 deletions",
            changes: [
                {
                    id: "c8",
                    fieldName: "company.domain",
                    changeType: "UPDATE",
                    previousValue: "acmecorp.com",
                    newValue: "acme-corporation.com",
                },
                {
                    id: "c9",
                    fieldName: "contact.phone",
                    changeType: "UPDATE",
                    previousValue: "+1 (555) 123-4567",
                    newValue: "+1 (555) 987-6543",
                },
            ],
            stats: { added: 8, updated: 145, deleted: 2, total: 155 },
        },
        {
            id: "evt-hs-002",
            timestamp: "2026-02-27T19:45:00Z",
            source: "system",
            version: "v1.8.2",
            summary: "Scheduled sync — 5 records updated",
            changes: [
                {
                    id: "c10",
                    fieldName: "user.role",
                    changeType: "UPDATE",
                    previousValue: "viewer",
                    newValue: "editor",
                },
                {
                    id: "c11",
                    fieldName: "user.email",
                    changeType: "UPDATE",
                    previousValue: "alice@temp.com",
                    newValue: "alice@company.com",
                },
            ],
            stats: { added: 0, updated: 5, deleted: 0, total: 5 },
        },
    ],
    stripe: [
        {
            id: "evt-st-001",
            timestamp: "2026-03-02T07:15:00Z",
            source: "system",
            version: "v3.1.0",
            summary: "Sync in progress — processing payment records",
            changes: [],
            stats: { added: 0, updated: 0, deleted: 0, total: 0 },
        },
    ],
    slack: [],
    zendesk: [
        {
            id: "evt-zd-001",
            timestamp: "2026-03-02T07:15:00Z",
            source: "system",
            version: "v2.0.8",
            summary: "Sync failed — gateway timeout",
            changes: [],
            stats: { added: 0, updated: 0, deleted: 0, total: 0 },
        },
    ],
    intercom: [
        {
            id: "evt-ic-001",
            timestamp: "2026-03-02T07:15:00Z",
            source: "external",
            version: "v1.5.2",
            summary: "External push — 4 records synced",
            changes: [
                {
                    id: "c14",
                    fieldName: "user.email",
                    changeType: "UPDATE",
                    previousValue: "support@old.com",
                    newValue: "support@intercom.com",
                },
                {
                    id: "c15",
                    fieldName: "door.name",
                    changeType: "UPDATE",
                    previousValue: "Main Entrance",
                    newValue: "Main Gate",
                },
                {
                    id: "c16",
                    fieldName: "user.id",
                    changeType: "ADD",
                    newValue: "new-user-uuid-123",
                },
                {
                    id: "c17",
                    fieldName: "key.id",
                    changeType: "DELETE",
                    previousValue: "old-key-uuid-456",
                },
            ],
            stats: { added: 1, updated: 2, deleted: 1, total: 4 },
        },
    ],
};

// ─── Conflict Data (for integrations with conflict status) ───────────

export const conflictsByIntegration: Record<string, ConflictField[]> = {
    hubspot: [
        {
            id: "conflict-001",
            fieldName: "user.email",
            localValue: "john@company.com",
            externalValue: "j.smith@newdomain.com",
            resolution: null,
        },
        {
            id: "conflict-002",
            fieldName: "user.name",
            localValue: "John Smith",
            externalValue: "Jonathan Smith",
            resolution: null,
        },
        {
            id: "conflict-003",
            fieldName: "user.phone",
            localValue: "+1 (555) 123-4567",
            externalValue: "+1 (555) 999-8888",
            resolution: null,
        },
        {
            id: "conflict-004",
            fieldName: "user.role",
            localValue: "admin",
            externalValue: "editor",
            resolution: null,
        },
    ],
};

export function applyMockConflictMerge(
    id: string,
    resolvedConflicts: ConflictField[],
): void {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;

    const allResolved = resolvedConflicts.every((c) => c.resolution !== null);
    if (!allResolved) return;

    const now = new Date().toISOString();
    const versionParts = integration.version.replace("v", "").split(".");
    const newPatch = Number.parseInt(versionParts[2] || "0", 10) + 1;
    const newVersion = `v${versionParts[0]}.${versionParts[1]}.${newPatch}`;

    conflictsByIntegration[id] = [];
    integration.status = "synced";
    integration.lastSyncedAt = now;
    integration.version = newVersion;
    integration.lastSyncDuration = `${Math.floor(Math.random() * 20) + 8}s`;

    const historyEntry: SyncHistoryEvent = {
        id: `evt-merge-${Date.now()}`,
        timestamp: now,
        source: "system",
        version: newVersion,
        summary: `Conflicts resolved — ${resolvedConflicts.length} field${resolvedConflicts.length === 1 ? "" : "s"} merged`,
        changes: resolvedConflicts.map((c) => ({
            id: c.id,
            fieldName: c.fieldName,
            changeType: "UPDATE",
            previousValue: c.resolution === "local" ? c.externalValue : c.localValue,
            newValue: c.resolution === "local" ? c.localValue : c.externalValue,
        })),
        stats: {
            added: 0,
            updated: resolvedConflicts.length,
            deleted: 0,
            total: resolvedConflicts.length,
        },
    };

    if (!syncHistoryByIntegration[id]) {
        syncHistoryByIntegration[id] = [];
    }
    syncHistoryByIntegration[id].unshift(historyEntry);
}

export function applyMockSync(id: string, changes: SyncChange[]): void {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;

    const now = new Date().toISOString();
    const versionParts = integration.version.replace("v", "").split(".");
    const newPatch = Number.parseInt(versionParts[2] || "0", 10) + 1;
    const newVersion = `v${versionParts[0]}.${versionParts[1]}.${newPatch}`;

    integration.status = "synced";
    integration.lastSyncedAt = now;
    integration.version = newVersion;
    integration.lastSyncDuration = `${Math.floor(Math.random() * 30) + 10}s`;

    const stats = {
        added: changes.filter((c) => c.change_type === "ADD").length,
        updated: changes.filter((c) => c.change_type === "UPDATE").length,
        deleted: changes.filter((c) => c.change_type === "DELETE").length,
    };

    const historyEntry: SyncHistoryEvent = {
        id: `evt-mock-${Date.now()}`,
        timestamp: now,
        source: "system",
        version: newVersion,
        summary: `Sync approved — ${[stats.added > 0 ? `${stats.added} added` : null, stats.updated > 0 ? `${stats.updated} updated` : null, stats.deleted > 0 ? `${stats.deleted} deleted` : null].filter(Boolean).join(", ")}`,
        changes: changes.map((c) => ({
            id: c.id,
            fieldName: c.field_name,
            changeType: c.change_type,
            previousValue: c.current_value,
            newValue: c.new_value,
        })),
        stats: {
            ...stats,
            total: changes.length,
        },
    };

    if (!syncHistoryByIntegration[id]) {
        syncHistoryByIntegration[id] = [];
    }
    syncHistoryByIntegration[id].unshift(historyEntry);

    const approval = mockSyncApprovals[id];
    if (approval) {
        approval.sync_approval.changes = [];
    }
}

export const mockSyncApprovals: Record<string, SyncApiData> = {
    salesforce: {
        sync_approval: {
            application_name: "Salesforce",
            changes: [
                {
                    id: "sync-001",
                    field_name: "user.email",
                    change_type: "UPDATE",
                    current_value: "john@old.com",
                    new_value: "john@company.com",
                },
                {
                    id: "sync-002",
                    field_name: "user.phone",
                    change_type: "UPDATE",
                    current_value: "+1-555-0100",
                    new_value: "+1-555-0199",
                },
                {
                    id: "sync-003",
                    field_name: "door.status",
                    change_type: "UPDATE",
                    current_value: "offline",
                    new_value: "online",
                },
                {
                    id: "sync-004",
                    field_name: "user.id",
                    change_type: "ADD",
                    new_value: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                },
                {
                    id: "sync-005",
                    field_name: "key.status",
                    change_type: "DELETE",
                    current_value: "revoked",
                },
            ],
        },
        metadata: {},
    },
    hubspot: {
        sync_approval: {
            application_name: "HubSpot",
            changes: [
                {
                    id: "sync-006",
                    field_name: "company.domain",
                    change_type: "UPDATE",
                    current_value: "acmecorp.com",
                    new_value: "acme-corporation.com",
                },
                {
                    id: "sync-007",
                    field_name: "contact.phone",
                    change_type: "UPDATE",
                    current_value: "+1 (555) 123-4567",
                    new_value: "+1 (555) 987-6543",
                },
            ],
        },
        metadata: {},
    },
    stripe: {
        sync_approval: {
            application_name: "Stripe",
            changes: [],
        },
        metadata: {},
    },
    slack: {
        sync_approval: {
            application_name: "Slack",
            changes: [],
        },
        metadata: {},
    },
    zendesk: {
        sync_approval: {
            application_name: "Zendesk",
            changes: [],
        },
        metadata: {},
    },
    intercom: {
        sync_approval: {
            application_name: "Intercom",
            changes: [
                {
                    id: "sync-008",
                    field_name: "user.email",
                    change_type: "UPDATE",
                    current_value: "support@old.com",
                    new_value: "support@intercom.com",
                },
                {
                    id: "sync-009",
                    field_name: "door.name",
                    change_type: "UPDATE",
                    current_value: "Main Entrance",
                    new_value: "Main Gate",
                },
                {
                    id: "sync-010",
                    field_name: "user.id",
                    change_type: "ADD",
                    new_value: "new-user-uuid-123",
                },
            ],
        },
        metadata: {},
    },
};
