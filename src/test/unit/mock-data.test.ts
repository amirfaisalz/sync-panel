import { describe, it, expect, beforeEach } from 'vitest'
import {
    integrations,
    syncHistoryByIntegration,
    conflictsByIntegration,
    mockSyncApprovals,
    applyMockSync,
    applyMockConflictMerge,
} from '@/lib/mock-data'
import type { SyncChange, ConflictField } from '@/types/sync'

// Helper to deep-clone and restore mutable module state between tests
function snapshotIntegration(id: string) {
    const integration = integrations.find((i) => i.id === id)!
    return { ...integration }
}

describe('applyMockSync', () => {
    let originalSalesforce: ReturnType<typeof snapshotIntegration>

    beforeEach(() => {
        // Snapshot and restore after each test
        originalSalesforce = snapshotIntegration('salesforce')
    })

    // Restore state (best-effort for shared mutable data)
    function restoreSalesforce() {
        const integration = integrations.find((i) => i.id === 'salesforce')!
        Object.assign(integration, originalSalesforce)
    }

    it('should update integration status to synced', () => {
        const changes: SyncChange[] = [
            { id: '1', field_name: 'user.email', change_type: 'UPDATE', current_value: 'old', new_value: 'new' },
        ]

        applyMockSync('salesforce', changes)

        const integration = integrations.find((i) => i.id === 'salesforce')!
        expect(integration.status).toBe('synced')
        restoreSalesforce()
    })

    it('should bump the patch version', () => {
        const changes: SyncChange[] = [
            { id: '1', field_name: 'user.name', change_type: 'ADD', new_value: 'John' },
        ]

        applyMockSync('salesforce', changes)

        const integration = integrations.find((i) => i.id === 'salesforce')!
        // Original was v2.4.1, should become v2.4.2
        expect(integration.version).toMatch(/^v\d+\.\d+\.\d+$/)
        const patchStr = integration.version.split('.')[2]
        const newPatch = Number.parseInt(patchStr, 10)
        const origPatch = Number.parseInt(originalSalesforce.version.split('.')[2], 10)
        expect(newPatch).toBe(origPatch + 1)
        restoreSalesforce()
    })

    it('should update lastSyncedAt to a recent ISO timestamp', () => {
        const before = new Date().toISOString()
        const changes: SyncChange[] = [
            { id: '1', field_name: 'field', change_type: 'DELETE', current_value: 'val' },
        ]

        applyMockSync('salesforce', changes)

        const integration = integrations.find((i) => i.id === 'salesforce')!
        expect(new Date(integration.lastSyncedAt).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime())
        restoreSalesforce()
    })

    it('should create a history entry with correct stats', () => {
        const changes: SyncChange[] = [
            { id: '1', field_name: 'a', change_type: 'ADD', new_value: 'x' },
            { id: '2', field_name: 'b', change_type: 'UPDATE', current_value: 'old', new_value: 'new' },
            { id: '3', field_name: 'c', change_type: 'DELETE', current_value: 'val' },
            { id: '4', field_name: 'd', change_type: 'ADD', new_value: 'y' },
        ]

        applyMockSync('salesforce', changes)

        const history = syncHistoryByIntegration['salesforce']
        const latest = history[0]
        expect(latest.stats.added).toBe(2)
        expect(latest.stats.updated).toBe(1)
        expect(latest.stats.deleted).toBe(1)
        expect(latest.stats.total).toBe(4)
        expect(latest.source).toBe('system')
        expect(latest.changes).toHaveLength(4)

        // Clean up
        history.shift()
        restoreSalesforce()
    })

    it('should handle empty changes array', () => {
        applyMockSync('salesforce', [])

        const history = syncHistoryByIntegration['salesforce']
        const latest = history[0]
        expect(latest.stats.total).toBe(0)
        expect(latest.stats.added).toBe(0)
        expect(latest.stats.updated).toBe(0)
        expect(latest.stats.deleted).toBe(0)

        // Clean up
        history.shift()
        restoreSalesforce()
    })

    it('should be a no-op for unknown integration ID', () => {
        applyMockSync('nonexistent' as never, [
            { id: '1', field_name: 'a', change_type: 'ADD', new_value: 'x' },
        ])

        // No integration was modified — just verify no crash
        expect(integrations.find((i) => i.id === 'salesforce')!.status).toBe(originalSalesforce.status)
    })

    it('should clear the sync approval changes after applying', () => {
        const changes: SyncChange[] = [
            { id: '1', field_name: 'a', change_type: 'ADD', new_value: 'x' },
        ]

        applyMockSync('salesforce', changes)

        const approval = mockSyncApprovals['salesforce']
        expect(approval.sync_approval.changes).toHaveLength(0)

        // Clean up
        syncHistoryByIntegration['salesforce'].shift()
        restoreSalesforce()
    })

    it('should map SyncChange fields to SyncHistoryChange fields', () => {
        const changes: SyncChange[] = [
            { id: 'c1', field_name: 'user.email', change_type: 'UPDATE', current_value: 'old@mail.com', new_value: 'new@mail.com' },
        ]

        applyMockSync('salesforce', changes)

        const latest = syncHistoryByIntegration['salesforce'][0]
        expect(latest.changes[0]).toEqual(
            expect.objectContaining({
                id: 'c1',
                fieldName: 'user.email',
                changeType: 'UPDATE',
                previousValue: 'old@mail.com',
                newValue: 'new@mail.com',
            }),
        )

        // Clean up
        syncHistoryByIntegration['salesforce'].shift()
        restoreSalesforce()
    })
})

describe('applyMockConflictMerge', () => {
    let originalHubspot: ReturnType<typeof snapshotIntegration>
    let originalConflicts: ConflictField[]

    beforeEach(() => {
        originalHubspot = snapshotIntegration('hubspot')
        originalConflicts = (conflictsByIntegration['hubspot'] || []).map((c) => ({ ...c }))
    })

    function restoreHubspot() {
        const integration = integrations.find((i) => i.id === 'hubspot')!
        Object.assign(integration, originalHubspot)
        conflictsByIntegration['hubspot'] = originalConflicts
    }

    it('should update integration status to synced', () => {
        const resolved: ConflictField[] = originalConflicts.map((c) => ({
            ...c,
            resolution: 'local',
        }))

        applyMockConflictMerge('hubspot', resolved)

        const integration = integrations.find((i) => i.id === 'hubspot')!
        expect(integration.status).toBe('synced')
        restoreHubspot()
    })

    it('should bump the patch version', () => {
        const resolved: ConflictField[] = originalConflicts.map((c) => ({
            ...c,
            resolution: 'external',
        }))

        applyMockConflictMerge('hubspot', resolved)

        const integration = integrations.find((i) => i.id === 'hubspot')!
        const origPatch = Number.parseInt(originalHubspot.version.split('.')[2], 10)
        const newPatch = Number.parseInt(integration.version.split('.')[2], 10)
        expect(newPatch).toBe(origPatch + 1)
        restoreHubspot()
    })

    it('should clear conflicts for the integration', () => {
        const resolved: ConflictField[] = originalConflicts.map((c) => ({
            ...c,
            resolution: 'local',
        }))

        applyMockConflictMerge('hubspot', resolved)

        expect(conflictsByIntegration['hubspot']).toHaveLength(0)
        restoreHubspot()
    })

    it('should create a history entry with correct conflict resolution mapping', () => {
        const resolved: ConflictField[] = [
            { ...originalConflicts[0], resolution: 'local' },
            { ...originalConflicts[1], resolution: 'external' },
        ]

        applyMockConflictMerge('hubspot', resolved)

        const history = syncHistoryByIntegration['hubspot']
        const latest = history[0]
        expect(latest.summary).toContain('Conflicts resolved')
        expect(latest.stats.updated).toBe(2)
        expect(latest.stats.total).toBe(2)

        // For local resolution: previousValue is externalValue, newValue is localValue
        expect(latest.changes[0].previousValue).toBe(originalConflicts[0].externalValue)
        expect(latest.changes[0].newValue).toBe(originalConflicts[0].localValue)

        // For external resolution: previousValue is localValue, newValue is externalValue
        expect(latest.changes[1].previousValue).toBe(originalConflicts[1].localValue)
        expect(latest.changes[1].newValue).toBe(originalConflicts[1].externalValue)

        // Clean up
        history.shift()
        restoreHubspot()
    })

    it('should be a no-op when not all conflicts are resolved', () => {
        const partiallyResolved: ConflictField[] = [
            { ...originalConflicts[0], resolution: 'local' },
            { ...originalConflicts[1], resolution: null }, // unresolved
        ]

        applyMockConflictMerge('hubspot', partiallyResolved)

        const integration = integrations.find((i) => i.id === 'hubspot')!
        // Status should remain unchanged
        expect(integration.status).toBe(originalHubspot.status)
        restoreHubspot()
    })

    it('should be a no-op for unknown integration ID', () => {
        const resolved: ConflictField[] = [
            { id: 'x', fieldName: 'f', localValue: 'l', externalValue: 'e', resolution: 'local' },
        ]

        // Should not throw
        applyMockConflictMerge('nonexistent', resolved)
        expect(integrations.find((i) => i.id === 'hubspot')!.status).toBe(originalHubspot.status)
    })

    it('should use singular "field" for single conflict resolution', () => {
        const resolved: ConflictField[] = [
            { ...originalConflicts[0], resolution: 'local' },
        ]

        applyMockConflictMerge('hubspot', resolved)

        const latest = syncHistoryByIntegration['hubspot'][0]
        expect(latest.summary).toContain('1 field merged')

        // Clean up
        syncHistoryByIntegration['hubspot'].shift()
        restoreHubspot()
    })

    it('should use plural "fields" for multiple conflict resolutions', () => {
        const resolved: ConflictField[] = originalConflicts.map((c) => ({
            ...c,
            resolution: 'local',
        }))

        applyMockConflictMerge('hubspot', resolved)

        const latest = syncHistoryByIntegration['hubspot'][0]
        expect(latest.summary).toContain('fields merged')

        // Clean up
        syncHistoryByIntegration['hubspot'].shift()
        restoreHubspot()
    })
})
