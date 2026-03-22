import { describe, it, expect } from 'vitest'
import { cn, formatRelative, formatDate, formatTime } from '@/lib/utils'

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('should handle array input', () => {
    const result = cn(['foo', 'bar'])
    expect(result).toBe('foo bar')
  })
})

describe('formatRelative', () => {
  it('should format days ago', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 3)
    const result = formatRelative(pastDate.toISOString())
    expect(result).toBe('3 days ago')
  })

  it('should handle today', () => {
    const today = new Date().toISOString()
    const result = formatRelative(today)
    expect(result).toBe('Today')
  })

  it('should handle singular day', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const result = formatRelative(yesterday.toISOString())
    expect(result).toBe('Yesterday')
  })
})

describe('formatRelative (edge cases)', () => {
  it('should handle 7 days ago', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 7)
    const result = formatRelative(pastDate.toISOString())
    expect(result).toMatch(/7 days ago|1 week ago/i)
  })

  it('should handle 30 days ago', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 30)
    const result = formatRelative(pastDate.toISOString())
    expect(result).toMatch(/30 days ago|1 month ago|4 weeks ago/i)
  })
})

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate('2026-03-15')
    expect(result).toBe('Mar 15, 2026')
  })

  it('should format end of year date', () => {
    const result = formatDate('2026-12-31')
    expect(result).toBe('Dec 31, 2026')
  })

  it('should format beginning of year date', () => {
    const result = formatDate('2026-01-01')
    expect(result).toBe('Jan 1, 2026')
  })
})

describe('formatTime', () => {
  it('should format time correctly', () => {
    const result = formatTime('2026-03-15T12:00:00Z')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('should format midnight UTC', () => {
    const result = formatTime('2026-03-15T00:00:00Z')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('should format a time with minutes', () => {
    const result = formatTime('2026-03-15T08:45:00Z')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})

describe('cn (Tailwind merge)', () => {
  it('should resolve conflicting Tailwind utilities', () => {
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('should merge non-conflicting Tailwind utilities', () => {
    const result = cn('px-2', 'py-4')
    expect(result).toBe('px-2 py-4')
  })

  it('should handle empty string', () => {
    const result = cn('')
    expect(result).toBe('')
  })

  it('should handle undefined and null inputs', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toBe('foo bar')
  })
})