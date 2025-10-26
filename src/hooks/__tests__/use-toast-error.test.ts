/**
 * @fileoverview Tests for useToastError hook
 */

import { renderHook } from '@testing-library/react';
import { useToastError } from '../use-toast-error';
import { useToast } from '../use-toast';

// Mock the useToast hook
jest.mock('../use-toast');

describe('useToastError', () => {
    const mockToast = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    });

    it('should return a function', () => {
        const { result } = renderHook(() => useToastError());

        expect(typeof result.current).toBe('function');
    });

    it('should display error toast with Error object', () => {
        const { result } = renderHook(() => useToastError());
        const error = new Error('Test error message');

        result.current(error);

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Test error message',
            variant: 'destructive',
            duration: 5000,
        });
    });

    it('should display error toast with string error', () => {
        const { result } = renderHook(() => useToastError());
        const errorMessage = 'String error message';

        result.current(errorMessage);

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
            duration: 5000,
        });
    });

    it('should use custom title when provided', () => {
        const customTitle = 'Custom Error Title';
        const { result } = renderHook(() => useToastError(customTitle));
        const error = new Error('Test error');

        result.current(error);

        expect(mockToast).toHaveBeenCalledWith({
            title: customTitle,
            description: 'Test error',
            variant: 'destructive',
            duration: 5000,
        });
    });

    it('should handle empty error message', () => {
        const { result } = renderHook(() => useToastError());
        const error = new Error('');

        result.current(error);

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: '',
            variant: 'destructive',
            duration: 5000,
        });
    });

    it('should handle empty string error', () => {
        const { result } = renderHook(() => useToastError());

        result.current('');

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: '',
            variant: 'destructive',
            duration: 5000,
        });
    });

    it('should handle Error with special characters', () => {
        const { result } = renderHook(() => useToastError());
        const error = new Error('Error: <script>alert("xss")</script>');

        result.current(error);

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Error: <script>alert("xss")</script>',
            variant: 'destructive',
            duration: 5000,
        });
    });

    it('should handle multiline error messages', () => {
        const { result } = renderHook(() => useToastError());
        const error = new Error('Line 1\nLine 2\nLine 3');

        result.current(error);

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Line 1\nLine 2\nLine 3',
            variant: 'destructive',
            duration: 5000,
        });
    });

    it('should always use destructive variant', () => {
        const { result } = renderHook(() => useToastError());

        result.current('Test error');

        expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
                variant: 'destructive',
            })
        );
    });

    it('should always use 5000ms duration', () => {
        const { result } = renderHook(() => useToastError());

        result.current('Test error');

        expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
                duration: 5000,
            })
        );
    });

    it('should be callable multiple times', () => {
        const { result } = renderHook(() => useToastError());

        result.current('Error 1');
        result.current('Error 2');
        result.current('Error 3');

        expect(mockToast).toHaveBeenCalledTimes(3);
    });

    it('should handle very long error messages', () => {
        const { result } = renderHook(() => useToastError());
        const longMessage = 'A'.repeat(1000);
        const error = new Error(longMessage);

        result.current(error);

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: longMessage,
            variant: 'destructive',
            duration: 5000,
        });
    });
});
