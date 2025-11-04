import { useState } from 'react';
import { ApplicationCard } from './ApplicationCard';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { useApplications, useMyApplications } from '@/hooks/useApplications';
import type {
    ApplicationStatus,
    ApplicationSortBy,
    ApplicationWithFreelancer,
    ApplicationWithAssignment,
} from '@/types/applications';

interface ApplicationListProps {
    assignmentId?: string;
    view: 'employer' | 'freelancer';
    onViewDetails?: (applicationId: string) => void;
}

export function ApplicationList({ assignmentId, view, onViewDetails }: ApplicationListProps) {
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<ApplicationSortBy>('created_at_desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const isEmployerView = view === 'employer';
    const isFreelancerView = view === 'freelancer';

    // Employer view: fetch applications for their assignment
    const employerQuery = useApplications(
        isEmployerView
            ? {
                assignment_id: assignmentId,
                status: statusFilter === 'all' ? undefined : statusFilter,
            }
            : undefined,
        isEmployerView
            ? {
                page,
                pageSize,
                sortBy,
            }
            : undefined
    );

    // Freelancer view: fetch their own applications
    const freelancerQuery = useMyApplications(
        isFreelancerView
            ? {
                assignment_id: assignmentId,
                status: statusFilter === 'all' ? undefined : statusFilter,
            }
            : undefined,
        isFreelancerView
            ? {
                page,
                pageSize,
                sortBy,
            }
            : undefined
    );

    const query = isEmployerView ? employerQuery : freelancerQuery;
    const { data, isLoading, error } = query;

    // Filter by search query (client-side)
    const filteredApplications = data?.data.filter((app) => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();

        if (isEmployerView && 'display_name' in app) {
            return (
                app.display_name.toLowerCase().includes(searchLower) ||
                app.cover_letter.toLowerCase().includes(searchLower) ||
                app.skills?.some((skill) => skill.toLowerCase().includes(searchLower))
            );
        }

        if (isFreelancerView && 'assignment_title' in app) {
            return (
                app.assignment_title.toLowerCase().includes(searchLower) ||
                app.cover_letter.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const handleNextPage = () => {
        if (data?.hasMore) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Failed to load applications</p>
                <p className="text-sm text-muted-foreground mt-2">
                    {error instanceof Error ? error.message : 'Unknown error'}
                </p>
            </div>
        );
    }

    if (!data || data.data.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">
                    {statusFilter === 'all'
                        ? 'No applications yet'
                        : `No ${statusFilter} applications`}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={
                            isEmployerView ? 'Search by freelancer name...' : 'Search by assignment title...'
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as ApplicationSortBy)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_at_desc">Newest First</SelectItem>
                        <SelectItem value="created_at_asc">Oldest First</SelectItem>
                        <SelectItem value="proposed_rate_asc">Rate: Low to High</SelectItem>
                        <SelectItem value="proposed_rate_desc">Rate: High to Low</SelectItem>
                        {isEmployerView && <SelectItem value="rating_desc">Rating: High to Low</SelectItem>}
                    </SelectContent>
                </Select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredApplications?.length || 0} of {data.total} applications
            </div>

            {/* Application Cards */}
            <div className="space-y-4">
                {filteredApplications?.map((application) => (
                    <ApplicationCard
                        key={application.id}
                        application={application as ApplicationWithFreelancer | ApplicationWithAssignment}
                        view={view}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>

            {/* Pagination */}
            {data.total > pageSize && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <Button variant="outline" onClick={handlePrevPage} disabled={page === 1}>
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {Math.ceil(data.total / pageSize)}
                    </span>
                    <Button variant="outline" onClick={handleNextPage} disabled={!data.hasMore}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
