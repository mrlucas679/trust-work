// Add custom jest matchers for testing-library
import '@testing-library/jest-dom';

// Mock import.meta for Vite env variables
(globalThis as unknown as { import: { meta: { env: Record<string, unknown> } } }).import = {
    meta: {
        env: {
            DEV: false,
            PROD: true,
            MODE: 'test',
            VITE_SUPABASE_URL: 'https://test-project.supabase.co',
            VITE_SUPABASE_ANON_KEY: 'test-anon-key-1234567890abcdefghijklmnopqrstuvwxyz',
        }
    }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver with required shape
class MockIntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = [0]

    constructor(
        private _callback: IntersectionObserverCallback,
        _options?: IntersectionObserverInit
    ) { }

    observe = (_target: Element) => void 0
    unobserve = (_target: Element) => void 0
    disconnect = () => void 0
    takeRecords = (): IntersectionObserverEntry[] => []
}

window.IntersectionObserver = MockIntersectionObserver as unknown as typeof window.IntersectionObserver
