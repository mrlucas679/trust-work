/**
 * Universal Search Type Definitions
 * 
 * Comprehensive type system for secure universal search across all TrustWork content.
 * Includes input validation, sanitization types, and rate limiting structures.
 */

// ============================================================================
// SECURITY TYPES
// ============================================================================

export interface SearchSecurityConfig {
    maxQueryLength: number;
    minQueryLength: number;
    maxResultsPerCategory: number;
    rateLimitWindowMs: number;
    maxRequestsPerWindow: number;
    allowedCharactersRegex: RegExp;
    blacklistedPatterns: string[];
}

export const DEFAULT_SEARCH_SECURITY: SearchSecurityConfig = {
    maxQueryLength: 100,
    minQueryLength: 2,
    maxResultsPerCategory: 10,
    rateLimitWindowMs: 60000, // 1 minute
    maxRequestsPerWindow: 30,
    allowedCharactersRegex: /^[a-zA-Z0-9\s\-.,#+()&]*$/,
    blacklistedPatterns: [
        '<script',
        'javascript:',
        'onerror',
        'onclick',
        'onload',
        'eval(',
        'exec(',
        'DROP TABLE',
        'DELETE FROM',
        'INSERT INTO',
        'UPDATE SET',
        'UNION SELECT',
        '--',
        '/*',
        '*/',
        'xp_',
        'sp_',
    ],
};

export interface RateLimitState {
    requests: number[];
    blocked: boolean;
    unblockAt?: number;
}

// ============================================================================
// SEARCH INPUT & VALIDATION
// ============================================================================

export interface UniversalSearchQuery {
    query: string;
    categories?: SearchCategory[];
    userId?: string;
    filters?: SearchFilters;
    limit?: number;
    offset?: number;
}

export type SearchCategory =
    | 'jobs'
    | 'gigs'
    | 'freelancers'
    | 'companies'
    | 'skills'
    | 'messages'
    | 'faqs'
    | 'all';

export interface SearchFilters {
    location?: string;
    remote?: boolean;
    budgetMin?: number;
    budgetMax?: number;
    rating?: number;
    verified?: boolean;
    dateRange?: {
        from?: string;
        to?: string;
    };
}

export interface ValidationResult {
    isValid: boolean;
    sanitizedQuery: string;
    errors: string[];
    warnings: string[];
}

// ============================================================================
// SEARCH RESULTS
// ============================================================================

export interface UniversalSearchResults {
    query: string;
    totalResults: number;
    searchTime: number; // milliseconds
    jobs: JobSearchResult[];
    gigs: GigSearchResult[];
    freelancers: FreelancerSearchResult[];
    companies: CompanySearchResult[];
    skills: SkillSearchResult[];
    messages: MessageSearchResult[];
    faqs: FAQSearchResult[];
}

export interface JobSearchResult {
    id: string;
    title: string;
    company: string;
    companyId: string;
    location: string;
    remote: boolean;
    salary?: string;
    type: 'full-time' | 'part-time' | 'contract';
    verified: boolean;
    flagged: boolean;
    postedAt: string;
    snippet: string; // Highlighted excerpt
}

export interface GigSearchResult {
    id: string;
    title: string;
    description: string;
    budget: string;
    clientName: string;
    clientId: string;
    duration: string;
    remote: boolean;
    verified: boolean;
    postedAt: string;
    snippet: string;
}

export interface FreelancerSearchResult {
    id: string;
    fullName: string;
    title: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    hourlyRate: number;
    jobsCompleted: number;
    skills: string[];
    verified: boolean;
    province: string;
    remote: boolean;
    availability: string;
    snippet: string;
}

export interface CompanySearchResult {
    id: string;
    name: string;
    industry: string;
    location: string;
    verified: boolean;
    jobCount: number;
    gigCount: number;
    snippet: string;
}

export interface SkillSearchResult {
    id: string;
    name: string;
    category: string;
    freelancerCount: number;
    jobCount: number;
}

export interface MessageSearchResult {
    id: string;
    conversationId: string;
    sender: string;
    senderId: string;
    content: string;
    timestamp: string;
    snippet: string;
}

export interface FAQSearchResult {
    id: string;
    question: string;
    answer: string;
    category: string;
    snippet: string;
}

// ============================================================================
// SEARCH HISTORY & SUGGESTIONS
// ============================================================================

export interface SearchHistoryItem {
    id: string;
    query: string;
    category: SearchCategory;
    timestamp: string;
    userId: string;
    resultCount: number;
}

export interface SearchSuggestion {
    text: string;
    type: 'history' | 'trending' | 'autocomplete';
    count?: number;
}

// ============================================================================
// DATABASE QUERY TYPES (Supabase)
// ============================================================================

export interface SearchQueryParams {
    search_query: string;
    user_id?: string;
    result_limit: number;
    category_filter?: string[];
    location_filter?: string;
    min_budget?: number;
    max_budget?: number;
    verified_only?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SearchAPIResponse {
    success: boolean;
    data?: UniversalSearchResults;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    metadata: {
        requestId: string;
        timestamp: string;
        rateLimitRemaining: number;
    };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Sanitize search query to prevent XSS and SQL injection
 */
export function sanitizeSearchQuery(
    query: string,
    config: SearchSecurityConfig = DEFAULT_SEARCH_SECURITY
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitizedQuery = query.trim();

    // Length validation
    if (sanitizedQuery.length < config.minQueryLength) {
        errors.push(`Query must be at least ${config.minQueryLength} characters`);
        return { isValid: false, sanitizedQuery: '', errors, warnings };
    }

    if (sanitizedQuery.length > config.maxQueryLength) {
        sanitizedQuery = sanitizedQuery.substring(0, config.maxQueryLength);
        warnings.push(`Query truncated to ${config.maxQueryLength} characters`);
    }

    // Check for blacklisted patterns (case-insensitive)
    const lowerQuery = sanitizedQuery.toLowerCase();
    for (const pattern of config.blacklistedPatterns) {
        if (lowerQuery.includes(pattern.toLowerCase())) {
            errors.push('Query contains prohibited patterns');
            return { isValid: false, sanitizedQuery: '', errors, warnings };
        }
    }

    // Character validation
    if (!config.allowedCharactersRegex.test(sanitizedQuery)) {
        errors.push('Query contains invalid characters');
        return { isValid: false, sanitizedQuery: '', errors, warnings };
    }

    // HTML entity encoding for extra safety
    sanitizedQuery = sanitizedQuery
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return {
        isValid: true,
        sanitizedQuery,
        errors,
        warnings,
    };
}

/**
 * Check rate limit for user search requests
 */
export function checkRateLimit(
    userId: string,
    rateLimitMap: Map<string, RateLimitState>,
    config: SearchSecurityConfig = DEFAULT_SEARCH_SECURITY
): { allowed: boolean; remainingRequests: number; resetAt?: number } {
    const now = Date.now();
    const userState = rateLimitMap.get(userId);

    if (!userState) {
        // First request
        rateLimitMap.set(userId, {
            requests: [now],
            blocked: false,
        });
        return {
            allowed: true,
            remainingRequests: config.maxRequestsPerWindow - 1,
        };
    }

    // Check if user is blocked
    if (userState.blocked && userState.unblockAt && now < userState.unblockAt) {
        return {
            allowed: false,
            remainingRequests: 0,
            resetAt: userState.unblockAt,
        };
    }

    // Remove expired requests
    const windowStart = now - config.rateLimitWindowMs;
    userState.requests = userState.requests.filter((time) => time > windowStart);

    // Check rate limit
    if (userState.requests.length >= config.maxRequestsPerWindow) {
        userState.blocked = true;
        userState.unblockAt = now + config.rateLimitWindowMs;
        return {
            allowed: false,
            remainingRequests: 0,
            resetAt: userState.unblockAt,
        };
    }

    // Add current request
    userState.requests.push(now);
    userState.blocked = false;
    userState.unblockAt = undefined;

    return {
        allowed: true,
        remainingRequests: config.maxRequestsPerWindow - userState.requests.length,
    };
}

/**
 * Validate and sanitize search filters
 */
export function sanitizeSearchFilters(filters: SearchFilters): SearchFilters {
    const sanitized: SearchFilters = {};

    // Location - alphanumeric and spaces only
    if (filters.location) {
        sanitized.location = filters.location
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .substring(0, 100);
    }

    // Remote - boolean only
    if (typeof filters.remote === 'boolean') {
        sanitized.remote = filters.remote;
    }

    // Budget - positive numbers only
    if (typeof filters.budgetMin === 'number' && filters.budgetMin >= 0) {
        sanitized.budgetMin = Math.min(filters.budgetMin, 1000000);
    }
    if (typeof filters.budgetMax === 'number' && filters.budgetMax >= 0) {
        sanitized.budgetMax = Math.min(filters.budgetMax, 1000000);
    }

    // Rating - 0-5 only
    if (typeof filters.rating === 'number') {
        sanitized.rating = Math.max(0, Math.min(5, filters.rating));
    }

    // Verified - boolean only
    if (typeof filters.verified === 'boolean') {
        sanitized.verified = filters.verified;
    }

    // Date range - ISO date strings only
    if (filters.dateRange) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (filters.dateRange.from && dateRegex.test(filters.dateRange.from)) {
            sanitized.dateRange = { from: filters.dateRange.from };
        }
        if (filters.dateRange.to && dateRegex.test(filters.dateRange.to)) {
            sanitized.dateRange = { ...sanitized.dateRange, to: filters.dateRange.to };
        }
    }

    return sanitized;
}

/**
 * Generate safe snippet from content with query highlighting
 */
export function generateSafeSnippet(
    content: string,
    query: string,
    maxLength: number = 150
): string {
    // Sanitize content
    const sanitized = content
        .replace(/[<>]/g, '')
        .replace(/\n+/g, ' ')
        .trim();

    if (sanitized.length <= maxLength) {
        return sanitized;
    }

    // Find query position
    const lowerContent = sanitized.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const queryIndex = lowerContent.indexOf(lowerQuery);

    if (queryIndex === -1) {
        // Query not found, return beginning
        return sanitized.substring(0, maxLength) + '...';
    }

    // Extract snippet around query
    const start = Math.max(0, queryIndex - Math.floor(maxLength / 2));
    const end = Math.min(sanitized.length, start + maxLength);
    let snippet = sanitized.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < sanitized.length) snippet = snippet + '...';

    return snippet;
}
