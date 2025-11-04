/**
 * Review List
 * 
 * Displays a list of reviews with:
 * - Filtering options
 * - Empty state
 * - Loading state
 */

import { ReviewCard } from './ReviewCard';
import { Loader2 } from 'lucide-react';
import type { ReviewWithProfiles } from '@/types/workflow';

interface ReviewListProps {
    reviews: ReviewWithProfiles[];
    isLoading?: boolean;
    currentUserId?: string;
    onHelpful?: (reviewId: string) => void;
    emptyMessage?: string;
    className?: string;
}

export function ReviewList({
    reviews,
    isLoading = false,
    currentUserId,
    onHelpful,
    emptyMessage = 'No reviews yet',
    className,
}: ReviewListProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="space-y-4">
                {reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        review={review}
                        currentUserId={currentUserId}
                        onHelpful={onHelpful}
                    />
                ))}
            </div>
        </div>
    );
}
