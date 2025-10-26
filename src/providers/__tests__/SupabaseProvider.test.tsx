import { renderHook, waitFor } from '@testing-library/react';
import { SupabaseProvider, useSupabase } from '../SupabaseProvider';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(),
}));

jest.mock('@/lib/supabaseClient', () => ({
    __esModule: true,
    default: {
        auth: {
            getSession: jest.fn(),
            onAuthStateChange: jest.fn(),
        },
    },
}));

describe('SupabaseProvider', () => {
    const mockSupabaseClient = {
        auth: {
            getSession: jest.fn(),
            onAuthStateChange: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    });

    it('should provide supabase client', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
            data: { session: null },
            error: null,
        });

        mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SupabaseProvider>{children}</SupabaseProvider>
        );

        const { result } = renderHook(() => useSupabase(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.supabase).toBeDefined();
        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
    });

    it('should update session and user on auth state change', async () => {
        const mockSession = {
            user: { id: '123', email: 'test@example.com' },
            access_token: 'token',
        };

        mockSupabaseClient.auth.getSession.mockResolvedValue({
            data: { session: mockSession },
            error: null,
        });

        const authStateCallback = jest.fn();
        mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
            authStateCallback.mockImplementation(callback);
            return {
                data: { subscription: { unsubscribe: jest.fn() } },
            };
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SupabaseProvider>{children}</SupabaseProvider>
        );

        const { result } = renderHook(() => useSupabase(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.session).toEqual(mockSession);
        expect(result.current.user).toEqual(mockSession.user);
    });

    it('should throw error when used outside provider', () => {
        expect(() => {
            renderHook(() => useSupabase());
        }).toThrow('useSupabase must be used within SupabaseProvider');
    });

    it('should handle session fetch errors gracefully', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Network error'));

        mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SupabaseProvider>{children}</SupabaseProvider>
        );

        const { result } = renderHook(() => useSupabase(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
    });

    it('should cleanup subscription on unmount', async () => {
        const mockUnsubscribe = jest.fn();
        mockSupabaseClient.auth.getSession.mockResolvedValue({
            data: { session: null },
            error: null,
        });

        mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SupabaseProvider>{children}</SupabaseProvider>
        );

        const { unmount } = renderHook(() => useSupabase(), { wrapper });

        await waitFor(() => {
            expect(mockUnsubscribe).not.toHaveBeenCalled();
        });

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
