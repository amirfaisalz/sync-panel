import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ConflictField } from '@/types/sync'

// Mock server-only (no-op)
vi.mock('server-only', () => ({}))

const mockApplyMockConflictMerge = vi.fn()
const mockRedirect = vi.fn()

vi.mock('@/services/sync.service', () => ({
    applyMockConflictMerge: (...args: unknown[]) => mockApplyMockConflictMerge(...args),
}))

vi.mock('next/navigation', () => ({
    redirect: (...args: unknown[]) => {
        mockRedirect(...args)
        throw new Error('NEXT_REDIRECT')
    },
}))



const { applyConflictMergeAction } = await import('@/actions/conflicts.action')

describe('applyConflictMergeAction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should call applyMockConflictMerge and redirect after timeout', async () => {
        const resolved: ConflictField[] = [
            { id: 'c1', fieldName: 'user.email', localValue: 'a', externalValue: 'b', resolution: 'local' },
        ]

        await expect(applyConflictMergeAction('hubspot', resolved)).rejects.toThrow('NEXT_REDIRECT')

        expect(mockApplyMockConflictMerge).toHaveBeenCalledWith('hubspot', resolved)
        expect(mockRedirect).toHaveBeenCalledWith('/integrations/hubspot')
    })

    it('should pass the correct integration ID', async () => {
        const resolved: ConflictField[] = [
            { id: 'c1', fieldName: 'field', localValue: 'l', externalValue: 'e', resolution: 'external' },
        ]

        await expect(applyConflictMergeAction('salesforce', resolved)).rejects.toThrow('NEXT_REDIRECT')

        expect(mockApplyMockConflictMerge).toHaveBeenCalledWith('salesforce', resolved)
        expect(mockRedirect).toHaveBeenCalledWith('/integrations/salesforce')
    })
})
