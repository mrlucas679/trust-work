import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchResultsDropdown } from '@/components/search/SearchResultsDropdown';
import { cn } from '@/lib/utils';

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

export const UniversalSearch = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounce the search query
    const debouncedQuery = useDebounce(query, 300);

    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            performSearch(debouncedQuery);
        } else {
            setResults(null);
            setIsOpen(false);
        }
    }, [debouncedQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async (searchQuery: string) => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&limit=15`);
            // const data = await response.json();

            // Mock data for now
            const mockResults: SearchResults = {
                gigs: searchQuery.toLowerCase().includes('market') ? [
                    {
                        id: 'gig123',
                        title: 'Social Media Marketing Campaign',
                        description: 'Looking for experienced marketer...',
                        budget: '$500-$1000',
                        clientName: 'ABC Company',
                        postedDate: '2025-10-20'
                    },
                    {
                        id: 'gig124',
                        title: 'Email Marketing Setup',
                        description: 'Need help setting up email campaigns...',
                        budget: '$300-$600',
                        clientName: 'XYZ Corp',
                        postedDate: '2025-10-22'
                    }
                ] : [],
                companies: searchQuery.toLowerCase().includes('market') ? [
                    {
                        id: 'company456',
                        name: 'Marketing Pro Agency',
                        industry: 'Marketing',
                        location: 'Lagos, Nigeria',
                        gigCount: 24
                    }
                ] : [],
                workers: searchQuery.toLowerCase().includes('market') ? [
                    {
                        id: 'user789',
                        name: 'John Doe',
                        title: 'Digital Marketing Expert',
                        rating: 4.8,
                        skills: ['SEO', 'Social Media', 'Content Marketing'],
                        certifications: ['Digital Marketing - Developer']
                    }
                ] : [],
                skills: searchQuery.toLowerCase().includes('market') ? [
                    {
                        id: 'skill_dm',
                        name: 'Digital Marketing',
                        workerCount: 142,
                        gigCount: 58
                    }
                ] : []
            };

            setResults(mockResults);
            setIsOpen(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults(null);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div
            className="w-full border-b bg-background/50 backdrop-blur-sm"
            ref={searchRef}
        >
            <div className="container mx-auto px-4 py-3 max-w-4xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search for gigs, jobs, companies, or people..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length >= 2 && results && setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "w-full h-12 pl-10 pr-10 rounded-lg border border-input",
                            "bg-background text-sm",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            "transition-all duration-200",
                            "placeholder:text-muted-foreground"
                        )}
                        autoComplete="off"
                        aria-label="Universal search"
                    />
                    {query && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-accent transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>

                {isOpen && (
                    <SearchResultsDropdown
                        results={results}
                        isLoading={isLoading}
                        query={query}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};
