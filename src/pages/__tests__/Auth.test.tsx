/**
 * @fileoverview Tests for Auth page
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../Auth';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';

// Mock supabase client
jest.mock('@supabase/supabase-js');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Auth Page', () => {
    const mockSupabase = {
        auth: {
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
            upsert: jest.fn(),
        })),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
    });

    const renderAuth = () => {
        return render(
            <BrowserRouter>
                <SupabaseProvider>
                    <Auth />
                </SupabaseProvider>
            </BrowserRouter>
        );
    };

    it('should render authentication form', () => {
        renderAuth();

        expect(screen.getByText(/Welcome to TrustWork/i)).toBeInTheDocument();
        expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
        expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    });

    it('should render email and password inputs', () => {
        renderAuth();

        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('should show role selection on sign up tab', () => {
        renderAuth();

        // Click Sign Up tab
        const signUpTab = screen.getByRole('tab', { name: /Sign Up/i });
        fireEvent.click(signUpTab);

        // Should show role options
        expect(screen.getByText(/I'm looking for work/i)).toBeInTheDocument();
        expect(screen.getByText(/I'm looking to hire/i)).toBeInTheDocument();
    });

    it('should disable submit button when form is invalid', () => {
        renderAuth();

        const submitButton = screen.getByRole('button', { name: /Sign In/i });
        expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', async () => {
        renderAuth();

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: /Sign In/i });
            expect(submitButton).not.toBeDisabled();
        });
    });

    it('should call signInWithPassword on sign in', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: '123' } },
        });

        renderAuth();

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        const submitButton = screen.getByRole('button', { name: /Sign In/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('should display error message on failed sign in', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            error: { message: 'Invalid credentials' },
        });

        renderAuth();

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

        const submitButton = screen.getByRole('button', { name: /Sign In/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('should show loading state during authentication', async () => {
        let resolveSignIn: (value: unknown) => void;
        const signInPromise = new Promise((resolve) => {
            resolveSignIn = resolve;
        });
        mockSupabase.auth.signInWithPassword.mockReturnValue(signInPromise);

        renderAuth();

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        const submitButton = screen.getByRole('button', { name: /Sign In/i });
        fireEvent.click(submitButton);

        // Should show loading state
        expect(submitButton).toBeDisabled();

        // Resolve the promise
        resolveSignIn!({ error: null });
        await waitFor(() => {
            expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
        });
    });

    it('should switch between sign in and sign up tabs', () => {
        renderAuth();

        const signInTab = screen.getByRole('tab', { name: /Sign In/i });
        const signUpTab = screen.getByRole('tab', { name: /Sign Up/i });

        // Default is sign in
        expect(signInTab).toHaveAttribute('data-state', 'active');

        // Click sign up
        fireEvent.click(signUpTab);
        expect(signUpTab).toHaveAttribute('data-state', 'active');

        // Click sign in again
        fireEvent.click(signInTab);
        expect(signInTab).toHaveAttribute('data-state', 'active');
    });

    it('should display trust features section', () => {
        renderAuth();

        expect(screen.getByText(/Why TrustWork\?/i)).toBeInTheDocument();
        expect(screen.getByText(/Verified Identities/i)).toBeInTheDocument();
        expect(screen.getByText(/Secure Payments/i)).toBeInTheDocument();
    });
});
