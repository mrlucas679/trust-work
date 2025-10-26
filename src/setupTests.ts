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

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getSession: jest.fn(() => Promise.resolve({
                data: {
                    session: {
                        user: {
                            id: 'test-user-id',
                            email: 'test@example.com',
                            user_metadata: {
                                full_name: 'Test User',
                                role: 'jobseeker'
                            }
                        },
                        access_token: 'test-access-token',
                        refresh_token: 'test-refresh-token'
                    }
                },
                error: null
            })),
            onAuthStateChange: jest.fn(() => ({
                data: {
                    subscription: {
                        unsubscribe: jest.fn()
                    }
                }
            })),
            signInWithPassword: jest.fn(() => Promise.resolve({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    },
                    session: {
                        access_token: 'test-token'
                    }
                },
                error: null
            })),
            signUp: jest.fn(() => Promise.resolve({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    },
                    session: {
                        access_token: 'test-token'
                    }
                },
                error: null
            })),
            signOut: jest.fn(() => Promise.resolve({ error: null })),
            getUser: jest.fn(() => Promise.resolve({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            }))
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
            then: jest.fn((resolve) => resolve({ data: [], error: null }))
        })),
        channel: jest.fn(() => ({
            on: jest.fn().mockReturnThis(),
            subscribe: jest.fn(() => Promise.resolve({ status: 'subscribed' })),
            unsubscribe: jest.fn(() => Promise.resolve({ status: 'unsubscribed' }))
        }))
    }))
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
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
