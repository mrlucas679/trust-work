/**
 * SearchFilters Component
 * 
 * A comprehensive filter panel for searching assignments and freelancers.
 * Includes location, budget, skills, industry, experience level, and date filters.
 */

import { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { SearchFilters } from '@/types/search';
import {
    SA_PROVINCES,
    INDUSTRIES,
    EXPERIENCE_LEVELS,
    AVAILABILITY_OPTIONS,
    COMMON_SKILLS,
} from '@/types/search';

interface SearchFiltersProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    searchType: 'assignments' | 'freelancers';
    onSearch?: () => void;
    className?: string;
}

export function SearchFiltersComponent({
    filters,
    onFiltersChange,
    searchType,
    onSearch,
    className = '',
}: SearchFiltersProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [selectedSkills, setSelectedSkills] = useState<string[]>(filters.skills || []);
    const [skillInput, setSkillInput] = useState('');

    const updateFilter = (key: keyof SearchFilters, value: string | number | string[] | undefined) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const handleAddSkill = (skill: string) => {
        if (skill && !selectedSkills.includes(skill)) {
            const newSkills = [...selectedSkills, skill];
            setSelectedSkills(newSkills);
            updateFilter('skills', newSkills);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        const newSkills = selectedSkills.filter((s) => s !== skill);
        setSelectedSkills(newSkills);
        updateFilter('skills', newSkills);
    };

    const clearFilters = () => {
        setSelectedSkills([]);
        onFiltersChange({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Filters</h3>
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-2">
                                {Object.keys(filters).length} active
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-8 px-2"
                            >
                                Clear all
                            </Button>
                        )}
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''
                                        }`}
                                />
                                <span className="sr-only">Toggle filters</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </div>

                <CollapsibleContent>
                    <Separator />
                    <div className="space-y-4 p-4">
                        {/* Search Query */}
                        <div className="space-y-2">
                            <Label htmlFor="search-query">Search Keywords</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="search-query"
                                    placeholder={
                                        searchType === 'assignments'
                                            ? 'e.g., React developer, web design...'
                                            : 'e.g., John Doe, designer...'
                                    }
                                    value={filters.query || ''}
                                    onChange={(e) => updateFilter('query', e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && onSearch) {
                                            onSearch();
                                        }
                                    }}
                                />
                                {onSearch && (
                                    <Button onClick={onSearch} size="sm">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Location Filters */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="province">Province</Label>
                                <Select
                                    value={filters.province || ''}
                                    onValueChange={(value) => updateFilter('province', value || undefined)}
                                >
                                    <SelectTrigger id="province">
                                        <SelectValue placeholder="Select province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All provinces</SelectItem>
                                        {SA_PROVINCES.map((province) => (
                                            <SelectItem key={province} value={province}>
                                                {province}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">City/Location</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Johannesburg"
                                    value={filters.location || ''}
                                    onChange={(e) => updateFilter('location', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Budget/Rate Filters (for assignments) */}
                        {searchType === 'assignments' && (
                            <div className="space-y-2">
                                <Label>Budget Range (ZAR)</Label>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.budgetMin || ''}
                                        onChange={(e) =>
                                            updateFilter(
                                                'budgetMin',
                                                e.target.value ? Number(e.target.value) : undefined
                                            )
                                        }
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.budgetMax || ''}
                                        onChange={(e) =>
                                            updateFilter(
                                                'budgetMax',
                                                e.target.value ? Number(e.target.value) : undefined
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* Rating Filter (for freelancers) */}
                        {searchType === 'freelancers' && (
                            <div className="space-y-2">
                                <Label htmlFor="rating">Minimum Rating</Label>
                                <Select
                                    value={filters.ratingMin?.toString() || ''}
                                    onValueChange={(value) =>
                                        updateFilter('ratingMin', value ? Number(value) : undefined)
                                    }
                                >
                                    <SelectTrigger id="rating">
                                        <SelectValue placeholder="Any rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Any rating</SelectItem>
                                        <SelectItem value="4">4+ stars</SelectItem>
                                        <SelectItem value="3">3+ stars</SelectItem>
                                        <SelectItem value="2">2+ stars</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Skills Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        id="skills"
                                        placeholder="Type and press Enter to add"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSkill(skillInput);
                                            }
                                        }}
                                        list="common-skills"
                                    />
                                    <datalist id="common-skills">
                                        {COMMON_SKILLS.map((skill) => (
                                            <option key={skill} value={skill} />
                                        ))}
                                    </datalist>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddSkill(skillInput)}
                                        disabled={!skillInput}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {selectedSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSkills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="gap-1">
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="ml-1 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Industry Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Select
                                value={filters.industry || ''}
                                onValueChange={(value) => updateFilter('industry', value || undefined)}
                            >
                                <SelectTrigger id="industry">
                                    <SelectValue placeholder="All industries" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All industries</SelectItem>
                                    {INDUSTRIES.map((industry) => (
                                        <SelectItem key={industry} value={industry}>
                                            {industry}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Experience Level Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience Level</Label>
                            <Select
                                value={filters.experienceLevel || ''}
                                onValueChange={(value) =>
                                    updateFilter('experienceLevel', value || undefined)
                                }
                            >
                                <SelectTrigger id="experience">
                                    <SelectValue placeholder="All levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All levels</SelectItem>
                                    <SelectItem value="entry">Entry Level</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="senior">Senior</SelectItem>
                                    <SelectItem value="expert">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Availability Filter (for freelancers) */}
                        {searchType === 'freelancers' && (
                            <div className="space-y-2">
                                <Label htmlFor="availability">Availability</Label>
                                <Select
                                    value={filters.availability || ''}
                                    onValueChange={(value) =>
                                        updateFilter('availability', value || undefined)
                                    }
                                >
                                    <SelectTrigger id="availability">
                                        <SelectValue placeholder="Any availability" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Any availability</SelectItem>
                                        <SelectItem value="immediately">Immediately</SelectItem>
                                        <SelectItem value="within_2_weeks">Within 2 weeks</SelectItem>
                                        <SelectItem value="within_month">Within a month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Posted Within Filter (for assignments) */}
                        {searchType === 'assignments' && (
                            <div className="space-y-2">
                                <Label htmlFor="posted">Posted Within</Label>
                                <Select
                                    value={filters.postedWithin || 'all'}
                                    onValueChange={(value) =>
                                        updateFilter('postedWithin', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger id="posted">
                                        <SelectValue placeholder="Any time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any time</SelectItem>
                                        <SelectItem value="day">Last 24 hours</SelectItem>
                                        <SelectItem value="week">Last week</SelectItem>
                                        <SelectItem value="month">Last month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}

// Export alias for backwards compatibility
export { SearchFiltersComponent as SearchFilters };
