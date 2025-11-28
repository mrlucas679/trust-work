import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

interface UseAsyncOperationOptions<T = unknown> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
}

/**
 * Custom hook for managing async operations with loading states
 * Provides automatic error handling and toast notifications
 * 
 * @example
 * const { execute, isLoading, error } = useAsyncOperation({
 *   showSuccessToast: true,
 *   successMessage: 'Job posted successfully!'
 * });
 * 
 * const handleSubmit = async (data) => {
 *   await execute(() => api.createJob(data));
 * };
 */
export function useAsyncOperation<T = unknown>(options: UseAsyncOperationOptions<T> = {}) {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        isLoading: false,
        error: null,
    });

    const { toast } = useToast();

    const execute = useCallback(
        async (asyncFunction: () => Promise<T>): Promise<T | null> => {
            setState({ data: null, isLoading: true, error: null });

            try {
                const result = await asyncFunction();
                setState({ data: result, isLoading: false, error: null });

                // Show success toast if enabled
                if (options.showSuccessToast) {
                    toast({
                        title: 'Success',
                        description: options.successMessage || 'Operation completed successfully',
                        variant: 'default',
                    });
                }

                // Call success callback
                options.onSuccess?.(result);

                return result;
            } catch (error) {
                const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
                setState({ data: null, isLoading: false, error: errorObj });

                // Show error toast if enabled
                if (options.showErrorToast !== false) {
                    toast({
                        title: 'Error',
                        description: options.errorMessage || errorObj.message || 'Something went wrong',
                        variant: 'destructive',
                    });
                }

                // Call error callback
                options.onError?.(errorObj);

                return null;
            }
        },
        [options, toast]
    );

    const reset = useCallback(() => {
        setState({ data: null, isLoading: false, error: null });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}

/**
 * Simplified version for mutations with optimistic updates
 * 
 * @example
 * const { mutate, isLoading } = useMutation({
 *   onSuccess: () => queryClient.invalidateQueries(['jobs'])
 * });
 */
export function useMutation<TData = unknown, TVariables = unknown>(
    options: UseAsyncOperationOptions<TData> = {}
) {
    const { execute, isLoading, error } = useAsyncOperation<TData>(options);

    const mutate = useCallback(
        async (mutationFn: (variables: TVariables) => Promise<TData>, variables: TVariables) => {
            return execute(() => mutationFn(variables));
        },
        [execute]
    );

    return {
        mutate,
        isLoading,
        error,
    };
}
