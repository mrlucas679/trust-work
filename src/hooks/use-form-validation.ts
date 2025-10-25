/**
 * @fileoverview Custom hook for form validation and submission using react-hook-form
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { useAsyncOperation } from './use-async-operation';
import { useToast } from './use-toast';

interface UseFormValidationOptions<T> {
    onSuccess?: (data: T) => void | Promise<void>;
    successMessage?: string;
}

/**
 * Hook for handling form validation and submission with Zod schemas
 * 
 * @template T The type of the form data
 * @param {z.ZodSchema<T>} schema - Zod schema for form validation
 * @param {UseFormValidationOptions<T>} options - Configuration options
 * @returns {UseFormReturn<T>} Form methods and state
 * 
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 * 
 * function LoginForm() {
 *   const form = useFormValidation(schema, {
 *     onSuccess: async (data) => {
 *       await api.login(data);
 *     },
 *     successMessage: 'Successfully logged in!'
 *   });
 * 
 *   return (
 *     <form onSubmit={form.handleSubmit}>
 *       <input {...form.register('email')} />
 *       {form.formState.errors.email && (
 *         <span>{form.formState.errors.email.message}</span>
 *       )}
 *       // ... rest of the form
 *     </form>
 *   );
 * }
 * ```
 */
export function useFormValidation<T extends z.ZodSchema<unknown>>(
    schema: T,
    { onSuccess, successMessage }: UseFormValidationOptions<z.infer<T>> = {}
): UseFormReturn<z.infer<T>> {
    const { toast } = useToast();
    const formData = {} as z.infer<T>;

    const { loading, execute } = useAsyncOperation(async () => {
        if (onSuccess) {
            await onSuccess(formData);
            if (successMessage) {
                toast({
                    title: 'Success',
                    description: successMessage,
                    duration: 3000,
                });
            }
        }
    });

    const form = useForm<z.infer<T>>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
    });

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await execute(() => onSuccess?.(data));
        } catch (error) {
            // Error is already handled by useAsyncOperation
        }
    });

    return {
        ...form,
        handleSubmit: onSubmit,
        formState: {
            ...form.formState,
            isSubmitting: loading,
        },
    };
}
