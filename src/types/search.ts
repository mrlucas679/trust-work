/**
 * Search & Discovery Type Definitions
 * 
 * Comprehensive type definitions for freelancer search, filtering, and sorting.
 * Includes South African provinces, experience levels, common skills, and filter utilities.
 */

// ============================================================================
// SEARCH FILTERS
// ============================================================================

export interface SearchFilters {
    skills?: string[];
    experienceLevel?: 'entry' | 'intermediate' | 'expert';
    province?: string;
    remote?: boolean;
    budgetMin?: number;
    budgetMax?: number;
    rating?: number;
    verified?: boolean;
    availability?: 'full-time' | 'part-time' | 'contract';
}

// ============================================================================
// SEARCH RESULTS
// ============================================================================

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
    bio: string;
    responseTime?: string;
    successRate?: number;
    lastActive?: string;
}

// Pagination
export interface PaginationState {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// South African Provinces
export const SA_PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape',
] as const;

// Experience Levels
export const EXPERIENCE_LEVELS = [
    { value: 'entry' as const, label: 'Entry Level (0-2 years)' },
    { value: 'intermediate' as const, label: 'Intermediate (3-5 years)' },
    { value: 'expert' as const, label: 'Expert (5+ years)' },
] as const;

// Common South African Freelance Skills
export const COMMON_SKILLS = [
    // Tech & Development
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
    'Java', 'C#', '.NET', 'PHP', 'SQL', 'MongoDB',
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'DevOps', 'AWS', 'Azure', 'Docker', 'Kubernetes',

    // Design
    'UI/UX Design', 'Graphic Design', 'Adobe Photoshop', 'Adobe Illustrator',
    'Figma', 'Sketch', 'Logo Design', 'Branding', 'Web Design',

    // Marketing & Content
    'Digital Marketing', 'SEO', 'Content Writing', 'Copywriting',
    'Social Media Marketing', 'Email Marketing', 'Google Ads',
    'Facebook Ads', 'Video Editing', 'Photography',

    // Business
    'Business Consulting', 'Project Management', 'Financial Analysis',
    'Accounting', 'Legal Consulting', 'HR Consulting',
    'Virtual Assistant', 'Data Entry', 'Translation',

    // Creative
    'Video Production', 'Animation', 'Voice Over', 'Music Production',
    '3D Modeling', 'Illustration',
] as const;

// ============================================================================
// SORT OPTIONS
// ============================================================================

export type SortOption =
    | 'relevance'
    | 'rating-desc'
    | 'rating-asc'
    | 'rate-desc'
    | 'rate-asc'
    | 'jobs-completed-desc'
    | 'jobs-completed-asc';

export interface SortConfig {
    value: SortOption;
    label: string;
    description?: string;
}

export const SORT_OPTIONS: SortConfig[] = [
    {
        value: 'relevance',
        label: 'Most Relevant',
        description: 'Best match for your search'
    },
    {
        value: 'rating-desc',
        label: 'Highest Rated',
        description: 'Top rated freelancers first'
    },
    {
        value: 'rating-asc',
        label: 'Lowest Rated',
        description: 'Lowest rated freelancers first'
    },
    {
        value: 'rate-desc',
        label: 'Highest Rate',
        description: 'Most expensive first'
    },
    {
        value: 'rate-asc',
        label: 'Lowest Rate',
        description: 'Most affordable first'
    },
    {
        value: 'jobs-completed-desc',
        label: 'Most Jobs Completed',
        description: 'Most experienced freelancers first'
    },
    {
        value: 'jobs-completed-asc',
        label: 'Fewest Jobs Completed',
        description: 'Newest freelancers first'
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Count the number of active filters
 */
export function countActiveFilters(filters: SearchFilters): number {
    let count = 0;

    if (filters.skills && filters.skills.length > 0) count++;
    if (filters.experienceLevel) count++;
    if (filters.province) count++;
    if (filters.remote) count++;
    if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) count++;
    if (filters.rating) count++;
    if (filters.verified) count++;
    if (filters.availability) count++;

    return count;
}

/**
 * Sort search results
 */
export function sortResults(
    results: FreelancerSearchResult[],
    sortBy: SortOption
): FreelancerSearchResult[] {
    const sorted = [...results];

    switch (sortBy) {
        case 'relevance':
            return sorted;
        case 'rating-desc':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'rating-asc':
            return sorted.sort((a, b) => a.rating - b.rating);
        case 'rate-desc':
            return sorted.sort((a, b) => b.hourlyRate - a.hourlyRate);
        case 'rate-asc':
            return sorted.sort((a, b) => a.hourlyRate - b.hourlyRate);
        case 'jobs-completed-desc':
            return sorted.sort((a, b) => b.jobsCompleted - a.jobsCompleted);
        case 'jobs-completed-asc':
            return sorted.sort((a, b) => a.jobsCompleted - b.jobsCompleted);
        default:
            return sorted;
    }
}
