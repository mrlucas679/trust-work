/**
 * FreelancerSearchResults Component
 * 
 * Displays search results for freelancers with pagination and sorting
 */

import { useState } from 'react';
import { MapPin, Star, Briefcase, CheckCircle, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { FreelancerProfile, FreelancerSortBy, SearchResult } from '@/types/search';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FreelancerSearchResultsProps {
    results: SearchResult<FreelancerProfile> | null;
    loading?: boolean;
    onSortChange?: (sortBy: FreelancerSortBy) => void;
    onPageChange?: (page: number) => void;
    sortBy?: FreelancerSortBy;
}

export function FreelancerSearchResults({
    results,
    loading = false,
    onSortChange,
    onPageChange,
    sortBy = 'rating_desc',
}: FreelancerSearchResultsProps) {
    if (loading) {
        return <FreelancerResultsSkeleton />;
    }

    if (!results || results.data.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No freelancers found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                        Try adjusting your filters or search terms to find more freelancers.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with sort and count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Found <span className="font-semibold">{results.total}</span> freelancer
                    {results.total !== 1 ? 's' : ''}
                </p>
                {onSortChange && (
                    <Select value={sortBy} onValueChange={(value) => onSortChange(value as FreelancerSortBy)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rating_desc">Highest rated</SelectItem>
                            <SelectItem value="rating_asc">Lowest rated</SelectItem>
                            <SelectItem value="completed_projects_desc">Most projects</SelectItem>
                            <SelectItem value="completed_projects_asc">Fewest projects</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Results Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.data.map((freelancer) => (
                    <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                ))}
            </div>

            {/* Pagination */}
            {results.total > results.pageSize && onPageChange && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(results.page - 1)}
                        disabled={results.page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {results.page} of {Math.ceil(results.total / results.pageSize)}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(results.page + 1)}
                        disabled={!results.hasMore}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

function FreelancerCard({ freelancer }: { freelancer: FreelancerProfile }) {
    const initials = `${freelancer.first_name?.[0] || ''}${freelancer.last_name?.[0] || ''}`.toUpperCase();

    return (
        <Card className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={freelancer.avatar_url} alt={`${freelancer.first_name} ${freelancer.last_name}`} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <Link
                            to={`/freelancer/${freelancer.id}`}
                            className="font-semibold hover:text-primary transition-colors line-clamp-1"
                        >
                            {freelancer.first_name} {freelancer.last_name}
                        </Link>
                        {freelancer.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {freelancer.bio}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3 flex-1">
                {/* Rating & Projects */}
                <div className="flex items-center gap-4 mb-3">
                    {freelancer.rating !== null && freelancer.rating !== undefined && (
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{freelancer.rating.toFixed(1)}</span>
                        </div>
                    )}
                    {freelancer.completed_projects !== null && freelancer.completed_projects !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4" />
                            <span>{freelancer.completed_projects} project{freelancer.completed_projects !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                {(freelancer.location || freelancer.province) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                            {freelancer.location}
                            {freelancer.location && freelancer.province && ', '}
                            {freelancer.province}
                        </span>
                    </div>
                )}

                {/* Skills */}
                {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {freelancer.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {freelancer.skills.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                                +{freelancer.skills.length - 4}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Availability Badge */}
                {freelancer.availability && (
                    <div className="mt-3">
                        <Badge
                            variant={freelancer.availability === 'available' ? 'default' : 'secondary'}
                            className={cn(
                                'text-xs',
                                freelancer.availability === 'available' && 'bg-green-500 hover:bg-green-600'
                            )}
                        >
                            {freelancer.availability === 'available' ? 'Available Now' :
                                freelancer.availability === 'busy' ? 'Busy' : 'Not Available'}
                        </Badge>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-3 gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/freelancer/${freelancer.id}`}>
                        View Profile
                    </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                    <Link to={`/messages/new?to=${freelancer.id}`}>
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function FreelancerResultsSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full mt-1" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-3">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-2/3 mb-3" />
                        <div className="flex gap-1.5">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-9 flex-1" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
