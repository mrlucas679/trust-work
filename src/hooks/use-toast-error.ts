/**
 * @fileoverview Custom hook for consistent error toast notifications
 */

import { useToast } from './use-toast';

/**
 * Hook for displaying error messages in a toast notification
 * 
 * @param {string} [title] - Optional custom title for the error toast
 * @returns {(error: Error | string) => void} Function to show error toast
 * 
 * @example
 * ```tsx
 * const showError = useToastError();
 * 
 * try {
 *   await someOperation();
 * } catch (error) {
 *   showError(error);
 * }
 * ```
 */
export function useToastError(title = 'Error') {
    const { toast } = useToast();

    return (error: Error | string) => {
        const message = error instanceof Error ? error.message : error;

        toast({
            title,
            description: message,
            variant: 'destructive',
            duration: 5000,
        });
    };
}
