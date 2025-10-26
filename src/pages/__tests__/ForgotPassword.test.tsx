import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';
import { useSupabase } from '@/providers/SupabaseProvider';

// Mock the Supabase provider
jest.mock('@/providers/SupabaseProvider');

const mockResetPasswordForEmail = jest.fn();
const mockSupabase = {
    auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
    },
};

const mockUseSupabase = useSupabase as jest.MockedFunction<typeof useSupabase>;

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <ForgotPassword />
        </BrowserRouter>
    );
};

describe('ForgotPassword', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSupabase.mockReturnValue({
            supabase: mockSupabase as any,
            session: null,
            user: null,
            loading: false,
        });
    });

    describe('Rendering', () => {
        it('renders the forgot password form', () => {
            renderComponent();

            expect(screen.getByText(/Reset your password/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Send reset link/i })).toBeInTheDocument();
        });

        it('renders back to sign in link', () => {
            renderComponent();

            const backLink = screen.getByRole('link', { name: /Back to sign in/i });
            expect(backLink).toBeInTheDocument();
            expect(backLink).toHaveAttribute('href', '/auth');
        });

        it('renders the email input with correct attributes', () => {
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
            expect(emailInput).toHaveAttribute('type', 'email');
            expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
            expect(emailInput).toHaveAttribute('autoComplete', 'email');
            expect(emailInput).toHaveAttribute('required');
        });
    });

    describe('Form Validation', () => {
        it('disables submit button when email is empty', () => {
            renderComponent();

            const submitButton = screen.getByRole('button', { name: /Send reset link/i });
            expect(submitButton).toBeDisabled();
        });

        it('enables submit button when email is entered', () => {
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            const submitButton = screen.getByRole('button', { name: /Send reset link/i });
            expect(submitButton).not.toBeDisabled();
        });

        it('shows error for invalid email format', async () => {
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            const submitButton = screen.getByRole('button', { name: /Send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
            });

            expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
        });
    });

    describe('Password Reset Flow', () => {
        it('calls resetPasswordForEmail with correct parameters', async () => {
            mockResetPasswordForEmail.mockResolvedValue({ error: null });
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            const submitButton = screen.getByRole('button', { name: /Send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
                    'test@example.com',
                    expect.objectContaining({
                        redirectTo: expect.stringContaining('/reset-password'),
                    })
                );
            });
        });

        it('shows loading state during submission', async () => {
            mockResetPasswordForEmail.mockImplementation(() => new Promise(() => { })); // Never resolves
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            const submitButton = screen.getByRole('button', { name: /Send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Sending reset link/i)).toBeInTheDocument();
            });

            expect(submitButton).toBeDisabled();
        });

        it('shows success screen after successful submission', async () => {
            mockResetPasswordForEmail.mockResolvedValue({ error: null });
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            const submitButton = screen.getByRole('button', { name: /Send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
            expect(screen.getByText(/Click the link in the email/i)).toBeInTheDocument();
        });

        it('shows generic error message on API error (security)', async () => {
            mockResetPasswordForEmail.mockResolvedValue({
                error: { message: 'User not found' } as any,
            });
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            const submitButton = screen.getByRole('button', { name: /Send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Unable to process request/i)).toBeInTheDocument();
            });

            // Should NOT reveal if email exists
            expect(screen.queryByText(/User not found/i)).not.toBeInTheDocument();
        });

        it('shows generic error on exception', async () => {
            mockResetPasswordForEmail.mockRejectedValue(new Error('Network error'));
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            const submitButton = screen.getByRole('button', { name: /Send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
            });
        });
    });

    describe('Success Screen', () => {
        beforeEach(async () => {
            mockResetPasswordForEmail.mockResolvedValue({ error: null });
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /Send reset link/i }));

            await waitFor(() => {
                expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
            });
        });

        it('displays helpful instructions', () => {
            expect(screen.getByText(/Click the link in the email/i)).toBeInTheDocument();
            expect(screen.getByText(/expire in 1 hour/i)).toBeInTheDocument();
            expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument();
        });

        it('shows back to sign in button', () => {
            const backButton = screen.getByRole('link', { name: /Back to sign in/i });
            expect(backButton).toBeInTheDocument();
            expect(backButton).toHaveAttribute('href', '/auth');
        });

        it('allows sending to different email', () => {
            const differentEmailButton = screen.getByRole('button', { name: /Send to a different email/i });
            expect(differentEmailButton).toBeInTheDocument();

            fireEvent.click(differentEmailButton);

            // Should return to form
            expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
            expect(screen.queryByText(/Check your email/i)).not.toBeInTheDocument();
        });

        it('clears email when returning to form', () => {
            const differentEmailButton = screen.getByRole('button', { name: /Send to a different email/i });
            fireEvent.click(differentEmailButton);

            const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
            expect(emailInput.value).toBe('');
        });
    });

    describe('Accessibility', () => {
        it('has proper form structure', () => {
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            expect(emailInput).toHaveAttribute('id', 'email');

            const label = screen.getByText('Email address');
            expect(label).toHaveAttribute('for', 'email');
        });

        it('autofocuses email input on mount', () => {
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            expect(emailInput).toHaveAttribute('autoFocus');
        });

        it('shows appropriate ARIA attributes during loading', async () => {
            mockResetPasswordForEmail.mockImplementation(() => new Promise(() => { }));
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /Send reset link/i }));

            await waitFor(() => {
                const submitButton = screen.getByRole('button', { name: /Sending reset link/i });
                expect(submitButton).toBeDisabled();
            });
        });
    });

    describe('User Experience', () => {
        it('displays email icon in submit button', () => {
            renderComponent();

            const submitButton = screen.getByRole('button', { name: /Send reset link/i });
            expect(submitButton.querySelector('svg')).toBeInTheDocument();
        });

        it('disables input during submission', async () => {
            mockResetPasswordForEmail.mockImplementation(() => new Promise(() => { }));
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /Send reset link/i }));

            await waitFor(() => {
                expect(emailInput).toBeDisabled();
            });
        });

        it('clears error when resubmitting', async () => {
            mockResetPasswordForEmail.mockResolvedValueOnce({
                error: { message: 'Rate limit exceeded' } as any,
            });
            renderComponent();

            const emailInput = screen.getByLabelText(/Email address/i);
            const submitButton = screen.getByRole('button', { name: /Send reset link/i });

            // First submission with error
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Unable to process request/i)).toBeInTheDocument();
            });

            // Second submission should clear error
            mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.queryByText(/Unable to process request/i)).not.toBeInTheDocument();
            });
        });
    });
});
