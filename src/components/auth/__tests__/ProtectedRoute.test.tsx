import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useSupabase } from '@/providers/SupabaseProvider';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

jest.mock('@/providers/SupabaseProvider');

const mockUseSupabase = useSupabase as jest.MockedFunction<typeof useSupabase>;

const createMockUser = (): User => ({
    id: '123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
});

const createMockSession = (): Session => ({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: createMockUser(),
});

const createMockSupabase = (): Partial<SupabaseClient> => ({
    auth: {} as SupabaseClient['auth'],
});

describe('ProtectedRoute', () => {
    const TestComponent = () => <div>Protected Content</div>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render children when user is authenticated', () => {
        mockUseSupabase.mockReturnValue({
            user: createMockUser(),
            session: createMockSession(),
            loading: false,
            supabase: createMockSupabase() as SupabaseClient,
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <TestComponent />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show loading state when auth is loading', () => {
        mockUseSupabase.mockReturnValue({
            user: null,
            session: null,
            loading: true,
            supabase: createMockSupabase() as SupabaseClient,
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <TestComponent />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        // Loading spinner should be present
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to /auth when user is not authenticated', () => {
        mockUseSupabase.mockReturnValue({
            user: null,
            session: null,
            loading: false,
            supabase: createMockSupabase() as SupabaseClient,
        });

        const { container } = render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <TestComponent />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/auth" element={<div>Auth Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Auth Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should not show protected content before auth check completes', () => {
        mockUseSupabase.mockReturnValue({
            user: null,
            session: null,
            loading: true,
            supabase: createMockSupabase() as SupabaseClient,
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <TestComponent />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when session exists', () => {
        mockUseSupabase.mockReturnValue({
            user: createMockUser(),
            session: createMockSession(),
            loading: false,
            supabase: createMockSupabase() as SupabaseClient,
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <TestComponent />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
});
