/**
 * @fileoverview Base layout component for consistent page structure
 */

import { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

interface BaseLayoutProps extends ComponentPropsWithoutRef<'div'> {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padded?: boolean;
    centered?: boolean;
}

/**
 * Base layout component providing consistent max-width, padding, and centering
 * 
 * @component
 * @example
 * ```tsx
 * <BaseLayout maxWidth="lg" padded centered>
 *   <h1>Page Title</h1>
 *   <p>Content goes here</p>
 * </BaseLayout>
 * ```
 */
export function BaseLayout({
    className,
    maxWidth = 'lg',
    padded = true,
    centered = true,
    children,
    ...props
}: BaseLayoutProps) {
    return (
        <div
            className={cn(
                "w-full overflow-x-hidden",
                {
                    'max-w-[640px]': maxWidth === 'sm',
                    'max-w-[768px]': maxWidth === 'md',
                    'max-w-[1024px]': maxWidth === 'lg',
                    'max-w-[1280px]': maxWidth === 'xl',
                    'max-w-[1400px]': maxWidth === '2xl',
                    'max-w-full': maxWidth === 'full',
                },
                padded && 'px-4 sm:px-6 lg:px-8',
                centered && 'mx-auto',
                'relative',
                className
            )}
            {...props}
        >
            <div className="w-full max-w-full">
                {children}
            </div>
        </div>
    );
}

/**
 * Section component for consistent vertical spacing between page sections
 */
export function Section({
    className,
    ...props
}: ComponentPropsWithoutRef<'section'>) {
    return (
        <section
            className={cn('py-12 sm:py-16 lg:py-20', className)}
            {...props}
        />
    );
}

/**
 * Container component for consistent horizontal padding
 */
export function Container({
    className,
    ...props
}: ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            className={cn('px-4 sm:px-6 lg:px-8', className)}
            {...props}
        />
    );
}
