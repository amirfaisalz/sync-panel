import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SyncApiData, SyncChange } from '@/types/sync'

// Mock server-only (no-op)
vi.mock('server-only', () => ({}))

// Mock the service dependencies
const mockTriggerSync = vi.fn()
const mockApplyMockSync = vi.fn()
const mockRedirect = vi.fn()

vi.mock('@/services/sync.service', () => ({
    triggerSync: (...args: unknown[]) => mockTriggerSync(...args),
    applyMockSync: (...args: unknown[]) => mockApplyMockSync(...args),
}))

vi.mock('next/navigation', () => ({
    redirect: (...args: unknown[]) => {
        mockRedirect(...args)
        throw new Error('NEXT_REDIRECT')
    },
}))



// Import AFTER mocks are set up
const { syncIntegration, applySyncAction } = await import('@/actions/sync.action')

describe('syncIntegration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return changes on success', async () => {
        const mockData: SyncApiData = {
            sync_approval: {
                application_name: 'Salesforce',
                changes: [
                    { id: '1', field_name: 'user.email', change_type: 'UPDATE', current_value: 'old', new_value: 'new' },
                ],
            },
            metadata: {},
        }

        mockTriggerSync.mockResolvedValue({
            code: 'SUCCESS',
            message: 'OK',
            data: mockData,
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBeFalsy()
        if (!result.isApiError) {
            expect(result.changes).toHaveLength(1)
            expect(result.changes[0].field_name).toBe('user.email')
        }
    })

    it('should return error with 400 for "missing configuration" message', async () => {
        mockTriggerSync.mockResolvedValue({
            code: 'ERROR',
            message: 'Possible missing configuration. Details: Bad request',
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBe(true)
        if (result.isApiError) {
            expect(result.statusCode).toBe(400)
            expect(result.message).toContain('missing configuration')
        }
    })

    it('should return error with 400 for "Missing" message', async () => {
        mockTriggerSync.mockResolvedValue({
            code: 'ERROR',
            message: 'Missing API key',
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBe(true)
        if (result.isApiError) {
            expect(result.statusCode).toBe(400)
        }
    })

    it('should return error with 502 for "Gateway" message', async () => {
        mockTriggerSync.mockResolvedValue({
            code: 'ERROR',
            message: 'Gateway error (integration client server down)',
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBe(true)
        if (result.isApiError) {
            expect(result.statusCode).toBe(502)
        }
    })

    it('should return error with 500 for "Internal server" message', async () => {
        mockTriggerSync.mockResolvedValue({
            code: 'ERROR',
            message: 'Internal server error',
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBe(true)
        if (result.isApiError) {
            expect(result.statusCode).toBe(500)
        }
    })

    it('should default to 500 for unknown error messages', async () => {
        mockTriggerSync.mockResolvedValue({
            code: 'ERROR',
            message: 'Something totally unexpected',
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBe(true)
        if (result.isApiError) {
            expect(result.statusCode).toBe(500)
            expect(result.message).toBe('Something totally unexpected')
        }
    })

    it('should handle empty sync_approval changes', async () => {
        mockTriggerSync.mockResolvedValue({
            code: 'SUCCESS',
            message: 'OK',
            data: { sync_approval: { application_name: 'Salesforce', changes: [] }, metadata: {} },
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBeFalsy()
        if (!result.isApiError) {
            expect(result.changes).toHaveLength(0)
        }
    })

    it('should handle missing sync_approval', async () => {
        mockTriggerSync.mockResolvedValue({
            code: 'SUCCESS',
            message: 'OK',
            data: { metadata: {} },
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBeFalsy()
        if (!result.isApiError) {
            expect(result.changes).toHaveLength(0)
        }
    })

    it('should use fallback message when error has no message', async () => {
        mockTriggerSync.mockResolvedValue({
            code: 'ERROR',
            message: '',
        })

        const result = await syncIntegration('salesforce')

        expect(result.isApiError).toBe(true)
        if (result.isApiError) {
            expect(result.message).toBe('Sync failed')
        }
    })
})

describe('applySyncAction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should call applyMockSync and redirect after timeout', async () => {
        const changes: SyncChange[] = [
            { id: '1', field_name: 'email', change_type: 'ADD', new_value: 'test@test.com' },
        ]

        await expect(applySyncAction('salesforce', changes)).rejects.toThrow('NEXT_REDIRECT')

        expect(mockApplyMockSync).toHaveBeenCalledWith('salesforce', changes)
        expect(mockRedirect).toHaveBeenCalledWith('/integrations/salesforce/history')
    })
})
