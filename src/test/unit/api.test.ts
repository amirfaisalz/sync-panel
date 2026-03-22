import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSuccessResponse, createErrorResponse, apiFetch, type SuccessApiResponse } from '@/lib/api'

describe('createSuccessResponse', () => {
  it('should create success response with default code', () => {
    const result = createSuccessResponse({ message: 'Success', data: { foo: 'bar' } })
    expect(result.code).toBe('SUCCESS')
    expect(result.message).toBe('Success')
    expect(result.data).toEqual({ foo: 'bar' })
  })

  it('should create success response with custom code', () => {
    const result = createSuccessResponse({ message: 'OK', data: null, code: 'CUSTOM' })
    expect(result.code).toBe('CUSTOM')
  })

  it('should handle empty data', () => {
    const result = createSuccessResponse({ message: 'Done', data: null })
    expect(result.data).toBeNull()
  })
})

describe('createErrorResponse', () => {
  it('should handle 400 status code', () => {
    const result = createErrorResponse({ statusCode: 400, originalMessage: 'Bad request' })
    expect(result.message).toBe('Possible missing configuration. Details: Bad request')
    expect(result.code).toBe('unknown_error')
  })

  it('should handle 404 status code', () => {
    const result = createErrorResponse({ statusCode: 404 })
    expect(result.message).toBe('Possible missing configuration')
  })

  it('should handle 500 status code', () => {
    const result = createErrorResponse({ statusCode: 500 })
    expect(result.message).toBe('Internal server error')
  })

  it('should handle 502 status code', () => {
    const result = createErrorResponse({ statusCode: 502 })
    expect(result.message).toBe('Gateway error (integration client server down)')
  })

  it('should handle custom error type', () => {
    const result = createErrorResponse({ statusCode: 400, errorType: 'ConfigError' })
    expect(result.error).toBe('ConfigError')
  })

  it('should fallback to original message for unknown status codes', () => {
    const result = createErrorResponse({ statusCode: 600, originalMessage: "I'm a teapot" })
    expect(result.message).toBe("I'm a teapot")
  })

  it('should fallback to unknown error for network errors', () => {
    const result = createErrorResponse({ statusCode: 500 })
    expect(result.message).toBe('Internal server error')
  })

  it('should handle 401 status code as missing configuration', () => {
    const result = createErrorResponse({ statusCode: 401, originalMessage: 'Unauthorized' })
    expect(result.message).toBe('Possible missing configuration. Details: Unauthorized')
  })

  it('should handle 403 status code as missing configuration', () => {
    const result = createErrorResponse({ statusCode: 403, originalMessage: 'Forbidden' })
    expect(result.message).toBe('Possible missing configuration. Details: Forbidden')
  })

  it('should handle 404 with "Not Found" originalMessage', () => {
    const result = createErrorResponse({ statusCode: 404, originalMessage: 'Not Found' })
    expect(result.message).toBe('Possible missing configuration')
  })

  it('should use "An unknown error occurred" when no message available for unknown status', () => {
    const result = createErrorResponse({ statusCode: 999 })
    expect(result.message).toBe('An unknown error occurred')
  })

  it('should default error to "Error" when no errorType provided', () => {
    const result = createErrorResponse({ statusCode: 500 })
    expect(result.error).toBe('Error')
  })

  it('should default code to "unknown_error" when no code provided', () => {
    const result = createErrorResponse({ statusCode: 500 })
    expect(result.code).toBe('unknown_error')
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should return success response for 200', async () => {
    const mockResponse = {
      code: 'SUCCESS',
      message: 'Data retrieved',
      data: { id: 1 },
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockResponse),
      status: 200,
      statusText: 'OK',
    })

    const result = await apiFetch('/api/test')
    expect(result).toEqual({
      code: 'SUCCESS',
      message: 'Data retrieved',
      data: { id: 1 },
    })
  })

  it('should return error response for 400', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Invalid input', code: 'INVALID' }),
    })

    const result = await apiFetch('/api/test')
    expect(result).toEqual({
      error: 'Error',
      code: 'INVALID',
      message: 'Possible missing configuration. Details: Invalid input',
    })
  })

  it('should return error response for 500', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Server error' }),
    })

    const result = await apiFetch('/api/test')
    expect(result).toEqual({
      error: 'Error',
      code: 'unknown_error',
      message: 'Internal server error',
    })
  })

  it('should handle network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await apiFetch('/api/test')
    expect(result).toEqual({
      error: 'Error',
      code: 'unknown_error',
      message: 'Internal server error',
    })
  })

  it('should handle non-JSON responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      json: () => Promise.reject(new Error('Not JSON')),
      text: () => Promise.resolve('plain text response'),
    })

    const result = await apiFetch('/api/test')
    expect(result.message).toBe('Success')
    const successResult = result as SuccessApiResponse<string>
    expect(successResult.data).toBe('plain text response')
  })

  it('should pass custom headers', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ data: {} }),
    })
    global.fetch = fetchSpy

    await apiFetch('/api/test', {
      headers: { Authorization: 'Bearer token' },
    })

    expect(fetchSpy).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      }),
    }))
  })

  it('should handle POST requests with body', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ code: 'SUCCESS', message: 'Created', data: { id: 99 } }),
    })
    global.fetch = fetchSpy

    const result = await apiFetch('/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    })

    expect(fetchSpy).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    }))
    expect(result).toEqual({
      code: 'SUCCESS',
      message: 'Created',
      data: { id: 99 },
    })
  })

  it('should handle 502 gateway error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Bad Gateway' }),
    })

    const result = await apiFetch('/api/test')
    expect(result).toEqual({
      error: 'Error',
      code: 'unknown_error',
      message: 'Gateway error (integration client server down)',
    })
  })

  it('should handle non-Error thrown exceptions', async () => {
    global.fetch = vi.fn().mockRejectedValue('string error')

    const result = await apiFetch('/api/test')
    expect(result).toEqual({
      error: 'Error',
      code: 'unknown_error',
      message: 'Internal server error',
    })
  })

  it('should handle error object with message property but not Error instance', async () => {
    global.fetch = vi.fn().mockRejectedValue({ message: 'custom object error' })

    const result = await apiFetch('/api/test')
    expect(result).toEqual({
      error: 'Error',
      code: 'unknown_error',
      message: 'Internal server error',
    })
  })

  it('should extract error type from response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Invalid', error: 'ValidationError', code: 'VALIDATION_FAILED' }),
    })

    const result = await apiFetch('/api/test')
    expect(result).toEqual({
      error: 'ValidationError',
      code: 'VALIDATION_FAILED',
      message: 'Possible missing configuration. Details: Invalid',
    })
  })

  it('should return data directly when response has no data wrapper', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'OK', code: 'SUCCESS', someField: 'value' }),
    })

    const result = await apiFetch('/api/test')
    // When data field is undefined, the whole responseData object is used as data
    const successResult = result as SuccessApiResponse<Record<string, unknown>>
    expect(successResult.message).toBe('OK')
    expect(successResult.code).toBe('SUCCESS')
  })
})