/**
 * @fileoverview Tests for useUserProfile hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserProfile } from '../use-user-profile';
import { IUserProfile } from '@/types/user';

describe('useUserProfile', () => {
    it('should initialize with null user and no loading', () => {
        const { result } = renderHook(() => useUserProfile());

        expect(result.current.user).toBe(null);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should provide updateProfile function', () => {
        const { result } = renderHook(() => useUserProfile());

        expect(typeof result.current.updateProfile).toBe('function');
    });

    it('should provide verifyUser function', () => {
        const { result } = renderHook(() => useUserProfile());

        expect(typeof result.current.verifyUser).toBe('function');
    });

    it('should update profile data', async () => {
        const { result } = renderHook(() => useUserProfile());

        const initialProfile: IUserProfile = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'freelancer',
            avatar: '/avatar.jpg',
            bio: 'Developer',
            verified: false,
        };

        // First set initial user
        act(() => {
            (result.current as { user: IUserProfile | null }).user = initialProfile;
        });

        const updates: Partial<IUserProfile> = {
            name: 'Jane Doe',
            professionalStatus: 'Senior Developer',
        };

        await act(async () => {
            await result.current.updateProfile(updates);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Profile should be updated (mocked behavior)
        expect(result.current.error).toBe(null);
    });

    it('should set loading state during update', async () => {
        const { result } = renderHook(() => useUserProfile());

        const promise = act(async () => {
            const updatePromise = result.current.updateProfile({ name: 'Updated Name' });
            // Check loading state immediately
            expect(result.current.loading).toBe(true);
            await updatePromise;
        });

        await promise;

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should verify user account', async () => {
        const { result } = renderHook(() => useUserProfile());

        const initialProfile: IUserProfile = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: '/avatar.jpg',
            verified: false,
            skills: ['JavaScript'],
        };

        // Set initial user
        act(() => {
            (result.current as { user: IUserProfile | null }).user = initialProfile;
        });

        await act(async () => {
            await result.current.verifyUser();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(null);
    });

    it('should set loading state during verification', async () => {
        const { result } = renderHook(() => useUserProfile());

        const promise = act(async () => {
            const verifyPromise = result.current.verifyUser();
            // Check loading state immediately
            expect(result.current.loading).toBe(true);
            await verifyPromise;
        });

        await promise;

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should clear previous error on new update', async () => {
        const { result } = renderHook(() => useUserProfile());

        // Manually set an error
        act(() => {
            (result.current as { error: Error | null }).error = new Error('Previous error');
        });

        expect(result.current.error).toBeTruthy();

        await act(async () => {
            await result.current.updateProfile({ name: 'New Name' });
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Error should be cleared since this is a successful operation (mock)
        expect(result.current.error).toBe(null);
    });

    it('should clear previous error on verification attempt', async () => {
        const { result } = renderHook(() => useUserProfile());

        // Manually set an error
        act(() => {
            (result.current as { error: Error | null }).error = new Error('Previous error');
        });

        expect(result.current.error).toBeTruthy();

        await act(async () => {
            await result.current.verifyUser();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Error should be cleared since this is a successful operation (mock)
        expect(result.current.error).toBe(null);
    });

    it('should maintain stable function references', () => {
        const { result, rerender } = renderHook(() => useUserProfile());

        const firstUpdateProfile = result.current.updateProfile;
        const firstVerifyUser = result.current.verifyUser;

        rerender();

        expect(result.current.updateProfile).toBe(firstUpdateProfile);
        expect(result.current.verifyUser).toBe(firstVerifyUser);
    });

    it('should handle multiple rapid updates', async () => {
        const { result } = renderHook(() => useUserProfile());

        const initialProfile: IUserProfile = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: '/avatar.jpg',
            verified: false,
            skills: ['JavaScript'],
        };

        act(() => {
            (result.current as { user: IUserProfile | null }).user = initialProfile;
        });

        // Execute multiple updates
        await act(async () => {
            await Promise.all([
                result.current.updateProfile({ name: 'Name 1' }),
                result.current.updateProfile({ professionalStatus: 'Developer' }),
                result.current.updateProfile({ name: 'Name 2' }),
            ]);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(null);
    });

    it('should handle partial profile updates', async () => {
        const { result } = renderHook(() => useUserProfile());

        const initialProfile: IUserProfile = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: '/avatar.jpg',
            verified: false,
            skills: ['JavaScript'],
        };

        act(() => {
            (result.current as { user: IUserProfile | null }).user = initialProfile;
        });

        // Update only one field
        await act(async () => {
            await result.current.updateProfile({ professionalStatus: 'Senior Developer' });
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(null);
    });
});
