/**
 * InlineSearch - CONSOLIDATED UNIVERSAL SEARCH
 * 
 * Single, unified search component for the entire application.
 * Consolidates functionality from previous InlineSearch, SearchBar, and search-bar components.
 * 
 * Features:
 * - Debounced search input (300ms)
 * - Autocomplete suggestions dropdown
 * - Recent searches history
 * - Advanced filter support with badge count
 * - Keyboard shortcuts (Cmd/Ctrl + K to focus)
 * - Active filter preview badges
 * - Click outside to close
 * - Responsive sizing (sm, md, lg)
 * - Search across assignments, freelancers, companies, and skills
 * 
 * @example
 * ```tsx
 * // Basic usage (uncontrolled)
 * <InlineSearch placeholder="Search..." />
 * 
 * // With filters (controlled)
 * <InlineSearch 
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   showFilters={true}
 * />
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Loader2, History, Briefcase, Users, Building2, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import type { SearchFilters } from '@/types/search';
import { countActiveFilters } from '@/types/search';

// ============================================================================
// TYPES
// ============================================================================

export type SearchCategory = 'all' | 'assignments' | 'freelancers' | 'companies' | 'skills';

export interface SearchResult {
    id: string;
    type: 'assignment' | 'freelancer' | 'company' | 'skill';
    title: string;
    subtitle?: string;
    description?: string;
    avatar?: string;
    metadata?: {
        budget?: string;
        location?: string;
        rating?: number;
        skills?: string[];
        count?: number;
    };
}

export interface InlineSearchProps {
    /** Current search query (controlled) */
    value?: string;
    /** Callback when search changes */
    onChange?: (value: string) => void;
    /** Search category filter */
    category?: SearchCategory;
    /** Current active filters */
    filters?: SearchFilters;
    /** Callback when filters change */
    onFiltersChange?: (filters: SearchFilters) => void;
    /** Callback when search is executed */
    onSearch?: (query: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Show filter button */
    showFilters?: boolean;
    /** Show suggestions dropdown */
    showSuggestions?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Additional class names */
    className?: string;
    /** Auto-focus on mount */
    autoFocus?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const InlineSearch = ({
    value: controlledValue,
    onChange: controlledOnChange,
    category = 'all',
    filters,
    onFiltersChange,
    onSearch,
    placeholder = 'Search assignments, freelancers, companies...',
    showFilters = true,
    showSuggestions = true,
    size = 'md',
    className = '',
    autoFocus = false,
}: InlineSearchProps = {}) => {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Local state (used if not controlled)
    const [localValue, setLocalValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Use controlled or uncontrolled value
    const query = controlledValue !== undefined ? controlledValue : localValue;
    const setQuery = controlledOnChange || setLocalValue;

    // Debounce search query
    const debouncedQuery = useDebounce(query, 300);

    // Filter count
    const filterCount = filters ? countActiveFilters(filters) : 0;

    // ========================================================================
    // EFFECTS
    // ========================================================================

    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored).slice(0, 5));
            } catch (e) {
                console.error('Failed to parse recent searches:', e);
            }
        }
    }, []);

    // Auto-focus if requested
    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);

    // Perform search when debounced query changes
    useEffect(() => {
        const performSearchLocal = async () => {
            if (!showSuggestions) return;

            setIsLoading(true);
            try {
                // TODO: Replace with actual Supabase API call
                // Example implementation:
                // const { data, error } = await supabase
                //   .rpc('universal_search', { 
                //     search_query: debouncedQuery,
                //     search_category: category,
                //     filters: filters
                //   });
                // if (error) throw error;
                // setResults(data);

                // Mock data for now - matches existing format for compatibility
                const mockResults: SearchResult[] = [
                    {
                        id: '1',
                        type: 'assignment',
                        title: 'Full Stack Developer Needed',
                        subtitle: 'ABC Company',
                        description: 'Looking for experienced developer...',
                        metadata: {
                            budget: 'R15,000 - R25,000',
                            location: 'Johannesburg',
                            skills: ['React', 'Node.js'],
                        },
                    },
                    {
                        id: '2',
                        type: 'freelancer',
                        title: 'John Doe',
                        subtitle: 'Senior Full Stack Developer',
                        description: '5+ years experience in web development',
                        metadata: {
                            location: 'Cape Town',
                            rating: 4.9,
                            skills: ['React', 'TypeScript', 'Node.js'],
                        },
                    },
                ];

                setResults(mockResults);
                setShowDropdown(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (debouncedQuery.length >= 2) {
            performSearchLocal();
        } else {
            setResults([]);
            setShowDropdown(false);
        }
    }, [debouncedQuery, category, filters, showSuggestions]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleSearch = useCallback(() => {
        if (!query.trim()) return;

        // Save to recent searches
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));

        // Call optional callback
        onSearch?.(query);

        // Navigate to search results page
        const params = new URLSearchParams({
            q: query,
            category: category,
        });

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(key, String(v)));
                    } else {
                        params.set(key, String(value));
                    }
                }
            });
        }

        navigate(`/search?${params.toString()}`);
        setShowDropdown(false);
        inputRef.current?.blur();
    }, [query, category, filters, recentSearches, navigate, onSearch]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSearch();
            } else if (e.key === 'Escape') {
                setShowDropdown(false);
                inputRef.current?.blur();
            }
        },
        [handleSearch]
    );

    const handleClear = useCallback(() => {
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    }, [setQuery]);

    const handleResultClick = (result: SearchResult) => {
        setShowDropdown(false);

        // Navigate based on result type
        switch (result.type) {
            case 'assignment':
                navigate(`/assignments/${result.id}`);
                break;
            case 'freelancer':
                navigate(`/profile/${result.id}`);
                break;
            case 'company':
                navigate(`/company/${result.id}`);
                break;
            case 'skill':
                navigate(`/search?q=${encodeURIComponent(result.title)}&category=assignments`);
                break;
        }
    };

    const handleRecentSearchClick = (search: string) => {
        setQuery(search);
        setShowDropdown(false);
        // Trigger search immediately
        setTimeout(() => handleSearch(), 100);
    };

    const getResultIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'assignment':
                return Briefcase;
            case 'freelancer':
                return Users;
            case 'company':
                return Building2;
            case 'skill':
                return Tag;
        }
    };

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const sizeClasses = {
        sm: 'h-8 text-sm',
        md: 'h-10',
        lg: 'h-12 text-lg',
    };

    const renderSearchResults = () => {
        if (!showDropdown || (!results.length && !recentSearches.length)) {
            return null;
        }

        return (
            <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 z-[100] bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto"
            >
                {isLoading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
                    </div>
                ) : (
                    <>
                        {/* Recent Searches */}
                        {query.length < 2 && recentSearches.length > 0 && (
                            <div className="p-2 border-b">
                                <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                                    <History className="h-3 w-3" />
                                    Recent Searches
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleRecentSearchClick(search)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
                                    >
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        {search}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Search Results */}
                        {results.length > 0 && (
                            <div className="p-2">
                                {results.map((result) => {
                                    const Icon = getResultIcon(result.type);
                                    return (
                                        <button
                                            key={result.id}
                                            onClick={() => handleResultClick(result)}
                                            className="w-full px-3 py-3 text-left hover:bg-accent rounded-md transition-colors flex gap-3"
                                        >
                                            <div className="flex-shrink-0">
                                                {result.avatar ? (
                                                    <img
                                                        src={result.avatar}
                                                        alt=""
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium text-sm">{result.title}</p>
                                                        {result.subtitle && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {result.subtitle}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs capitalize">
                                                        {result.type}
                                                    </Badge>
                                                </div>
                                                {result.description && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                        {result.description}
                                                    </p>
                                                )}
                                                {result.metadata && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {result.metadata.budget && (
                                                            <span className="text-xs text-muted-foreground">
                                                                💰 {result.metadata.budget}
                                                            </span>
                                                        )}
                                                        {result.metadata.location && (
                                                            <span className="text-xs text-muted-foreground">
                                                                📍 {result.metadata.location}
                                                            </span>
                                                        )}
                                                        {result.metadata.rating && (
                                                            <span className="text-xs text-muted-foreground">
                                                                ⭐ {result.metadata.rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* No Results */}
                        {query.length >= 2 && results.length === 0 && !isLoading && (
                            <div className="p-8 text-center">
                                <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    No results found for "{query}"
                                </p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="mt-2"
                                    onClick={handleSearch}
                                >
                                    Search all results →
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className={cn('relative w-full', className)}>
            <div
                className={cn(
                    'flex items-center gap-2 rounded-lg border bg-background px-3 transition-all',
                    isFocused && 'ring-2 ring-ring ring-offset-2',
                    sizeClasses[size]
                )}
            >
                {/* Search Icon / Loading */}
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
                ) : (
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}

                {/* Input */}
                <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setIsFocused(true);
                        if (query.length >= 2 || recentSearches.length > 0) {
                            setShowDropdown(true);
                        }
                    }}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Universal search"
                />

                {/* Keyboard Shortcut Hint */}
                {!query && !isFocused && (
                    <kbd className="hidden pointer-events-none sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 flex-shrink-0">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                )}

                {/* Clear Button */}
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}

                {/* Filter Button */}
                {showFilters && onFiltersChange && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 relative flex-shrink-0"
                                aria-label={`Filters${filterCount > 0 ? ` (${filterCount} active)` : ''}`}
                            >
                                <Filter className="h-4 w-4" />
                                {filterCount > 0 && (
                                    <Badge
                                        variant="default"
                                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                                    >
                                        {filterCount}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-64">
                            <p className="text-sm text-muted-foreground">
                                Advanced filters coming soon...
                            </p>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {/* Search Results Dropdown */}
            {showSuggestions && renderSearchResults()}

            {/* Active Filters Preview */}
            {filterCount > 0 && filters && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {filters.location && (
                        <Badge variant="secondary" className="text-xs">
                            📍 {filters.location}
                        </Badge>
                    )}
                    {filters.skills && filters.skills.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            🛠️ {filters.skills.length} skill{filters.skills.length > 1 ? 's' : ''}
                        </Badge>
                    )}
                    {(filters.budgetMin || filters.budgetMax) && (
                        <Badge variant="secondary" className="text-xs">
                            💰 Budget filter
                        </Badge>
                    )}
                    {filters.industry && (
                        <Badge variant="secondary" className="text-xs">
                            🏢 {filters.industry}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};
