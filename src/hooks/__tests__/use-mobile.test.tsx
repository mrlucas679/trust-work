/**
 * @fileoverview Tests for useIsMobile hook
 */

import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

const MOBILE_BREAKPOINT = 768;

describe('useIsMobile', () => {
    let matchMediaMock: jest.Mock;
    let listeners: Array<() => void> = [];
    let originalMatchMedia: typeof window.matchMedia;

    beforeAll(() => {
        originalMatchMedia = window.matchMedia;
    });

    beforeEach(() => {
        listeners = [];

        matchMediaMock = jest.fn((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: jest.fn((event: string, handler: () => void) => {
                if (event === 'change') {
                    listeners.push(handler);
                }
            }),
            removeEventListener: jest.fn((event: string, handler: () => void) => {
                if (event === 'change') {
                    listeners = listeners.filter(l => l !== handler);
                }
            }),
            dispatchEvent: jest.fn(),
            addListener: jest.fn(),
            removeListener: jest.fn(),
        }));

        // Delete the property first if it exists
        delete (window as { matchMedia?: typeof window.matchMedia }).matchMedia;

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: matchMediaMock,
        });
    });

    afterEach(() => {
        listeners = [];
    });

    afterAll(() => {
        delete (window as { matchMedia?: typeof window.matchMedia }).matchMedia;
        if (originalMatchMedia) {
            window.matchMedia = originalMatchMedia;
        }
    });

    it('should return false for desktop width', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('should return true for mobile width', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('should return true for width exactly at breakpoint minus 1', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: MOBILE_BREAKPOINT - 1,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('should return false for width at breakpoint', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: MOBILE_BREAKPOINT,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('should update when window is resized to mobile', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);

        // Simulate resize to mobile
        act(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });
            listeners.forEach(listener => listener());
        });

        expect(result.current).toBe(true);
    });

    it('should update when window is resized to desktop', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);

        // Simulate resize to desktop
        act(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1024,
            });
            listeners.forEach(listener => listener());
        });

        expect(result.current).toBe(false);
    });

    it('should register matchMedia listener with correct query', () => {
        renderHook(() => useIsMobile());

        expect(matchMediaMock).toHaveBeenCalledWith(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    });

    it('should cleanup listener on unmount', () => {
        const { unmount } = renderHook(() => useIsMobile());

        const initialListenerCount = listeners.length;
        unmount();

        // Listener should be removed
        expect(listeners.length).toBeLessThan(initialListenerCount);
    });

    it('should handle multiple rapid resize events', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());

        // Simulate multiple rapid resizes
        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 375 });
            listeners.forEach(listener => listener());

            Object.defineProperty(window, 'innerWidth', { value: 800 });
            listeners.forEach(listener => listener());

            Object.defineProperty(window, 'innerWidth', { value: 500 });
            listeners.forEach(listener => listener());
        });

        // Should reflect the final state
        expect(result.current).toBe(true);
    });

    it('should return boolean (not undefined) after initialization', () => {
        const { result } = renderHook(() => useIsMobile());

        // Should be a boolean, not undefined
        expect(typeof result.current).toBe('boolean');
    });
});
