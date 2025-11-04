/**
 * FindFreelancers Page
 * 
 * Page for employers to search and discover freelancers
 */

import { useState } from 'react';
import { Search, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilters as SearchFiltersComponent } from '@/components/search/SearchFilters';
import { FreelancerSearchResults } from '@/components/search/FreelancerSearchResults';
import { SavedSearchesList } from '@/components/search/SavedSearchesList';
import { SaveSearchDialog } from '@/components/search/SaveSearchDialog';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useQuery } from '@tanstack/react-query';
import type { SearchFilters as SearchFiltersType, FreelancerSortBy, SavedSearch } from '@/types/search';
import { searchFreelancers, getSavedSearches, executeSavedSearch } from '@/lib/api/search';
import { AppLayout } from '@/components/layout/AppLayout';

export default function FindFreelancers() {
    const { user } = useSupabase();
    const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
    const [filters, setFilters] = useState<SearchFiltersType>({});
    const [sortBy, setSortBy] = useState<FreelancerSortBy>('rating_desc');
    const [page, setPage] = useState(1);
    const [hasSearched, setHasSearched] = useState(false);

    // Search query
    const { data: searchResults, isLoading: searchLoading, refetch: refetchSearch } = useQuery({
        queryKey: ['freelancers', 'search', filters, sortBy, page],
        queryFn: () => searchFreelancers(filters, { sortBy, page, pageSize: 12 }),
        enabled: hasSearched,
    });

    // Saved searches query
    const { data: savedSearches = [], isLoading: savedLoading, refetch: refetchSaved } = useQuery({
        queryKey: ['savedSearches', user?.id, 'freelancers'],
        queryFn: () => getSavedSearches(user?.id || ''),
        enabled: !!user && activeTab === 'saved',
    }); const handleSearch = () => {
        setHasSearched(true);
        setPage(1);
        refetchSearch();
    };

    const handleFiltersChange = (newFilters: SearchFiltersType) => {
        setFilters(newFilters);
        // Auto-search when filters change if already searched
        if (hasSearched) {
            setPage(1);
        }
    };

    const handleSortChange = (newSortBy: FreelancerSortBy) => {
        setSortBy(newSortBy);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        // Scroll to top of results
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExecuteSavedSearch = async (search: SavedSearch) => {
        try {
            // Load the filters from saved search
            setFilters(search.filters);
            setActiveTab('search');
            setHasSearched(true);
            setPage(1);

            // Execute the search
            await executeSavedSearch(search.id);
            refetchSearch();
        } catch (error) {
            console.error('Error executing saved search:', error);
        }
    };

    const handleSearchSaved = () => {
        refetchSaved();
    };

    const hasActiveFilters = Object.keys(filters).some((key) => {
        const value = filters[key as keyof SearchFiltersType];
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return value > 0;
        return false;
    });

    return (
        <AppLayout>
            <div className="container max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Find Freelancers</h1>
                    <p className="text-muted-foreground">
                        Search and connect with talented South African freelancers
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'search' | 'saved')} className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="search" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search Freelancers
                        </TabsTrigger>
                        <TabsTrigger value="saved" className="gap-2">
                            <Bookmark className="h-4 w-4" />
                            Saved Searches
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="space-y-6">
                        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
                            {/* Filters Sidebar */}
                            <aside className="space-y-4">
                                <SearchFiltersComponent
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                    searchType="freelancers"
                                    onSearch={handleSearch}
                                />
                                {hasActiveFilters && user && (
                                    <SaveSearchDialog
                                        filters={filters}
                                        searchType="freelancers"
                                        userId={user.id}
                                        onSaved={handleSearchSaved}
                                        trigger={
                                            <Button variant="outline" className="w-full">
                                                <Bookmark className="h-4 w-4 mr-2" />
                                                Save This Search
                                            </Button>
                                        }
                                    />
                                )}
                            </aside>

                            {/* Results */}
                            <main>
                                {!hasSearched ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Search className="h-16 w-16 text-muted-foreground mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">
                                            Start searching for freelancers
                                        </h3>
                                        <p className="text-muted-foreground max-w-md mb-6">
                                            Use the filters on the left to narrow down your search, then click
                                            "Search" to find freelancers that match your criteria.
                                        </p>
                                        <Button onClick={handleSearch} size="lg">
                                            <Search className="h-4 w-4 mr-2" />
                                            Search All Freelancers
                                        </Button>
                                    </div>
                                ) : (
                                    <FreelancerSearchResults
                                        results={searchResults ?? null}
                                        loading={searchLoading}
                                        onSortChange={handleSortChange}
                                        onPageChange={handlePageChange}
                                        sortBy={sortBy}
                                    />
                                )}
                            </main>
                        </div>
                    </TabsContent>

                    <TabsContent value="saved" className="space-y-6">
                        {user ? (
                            <SavedSearchesList
                                searches={savedSearches}
                                loading={savedLoading}
                                onExecute={handleExecuteSavedSearch}
                                onDeleted={refetchSaved}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    Please sign in to view your saved searches
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
