import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplicationStatistics } from '@/hooks/useApplications';
import { Loader2, FileText, Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationStatsProps {
    assignmentId: string;
    className?: string;
}

export function ApplicationStats({ assignmentId, className }: ApplicationStatsProps) {
    const { data: stats, isLoading, error } = useApplicationStatistics(assignmentId);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error || !stats) {
        return (
            <Card className={className}>
                <CardContent className="py-6">
                    <p className="text-sm text-destructive">Failed to load statistics</p>
                </CardContent>
            </Card>
        );
    }

    const statItems = [
        {
            label: 'Total Applications',
            value: stats.total_applications,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            label: 'Pending Review',
            value: stats.pending_count,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            label: 'Shortlisted',
            value: stats.shortlisted_count,
            icon: CheckCircle2,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            label: 'Accepted',
            value: stats.accepted_count,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            label: 'Rejected',
            value: stats.rejected_count,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
        {
            label: 'Withdrawn',
            value: stats.withdrawn_count,
            icon: Ban,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
        },
    ];

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Application Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {statItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.label}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                            >
                                <div className={cn('p-2 rounded-lg', item.bgColor)}>
                                    <Icon className={cn('h-5 w-5', item.color)} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{item.value}</p>
                                    <p className="text-xs text-muted-foreground">{item.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
