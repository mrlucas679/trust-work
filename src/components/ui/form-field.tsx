/**
 * @fileoverview Form field wrapper component with error handling and labels
 */

import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends ComponentPropsWithoutRef<'div'> {
    label?: string;
    error?: string;
    required?: boolean;
    description?: string;
}

/**
 * FormField component wraps form inputs with consistent styling and error handling
 * 
 * @component
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   error={errors.email?.message}
 *   required
 *   description="We'll never share your email"
 * >
 *   <Input {...register('email')} />
 * </FormField>
 * ```
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
    ({ className, children, label, error, required, description, ...props }, ref) => {
        const id = props.id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div ref={ref} className={cn('space-y-2', className)} {...props}>
                {label && (
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor={id}
                            className={cn(
                                required && "after:content-['*'] after:ml-0.5 after:text-red-500"
                            )}
                        >
                            {label}
                        </Label>
                    </div>
                )}

                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}

                {children}

                {error && (
                    <p className="text-sm font-medium text-destructive">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
