/**
 * Assignment Timeline View
 * 
 * Displays the complete history of an assignment:
 * - Status changes
 * - Application events
 * - Review submissions
 * - Timeline formatting
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    Play,
    CheckCircle,
    XCircle,
    FileText,
    Star,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { getStatusLabel, getStatusColor, formatTimelineDuration } from '@/types/workflow';
import type { TimelineEvent } from '@/types/workflow';

interface TimelineViewProps {
    events: TimelineEvent[];
    isLoading?: boolean;
    className?: string;
}

export function TimelineView({ events, isLoading = false, className }: TimelineViewProps) {
    const getEventIcon = (event: TimelineEvent) => {
        switch (event.event_type) {
            case 'status_change':
                if (event.new_status === 'in_progress') return Play;
                if (event.new_status === 'completed') return CheckCircle;
                if (event.new_status === 'cancelled') return XCircle;
                return Clock;
            case 'application':
                return FileText;
            case 'review':
                return Star;
            default:
                return Calendar;
        }
    };

    const getEventColor = (event: TimelineEvent) => {
        if (event.event_type === 'status_change') {
            return getStatusColor(event.new_status!);
        }
        if (event.event_type === 'review') {
            return '#f59e0b'; // amber
        }
        return '#6b7280'; // gray
    };

    const getEventTitle = (event: TimelineEvent) => {
        if (event.event_type === 'status_change') {
            return `Status changed to ${getStatusLabel(event.new_status!)}`;
        }
        if (event.event_type === 'application') {
            return event.description;
        }
        if (event.event_type === 'review') {
            return 'Review submitted';
        }
        return event.description;
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center py-8">
                        <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (events.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No timeline events yet
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-4">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

                    {events.map((event, index) => {
                        const Icon = getEventIcon(event);
                        const color = getEventColor(event);
                        const isLast = index === events.length - 1;

                        return (
                            <div key={event.event_id} className="relative flex gap-4 pb-4">
                                {/* Icon */}
                                <div
                                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background"
                                    style={{ borderColor: color }}
                                >
                                    <Icon className="h-4 w-4" style={{ color }} />
                                </div>

                                {/* Content */}
                                <div className={cn(
                                    'flex-1 space-y-1 pb-4',
                                    !isLast && 'border-b'
                                )}>
                                    <div className="flex items-center justify-between gap-4">
                                        <h4 className="font-medium">{getEventTitle(event)}</h4>
                                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(event.event_time), {
                                                addSuffix: true
                                            })}
                                        </time>
                                    </div>

                                    {event.metadata && (
                                        <div className="text-sm text-muted-foreground">
                                            {event.metadata.reason && (
                                                <p>Reason: {event.metadata.reason}</p>
                                            )}
                                            {event.metadata.notes && (
                                                <p>Notes: {event.metadata.notes}</p>
                                            )}
                                            {event.metadata.rating && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span>{event.metadata.rating}/5</span>
                                                </div>
                                            )}
                                            {event.metadata.duration && (
                                                <p>
                                                    Duration: {formatTimelineDuration(
                                                        event.metadata.duration.start,
                                                        event.metadata.duration.end
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(event.event_time), 'PPpp')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
