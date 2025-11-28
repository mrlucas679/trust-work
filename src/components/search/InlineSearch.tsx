import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchResultsDropdown } from '@/components/search/SearchResultsDropdown';
import { cn } from '@/lib/utils';
import { performUniversalSearch } from '@/lib/universalSearch';
import { useSupabase } from '@/providers/SupabaseProvider';

export interface SearchResults {
    gigs: Array<{
        id: string;
        title: string;
        description: string;
        budget: string;
        clientName: string;
        postedDate: string;
    }>;
    companies: Array<{
        id: string;
        name: string;
        industry: string;
        location: string;
        gigCount: number;
    }>;
    workers: Array<{
        id: string;
        name: string;
        title: string;
        rating: number;
        skills: string[];
        certifications: string[];
    }>;
    skills: Array<{
        id: string;
        name: string;
        workerCount: number;
        gigCount: number;
    }>;
}

export const InlineSearch = () => {
    const { user } = useSupabase();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(query, 400);

    const performSearch = useCallback(async (searchQuery: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await performUniversalSearch({
                query: searchQuery,
                categories: ['all'],
                userId: user?.id || 'anonymous',
                limit: 10,
            });

            if (!response.success || !response.data) {
                setError(response.error?.message || 'Search failed');
                setResults(null);
                setIsOpen(false);
                return;
            }

            const transformedResults: SearchResults = {
                gigs: response.data.gigs.map((gig) => ({
                    id: gig.id,
                    title: gig.title,
                    description: gig.snippet,
                    budget: gig.budget,
                    clientName: gig.clientName,
                    postedDate: gig.postedAt,
                })),
                companies: response.data.companies.map((company) => ({
                    id: company.id,
                    name: company.name,
                    industry: company.industry,
                    location: company.location,
                    gigCount: company.jobCount + company.gigCount,
                })),
                workers: response.data.freelancers.map((freelancer) => ({
                    id: freelancer.id,
                    name: freelancer.fullName,
                    title: freelancer.title,
                    rating: freelancer.rating,
                    skills: freelancer.skills,
                    certifications: [],
                })),
                skills: response.data.skills.map((skill) => ({
                    id: skill.id,
                    name: skill.name,
                    workerCount: skill.freelancerCount,
                    gigCount: skill.jobCount,
                })),
            };

            setResults(transformedResults);
            setIsOpen(true);
        } catch (error) {
            console.error('Search error:', error);
            setError('An unexpected error occurred. Please try again.');
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            performSearch(debouncedQuery);
        } else {
            setResults(null);
            setIsOpen(false);
        }
    }, [debouncedQuery, performSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClear = () => {
        setQuery('');
        setResults(null);
        setIsOpen(false);
        setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative">
                {isLoading ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none animate-spin" />
                ) : (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                )}
                <input
                    type="search"
                    placeholder="Search jobs, gigs, freelancers, messages..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && results && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "w-full h-9 pl-9 pr-9 rounded-md border border-input",
                        "bg-background text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
                        "transition-all duration-200",
                        "placeholder:text-muted-foreground",
                        error && "border-destructive"
                    )}
                    autoComplete="off"
                    aria-label="Universal search across TrustWork"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'search-error' : undefined}
                />
                {query && !isLoading && (
                    <button
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-accent transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                )}
            </div>

            {error && (
                <div
                    id="search-error"
                    className="absolute top-full left-0 right-0 mt-1 p-2 text-xs text-destructive bg-destructive/10 rounded-md border border-destructive/20"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {isOpen && !error && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[100]">
                    <SearchResultsDropdown
                        results={results}
                        isLoading={isLoading}
                        query={query}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};
