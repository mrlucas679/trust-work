import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import { useSupabase } from '@/providers/SupabaseProvider';

// Mock the Supabase provider
jest.mock('@/providers/SupabaseProvider');

const mockGetSession = jest.fn();
const mockUpdateUser = jest.fn();
const mockSupabase = {
    auth: {
        getSession: mockGetSession,
        updateUser: mockUpdateUser,
    },
};

const mockUseSupabase = useSupabase as jest.MockedFunction<typeof useSupabase>;

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <ResetPassword />
        </BrowserRouter>
    );
};

describe('ResetPassword', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSupabase.mockReturnValue({
            supabase: mockSupabase as any,
            session: null,
            user: null,
            loading: false,
        });
    });

    describe('Token Validation', () => {
        it('shows loading state while validating token', () => {
            mockGetSession.mockImplementation(() => new Promise(() => { })); // Never resolves
            renderComponent();

            expect(screen.getByText(/Validating reset link/i)).toBeInTheDocument();
        });

        it('shows error for invalid token', async () => {
            mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Invalid or expired link/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/expire after 1 hour/i)).toBeInTheDocument();
        });

        it('shows form with valid token', async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { access_token: 'valid-token' } },
                error: null,
            });
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
            });

            expect(screen.getByLabelText(/New password/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Confirm new password/i)).toBeInTheDocument();
        });
    });

    describe('Invalid Token Screen', () => {
        beforeEach(async () => {
            mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Invalid or expired link/i)).toBeInTheDocument();
            });
        });

        it('shows request new link button', () => {
            const newLinkButton = screen.getByRole('link', { name: /Request new reset link/i });
            expect(newLinkButton).toBeInTheDocument();
            expect(newLinkButton).toHaveAttribute('href', '/forgot-password');
        });

        it('shows back to sign in button', () => {
            const backButton = screen.getByRole('link', { name: /Back to sign in/i });
            expect(backButton).toBeInTheDocument();
            expect(backButton).toHaveAttribute('href', '/auth');
        });
    });

    describe('Password Reset Form', () => {
        beforeEach(async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { access_token: 'valid-token' } },
                error: null,
            });
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
            });
        });

        it('renders password fields with show/hide toggles', () => {
            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);

            expect(passwordInput).toHaveAttribute('type', 'password');
            expect(confirmInput).toHaveAttribute('type', 'password');

            // Should have eye icons for toggling
            const toggleButtons = screen.getAllByRole('button', { name: '' });
            expect(toggleButtons.length).toBeGreaterThanOrEqual(2);
        });

        it('toggles password visibility', async () => {
            const passwordInput = screen.getByLabelText(/New password/i) as HTMLInputElement;
            const toggleButtons = screen.getAllByRole('button');
            const passwordToggle = toggleButtons.find(btn =>
                btn.parentElement?.contains(passwordInput)
            );

            expect(passwordInput.type).toBe('password');

            if (passwordToggle) {
                fireEvent.click(passwordToggle);
                await waitFor(() => {
                    expect(passwordInput.type).toBe('text');
                });

                fireEvent.click(passwordToggle);
                await waitFor(() => {
                    expect(passwordInput.type).toBe('password');
                });
            }
        });

        it('disables submit button when fields are empty', () => {
            const submitButton = screen.getByRole('button', { name: /Reset password/i });
            expect(submitButton).toBeDisabled();
        });

        it('enables submit button when fields are filled', () => {
            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);

            fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'NewPass123!' } });

            const submitButton = screen.getByRole('button', { name: /Reset password/i });
            expect(submitButton).not.toBeDisabled();
        });
    });

    describe('Password Validation', () => {
        beforeEach(async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { access_token: 'valid-token' } },
                error: null,
            });
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
            });
        });

        it('shows error for password shorter than 8 characters', async () => {
            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);
            const submitButton = screen.getByRole('button', { name: /Reset password/i });

            fireEvent.change(passwordInput, { target: { value: 'Short1!' } });
            fireEvent.change(confirmInput, { target: { value: 'Short1!' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
            });

            expect(mockUpdateUser).not.toHaveBeenCalled();
        });

        it('shows error for password without number', async () => {
            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);
            const submitButton = screen.getByRole('button', { name: /Reset password/i });

            fireEvent.change(passwordInput, { target: { value: 'NoNumber!!' } });
            fireEvent.change(confirmInput, { target: { value: 'NoNumber!!' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/contain at least one number/i)).toBeInTheDocument();
            });

            expect(mockUpdateUser).not.toHaveBeenCalled();
        });

        it('shows error for password without special character', async () => {
            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);
            const submitButton = screen.getByRole('button', { name: /Reset password/i });

            fireEvent.change(passwordInput, { target: { value: 'NoSpecial123' } });
            fireEvent.change(confirmInput, { target: { value: 'NoSpecial123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/special character/i)).toBeInTheDocument();
            });

            expect(mockUpdateUser).not.toHaveBeenCalled();
        });

        it('shows error when passwords do not match', async () => {
            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);
            const submitButton = screen.getByRole('button', { name: /Reset password/i });

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'DifferentPass123!' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
            });

            expect(mockUpdateUser).not.toHaveBeenCalled();
        });

        it('shows password requirements hint', () => {
            expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
            expect(screen.getByText(/including a number and special character/i)).toBeInTheDocument();
        });
    });

    describe('Password Update', () => {
        beforeEach(async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { access_token: 'valid-token' } },
                error: null,
            });
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
            });
        });

        it('calls updateUser with valid password', async () => {
            mockUpdateUser.mockResolvedValue({ error: null });

            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);
            const submitButton = screen.getByRole('button', { name: /Reset password/i });

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockUpdateUser).toHaveBeenCalledWith({
                    password: 'ValidPass123!'
                });
            });
        });

        it('shows loading state during submission', async () => {
            mockUpdateUser.mockImplementation(() => new Promise(() => { }));

            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);
            const submitButton = screen.getByRole('button', { name: /Reset password/i });

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Resetting password/i)).toBeInTheDocument();
            });

            expect(submitButton).toBeDisabled();
        });

        it('shows success screen after successful reset', async () => {
            mockUpdateUser.mockResolvedValue({ error: null });

            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);
            const submitButton = screen.getByRole('button', { name: /Reset password/i });

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Password reset successful/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
        });

        it('shows error message on API failure', async () => {
            mockUpdateUser.mockResolvedValue({
                error: { message: 'Failed to update password' },
            });

            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);
            const submitButton = screen.getByRole('button', { name: /Reset password/i });

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Failed to update password/i)).toBeInTheDocument();
            });
        });
    });

    describe('Success Screen', () => {
        beforeEach(async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { access_token: 'valid-token' } },
                error: null,
            });
            mockUpdateUser.mockResolvedValue({ error: null });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
            });

            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
            fireEvent.click(screen.getByRole('button', { name: /Reset password/i }));

            await waitFor(() => {
                expect(screen.getByText(/Password reset successful/i)).toBeInTheDocument();
            });
        });

        it('shows success message with confirmation', () => {
            expect(screen.getByText(/Password reset successful/i)).toBeInTheDocument();
            expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
        });

        it('shows redirect notification', () => {
            expect(screen.getByText(/Redirecting to sign in page/i)).toBeInTheDocument();
        });

        it('provides continue to sign in link', () => {
            const continueLink = screen.getByRole('link', { name: /Continue to sign in/i });
            expect(continueLink).toBeInTheDocument();
            expect(continueLink).toHaveAttribute('href', '/auth');
        });
    });

    describe('Accessibility', () => {
        beforeEach(async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { access_token: 'valid-token' } },
                error: null,
            });
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
            });
        });

        it('has proper form labels', () => {
            const passwordLabel = screen.getByText('New password');
            const confirmLabel = screen.getByText('Confirm new password');

            expect(passwordLabel).toBeInTheDocument();
            expect(confirmLabel).toBeInTheDocument();
        });

        it('autofocuses password input', () => {
            const passwordInput = screen.getByLabelText(/New password/i);
            expect(passwordInput).toHaveAttribute('autoFocus');
        });

        it('has proper autocomplete attributes', () => {
            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);

            expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
            expect(confirmInput).toHaveAttribute('autoComplete', 'new-password');
        });
    });

    describe('User Experience', () => {
        beforeEach(async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { access_token: 'valid-token' } },
                error: null,
            });
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
            });
        });

        it('disables inputs during submission', async () => {
            mockUpdateUser.mockImplementation(() => new Promise(() => { }));

            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
            fireEvent.click(screen.getByRole('button', { name: /Reset password/i }));

            await waitFor(() => {
                expect(passwordInput).toBeDisabled();
                expect(confirmInput).toBeDisabled();
            });
        });

        it('shows cancel button', () => {
            const cancelButton = screen.getByRole('link', { name: /Cancel/i });
            expect(cancelButton).toBeInTheDocument();
            expect(cancelButton).toHaveAttribute('href', '/auth');
        });

        it('clears error when user types', async () => {
            mockUpdateUser.mockResolvedValue({
                error: { message: 'Failed to update' },
            });

            const passwordInput = screen.getByLabelText(/New password/i);
            const confirmInput = screen.getByLabelText(/Confirm new password/i);

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
            fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
            fireEvent.click(screen.getByRole('button', { name: /Reset password/i }));

            await waitFor(() => {
                expect(screen.getByText(/Failed to update/i)).toBeInTheDocument();
            });

            // Should clear error when resubmitting
            mockUpdateUser.mockResolvedValue({ error: null });
            fireEvent.click(screen.getByRole('button', { name: /Reset password/i }));

            await waitFor(() => {
                expect(screen.queryByText(/Failed to update/i)).not.toBeInTheDocument();
            });
        });
    });
});
