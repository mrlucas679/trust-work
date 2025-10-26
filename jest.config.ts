export default {
    // Jest configurations
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    },
    // Mock import.meta for Vite compatibility
    globals: {
        'import.meta': {
            env: {
                DEV: false,
                PROD: true,
                MODE: 'test',
                VITE_SUPABASE_URL: 'https://test.supabase.co',
                VITE_SUPABASE_ANON_KEY: 'test-key'
            }
        }
    },
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                module: 'CommonJS',
                moduleResolution: 'node',
                resolveJsonModule: true,
                isolatedModules: true,
                skipLibCheck: true,
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true,
                noUncheckedSideEffectImports: true,
                baseUrl: '.',
                paths: {
                    '@/*': ['./src/*']
                }
            }
        }]
    },
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))'
    ],
    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/main.tsx',
        '!src/vite-env.d.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    // Test pattern
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{ts,tsx}'
    ]
};
