/**
 * FreelancerSearchFilters Component
 * 
 * Advanced filter panel for freelancer search with comprehensive filtering options.
 * Supports filtering by skills, experience, location, rating, availability, and hourly rate.
 * 
 * Features:
 * - Skill selection with autocomplete
 * - Experience level filter
 * - Location/province filter
 * - Rating filter (stars)
 * - Availability filter
 * - Hourly rate range
 * - Verification status filter
 * - Active filter count badge
 * - Clear all filters button
 * 
 * @example
 * ```tsx
 * <FreelancerSearchFilters 
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   onApply={() => handleSearch()}
 * />
 * ```
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Clock, Shield, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchFilters } from '@/types/search';
import {
    SA_PROVINCES,
    EXPERIENCE_LEVELS,
    COMMON_SKILLS,
    countActiveFilters
} from '@/types/search';

export interface FreelancerSearchFiltersProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    onApply?: () => void;
    onClear?: () => void;
    showApplyButton?: boolean;
    className?: string;
}

export function FreelancerSearchFilters({
    filters,
    onFiltersChange,
    onApply,
    onClear,
    showApplyButton = true,
    className,
}: FreelancerSearchFiltersProps) {
    const [skillsOpen, setSkillsOpen] = useState(false);

    const activeFiltersCount = countActiveFilters(filters);

    // Update filter helper
    const updateFilter = <K extends keyof SearchFilters>(
        key: K,
        value: SearchFilters[K]
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    // Toggle skill selection
    const toggleSkill = (skill: string) => {
        const currentSkills = filters.skills || [];
        const newSkills = currentSkills.includes(skill)
            ? currentSkills.filter(s => s !== skill)
            : [...currentSkills, skill];
        updateFilter('skills', newSkills.length > 0 ? newSkills : undefined);
    };

    // Clear all filters
    const handleClearAll = () => {
        onFiltersChange({});
        onClear?.();
    };

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filters</CardTitle>
                    <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary">
                                {activeFiltersCount} active
                            </Badge>
                        )}
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                                className="h-8 px-2"
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Skills Filter */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Skills
                    </Label>
                    <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={skillsOpen}
                                className="w-full justify-between"
                            >
                                {filters.skills && filters.skills.length > 0
                                    ? `${filters.skills.length} skill${filters.skills.length > 1 ? 's' : ''} selected`
                                    : 'Select skills...'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search skills..." />
                                <CommandEmpty>No skills found.</CommandEmpty>
                                <CommandList>
                                    <ScrollArea className="h-72">
                                        <CommandGroup>
                                            {COMMON_SKILLS.map((skill) => (
                                                <CommandItem
                                                    key={skill}
                                                    onSelect={() => toggleSkill(skill)}
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Checkbox
                                                            checked={filters.skills?.includes(skill)}
                                                            className="pointer-events-none"
                                                        />
                                                        <span>{skill}</span>
                                                        {filters.skills?.includes(skill) && (
                                                            <Check className="ml-auto h-4 w-4" />
                                                        )}
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </ScrollArea>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Selected Skills */}
                    {filters.skills && filters.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {filters.skills.map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="text-xs cursor-pointer hover:bg-secondary/80"
                                    onClick={() => toggleSkill(skill)}
                                >
                                    {skill}
                                    <X className="ml-1 h-3 w-3" />
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Experience Level */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Experience Level
                    </Label>
                    <Select
                        value={filters.experienceLevel || 'all'}
                        onValueChange={(value) =>
                            updateFilter('experienceLevel', value === 'all' ? undefined : (value as 'entry' | 'intermediate' | 'expert'))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Any experience level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any experience level</SelectItem>
                            {EXPERIENCE_LEVELS.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                    </Label>
                    <Select
                        value={filters.province || 'all'}
                        onValueChange={(value) =>
                            updateFilter('province', value === 'all' ? undefined : value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Any province" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any province</SelectItem>
                            {SA_PROVINCES.map((province) => (
                                <SelectItem key={province} value={province}>
                                    {province}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Remote Work */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remote"
                            checked={filters.remote || false}
                            onCheckedChange={(checked) =>
                                updateFilter('remote', checked ? true : undefined)
                            }
                        />
                        <Label
                            htmlFor="remote"
                            className="text-sm font-normal cursor-pointer"
                        >
                            Open to remote work
                        </Label>
                    </div>
                </div>

                <Separator />

                {/* Hourly Rate */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        Hourly Rate Range
                    </Label>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                {formatCurrency(filters.budgetMin || 0)}
                            </span>
                            <span className="text-muted-foreground">
                                {formatCurrency(filters.budgetMax || 1000)}
                            </span>
                        </div>
                        <Slider
                            min={0}
                            max={1000}
                            step={50}
                            value={[filters.budgetMin || 0, filters.budgetMax || 1000]}
                            onValueChange={([min, max]) => {
                                updateFilter('budgetMin', min > 0 ? min : undefined);
                                updateFilter('budgetMax', max < 1000 ? max : undefined);
                            }}
                            className="w-full"
                        />
                    </div>
                </div>

                <Separator />

                {/* Rating */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Minimum Rating
                    </Label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                                key={rating}
                                variant={filters.rating && filters.rating >= rating ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    updateFilter('rating', filters.rating === rating ? undefined : rating)
                                }
                                className="w-10 h-10 p-0"
                            >
                                <Star
                                    className={cn(
                                        'h-4 w-4',
                                        filters.rating && filters.rating >= rating && 'fill-current'
                                    )}
                                />
                            </Button>
                        ))}
                    </div>
                    {filters.rating && (
                        <p className="text-xs text-muted-foreground">
                            {filters.rating}+ stars
                        </p>
                    )}
                </div>

                <Separator />

                {/* Verification Status */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="verified"
                            checked={filters.verified || false}
                            onCheckedChange={(checked) =>
                                updateFilter('verified', checked ? true : undefined)
                            }
                        />
                        <Label
                            htmlFor="verified"
                            className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                            <Shield className="h-4 w-4 text-verified" />
                            Verified freelancers only
                        </Label>
                    </div>
                </div>

                {/* Apply Button */}
                {showApplyButton && onApply && (
                    <>
                        <Separator />
                        <Button onClick={onApply} className="w-full">
                            Apply Filters
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default FreelancerSearchFilters;
