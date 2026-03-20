export interface SuccessApiResponse<T = unknown> {
    code?: string;
    message: string;
    data: T;
}

export interface ErrorApiResponse {
    error?: string;
    code?: string;
    message: string;
}

export type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse;

/**
 * Creates a standard successful API response
 */
export function createSuccessResponse<T>({
    message,
    data,
    code
}: {
    message: string;
    data: T;
    code?: string;
}): SuccessApiResponse<T> {
    return {
        code: code || 'SUCCESS',
        message,
        data,
    };
}

/**
 * Creates a standard error API response handling specific error cases
 * 4xx: Possible missing configuration
 * 500: Internal server error
 * 502: Gateway error (integration client server down)
 */
export function createErrorResponse({
    statusCode,
    originalMessage,
    code,
    errorType
}: {
    statusCode: number;
    originalMessage?: string;
    code?: string;
    errorType?: string;
}): ErrorApiResponse {
    let message = 'An unknown error occurred';

    // Map to requested standard messages based on status codes
    if (statusCode >= 400 && statusCode < 500) {
        message = originalMessage && originalMessage !== 'Not Found'
            ? `Possible missing configuration. Details: ${originalMessage}`
            : 'Possible missing configuration';
    } else if (statusCode === 500) {
        message = 'Internal server error';
    } else if (statusCode === 502) {
        message = 'Gateway error (integration client server down)';
    } else if (originalMessage) {
        message = originalMessage; // Fallback to provided error message
    }

    return {
        error: errorType || 'Error',
        code: code || 'unknown_error',
        message,
    };
}

export type FetchOptions = RequestInit;

/**
 * Extends the native fetch to automatically return a strict `ApiResponse<T>` contract.
 * Also automatically maps typical API failures smoothly.
 */
export async function apiFetch<T = unknown>(
    url: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers, // Allow overrides
            },
        });

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const responseData = isJson ? await response.json() : await response.text();

        const dataObj = typeof responseData === 'object' && responseData !== null
            ? (responseData as Record<string, unknown>)
            : null;

        if (!response.ok) {
            return createErrorResponse({
                statusCode: response.status,
                originalMessage: dataObj?.message ? String(dataObj.message) : typeof responseData === 'string' ? responseData : response.statusText,
                code: dataObj?.code ? String(dataObj.code) : undefined,
                errorType: dataObj?.error ? String(dataObj.error) : undefined
            });
        }

        return createSuccessResponse<T>({
            message: dataObj?.message ? String(dataObj.message) : 'Success',
            data: dataObj?.data !== undefined ? (dataObj.data as T) : (responseData as T),
            code: dataObj?.code ? String(dataObj.code) : undefined
        });
    } catch (error: unknown) {
        // If the error is an operational fetch failure (e.g. connection refused, network down)
        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
                ? String((error as Record<string, unknown>).message)
                : 'Internal client/network error';

        return createErrorResponse({
            statusCode: 500,
            originalMessage: errorMessage,
            code: undefined, // no code
            errorType: undefined // no errorType
        });
    }
}
