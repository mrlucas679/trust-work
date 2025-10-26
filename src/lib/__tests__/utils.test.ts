import { render, screen } from '@testing-library/react';
import { cn } from '../utils';

describe('utils', () => {
    describe('cn (class names utility)', () => {
        it('should merge class names', () => {
            const result = cn('text-red-500', 'bg-blue-500');
            expect(result).toBe('text-red-500 bg-blue-500');
        });

        it('should handle conditional classes', () => {
            const result = cn('base-class', { 'active': true, 'disabled': false });
            expect(result).toContain('active');
            expect(result).not.toContain('disabled');
        });

        it('should handle undefined and null values', () => {
            const result = cn('base', undefined, null, 'other');
            expect(result).toBe('base other');
        });

        it('should merge tailwind classes correctly', () => {
            // Testing tailwind-merge behavior
            const result = cn('px-2', 'px-4');
            expect(result).toBe('px-4'); // Later class should override
        });

        it('should handle arrays of classes', () => {
            const result = cn(['class1', 'class2'], 'class3');
            expect(result).toContain('class1');
            expect(result).toContain('class2');
            expect(result).toContain('class3');
        });

        it('should handle empty input', () => {
            const result = cn();
            expect(result).toBe('');
        });

        it('should handle complex conditional logic', () => {
            const isActive = true;
            const isDisabled = false;
            const result = cn(
                'btn',
                isActive && 'btn-active',
                isDisabled && 'btn-disabled'
            );

            expect(result).toContain('btn');
            expect(result).toContain('btn-active');
            expect(result).not.toContain('btn-disabled');
        });
    });
});
