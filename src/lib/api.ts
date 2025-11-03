/**
 * @fileoverview API client with type-safe request handling
 */

import { z } from 'zod';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Base configuration for API requests
 */
interface ApiClientConfig {
    baseUrl: string;
    headers?: Record<string, string>;
}

/**
 * Options for individual API requests
 */
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    params?: Record<string, string>;
    body?: unknown;
    schema?: z.ZodSchema;
}

/**
 * Helper function to build query string from params
 */
function buildQueryString(params?: Record<string, string>): string {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, value);
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * API client class for making type-safe HTTP requests
 */
export class ApiClient {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;

    constructor({ baseUrl, headers = {} }: ApiClientConfig) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers,
        };
    }

    /**
     * Set an authorization token for subsequent requests
     */
    setAuthToken(token: string) {
        this.defaultHeaders.Authorization = `Bearer ${token}`;
    }

    /**
     * Clear the authorization token
     */
    clearAuthToken() {
        delete this.defaultHeaders.Authorization;
    }

    /**
     * Make a request to the API
     */
    async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
        const {
            method = 'GET',
            headers = {},
            params,
            body,
            schema,
        } = options;

        const url = `${this.baseUrl}${path}${buildQueryString(params)}`;

        const response = await fetch(url, {
            method,
            headers: {
                ...this.defaultHeaders,
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = response.headers.get('content-type')?.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            throw new ApiError(
                data.message || 'An error occurred',
                response.status,
                data
            );
        }

        if (schema) {
            const result = schema.safeParse(data);
            if (!result.success) {
                throw new ApiError(
                    'Invalid response data',
                    response.status,
                    result.error
                );
            }
            return result.data as T;
        }

        return data as T;
    }

    /**
     * GET request helper
     */
    get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
        return this.request<T>(path, { ...options, method: 'GET' });
    }

    /**
     * POST request helper
     */
    post<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
        return this.request<T>(path, { ...options, method: 'POST' });
    }

    /**
     * PUT request helper
     */
    put<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
        return this.request<T>(path, { ...options, method: 'PUT' });
    }

    /**
     * DELETE request helper
     */
    delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
        return this.request<T>(path, { ...options, method: 'DELETE' });
    }

    /**
     * PATCH request helper
     */
    patch<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
        return this.request<T>(path, { ...options, method: 'PATCH' });
    }
}

/**
 * Create an API client instance
 */
export const api = new ApiClient({
    baseUrl: (() => {
        // Check for test environment
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
            return 'http://localhost:3000';
        }

        // Check for Vite environment (browser)
        if (typeof globalThis !== 'undefined') {
            const globalWithImport = globalThis as typeof globalThis & {
                import?: { meta?: { env?: { VITE_API_URL?: string } } }
            };
            const viteApiUrl = globalWithImport.import?.meta?.env?.VITE_API_URL;
            if (viteApiUrl) {
                return viteApiUrl;
            }
        }

        // Default fallback
        return 'http://localhost:3000';
    })(),
});
