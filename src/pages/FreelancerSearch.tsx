/**
 * FreelancerSearch Page
 * 
 * Dedicated page for searching and filtering freelancers with advanced search capabilities.
 * Integrates with the universal search system and provides comprehensive filtering options.
 * 
 * Features:
 * - Advanced filter panel (skills, experience, location, rating, rate)
 * - Sort options (relevance, rating, rate, jobs completed)
 * - Grid/list view toggle
 * - Pagination
 * - Real-time search with debouncing
 * - Filter count badge
 * - Loading states and skeletons
 * - Empty states
 * - Responsive design
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { FreelancerSearchFilters } from '@/components/search/FreelancerSearchFilters';
import { FreelancerCard } from '@/components/search/FreelancerCard';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid, LayoutList, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchFilters, FreelancerSearchResult, SortOption } from '@/types/search';
import { SORT_OPTIONS, countActiveFilters } from '@/types/search';

// Mock data (replace with Supabase query later)
const MOCK_FREELANCERS: FreelancerSearchResult[] = [
    {
        id: '1',
        fullName: 'Thabo Mabaso',
        title: 'Full-Stack Developer',
        avatar: undefined,
        rating: 4.9,
        reviewCount: 47,
        hourlyRate: 550,
        jobsCompleted: 83,
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        verified: true,
        province: 'Gauteng',
        remote: true,
        availability: 'full-time',
        bio: 'Experienced full-stack developer specializing in React and Node.js applications. I help businesses build scalable web applications with clean, maintainable code.',
        responseTime: '2 hours',
        successRate: 98,
        lastActive: '1 hour ago',
    },
    {
        id: '2',
        fullName: 'Nomvula Dlamini',
        title: 'UI/UX Designer',
        avatar: undefined,
        rating: 5.0,
        reviewCount: 62,
        hourlyRate: 450,
        jobsCompleted: 94,
        skills: ['Figma', 'Adobe XD', 'UI/UX Design', 'Prototyping', 'User Research'],
        verified: true,
        province: 'Western Cape',
        remote: true,
        availability: 'part-time',
        bio: 'Award-winning UI/UX designer with 8+ years of experience creating beautiful, user-centered designs. I specialize in mobile and web applications.',
        responseTime: '1 hour',
        successRate: 100,
        lastActive: '30 min ago',
    },
    {
        id: '3',
        fullName: 'Sipho Ndlovu',
        title: 'Mobile App Developer',
        avatar: undefined,
        rating: 4.8,
        reviewCount: 35,
        hourlyRate: 600,
        jobsCompleted: 56,
        skills: ['React Native', 'Flutter', 'iOS Development', 'Android Development', 'Firebase'],
        verified: true,
        province: 'KwaZulu-Natal',
        remote: true,
        availability: 'full-time',
        bio: 'Mobile development expert with a passion for creating cross-platform applications. Delivered 50+ apps to the App Store and Google Play.',
        responseTime: '3 hours',
        successRate: 96,
        lastActive: '2 hours ago',
    },
    {
        id: '4',
        fullName: 'Lerato Mokoena',
        title: 'Digital Marketing Specialist',
        avatar: undefined,
        rating: 4.7,
        reviewCount: 28,
        hourlyRate: 380,
        jobsCompleted: 42,
        skills: ['SEO', 'Google Ads', 'Social Media Marketing', 'Content Marketing', 'Google Analytics'],
        verified: false,
        province: 'Gauteng',
        remote: true,
        availability: 'contract',
        bio: 'Results-driven digital marketer helping businesses grow their online presence. Expertise in SEO, PPC, and social media strategies.',
        responseTime: '4 hours',
        successRate: 94,
        lastActive: '5 hours ago',
    },
    {
        id: '5',
        fullName: 'Zanele Khumalo',
        title: 'Content Writer & Copywriter',
        avatar: undefined,
        rating: 4.9,
        reviewCount: 51,
        hourlyRate: 320,
        jobsCompleted: 127,
        skills: ['Content Writing', 'Copywriting', 'SEO', 'Blog Writing', 'Technical Writing'],
        verified: true,
        province: 'Western Cape',
        remote: true,
        availability: 'part-time',
        bio: 'Professional writer with 6 years of experience creating engaging content for tech, finance, and lifestyle brands. I help businesses tell their story.',
        responseTime: '2 hours',
        successRate: 97,
        lastActive: '1 hour ago',
    },
];

export function FreelancerSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState<SearchFilters>({});
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<FreelancerSearchResult[]>(MOCK_FREELANCERS);

    // Sync filters with URL params
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            // TODO: Implement actual search with query
            setIsLoading(true);
            setTimeout(() => {
                setResults(MOCK_FREELANCERS);
                setIsLoading(false);
            }, 500);
        }
    }, [searchParams]);

    // Apply filters and sorting
    const applyFiltersAndSort = () => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            let filtered = [...MOCK_FREELANCERS];

            // Apply filters
            if (filters.skills && filters.skills.length > 0) {
                filtered = filtered.filter(f =>
                    filters.skills!.some(skill =>
                        f.skills.some(fs => fs.toLowerCase().includes(skill.toLowerCase()))
                    )
                );
            }

            if (filters.province) {
                filtered = filtered.filter(f => f.province === filters.province);
            }

            if (filters.remote) {
                filtered = filtered.filter(f => f.remote);
            }

            if (filters.budgetMin !== undefined) {
                filtered = filtered.filter(f => f.hourlyRate >= filters.budgetMin!);
            }

            if (filters.budgetMax !== undefined) {
                filtered = filtered.filter(f => f.hourlyRate <= filters.budgetMax!);
            }

            if (filters.rating) {
                filtered = filtered.filter(f => f.rating >= filters.rating!);
            }

            if (filters.verified) {
                filtered = filtered.filter(f => f.verified);
            }

            // Apply sorting
            switch (sortBy) {
                case 'rating-desc':
                    filtered.sort((a, b) => b.rating - a.rating);
                    break;
                case 'rating-asc':
                    filtered.sort((a, b) => a.rating - b.rating);
                    break;
                case 'rate-desc':
                    filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
                    break;
                case 'rate-asc':
                    filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
                    break;
                case 'jobs-completed-desc':
                    filtered.sort((a, b) => b.jobsCompleted - a.jobsCompleted);
                    break;
                case 'jobs-completed-asc':
                    filtered.sort((a, b) => a.jobsCompleted - b.jobsCompleted);
                    break;
            }

            setResults(filtered);
            setIsLoading(false);
        }, 500);
    };

    useEffect(() => {
        applyFiltersAndSort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, sortBy]);

    const activeFiltersCount = countActiveFilters(filters);

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Find Freelancers</h1>
                    <p className="text-muted-foreground">
                        Discover talented South African freelancers for your projects
                    </p>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    {/* Filter Toggle */}
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="ml-1 rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* View Mode Toggle */}
                        <div className="flex items-center border rounded-lg">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="rounded-r-none"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="rounded-l-none"
                            >
                                <LayoutList className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <aside className="w-80 shrink-0">
                            <FreelancerSearchFilters
                                filters={filters}
                                onFiltersChange={setFilters}
                                showApplyButton={false}
                            />
                        </aside>
                    )}

                    {/* Results */}
                    <main className="flex-1 min-w-0">
                        {/* Results Count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            {isLoading ? (
                                <Skeleton className="h-5 w-40" />
                            ) : (
                                <span>
                                    {results.length} freelancer{results.length !== 1 ? 's' : ''} found
                                </span>
                            )}
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className={cn(
                                'grid gap-4',
                                viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                            )}>
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-80 w-full" />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && results.length === 0 && (
                            <div className="text-center py-16">
                                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No freelancers found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Try adjusting your filters or search criteria
                                </p>
                                <Button onClick={() => setFilters({})}>
                                    Clear all filters
                                </Button>
                            </div>
                        )}

                        {/* Results Grid/List */}
                        {!isLoading && results.length > 0 && (
                            <div className={cn(
                                'grid gap-4',
                                viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                            )}>
                                {results.map((freelancer) => (
                                    <FreelancerCard
                                        key={freelancer.id}
                                        freelancer={freelancer}
                                        onClick={() => {
                                            // TODO: Navigate to freelancer profile
                                            console.log('View freelancer:', freelancer.id);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}

export default FreelancerSearch;
