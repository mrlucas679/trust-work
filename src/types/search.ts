/**
 * Search & Discovery Type Definitions
 * 
 * This file contains all TypeScript interfaces for the search functionality,
 * including filters, saved searches, assignments, and freelancer profiles.
 */

// ============================================================================
// SEARCH FILTERS
// ============================================================================

export interface SearchFilters {
    query?: string;
    location?: string;
    province?: string;
    minBudget?: number;
    maxBudget?: number;
    budgetMin?: number;  // Alias for backward compatibility
    budgetMax?: number;  // Alias for backward compatibility
    skills?: string[];
    industry?: string;
    experienceLevel?: string;
    availability?: string;
    minRating?: number;
    ratingMin?: number;  // Alias for backward compatibility
    postedWithin?: 'day' | 'week' | 'month' | 'all';
}

// ============================================================================
// SAVED SEARCHES
// ============================================================================

export interface SavedSearch {
    id: string;
    user_id: string;
    search_type: 'assignments' | 'freelancers';
    name: string;
    filters: SearchFilters;
    alert_enabled: boolean;
    alert_frequency?: 'immediate' | 'daily' | 'weekly';
    last_alerted_at?: string;
    last_run_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSavedSearchInput {
    search_type: 'assignments' | 'freelancers';
    name: string;
    filters: SearchFilters;
    alert_enabled?: boolean;
    alert_frequency?: 'immediate' | 'daily' | 'weekly';
}

export interface UpdateSavedSearchInput {
    name?: string;
    filters?: SearchFilters;
    alert_enabled?: boolean;
    alert_frequency?: 'immediate' | 'daily' | 'weekly';
}

// ============================================================================
// ASSIGNMENTS
// ============================================================================

export interface Assignment {
    id: string;
    client_id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    location?: string;
    province?: string;
    budget_min?: number;
    budget_max?: number;
    skills_required?: string[];
    industry?: string;
    experience_level?: string;
    created_at: string;
    updated_at: string;
    deadline?: string;
    // Populated fields
    client?: ClientProfile;
    application_count?: number;
}

export interface CreateAssignmentInput {
    title: string;
    description: string;
    location?: string;
    province?: string;
    budget_min?: number;
    budget_max?: number;
    skills_required?: string[];
    industry?: string;
    experience_level?: string;
    deadline?: string;
}

// ============================================================================
// FREELANCER PROFILES
// ============================================================================

export interface FreelancerProfile {
    id: string;
    display_name: string;
    first_name?: string;
    last_name?: string;
    role: string;
    skills: string[];
    location?: string;
    province?: string;
    industry?: string;
    experience_level?: string;
    rating?: number;
    completed_projects?: number;
    avatar_url?: string;
    availability?: string;
    current_job_title?: string;
    desired_role?: string;
    // Additional profile fields
    city?: string;
    years_experience?: string;
    hourly_rate?: number;
    bio?: string;
    languages?: string[];
}

export interface ClientProfile {
    id: string;
    display_name: string;
    business_name?: string;
    business_verified: boolean;
    avatar_url?: string;
    rating?: number;
    total_reviews?: number;
}

// ============================================================================
// SEARCH RESULTS
// ============================================================================

export interface SearchResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface AssignmentSearchResult extends SearchResult<Assignment> {
    filters: SearchFilters;
}

export interface FreelancerSearchResult extends SearchResult<FreelancerProfile> {
    filters: SearchFilters;
}

// ============================================================================
// SEARCH HISTORY
// ============================================================================

export interface SearchHistoryItem {
    id: string;
    search_type: 'assignments' | 'freelancers';
    filters: SearchFilters;
    result_count: number;
    searched_at: string;
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export interface FilterOptions {
    provinces: string[];
    industries: string[];
    experienceLevels: string[];
    skills: string[];
    availabilityOptions: string[];
}

// South African provinces
export const SA_PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
] as const;

export type Province = typeof SA_PROVINCES[number];

// Industry options
export const INDUSTRIES = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Marketing',
    'Design',
    'Construction',
    'Legal',
    'Retail',
    'Manufacturing',
    'Agriculture',
    'Tourism',
    'Media',
    'Telecommunications',
    'Energy',
    'Other'
] as const;

export type Industry = typeof INDUSTRIES[number];

// Experience levels
export const EXPERIENCE_LEVELS = [
    'entry',
    'intermediate',
    'senior',
    'expert'
] as const;

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];

// Availability options
export const AVAILABILITY_OPTIONS = [
    'immediately',
    'within_2_weeks',
    'within_month',
    'not_available'
] as const;

export type Availability = typeof AVAILABILITY_OPTIONS[number];

// ============================================================================
// SEARCH SORTING
// ============================================================================

export type AssignmentSortBy =
    | 'created_at_desc'
    | 'created_at_asc'
    | 'budget_desc'
    | 'budget_asc'
    | 'title_asc'
    | 'title_desc';

export type FreelancerSortBy =
    | 'rating_desc'
    | 'rating_asc'
    | 'experience_desc'
    | 'experience_asc'
    | 'name_asc'
    | 'name_desc';

export interface SearchOptions {
    page?: number;
    pageSize?: number;
    sortBy?: AssignmentSortBy | FreelancerSortBy;
}

// ============================================================================
// COMMON SKILLS (for autocomplete/suggestions)
// ============================================================================

export const COMMON_SKILLS = [
    // Programming Languages
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    'PHP',
    'Ruby',
    'Go',
    'Swift',
    'Kotlin',

    // Frontend
    'React',
    'Vue.js',
    'Angular',
    'HTML',
    'CSS',
    'Tailwind CSS',
    'Next.js',
    'Svelte',

    // Backend
    'Node.js',
    'Django',
    'Flask',
    'Express',
    'FastAPI',
    'Spring Boot',
    'Laravel',
    'Ruby on Rails',

    // Databases
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'SQLite',
    'Firebase',
    'Supabase',

    // Cloud & DevOps
    'AWS',
    'Azure',
    'Google Cloud',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'Git',

    // Design
    'Figma',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Sketch',
    'Adobe XD',
    'InDesign',

    // Marketing
    'SEO',
    'Google Analytics',
    'Content Marketing',
    'Social Media Marketing',
    'Email Marketing',

    // Other
    'Project Management',
    'Agile',
    'Scrum',
    'Data Analysis',
    'Machine Learning',
    'Mobile Development'
] as const;

export type CommonSkill = typeof COMMON_SKILLS[number];

// ============================================================================
// SEARCH HELPER FUNCTIONS
// ============================================================================

/**
 * Check if any filters are active (excluding pagination)
 */
export function hasActiveFilters(filters: SearchFilters): boolean {
    const { query, ...otherFilters } = filters;
    return Object.values(otherFilters).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && value !== '';
    });
}

/**
 * Count active filters (excluding query and pagination)
 */
export function countActiveFilters(filters: SearchFilters): number {
    const { query, ...otherFilters } = filters;
    return Object.values(otherFilters).filter(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && value !== '';
    }).length;
}

/**
 * Build URL search params from filters
 */
export function buildSearchParams(filters: SearchFilters): URLSearchParams {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach(item => params.append(key, String(item)));
            } else {
                params.set(key, String(value));
            }
        }
    });

    return params;
}

/**
 * Parse URL search params into filters
 */
export function parseSearchParams(params: URLSearchParams): SearchFilters {
    const filters: SearchFilters = {};

    // Single value params
    const query = params.get('query');
    if (query) filters.query = query;

    const location = params.get('location');
    if (location) filters.location = location;

    const province = params.get('province');
    if (province) filters.province = province;

    const industry = params.get('industry');
    if (industry) filters.industry = industry;

    const experienceLevel = params.get('experienceLevel');
    if (experienceLevel) filters.experienceLevel = experienceLevel;

    const availability = params.get('availability');
    if (availability) filters.availability = availability;

    const postedWithin = params.get('postedWithin') as SearchFilters['postedWithin'];
    if (postedWithin) filters.postedWithin = postedWithin;

    // Numeric params
    const minBudget = params.get('minBudget');
    if (minBudget) filters.minBudget = parseFloat(minBudget);

    const maxBudget = params.get('maxBudget');
    if (maxBudget) filters.maxBudget = parseFloat(maxBudget);

    const minRating = params.get('minRating');
    if (minRating) filters.minRating = parseFloat(minRating);

    // Array params
    const skills = params.getAll('skills');
    if (skills.length > 0) filters.skills = skills;

    return filters;
}

/**
 * Get human-readable description of filters
 */
export function describeFilters(filters: SearchFilters): string {
    const descriptions: string[] = [];

    if (filters.query) {
        descriptions.push(`"${filters.query}"`);
    }

    if (filters.location) {
        descriptions.push(`in ${filters.location}`);
    }

    if (filters.province) {
        descriptions.push(`in ${filters.province}`);
    }

    if (filters.skills && filters.skills.length > 0) {
        const skillsText = filters.skills.length > 2
            ? `${filters.skills.slice(0, 2).join(', ')} +${filters.skills.length - 2}`
            : filters.skills.join(', ');
        descriptions.push(`skills: ${skillsText}`);
    }

    if (filters.minBudget || filters.budgetMin || filters.maxBudget || filters.budgetMax) {
        const min = filters.minBudget || filters.budgetMin;
        const max = filters.maxBudget || filters.budgetMax;
        if (min && max) {
            descriptions.push(`R${min.toLocaleString()} - R${max.toLocaleString()}`);
        } else if (min) {
            descriptions.push(`from R${min.toLocaleString()}`);
        } else if (max) {
            descriptions.push(`up to R${max.toLocaleString()}`);
        }
    }

    if (filters.industry) {
        descriptions.push(filters.industry);
    }

    if (filters.experienceLevel) {
        descriptions.push(filters.experienceLevel);
    }

    if (filters.availability) {
        descriptions.push(filters.availability.replace(/_/g, ' '));
    }

    if (filters.minRating || filters.ratingMin) {
        const rating = filters.minRating || filters.ratingMin;
        descriptions.push(`${rating}+ stars`);
    }

    if (filters.postedWithin && filters.postedWithin !== 'all') {
        descriptions.push(`posted within ${filters.postedWithin}`);
    }

    return descriptions.length > 0
        ? descriptions.join(' • ')
        : 'All results';
}

/**
 * Validate search filters
 */
export function validateFilters(filters: SearchFilters): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Budget validation
    const minBudget = filters.minBudget || filters.budgetMin;
    const maxBudget = filters.maxBudget || filters.budgetMax;
    if (minBudget && maxBudget && minBudget > maxBudget) {
        errors.push('Minimum budget cannot be greater than maximum budget');
    }
    if (minBudget && minBudget < 0) {
        errors.push('Budget cannot be negative');
    }
    if (maxBudget && maxBudget < 0) {
        errors.push('Budget cannot be negative');
    }

    // Rating validation
    const minRating = filters.minRating || filters.ratingMin;
    if (minRating && (minRating < 0 || minRating > 5)) {
        errors.push('Rating must be between 0 and 5');
    }

    // Province validation
    if (filters.province && !SA_PROVINCES.includes(filters.province as Province)) {
        errors.push('Invalid province');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// ============================================================================
// SEARCH SUGGESTIONS
// ============================================================================

export interface SearchSuggestion {
    text: string;
    type: 'skill' | 'location' | 'industry' | 'recent';
    count?: number;
}

export interface SearchSuggestionsResponse {
    suggestions: SearchSuggestion[];
    query: string;
}
