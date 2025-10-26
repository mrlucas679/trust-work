/**
 * @fileoverview Tests for Profile page
 */

import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../Profile';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';

// Mock supabase client
jest.mock('@supabase/supabase-js');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
}));

describe('Profile Page', () => {
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({ data: null, error: null }),
                })),
            })),
        })),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
        });
    });

    const renderProfile = () => {
        return render(
            <BrowserRouter>
                <SupabaseProvider>
                    <Profile />
                </SupabaseProvider>
            </BrowserRouter>
        );
    };

    it('should render profile header', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
        });
    });

    it('should display user avatar', async () => {
        renderProfile();

        await waitFor(() => {
            const avatar = screen.getByRole('img', { hidden: true });
            expect(avatar).toBeInTheDocument();
        });
    });

    it('should display verification badge', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByTestId(/verification-badge/i)).toBeInTheDocument();
        });
    });

    it('should display user rating', async () => {
        renderProfile();

        await waitFor(() => {
            const stars = screen.getAllByTestId(/star/i);
            expect(stars.length).toBeGreaterThan(0);
        });
    });

    it('should display completed jobs count', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByText(/Completed/i)).toBeInTheDocument();
        });
    });

    it('should display skills section', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByText(/Skills/i)).toBeInTheDocument();
        });
    });

    it('should display certifications section', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByText(/Certifications/i)).toBeInTheDocument();
        });
    });

    it('should display work history section', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByText(/Work History/i)).toBeInTheDocument();
        });
    });

    it('should display reviews section', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByText(/Reviews/i)).toBeInTheDocument();
        });
    });

    it('should show edit button for own profile', async () => {
        renderProfile();

        await waitFor(() => {
            const editButton = screen.getByRole('button', { name: /Edit Profile/i });
            expect(editButton).toBeInTheDocument();
        });
    });

    it('should display contact information', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByTestId(/mail|email/i)).toBeInTheDocument();
        });
    });

    it('should display location information', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByTestId(/map-pin|location/i)).toBeInTheDocument();
        });
    });

    it('should show risk indicator', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByText(/Trust Score/i)).toBeInTheDocument();
        });
    });

    it('should load CV URL from supabase', async () => {
        const mockCvUrl = 'https://example.supabase.co/storage/v1/object/public/cvs/test.pdf';
        mockSupabase.from.mockReturnValue({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({
                        data: { cv_url: mockCvUrl },
                        error: null,
                    }),
                })),
            })),
        });

        renderProfile();

        await waitFor(() => {
            expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        });
    });

    it('should handle missing CV URL gracefully', async () => {
        mockSupabase.from.mockReturnValue({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({
                        data: { cv_url: null },
                        error: null,
                    }),
                })),
            })),
        });

        renderProfile();

        // Should not crash
        await waitFor(() => {
            expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
        });
    });

    it('should display hourly rate', async () => {
        renderProfile();

        await waitFor(() => {
            expect(screen.getByTestId(/dollar-sign|rate/i)).toBeInTheDocument();
        });
    });
});
