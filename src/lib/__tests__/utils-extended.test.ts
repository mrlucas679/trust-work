/**
 * @fileoverview Tests for utility functions
 */

import { cn } from '../utils';

describe('cn utility', () => {
    it('should merge class names', () => {
        const result = cn('foo', 'bar');
        expect(result).toContain('foo');
        expect(result).toContain('bar');
    });

    it('should handle conditional classes', () => {
        const condition1 = true;
        const condition2 = false;
        const result = cn('base', condition1 && 'conditional', condition2 && 'not-included');
        expect(result).toContain('base');
        expect(result).toContain('conditional');
        expect(result).not.toContain('not-included');
    });

    it('should merge tailwind classes correctly', () => {
        const result = cn('text-red-500', 'text-blue-500');
        // Should only have one text color class
        expect(result).toBe('text-blue-500');
    });

    it('should handle undefined and null', () => {
        const result = cn('base', undefined, null, 'other');
        expect(result).toContain('base');
        expect(result).toContain('other');
    });

    it('should handle arrays', () => {
        const result = cn(['foo', 'bar'], 'baz');
        expect(result).toContain('foo');
        expect(result).toContain('bar');
        expect(result).toContain('baz');
    });

    it('should handle objects', () => {
        const result = cn({ foo: true, bar: false, baz: true });
        expect(result).toContain('foo');
        expect(result).not.toContain('bar');
        expect(result).toContain('baz');
    });

    it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle complex merges with multiple classes', () => {
        const result = cn(
            'px-4 py-2',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'rounded-md'
        );
        expect(result).toContain('px-4');
        expect(result).toContain('py-2');
        expect(result).toContain('bg-primary');
        expect(result).toContain('hover:bg-primary/90');
    });

    it('should prioritize later classes over earlier ones', () => {
        const result = cn('p-4', 'p-8');
        expect(result).toBe('p-8');
    });

    it('should handle responsive classes', () => {
        const result = cn('text-sm', 'md:text-base', 'lg:text-lg');
        expect(result).toContain('text-sm');
        expect(result).toContain('md:text-base');
        expect(result).toContain('lg:text-lg');
    });
});
