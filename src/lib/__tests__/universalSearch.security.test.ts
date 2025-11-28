/**
 * Universal Search Security Tests
 * 
 * Tests for:
 * - Input validation and sanitization
 * - XSS prevention
 * - SQL injection prevention
 * - Rate limiting
 * - RLS enforcement
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
    sanitizeSearchQuery,
    checkRateLimit,
    sanitizeSearchFilters,
    generateSafeSnippet,
    DEFAULT_SEARCH_SECURITY,
    RateLimitState,
} from '@/types/universal-search';

describe('Universal Search Security', () => {
    describe('sanitizeSearchQuery', () => {
        it('should accept valid search queries', () => {
            const queries = [
                'developer',
                'front-end developer',
                'C# .NET',
                'Node.js & React',
                'UI/UX Designer (Remote)',
            ];

            queries.forEach((query) => {
                const result = sanitizeSearchQuery(query);
                expect(result.isValid).toBe(true);
                expect(result.sanitizedQuery).toBeTruthy();
                expect(result.errors).toHaveLength(0);
            });
        });

        it('should reject queries that are too short', () => {
            const result = sanitizeSearchQuery('a');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('at least 2 characters')
            );
        });

        it('should reject queries that are too long', () => {
            const longQuery = 'a'.repeat(101);
            const result = sanitizeSearchQuery(longQuery);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('maximum 100 characters')
            );
        });

        it('should reject queries with invalid characters', () => {
            const maliciousQueries = [
                '<script>alert("xss")</script>',
                'SELECT * FROM users',
                'admin\' OR 1=1--',
                '"><img src=x onerror=alert(1)>',
            ];

            maliciousQueries.forEach((query) => {
                const result = sanitizeSearchQuery(query);
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            });
        });

        it('should detect SQL injection patterns', () => {
            const sqlInjectionQueries = [
                'DROP TABLE users',
                'UNION SELECT password FROM users',
                'admin\' OR 1=1--',
                '; DELETE FROM jobs',
                'test\' UNION ALL SELECT NULL--',
            ];

            sqlInjectionQueries.forEach((query) => {
                const result = sanitizeSearchQuery(query);
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain(
                    expect.stringContaining('potentially malicious')
                );
            });
        });

        it('should sanitize HTML entities for XSS prevention', () => {
            const result = sanitizeSearchQuery('test <tag> & "quote"');
            expect(result.sanitizedQuery).not.toContain('<');
            expect(result.sanitizedQuery).not.toContain('>');
            expect(result.sanitizedQuery).not.toContain('&');
            // Should contain encoded entities
            expect(result.sanitizedQuery).toContain('&lt;');
            expect(result.sanitizedQuery).toContain('&gt;');
        });

        it('should trim whitespace', () => {
            const result = sanitizeSearchQuery('  developer  ');
            expect(result.isValid).toBe(true);
            expect(result.sanitizedQuery).toBe('developer');
        });

        it('should handle empty or null queries', () => {
            const emptyResult = sanitizeSearchQuery('');
            expect(emptyResult.isValid).toBe(false);

            const nullResult = sanitizeSearchQuery(null as unknown as string);
            expect(nullResult.isValid).toBe(false);
        });
    });

    describe('checkRateLimit', () => {
        let rateLimitMap: Map<string, RateLimitState>;

        beforeEach(() => {
            rateLimitMap = new Map();
        });

        it('should allow requests within rate limit', () => {
            const userId = 'test-user-1';

            // First request should be allowed
            const result1 = checkRateLimit(userId, rateLimitMap);
            expect(result1.allowed).toBe(true);
            expect(result1.remainingRequests).toBe(
                DEFAULT_SEARCH_SECURITY.maxRequestsPerWindow - 1
            );

            // Second request should be allowed
            const result2 = checkRateLimit(userId, rateLimitMap);
            expect(result2.allowed).toBe(true);
            expect(result2.remainingRequests).toBe(
                DEFAULT_SEARCH_SECURITY.maxRequestsPerWindow - 2
            );
        });

        it('should block requests exceeding rate limit', () => {
            const userId = 'test-user-2';

            // Make maximum allowed requests
            for (let i = 0; i < DEFAULT_SEARCH_SECURITY.maxRequestsPerWindow; i++) {
                const result = checkRateLimit(userId, rateLimitMap);
                expect(result.allowed).toBe(true);
            }

            // Next request should be blocked
            const blockedResult = checkRateLimit(userId, rateLimitMap);
            expect(blockedResult.allowed).toBe(false);
            expect(blockedResult.remainingRequests).toBe(0);
            expect(blockedResult.resetAt).toBeDefined();
        });

        it('should reset rate limit after window expires', () => {
            const userId = 'test-user-3';

            // Create rate limit state with expired window
            const expiredTimestamp = Date.now() - DEFAULT_SEARCH_SECURITY.rateLimitWindowMs - 1000;
            const expiredState: RateLimitState = {
                requests: Array(DEFAULT_SEARCH_SECURITY.maxRequestsPerWindow).fill(expiredTimestamp),
                blocked: true,
                unblockAt: expiredTimestamp + DEFAULT_SEARCH_SECURITY.rateLimitWindowMs,
            };
            rateLimitMap.set(userId, expiredState);

            // Request should be allowed after reset
            const result = checkRateLimit(userId, rateLimitMap);
            expect(result.allowed).toBe(true);
            expect(result.remainingRequests).toBe(
                DEFAULT_SEARCH_SECURITY.maxRequestsPerWindow - 1
            );
        });

        it('should track different users independently', () => {
            const user1 = 'test-user-4';
            const user2 = 'test-user-5';

            // User 1 makes requests
            for (let i = 0; i < 10; i++) {
                checkRateLimit(user1, rateLimitMap);
            }

            // User 2 should have full quota
            const result = checkRateLimit(user2, rateLimitMap);
            expect(result.allowed).toBe(true);
            expect(result.remainingRequests).toBe(
                DEFAULT_SEARCH_SECURITY.maxRequestsPerWindow - 1
            );
        });
    });

    describe('sanitizeSearchFilters', () => {
        it('should accept valid filter values', () => {
            const filters = {
                location: 'Johannesburg',
                remote: true,
                budgetMin: 30000,
                budgetMax: 80000,
                rating: 4.5,
                verified: true,
                dateRange: {
                    from: '2025-01-01',
                    to: '2025-12-31',
                },
            };

            const sanitized = sanitizeSearchFilters(filters);
            expect(sanitized.location).toBe('Johannesburg');
            expect(sanitized.remote).toBe(true);
            expect(sanitized.budgetMin).toBe(30000);
            expect(sanitized.budgetMax).toBe(80000);
        });

        it('should reject budget values exceeding maximum', () => {
            const filters = {
                budgetMin: 2000000, // Exceeds 1M limit
            };

            const sanitized = sanitizeSearchFilters(filters);
            expect(sanitized.budgetMin).toBeUndefined();
        });

        it('should reject invalid rating values', () => {
            const invalidRatings = [-1, 6, 10];

            invalidRatings.forEach((rating) => {
                const sanitized = sanitizeSearchFilters({ rating });
                expect(sanitized.rating).toBeUndefined();
            });
        });

        it('should reject invalid date formats', () => {
            const invalidDates = [
                'not-a-date',
                '2025/01/01', // Wrong format
                '01-01-2025', // Wrong format
            ];

            invalidDates.forEach((date) => {
                const sanitized = sanitizeSearchFilters({
                    dateRange: { from: date }
                });
                expect(sanitized.dateRange?.from).toBeUndefined();
            });
        });

        it('should accept valid ISO date formats', () => {
            const validDates = [
                '2025-01-01',
                '2025-12-31T23:59:59Z',
                '2025-06-15T12:00:00.000Z',
            ];

            validDates.forEach((date) => {
                const sanitized = sanitizeSearchFilters({
                    dateRange: { from: date }
                });
                expect(sanitized.dateRange?.from).toBe(date);
            });
        });

        it('should handle missing or undefined filters', () => {
            const sanitized = sanitizeSearchFilters({});
            expect(Object.keys(sanitized)).toHaveLength(0);
        });
    });

    describe('generateSafeSnippet', () => {
        it('should generate snippet with query highlighted', () => {
            const text = 'We are looking for a senior React developer with 5+ years experience.';
            const query = 'React';
            const snippet = generateSafeSnippet(text, query, 50);

            expect(snippet).toContain('React');
            expect(snippet.length).toBeLessThanOrEqual(50);
        });

        it('should strip HTML tags from text', () => {
            const text = 'Looking for <b>developer</b> with <script>alert(1)</script> skills';
            const query = 'developer';
            const snippet = generateSafeSnippet(text, query, 100);

            expect(snippet).not.toContain('<b>');
            expect(snippet).not.toContain('</b>');
            expect(snippet).not.toContain('<script>');
            expect(snippet).toContain('developer');
        });

        it('should encode HTML entities for XSS prevention', () => {
            const text = 'Test <tag> & "quotes" \' apostrophe';
            const query = 'test';
            const snippet = generateSafeSnippet(text, query, 100);

            expect(snippet).not.toContain('<tag>');
            expect(snippet).toContain('&lt;');
            expect(snippet).toContain('&gt;');
            expect(snippet).toContain('&amp;');
        });

        it('should truncate long text to max length', () => {
            const longText = 'a'.repeat(500);
            const snippet = generateSafeSnippet(longText, 'a', 50);

            expect(snippet.length).toBeLessThanOrEqual(50);
        });

        it('should handle text without query match', () => {
            const text = 'This is a test description';
            const query = 'nonexistent';
            const snippet = generateSafeSnippet(text, query, 50);

            expect(snippet).toBeTruthy();
            expect(snippet.length).toBeGreaterThan(0);
        });

        it('should handle empty or null text', () => {
            const snippet1 = generateSafeSnippet('', 'query', 50);
            expect(snippet1).toBe('');

            const snippet2 = generateSafeSnippet(null as unknown as string, 'query', 50);
            expect(snippet2).toBe('');
        });

        it('should center snippet around query match', () => {
            const text =
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. We need a React developer. Sed do eiusmod tempor incididunt.';
            const query = 'React';
            const snippet = generateSafeSnippet(text, query, 60);

            expect(snippet).toContain('React');
            // Should have text before and after the match
            expect(snippet.indexOf('React')).toBeGreaterThan(0);
            expect(snippet.indexOf('React')).toBeLessThan(snippet.length - 5);
        });
    });

    describe('Security Constants', () => {
        it('should have reasonable security limits', () => {
            expect(DEFAULT_SEARCH_SECURITY.maxQueryLength).toBe(100);
            expect(DEFAULT_SEARCH_SECURITY.minQueryLength).toBe(2);
            expect(DEFAULT_SEARCH_SECURITY.maxRequestsPerWindow).toBe(30);
            expect(DEFAULT_SEARCH_SECURITY.rateLimitWindowMs).toBe(60000); // 1 minute
            expect(DEFAULT_SEARCH_SECURITY.maxResultsPerCategory).toBe(10);
        });

        it('should have comprehensive blacklist patterns', () => {
            const blacklist = DEFAULT_SEARCH_SECURITY.blacklistedPatterns;

            expect(blacklist).toContain('DROP TABLE');
            expect(blacklist).toContain('DELETE FROM');
            expect(blacklist).toContain('UNION SELECT');
            expect(blacklist).toContain('INSERT INTO');
            expect(blacklist).toContain('UPDATE SET');
            expect(blacklist).toContain('EXEC');
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete search workflow securely', () => {
            const rateLimitMap = new Map();
            const userId = 'integration-test-user';

            // Step 1: Validate query
            const validation = sanitizeSearchQuery('React developer');
            expect(validation.isValid).toBe(true);

            // Step 2: Check rate limit
            const rateLimit = checkRateLimit(userId, rateLimitMap);
            expect(rateLimit.allowed).toBe(true);

            // Step 3: Sanitize filters
            const filters = sanitizeSearchFilters({
                location: 'Cape Town',
                budgetMin: 40000,
                remote: true,
            });
            expect(filters.location).toBe('Cape Town');

            // Step 4: Generate safe snippet
            const snippet = generateSafeSnippet(
                'Senior React developer needed for fintech startup',
                validation.sanitizedQuery,
                100
            );
            expect(snippet).toContain('React');
        });

        it('should block malicious search workflow', () => {
            const rateLimitMap = new Map();
            const userId = 'malicious-user';

            // Step 1: Attempt SQL injection
            const validation = sanitizeSearchQuery(
                'developer\' UNION SELECT password FROM users--'
            );
            expect(validation.isValid).toBe(false);

            // Even if we bypass validation, rate limiting should block abuse
            // Make too many requests
            for (let i = 0; i < DEFAULT_SEARCH_SECURITY.maxRequestsPerWindow + 5; i++) {
                checkRateLimit(userId, rateLimitMap);
            }

            const blocked = checkRateLimit(userId, rateLimitMap);
            expect(blocked.allowed).toBe(false);
        });
    });
});
