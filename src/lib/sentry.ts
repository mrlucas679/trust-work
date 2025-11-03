import * as Sentry from '@sentry/react';

/**
 * Sentry Configuration
 * 
 * Setup and utilities for error tracking and performance monitoring
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize Sentry with proper configuration
 * Call this in main.tsx before rendering the app
 */
export function initSentry() {
    // Only initialize in production or when explicitly enabled
    const isDevelopment = import.meta.env.DEV;
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

    if (!sentryDsn) {
        console.warn('Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE,
        enabled: !isDevelopment || import.meta.env.VITE_SENTRY_ENABLED === 'true',

        // Performance Monitoring - browserTracingIntegration is now included by default
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],

        // Performance sampling
        tracesSampleRate: isDevelopment ? 1.0 : 0.1, // 100% in dev, 10% in prod

        // Error sampling
        sampleRate: 1.0, // Capture 100% of errors

        // Session Replay sampling
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

        // Release tracking
        release: import.meta.env.VITE_APP_VERSION || 'unknown',

        // Trace propagation
        tracePropagationTargets: [
            'localhost',
            /^https:\/\/yourapp\.com\/api/,
            import.meta.env.VITE_SUPABASE_URL,
        ],

        // Before send hook - filter sensitive data
        beforeSend(event, hint) {
            // Filter out sensitive information
            if (event.request?.headers) {
                delete event.request.headers['Authorization'];
                delete event.request.headers['Cookie'];
            }

            // Filter out sensitive query params
            if (event.request?.url) {
                const url = new URL(event.request.url);
                url.searchParams.delete('token');
                url.searchParams.delete('apikey');
                event.request.url = url.toString();
            }

            // Log errors in development
            if (isDevelopment) {
                console.error('Sentry error:', hint.originalException || hint.syntheticException);
            }

            return event;
        },

        // Ignore common errors
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            'chrome-extension://',
            'moz-extension://',
            // Network errors
            'NetworkError',
            'Network request failed',
            // ResizeObserver loop errors (non-critical)
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications',
        ],
    });
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

/**
 * Sentry Error Boundary component
 * Use this to wrap your app or specific sections
 * 
 * @example
 * <SentryErrorBoundary fallback={<ErrorFallback />}>
 *   <App />
 * </SentryErrorBoundary>
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// ============================================================================
// CUSTOM ERROR REPORTING
// ============================================================================

/**
 * Manually capture an exception
 * @param error - The error to capture
 * @param context - Additional context
 * 
 * @example
 * captureException(new Error('Something went wrong'), {
 *   tags: { feature: 'payments' },
 *   extra: { userId: '123' }
 * });
 */
export function captureException(
    error: Error,
    context?: {
        tags?: Record<string, string>;
        extra?: Record<string, unknown>;
        level?: Sentry.SeverityLevel;
    }
) {
    Sentry.captureException(error, {
        tags: context?.tags,
        extra: context?.extra,
        level: context?.level || 'error',
    });
}

/**
 * Manually capture a message
 * @param message - The message to capture
 * @param level - Severity level
 * @param context - Additional context
 * 
 * @example
 * captureMessage('User completed onboarding', 'info', {
 *   tags: { feature: 'onboarding' }
 * });
 */
export function captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: {
        tags?: Record<string, string>;
        extra?: Record<string, unknown>;
    }
) {
    Sentry.captureMessage(message, {
        level,
        tags: context?.tags,
        extra: context?.extra,
    });
}

// ============================================================================
// USER CONTEXT
// ============================================================================

/**
 * Set user context for error reports
 * @param user - User information
 * 
 * @example
 * setUserContext({
 *   id: user.id,
 *   email: user.email,
 *   role: user.role
 * });
 */
export function setUserContext(user: {
    id: string;
    email?: string;
    username?: string;
    role?: string;
} | null) {
    if (user) {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        });
    } else {
        Sentry.setUser(null);
    }
}

// ============================================================================
// BREADCRUMBS
// ============================================================================

/**
 * Add a breadcrumb for debugging
 * @param message - Breadcrumb message
 * @param category - Category for grouping
 * @param data - Additional data
 * 
 * @example
 * addBreadcrumb('User clicked submit button', 'user-action', {
 *   formId: 'payment-form'
 * });
 */
export function addBreadcrumb(
    message: string,
    category: string = 'default',
    data?: Record<string, unknown>
) {
    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
        timestamp: Date.now() / 1000,
    });
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Start a custom transaction for performance tracking
 * @param name - Transaction name
 * @param operation - Operation type
 * @returns Span object
 * 
 * @example
 * const span = startTransaction('load-user-data', 'http.request');
 * // ... perform operation
 * span.end();
 */
export function startTransaction(name: string, operation: string = 'custom') {
    return Sentry.startSpan({
        name,
        op: operation,
    }, (span) => span);
}

/**
 * Measure a specific operation
 * @param name - Operation name
 * @param operation - Function to measure
 * @returns Result of the operation
 * 
 * @example
 * const result = await measureOperation('fetch-assignments', async () => {
 *   return await api.getAssignments();
 * });
 */
export async function measureOperation<T>(
    name: string,
    operation: () => Promise<T>
): Promise<T> {
    return Sentry.startSpan(
        {
            name,
            op: 'function',
        },
        async () => {
            return await operation();
        }
    );
}

/**
 * Create a span within the current transaction
 * @param description - Span description
 * @param operation - Function to measure
 * @returns Result of the operation
 * 
 * @example
 * await withSpan('database-query', async () => {
 *   return await db.query('SELECT * FROM users');
 * });
 */
export async function withSpan<T>(
    description: string,
    operation: () => Promise<T>
): Promise<T> {
    return Sentry.startSpan(
        {
            name: description,
            op: 'function',
        },
        async () => {
            return await operation();
        }
    );
}

// ============================================================================
// TAGS AND CONTEXT
// ============================================================================

/**
 * Set a tag for filtering errors
 * @param key - Tag key
 * @param value - Tag value
 * 
 * @example
 * setTag('feature', 'payments');
 */
export function setTag(key: string, value: string) {
    Sentry.setTag(key, value);
}

/**
 * Set multiple tags at once
 * @param tags - Object with tag key-value pairs
 * 
 * @example
 * setTags({ feature: 'payments', userType: 'freelancer' });
 */
export function setTags(tags: Record<string, string>) {
    Sentry.setTags(tags);
}

/**
 * Set extra context data
 * @param key - Context key
 * @param value - Context value
 * 
 * @example
 * setContext('payment', { amount: 100, currency: 'USD' });
 */
export function setContext(key: string, value: Record<string, unknown>) {
    Sentry.setContext(key, value);
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check if Sentry is enabled
 * @returns Whether Sentry is initialized and enabled
 */
export function isSentryEnabled(): boolean {
    return !!import.meta.env.VITE_SENTRY_DSN;
}

/**
 * Flush all pending events to Sentry
 * Useful before page unload or app shutdown
 * @param timeout - Timeout in milliseconds
 * @returns Promise that resolves when flushed
 * 
 * @example
 * await flushSentry(2000);
 */
export async function flushSentry(timeout: number = 2000): Promise<boolean> {
    return Sentry.flush(timeout);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Sentry };
