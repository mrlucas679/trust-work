/**
 * Review Card
 * 
 * Displays a single review with:
 * - Star rating
 * - Review text
 * - Reviewer information
 * - Helpful button
 * - Edit option (for reviewer within 7 days)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Star, ThumbsUp, Edit2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ReviewForm } from './ReviewForm';
import { useUpdateReview } from '@/hooks/useWorkflow';
import { useToast } from '@/hooks/use-toast';
import type { ReviewWithProfiles } from '@/types/workflow';

interface ReviewCardProps {
    review: ReviewWithProfiles;
    currentUserId?: string;
    onHelpful?: (reviewId: string) => void;
    className?: string;
}

export function ReviewCard({
    review,
    currentUserId,
    onHelpful,
    className
}: ReviewCardProps) {
    const { toast } = useToast();
    const [showEditDialog, setShowEditDialog] = useState(false);
    const updateReview = useUpdateReview();

    // Check if current user is the reviewer
    const isReviewer = currentUserId === review.reviewer_id;

    // Check if review is editable (within 7 days)
    const createdAt = new Date(review.created_at);
    const daysSinceCreated = Math.floor(
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isEditable = isReviewer && daysSinceCreated <= 7;

    const handleEditSubmit = async (rating: number, reviewText: string) => {
        const result = await updateReview.mutateAsync({
            reviewId: review.id,
            input: { rating, review_text: reviewText },
            assignmentId: review.assignment_id,
        });

        if (result.review) {
            toast({
                title: 'Review updated',
                description: 'Your review has been updated successfully.',
            });
            setShowEditDialog(false);
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Failed to update review',
                variant: 'destructive',
            });
        }
    };

    return (
        <>
            <Card className={className}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={review.reviewer.avatar_url} alt={review.reviewer.display_name} />
                            <AvatarFallback>
                                {review.reviewer.display_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{review.reviewer.display_name}</h4>
                                {review.reviewer.verified && (
                                    <Badge variant="secondary" className="gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                    </Badge>
                                )}
                            </div>

                            {/* Star Rating */}
                            <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            'h-4 w-4',
                                            i < review.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        )}
                                    />
                                ))}
                                <span className="ml-1 text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    {isEditable && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEditDialog(true)}
                            className="gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Review Text */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {review.review_text}
                    </p>

                    {/* Assignment Info */}
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            Assignment: <span className="font-medium">{review.assignment.title}</span>
                        </p>
                    </div>

                    {/* Helpful Button */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onHelpful?.(review.id)}
                            className="gap-2"
                        >
                            <ThumbsUp className="h-4 w-4" />
                            Helpful ({review.helpful_count})
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Review</DialogTitle>
                        <DialogDescription>
                            You can edit your review within 7 days of posting.
                        </DialogDescription>
                    </DialogHeader>

                    <ReviewForm
                        assignmentId={review.assignment_id}
                        revieweeId={review.reviewee_id}
                        reviewerType={review.reviewer_type}
                        initialRating={review.rating}
                        initialText={review.review_text}
                        isEditing
                        onSubmit={handleEditSubmit}
                        onCancel={() => setShowEditDialog(false)}
                        submitLabel="Update Review"
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
