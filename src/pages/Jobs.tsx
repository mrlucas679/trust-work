import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, MapPin, Clock, DollarSign, Search, Filter, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockJobs } from "@/data/mockData";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchFilters as SearchFiltersComponent } from "@/components/search/SearchFilters";
import { AssignmentSearchResults } from "@/components/search/AssignmentSearchResults";
import { SavedSearchesList } from "@/components/search/SavedSearchesList";
import { SaveSearchDialog } from "@/components/search/SaveSearchDialog";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useQuery } from "@tanstack/react-query";
import type { SearchFilters as SearchFiltersType, AssignmentSortBy, SavedSearch } from "@/types/search";
import { searchAssignments, getSavedSearches, executeSavedSearch } from "@/lib/api/search";
const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'saved'>('browse');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [sortBy, setSortBy] = useState<AssignmentSortBy>('created_at_desc');
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // Legacy browse mode filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showSuspicious, setShowSuspicious] = useState(false);

  // Search query
  const { data: searchResults, isLoading: isLoadingSearch, refetch: refetchSearch } = useQuery({
    queryKey: ['assignments', 'search', filters, sortBy, page],
    queryFn: () => searchAssignments(filters, { sortBy, page, pageSize: 12 }),
    enabled: hasSearched && activeTab === 'search',
  });

  // Saved searches query
  const { data: savedSearches = [], isLoading: savedLoading, refetch: refetchSaved } = useQuery({
    queryKey: ['savedSearches', user?.id, 'assignments'],
    queryFn: () => getSavedSearches(user?.id || ''),
    enabled: !!user && activeTab === 'saved',
  });

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === "all" || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSafety = showSuspicious || !job.flagged;
    return matchesSearch && matchesLocation && matchesSafety;
  });
  const verifiedJobs = filteredJobs.filter(job => job.verified && !job.flagged);
  const suspiciousJobs = filteredJobs.filter(job => job.flagged);

  const handleSearch = () => {
    setHasSearched(true);
    setPage(1);
    refetchSearch();
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    if (hasSearched) {
      setPage(1);
    }
  };

  const handleSortChange = (newSortBy: AssignmentSortBy) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecuteSavedSearch = async (search: SavedSearch) => {
    try {
      setFilters(search.filters);
      setActiveTab('search');
      setHasSearched(true);
      setPage(1);
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
    <div className="space-y-8">
      {/* Header Section */}
      <PageHeader
        title="Job Opportunities"
        subtitle="Find verified jobs from trusted employers"
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'browse' | 'search' | 'saved')} className="mt-6">
        <TabsList>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Searches
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab - Legacy UI */}
        <TabsContent value="browse" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs or companies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="sm:w-48 h-11">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="johannesburg">Johannesburg</SelectItem>
                <SelectItem value="cape town">Cape Town</SelectItem>
                <SelectItem value="durban">Durban</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showSuspicious ? "destructive" : "outline"}
              onClick={() => setShowSuspicious(!showSuspicious)}
              className="flex items-center justify-center gap-2 h-11 sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{showSuspicious ? "Hide Suspicious" : "Show All"}</span>
              <span className="sm:hidden">Filter</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-verified/10">
                    <CheckCircle className="h-6 w-6 text-verified" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{verifiedJobs.length}</p>
                    <p className="text-sm text-muted-foreground">Verified Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{suspiciousJobs.length}</p>
                    <p className="text-sm text-muted-foreground">Flagged Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{filteredJobs.length}</p>
                    <p className="text-sm text-muted-foreground">Total Results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="space-y-8">
            {/* Verified Jobs Section */}
            {verifiedJobs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-verified" />
                  Verified Opportunities ({verifiedJobs.length})
                </h2>
                <div className="space-y-4">
                  {verifiedJobs.map(job => (
                    <Card key={job.id} className="hover:shadow-lg transition-all duration-200 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <Badge variant="outline" className="border-verified text-verified">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                            <p className="text-muted-foreground font-medium">{job.company}</p>
                          </div>
                          <Button onClick={() => navigate(`/job/${job.id}`)} className="sm:flex-shrink-0 w-full sm:w-auto">
                            View Details
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map(req => (
                            <Badge key={req} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Suspicious Jobs Section */}
            {showSuspicious && suspiciousJobs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Flagged Listings ({suspiciousJobs.length}) - Proceed with Caution
                </h2>
                <div className="space-y-4">
                  {suspiciousJobs.map(job => (
                    <Card key={job.id} className="border-warning/40 bg-warning/5 hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Flagged
                              </Badge>
                            </div>
                            <p className="text-muted-foreground font-medium">{job.company}</p>
                          </div>
                          <Button variant="outline" onClick={() => navigate(`/job/${job.id}`)} className="sm:flex-shrink-0 w-full sm:w-auto">
                            View Anyway
                          </Button>
                        </div>

                        <div className="bg-warning/15 border border-warning/30 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-warning mb-1">Safety Warning</p>
                              <p className="text-xs text-muted-foreground">This posting has been flagged for suspicious activity. Exercise caution and verify all details independently.</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {filteredJobs.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No jobs found matching your criteria.</p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setLocationFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Advanced Search Tab */}
        <TabsContent value="search" className="mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar with Filters */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-20">
                <SearchFiltersComponent
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  searchType="assignments"
                  onSearch={handleSearch}
                />
                {hasActiveFilters && user && (
                  <div className="mt-4">
                    <SaveSearchDialog
                      filters={filters}
                      searchType="assignments"
                      userId={user.id}
                      onSaved={handleSearchSaved}
                      trigger={
                        <Button variant="outline" className="w-full">
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save This Search
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {hasSearched ? (
                <AssignmentSearchResults
                  results={searchResults || null}
                  loading={isLoadingSearch}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  onPageChange={handlePageChange}
                />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Advanced Job Search</h3>
                    <p className="text-muted-foreground mb-6">
                      Use the filters on the left to find the perfect job opportunities.
                      Search by location, budget, skills, and more.
                    </p>
                    <Button onClick={handleSearch}>
                      <Search className="h-4 w-4 mr-2" />
                      Search Jobs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="saved" className="mt-6">
          <SavedSearchesList
            searches={savedSearches}
            loading={savedLoading}
            onExecute={handleExecuteSavedSearch}
            onDeleted={refetchSaved}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Jobs;