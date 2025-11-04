/**
 * AssignmentSearchResults Component
 * 
 * Displays search results for assignments with pagination and sorting
 */

import { useState } from 'react';
import { MapPin, Briefcase, DollarSign, Calendar, Building2, ArrowUpDown, MessageSquare } from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';
import type { Assignment, AssignmentSortBy, SearchResult } from '@/types/search';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useMutation } from '@tanstack/react-query';
import { getOrCreateConversation } from '@/lib/api/messaging';

interface AssignmentSearchResultsProps {
    results: SearchResult<Assignment> | null;
    loading?: boolean;
    onSortChange?: (sortBy: AssignmentSortBy) => void;
    onPageChange?: (page: number) => void;
    sortBy?: AssignmentSortBy;
}

export function AssignmentSearchResults({
    results,
    loading = false,
    onSortChange,
    onPageChange,
    sortBy = 'created_at_desc',
}: AssignmentSearchResultsProps) {
    if (loading) {
        return <AssignmentResultsSkeleton />;
    }

    if (!results || results.data.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                        Try adjusting your filters or search terms to find more results.
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
                    Found <span className="font-semibold">{results.total}</span> assignment
                    {results.total !== 1 ? 's' : ''}
                </p>
                {onSortChange && (
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        <Select value={sortBy} onValueChange={(value) => onSortChange(value as AssignmentSortBy)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at_desc">Newest first</SelectItem>
                                <SelectItem value="created_at_asc">Oldest first</SelectItem>
                                <SelectItem value="budget_desc">Highest budget</SelectItem>
                                <SelectItem value="budget_asc">Lowest budget</SelectItem>
                                <SelectItem value="title_asc">Title A-Z</SelectItem>
                                <SelectItem value="title_desc">Title Z-A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="space-y-4">
                {results.data.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
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

function AssignmentCard({ assignment }: { assignment: Assignment }) {
    const navigate = useNavigate();
    const { user } = useSupabase();

    // Create or get conversation mutation
    const createConversationMutation = useMutation({
        mutationFn: async () => {
            if (!user || !assignment.client_id) {
                throw new Error('Missing required data');
            }

            return getOrCreateConversation(user.id, {
                participant_id: assignment.client_id,
                assignment_id: assignment.id,
                initial_message: `Hi, I'm interested in your assignment: ${assignment.title}`,
            });
        },
        onSuccess: (conversation) => {
            navigate(`/messages/${conversation}`);
        },
    });

    const handleMessageClick = () => {
        createConversationMutation.mutate();
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <Link
                            to={`/job/${assignment.id}`}
                            className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                            {assignment.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                            {assignment.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {assignment.location}
                                    {assignment.province && `, ${assignment.province}`}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                            </span>
                            {assignment.client?.business_name && (
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {assignment.client.business_name}
                                </span>
                            )}
                        </div>
                    </div>
                    {assignment.budget_min && assignment.budget_max && (
                        <div className="text-right shrink-0">
                            <div className="text-sm text-muted-foreground">Budget</div>
                            <div className="font-semibold text-lg">
                                R{assignment.budget_min.toLocaleString()} - R{assignment.budget_max.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {assignment.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                    {assignment.experience_level && (
                        <Badge variant="secondary">
                            {assignment.experience_level.charAt(0).toUpperCase() +
                                assignment.experience_level.slice(1)}
                        </Badge>
                    )}
                    {assignment.industry && (
                        <Badge variant="outline">{assignment.industry}</Badge>
                    )}
                    {assignment.skills_required?.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary">
                            {skill}
                        </Badge>
                    ))}
                    {assignment.skills_required && assignment.skills_required.length > 3 && (
                        <Badge variant="secondary">
                            +{assignment.skills_required.length - 3} more
                        </Badge>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-3 flex gap-2">
                <Button asChild className="flex-1">
                    <Link to={`/apply/${assignment.id}`}>Apply Now</Link>
                </Button>
                {user && assignment.client_id && assignment.client_id !== user.id && (
                    <Button
                        variant="outline"
                        onClick={handleMessageClick}
                        disabled={createConversationMutation.isPending}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

function AssignmentResultsSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6 mt-2" />
                        <div className="flex gap-2 mt-3">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
