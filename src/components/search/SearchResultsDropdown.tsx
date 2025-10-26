import { SearchResults } from '@/components/search';
import { SearchResultItem } from '@/components/search/SearchResultItem';
import { Briefcase, Building, User, Lightbulb, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResultsDropdownProps {
    results: SearchResults | null;
    isLoading: boolean;
    query: string;
    onClose: () => void;
}

export const SearchResultsDropdown = ({ results, isLoading, query, onClose }: SearchResultsDropdownProps) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-8">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Searching...</span>
                </div>
            </div>
        );
    }

    if (!results) {
        return null;
    }

    const hasResults = results.gigs.length > 0 ||
        results.companies.length > 0 ||
        results.workers.length > 0 ||
        results.skills.length > 0;

    if (!hasResults) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-6">
                <div className="text-center space-y-3">
                    <p className="text-sm font-medium">No results found for: "{query}"</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p>Try searching for:</p>
                        <ul className="list-disc list-inside">
                            <li>Gig titles or descriptions</li>
                            <li>Company names</li>
                            <li>Worker names or skills</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-[500px] overflow-y-auto">
            <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    Search results for: "{query}"
                </div>

                {/* Gigs Section */}
                {results.gigs.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold">
                            <Briefcase className="h-4 w-4" />
                            <span>GIGS ({results.gigs.length})</span>
                        </div>
                        {results.gigs.slice(0, 3).map((gig) => (
                            <SearchResultItem
                                key={gig.id}
                                icon={<Briefcase className="h-5 w-5 text-muted-foreground" />}
                                title={gig.title}
                                description={`${gig.budget} • ${gig.clientName}`}
                                onClick={() => {
                                    navigate(`/gigs/${gig.id}`);
                                    onClose();
                                }}
                            />
                        ))}
                        {results.gigs.length > 3 && (
                            <button
                                onClick={() => {
                                    navigate(`/gigs?search=${encodeURIComponent(query)}`);
                                    onClose();
                                }}
                                className="w-full px-3 py-2 text-sm text-primary hover:bg-accent rounded-md transition-colors text-left"
                            >
                                See all {results.gigs.length} gigs →
                            </button>
                        )}
                    </div>
                )}

                {/* Companies Section */}
                {results.companies.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold">
                            <Building className="h-4 w-4" />
                            <span>COMPANIES ({results.companies.length})</span>
                        </div>
                        {results.companies.slice(0, 3).map((company) => (
                            <SearchResultItem
                                key={company.id}
                                icon={<Building className="h-5 w-5 text-muted-foreground" />}
                                title={company.name}
                                description={`${company.location} • ${company.gigCount} gigs`}
                                onClick={() => {
                                    navigate(`/company/${company.id}`);
                                    onClose();
                                }}
                            />
                        ))}
                        {results.companies.length > 3 && (
                            <button
                                onClick={() => {
                                    navigate(`/companies?search=${encodeURIComponent(query)}`);
                                    onClose();
                                }}
                                className="w-full px-3 py-2 text-sm text-primary hover:bg-accent rounded-md transition-colors text-left"
                            >
                                See all {results.companies.length} companies →
                            </button>
                        )}
                    </div>
                )}

                {/* Workers Section */}
                {results.workers.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold">
                            <User className="h-4 w-4" />
                            <span>WORKERS ({results.workers.length})</span>
                        </div>
                        {results.workers.slice(0, 3).map((worker) => (
                            <SearchResultItem
                                key={worker.id}
                                icon={<User className="h-5 w-5 text-muted-foreground" />}
                                title={worker.name}
                                description={`${worker.title} • ⭐ ${worker.rating}`}
                                onClick={() => {
                                    navigate(`/profile/${worker.id}`);
                                    onClose();
                                }}
                            />
                        ))}
                        {results.workers.length > 3 && (
                            <button
                                onClick={() => {
                                    navigate(`/workers?search=${encodeURIComponent(query)}`);
                                    onClose();
                                }}
                                className="w-full px-3 py-2 text-sm text-primary hover:bg-accent rounded-md transition-colors text-left"
                            >
                                See all {results.workers.length} workers →
                            </button>
                        )}
                    </div>
                )}

                {/* Skills Section */}
                {results.skills.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold">
                            <Lightbulb className="h-4 w-4" />
                            <span>SKILLS</span>
                        </div>
                        {results.skills.map((skill) => (
                            <SearchResultItem
                                key={skill.id}
                                icon={<Lightbulb className="h-5 w-5 text-muted-foreground" />}
                                title={skill.name}
                                description={`${skill.workerCount} workers • ${skill.gigCount} gigs`}
                                onClick={() => {
                                    navigate(`/skills/${skill.id}`);
                                    onClose();
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
