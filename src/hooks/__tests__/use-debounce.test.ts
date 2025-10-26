/**
 * @fileoverview Tests for useDebounce hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));
        expect(result.current).toBe('initial');
    });

    it('should debounce string value changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        );

        expect(result.current).toBe('initial');

        // Update value
        rerender({ value: 'updated', delay: 500 });

        // Value should not change immediately
        expect(result.current).toBe('initial');

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Value should now be updated
        expect(result.current).toBe('updated');
    });

    it('should debounce number value changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 0, delay: 300 } }
        );

        expect(result.current).toBe(0);

        rerender({ value: 42, delay: 300 });
        expect(result.current).toBe(0);

        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(result.current).toBe(42);
    });

    it('should cancel previous timeout on rapid value changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'first', delay: 500 } }
        );

        // Change value multiple times rapidly
        rerender({ value: 'second', delay: 500 });
        act(() => {
            jest.advanceTimersByTime(200);
        });

        rerender({ value: 'third', delay: 500 });
        act(() => {
            jest.advanceTimersByTime(200);
        });

        rerender({ value: 'fourth', delay: 500 });

        // Value should still be the original
        expect(result.current).toBe('first');

        // Complete the last timeout
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Only the last value should be reflected
        expect(result.current).toBe('fourth');
    });

    it('should handle delay changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'test', delay: 500 } }
        );

        rerender({ value: 'updated', delay: 1000 });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Should not update yet with longer delay
        expect(result.current).toBe('test');

        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Should update after full 1000ms
        expect(result.current).toBe('updated');
    });

    it('should debounce object value changes', () => {
        const initialObj = { name: 'John', age: 30 };
        const updatedObj = { name: 'Jane', age: 25 };

        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: initialObj, delay: 300 } }
        );

        expect(result.current).toBe(initialObj);

        rerender({ value: updatedObj, delay: 300 });
        expect(result.current).toBe(initialObj);

        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(result.current).toBe(updatedObj);
    });

    it('should debounce array value changes', () => {
        const initialArray = [1, 2, 3];
        const updatedArray = [4, 5, 6];

        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: initialArray, delay: 250 } }
        );

        expect(result.current).toBe(initialArray);

        rerender({ value: updatedArray, delay: 250 });
        expect(result.current).toBe(initialArray);

        act(() => {
            jest.advanceTimersByTime(250);
        });

        expect(result.current).toBe(updatedArray);
    });

    it('should handle zero delay', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 0 } }
        );

        rerender({ value: 'updated', delay: 0 });

        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current).toBe('updated');
    });

    it('should cleanup timeout on unmount', () => {
        const { unmount } = renderHook(() => useDebounce('value', 500));

        // Should not throw or cause issues
        unmount();

        act(() => {
            jest.advanceTimersByTime(500);
        });
    });
});
