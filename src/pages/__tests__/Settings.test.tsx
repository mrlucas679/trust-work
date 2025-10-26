/**
 * @fileoverview Tests for Settings page
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../Settings';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';

// Mock supabase client
jest.mock('@supabase/supabase-js');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Settings Page', () => {
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
            updateUser: jest.fn(),
            signOut: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({
                        data: {
                            display_name: 'Test User',
                            email_notifications: true,
                            push_notifications: false,
                        },
                        error: null,
                    }),
                })),
            })),
            update: jest.fn(() => ({
                eq: jest.fn().mockResolvedValue({ error: null }),
            })),
        })),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        });
    });

    const renderSettings = () => {
        return render(
            <BrowserRouter>
                <SupabaseProvider>
                    <Settings />
                </SupabaseProvider>
            </BrowserRouter>
        );
    };

    it('should render settings page header', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Settings/i)).toBeInTheDocument();
        });
    });

    it('should render account settings section', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Account/i)).toBeInTheDocument();
        });
    });

    it('should render notification settings section', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
        });
    });

    it('should render privacy settings section', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
        });
    });

    it('should render security settings section', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Security/i)).toBeInTheDocument();
        });
    });

    it('should toggle email notifications', async () => {
        renderSettings();

        await waitFor(() => {
            const emailToggle = screen.getByRole('switch', { name: /Email notifications/i });
            expect(emailToggle).toBeInTheDocument();

            fireEvent.click(emailToggle);
        });

        // Should call update
        await waitFor(() => {
            expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        });
    });

    it('should toggle push notifications', async () => {
        renderSettings();

        await waitFor(() => {
            const pushToggle = screen.getByRole('switch', { name: /Push notifications/i });
            expect(pushToggle).toBeInTheDocument();

            fireEvent.click(pushToggle);
        });
    });

    it('should display change password button', async () => {
        renderSettings();

        await waitFor(() => {
            const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
            expect(changePasswordButton).toBeInTheDocument();
        });
    });

    it('should display delete account button', async () => {
        renderSettings();

        await waitFor(() => {
            const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
            expect(deleteButton).toBeInTheDocument();
        });
    });

    it('should display sign out button', async () => {
        renderSettings();

        await waitFor(() => {
            const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
            expect(signOutButton).toBeInTheDocument();
        });
    });

    it('should sign out when sign out button is clicked', async () => {
        mockSupabase.auth.signOut.mockResolvedValue({ error: null });

        renderSettings();

        await waitFor(async () => {
            const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
            fireEvent.click(signOutButton);

            await waitFor(() => {
                expect(mockSupabase.auth.signOut).toHaveBeenCalled();
            });
        });
    });

    it('should display current email', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
        });
    });

    it('should display theme settings', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Theme|Appearance/i)).toBeInTheDocument();
        });
    });

    it('should display language settings', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Language/i)).toBeInTheDocument();
        });
    });

    it('should handle settings save with success message', async () => {
        renderSettings();

        await waitFor(async () => {
            const saveButton = screen.getByRole('button', { name: /Save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText(/Settings saved/i)).toBeInTheDocument();
            });
        });
    });

    it('should handle settings save with error message', async () => {
        mockSupabase.from.mockReturnValue({
            update: jest.fn(() => ({
                eq: jest.fn().mockResolvedValue({ error: { message: 'Failed to save' } }),
            })),
        });

        renderSettings();

        await waitFor(async () => {
            const saveButton = screen.getByRole('button', { name: /Save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText(/Failed to save/i)).toBeInTheDocument();
            });
        });
    });

    it('should display two-factor authentication option', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Two-Factor Authentication|2FA/i)).toBeInTheDocument();
        });
    });

    it('should display connected accounts section', async () => {
        renderSettings();

        await waitFor(() => {
            expect(screen.getByText(/Connected Accounts|Integrations/i)).toBeInTheDocument();
        });
    });
});
