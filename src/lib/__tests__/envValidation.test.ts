import { validateEnvironment, getEnvironment, isEnvironmentConfigured } from '../envValidation';

describe('envValidation', () => {
    const originalEnv = import.meta.env;

    beforeEach(() => {
        // Reset environment
        import.meta.env = { ...originalEnv };
    });

    afterEach(() => {
        import.meta.env = originalEnv;
    });

    describe('validateEnvironment', () => {
        it('should pass validation with valid environment variables', () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

            expect(() => validateEnvironment()).not.toThrow();
            const config = validateEnvironment();

            expect(config.SUPABASE_URL).toBe('https://example.supabase.co');
            expect(config.SUPABASE_ANON_KEY).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');
        });

        it('should throw error when VITE_SUPABASE_URL is missing', () => {
            import.meta.env.VITE_SUPABASE_URL = '';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

            expect(() => validateEnvironment()).toThrow('VITE_SUPABASE_URL is not defined');
        });

        it('should throw error when VITE_SUPABASE_ANON_KEY is missing', () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = '';

            expect(() => validateEnvironment()).toThrow('VITE_SUPABASE_ANON_KEY is not defined');
        });

        it('should throw error when URL is invalid', () => {
            import.meta.env.VITE_SUPABASE_URL = 'not-a-valid-url';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

            expect(() => validateEnvironment()).toThrow('VITE_SUPABASE_URL is not a valid URL');
        });

        it('should throw error when anon key is too short', () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'short';

            expect(() => validateEnvironment()).toThrow('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
        });

        it('should provide helpful error message with multiple issues', () => {
            import.meta.env.VITE_SUPABASE_URL = '';
            import.meta.env.VITE_SUPABASE_ANON_KEY = '';

            try {
                validateEnvironment();
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                const errorMessage = (error as Error).message;
                expect(errorMessage).toContain('Environment Configuration Error');
                expect(errorMessage).toContain('VITE_SUPABASE_URL is not defined');
                expect(errorMessage).toContain('VITE_SUPABASE_ANON_KEY is not defined');
                expect(errorMessage).toContain('To fix this:');
                expect(errorMessage).toContain('Create a .env file');
            }
        });
    });

    describe('getEnvironment', () => {
        it('should return environment config with valid values', () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';

            const config = getEnvironment();

            expect(config.SUPABASE_URL).toBe('https://example.supabase.co');
            expect(config.SUPABASE_ANON_KEY).toBe('test-key');
        });

        it('should return empty strings when env vars are missing', () => {
            import.meta.env.VITE_SUPABASE_URL = undefined;
            import.meta.env.VITE_SUPABASE_ANON_KEY = undefined;

            const config = getEnvironment();

            expect(config.SUPABASE_URL).toBe('');
            expect(config.SUPABASE_ANON_KEY).toBe('');
        });
    });

    describe('isEnvironmentConfigured', () => {
        it('should return true when environment is valid', () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

            expect(isEnvironmentConfigured()).toBe(true);
        });

        it('should return false when environment is invalid', () => {
            import.meta.env.VITE_SUPABASE_URL = '';
            import.meta.env.VITE_SUPABASE_ANON_KEY = '';

            expect(isEnvironmentConfigured()).toBe(false);
        });

        it('should return false when URL is invalid', () => {
            import.meta.env.VITE_SUPABASE_URL = 'invalid-url';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

            expect(isEnvironmentConfigured()).toBe(false);
        });
    });
});
