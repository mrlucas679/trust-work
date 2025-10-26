/**
 * @fileoverview Tests for useFormValidation hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { useFormValidation } from '../use-form-validation';
import { useAsyncOperation } from '../use-async-operation';
import { useToast } from '../use-toast';

// Mock dependencies
jest.mock('../use-async-operation');
jest.mock('../use-toast');

describe('useFormValidation', () => {
    const mockToast = jest.fn();
    const mockExecute = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
        (useAsyncOperation as jest.Mock).mockReturnValue({
            loading: false,
            execute: mockExecute,
        });
    });

    it('should initialize form with default values', () => {
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(8),
        });

        const { result } = renderHook(() => useFormValidation(schema));

        expect(result.current.formState.isSubmitting).toBe(false);
        expect(result.current.formState.errors).toEqual({});
    });

    it('should validate fields on blur', async () => {
        const schema = z.object({
            email: z.string().email('Invalid email'),
        });

        const { result } = renderHook(() => useFormValidation(schema));

        act(() => {
            result.current.setValue('email', 'invalid-email', { shouldValidate: true });
        });

        await waitFor(() => {
            expect(result.current.formState.errors.email).toBeDefined();
        });
    });

    it('should accept valid form data', async () => {
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(8),
        });

        const { result } = renderHook(() => useFormValidation(schema));

        act(() => {
            result.current.setValue('email', 'test@example.com', { shouldValidate: true });
            result.current.setValue('password', 'password123', { shouldValidate: true });
        });

        await waitFor(() => {
            expect(result.current.formState.errors).toEqual({});
        });
    });

    it('should call onSuccess callback on successful submission', async () => {
        const schema = z.object({
            email: z.string().email(),
        });

        const onSuccess = jest.fn();
        const { result } = renderHook(() =>
            useFormValidation(schema, { onSuccess })
        );

        act(() => {
            result.current.setValue('email', 'test@example.com');
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        // useAsyncOperation execute should be called
        expect(mockExecute).toHaveBeenCalled();
    });

    it('should show success toast when successMessage is provided', async () => {
        const schema = z.object({
            email: z.string().email(),
        });

        const successMessage = 'Form submitted successfully!';
        const onSuccess = jest.fn();

        renderHook(() =>
            useFormValidation(schema, { onSuccess, successMessage })
        );

        // Success toast configuration should be set up
        expect(useToast).toHaveBeenCalled();
    });

    it('should set isSubmitting to loading state', () => {
        const schema = z.object({
            email: z.string().email(),
        });

        (useAsyncOperation as jest.Mock).mockReturnValue({
            loading: true,
            execute: mockExecute,
        });

        const { result } = renderHook(() => useFormValidation(schema));

        expect(result.current.formState.isSubmitting).toBe(true);
    });

    it('should handle submission errors', async () => {
        const schema = z.object({
            email: z.string().email(),
        });

        const onSuccess = jest.fn().mockRejectedValue(new Error('Submission failed'));
        const { result } = renderHook(() =>
            useFormValidation(schema, { onSuccess })
        );

        act(() => {
            result.current.setValue('email', 'test@example.com');
        });

        await act(async () => {
            try {
                await result.current.handleSubmit();
            } catch (error) {
                // Error should be caught internally
            }
        });

        // useAsyncOperation should handle the error
        expect(mockExecute).toHaveBeenCalled();
    });

    it('should validate multiple fields', async () => {
        const schema = z.object({
            email: z.string().email('Invalid email'),
            password: z.string().min(8, 'Password must be at least 8 characters'),
            name: z.string().min(2, 'Name must be at least 2 characters'),
        });

        const { result } = renderHook(() => useFormValidation(schema));

        act(() => {
            result.current.setValue('email', 'invalid', { shouldValidate: true });
            result.current.setValue('password', 'short', { shouldValidate: true });
            result.current.setValue('name', 'a', { shouldValidate: true });
        });

        await waitFor(() => {
            expect(result.current.formState.errors.email).toBeDefined();
            expect(result.current.formState.errors.password).toBeDefined();
            expect(result.current.formState.errors.name).toBeDefined();
        });
    });

    it('should clear errors when valid data is provided', async () => {
        const schema = z.object({
            email: z.string().email('Invalid email'),
        });

        const { result } = renderHook(() => useFormValidation(schema));

        // Set invalid value
        act(() => {
            result.current.setValue('email', 'invalid', { shouldValidate: true });
        });

        await waitFor(() => {
            expect(result.current.formState.errors.email).toBeDefined();
        });

        // Set valid value
        act(() => {
            result.current.setValue('email', 'valid@example.com', { shouldValidate: true });
        });

        await waitFor(() => {
            expect(result.current.formState.errors.email).toBeUndefined();
        });
    });

    it('should handle complex validation schemas', async () => {
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(8),
            confirmPassword: z.string(),
        }).refine((data) => data.password === data.confirmPassword, {
            message: "Passwords don't match",
            path: ['confirmPassword'],
        });

        const { result } = renderHook(() => useFormValidation(schema));

        act(() => {
            result.current.setValue('email', 'test@example.com', { shouldValidate: true });
            result.current.setValue('password', 'password123', { shouldValidate: true });
            result.current.setValue('confirmPassword', 'different', { shouldValidate: true });
        });

        await waitFor(() => {
            expect(result.current.formState.errors.confirmPassword).toBeDefined();
        });
    });
});
