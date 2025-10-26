/**
 * @fileoverview Tests for useAsyncOperation hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncOperation } from '../use-async-operation';
import { useToastError } from '../use-toast-error';

// Mock the useToastError hook
jest.mock('../use-toast-error');

describe('useAsyncOperation', () => {
    const mockToastError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useToastError as jest.Mock).mockReturnValue(mockToastError);
    });

    it('should initialize with loading false and no error', () => {
        const asyncFn = jest.fn(() => Promise.resolve('result'));
        const { result } = renderHook(() => useAsyncOperation(asyncFn));

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should set loading to true during execution', async () => {
        const asyncFn = jest.fn(() => new Promise((resolve) => setTimeout(() => resolve('result'), 100)));
        const { result } = renderHook(() => useAsyncOperation(asyncFn));

        act(() => {
            result.current.execute();
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should return the result on successful execution', async () => {
        const expectedResult = 'success result';
        const asyncFn = jest.fn(() => Promise.resolve(expectedResult));
        const { result } = renderHook(() => useAsyncOperation(asyncFn));

        let actualResult: string | undefined;
        await act(async () => {
            actualResult = await result.current.execute();
        });

        expect(actualResult).toBe(expectedResult);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle errors and set error state', async () => {
        const expectedError = new Error('Test error');
        const asyncFn = jest.fn(() => Promise.reject(expectedError));
        const { result } = renderHook(() => useAsyncOperation(asyncFn));

        await act(async () => {
            try {
                await result.current.execute();
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(expectedError);
    });

    it('should show error toast by default when error occurs', async () => {
        const expectedError = new Error('Test error');
        const asyncFn = jest.fn(() => Promise.reject(expectedError));
        const { result } = renderHook(() => useAsyncOperation(asyncFn));

        await act(async () => {
            try {
                await result.current.execute();
            } catch (error) {
                // Expected to throw
            }
        });

        expect(mockToastError).toHaveBeenCalledWith(expectedError);
    });

    it('should not show error toast when showError is false', async () => {
        const expectedError = new Error('Test error');
        const asyncFn = jest.fn(() => Promise.reject(expectedError));
        const { result } = renderHook(() => useAsyncOperation(asyncFn, { showError: false }));

        await act(async () => {
            try {
                await result.current.execute();
            } catch (error) {
                // Expected to throw
            }
        });

        expect(mockToastError).not.toHaveBeenCalled();
    });

    it('should convert non-Error objects to Error instances', async () => {
        const asyncFn = jest.fn(() => Promise.reject('string error'));
        const { result } = renderHook(() => useAsyncOperation(asyncFn));

        await act(async () => {
            try {
                await result.current.execute();
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('An error occurred');
    });

    it('should clear previous error on new execution', async () => {
        const asyncFn = jest.fn()
            .mockRejectedValueOnce(new Error('First error'))
            .mockResolvedValueOnce('success');

        const { result } = renderHook(() => useAsyncOperation(asyncFn));

        // First execution - error
        await act(async () => {
            try {
                await result.current.execute();
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.error).toBeTruthy();

        // Second execution - success
        await act(async () => {
            await result.current.execute();
        });

        expect(result.current.error).toBe(null);
    });

    it('should maintain stable execute function reference', () => {
        const asyncFn = jest.fn(() => Promise.resolve('result'));
        const { result, rerender } = renderHook(() => useAsyncOperation(asyncFn));

        const firstExecute = result.current.execute;
        rerender();
        const secondExecute = result.current.execute;

        expect(firstExecute).toBe(secondExecute);
    });
});
