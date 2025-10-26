/**
 * @fileoverview Tests for SocialAuth component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAuth } from '../SocialAuth';
import { useSupabase } from '@/providers/SupabaseProvider';

// Mock the SupabaseProvider
jest.mock('@/providers/SupabaseProvider');

describe('SocialAuth', () => {
    const mockSignInWithOAuth = jest.fn();
    const mockSupabase = {
        auth: {
            signInWithOAuth: mockSignInWithOAuth,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useSupabase as jest.Mock).mockReturnValue({
            supabase: mockSupabase,
            session: null,
            user: null,
            loading: false,
        });
    });

    it('should render social auth buttons', () => {
        render(<SocialAuth />);

        expect(screen.getByText('Or continue with')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument();
    });

    it('should render privacy policy text', () => {
        render(<SocialAuth />);

        expect(screen.getByText(/by continuing, you agree/i)).toBeInTheDocument();
        expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    });

    it('should call signInWithOAuth when Google button is clicked', async () => {
        const user = userEvent.setup();
        mockSignInWithOAuth.mockResolvedValue({ error: null });

        render(<SocialAuth role="job_seeker" />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        await user.click(googleButton);

        await waitFor(() => {
            expect(mockSignInWithOAuth).toHaveBeenCalledWith({
                provider: 'google',
                options: {
                    redirectTo: expect.stringContaining('/auth/callback'),
                    queryParams: {
                        role: 'job_seeker',
                    },
                    scopes: 'email profile',
                },
            });
        });
    });

    it('should call signInWithOAuth when Apple button is clicked', async () => {
        const user = userEvent.setup();
        mockSignInWithOAuth.mockResolvedValue({ error: null });

        render(<SocialAuth role="employer" />);

        const appleButton = screen.getByRole('button', { name: /apple/i });
        await user.click(appleButton);

        await waitFor(() => {
            expect(mockSignInWithOAuth).toHaveBeenCalledWith({
                provider: 'apple',
                options: {
                    redirectTo: expect.stringContaining('/auth/callback'),
                    queryParams: {
                        role: 'employer',
                    },
                    scopes: undefined,
                },
            });
        });
    });

    it('should show loading state on Google button', async () => {
        const user = userEvent.setup();
        mockSignInWithOAuth.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(<SocialAuth />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        await user.click(googleButton);

        await waitFor(() => {
            expect(googleButton).toHaveTextContent('⏳');
        });
    });

    it('should show loading state on Apple button', async () => {
        const user = userEvent.setup();
        mockSignInWithOAuth.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(<SocialAuth />);

        const appleButton = screen.getByRole('button', { name: /apple/i });
        await user.click(appleButton);

        await waitFor(() => {
            expect(appleButton).toHaveTextContent('⏳');
        });
    });

    it('should disable buttons when disabled prop is true', () => {
        render(<SocialAuth disabled />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        const appleButton = screen.getByRole('button', { name: /apple/i });

        expect(googleButton).toBeDisabled();
        expect(appleButton).toBeDisabled();
    });

    it('should disable all buttons when one is loading', async () => {
        const user = userEvent.setup();
        mockSignInWithOAuth.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(<SocialAuth />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        const appleButton = screen.getByRole('button', { name: /apple/i });

        await user.click(googleButton);

        await waitFor(() => {
            expect(googleButton).toBeDisabled();
            expect(appleButton).toBeDisabled();
        });
    });

    it('should call onSuccess callback on successful Google sign-in', async () => {
        const user = userEvent.setup();
        const onSuccess = jest.fn();
        mockSignInWithOAuth.mockResolvedValue({ error: null });

        render(<SocialAuth onSuccess={onSuccess} />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        await user.click(googleButton);

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });
    });

    it('should call onSuccess callback on successful Apple sign-in', async () => {
        const user = userEvent.setup();
        const onSuccess = jest.fn();
        mockSignInWithOAuth.mockResolvedValue({ error: null });

        render(<SocialAuth onSuccess={onSuccess} />);

        const appleButton = screen.getByRole('button', { name: /apple/i });
        await user.click(appleButton);

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });
    });

    it('should call onError callback on Google sign-in error', async () => {
        const user = userEvent.setup();
        const onError = jest.fn();
        mockSignInWithOAuth.mockResolvedValue({ error: new Error('OAuth error') });

        render(<SocialAuth onError={onError} />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        await user.click(googleButton);

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(expect.stringContaining('OAuth error'));
        });
    });

    it('should call onError callback on Apple sign-in error', async () => {
        const user = userEvent.setup();
        const onError = jest.fn();
        mockSignInWithOAuth.mockResolvedValue({ error: new Error('Apple OAuth failed') });

        render(<SocialAuth onError={onError} />);

        const appleButton = screen.getByRole('button', { name: /apple/i });
        await user.click(appleButton);

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(expect.stringContaining('Apple OAuth failed'));
        });
    });

    it('should use default role if not provided', async () => {
        const user = userEvent.setup();
        mockSignInWithOAuth.mockResolvedValue({ error: null });

        render(<SocialAuth />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        await user.click(googleButton);

        await waitFor(() => {
            expect(mockSignInWithOAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    options: expect.objectContaining({
                        queryParams: {
                            role: 'job_seeker',
                        },
                    }),
                })
            );
        });
    });

    it('should render Google icon', () => {
        render(<SocialAuth />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        const svgIcon = googleButton.querySelector('svg');

        expect(svgIcon).toBeInTheDocument();
    });

    it('should render Apple icon', () => {
        render(<SocialAuth />);

        const appleButton = screen.getByRole('button', { name: /apple/i });
        const appleIcon = appleButton.querySelector('svg');

        expect(appleIcon).toBeInTheDocument();
    });

    it('should have outline variant buttons', () => {
        render(<SocialAuth />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        const appleButton = screen.getByRole('button', { name: /apple/i });

        expect(googleButton).toHaveClass('border');
        expect(appleButton).toHaveClass('border');
    });

    it('should render in grid layout', () => {
        const { container } = render(<SocialAuth />);

        const gridContainer = container.querySelector('.grid');
        expect(gridContainer).toBeInTheDocument();
        expect(gridContainer).toHaveClass('grid-cols-2', 'gap-3');
    });

    it('should handle network errors gracefully', async () => {
        const user = userEvent.setup();
        const onError = jest.fn();
        mockSignInWithOAuth.mockRejectedValue(new Error('Network error'));

        render(<SocialAuth onError={onError} />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        await user.click(googleButton);

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith('Network error');
        });
    });

    it('should handle non-Error exceptions', async () => {
        const user = userEvent.setup();
        const onError = jest.fn();
        mockSignInWithOAuth.mockRejectedValue('String error');

        render(<SocialAuth onError={onError} />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        await user.click(googleButton);

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(expect.stringContaining('Failed to sign in'));
        });
    });

    it('should not call callbacks if not provided', async () => {
        const user = userEvent.setup();
        mockSignInWithOAuth.mockResolvedValue({ error: null });

        render(<SocialAuth />);

        const googleButton = screen.getByRole('button', { name: /google/i });

        // Should not throw error when callbacks are not provided
        await expect(user.click(googleButton)).resolves.not.toThrow();
    });
});
