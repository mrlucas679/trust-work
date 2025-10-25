/**
 * @fileoverview Custom hook for handling async operations with loading states
 */

import { useState, useCallback } from 'react';
import { useToastError } from './use-toast-error';

interface UseAsyncOperationReturn<T> {
    loading: boolean;
    error: Error | null;
    execute: () => Promise<T>;
}

/**
 * Hook for handling async operations with built-in loading and error states
 * 
 * @template T The type of the async operation result
 * @param {() => Promise<T>} asyncFn - The async function to execute
 * @param {Object} options - Configuration options
 * @param {boolean} [options.showError=true] - Whether to show error toasts
 * @returns {UseAsyncOperationReturn<T>} Object containing loading state, error, and execute function
 * 
 * @example
 * ```tsx
 * const { loading, error, execute } = useAsyncOperation(
 *   async () => {
 *     const response = await api.fetchData();
 *     return response.data;
 *   }
 * );
 * 
 * return (
 *   <button onClick={execute} disabled={loading}>
 *     {loading ? 'Loading...' : 'Fetch Data'}
 *   </button>
 * );
 * ```
 */
export function useAsyncOperation<T>(
    asyncFn: () => Promise<T>,
    { showError = true } = {}
): UseAsyncOperationReturn<T> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const toastError = useToastError();

    const execute = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await asyncFn();
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred');
            setError(error);
            if (showError) {
                toastError(error);
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }, [asyncFn, showError, toastError]);

    return { loading, error, execute };
}
