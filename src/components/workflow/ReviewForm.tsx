/**
 * Review Form
 * 
 * Form for creating or editing assignment reviews
 * - Star rating (1-5)
 * - Review text (10-2000 characters)
 * - Client-side validation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateReviewInput, getRatingLabel } from '@/types/workflow';
import type { ReviewRating, ReviewerType } from '@/types/workflow';

interface ReviewFormProps {
    assignmentId: string;
    revieweeId: string;
    reviewerType: ReviewerType;
    initialRating?: ReviewRating;
    initialText?: string;
    isEditing?: boolean;
    onSubmit: (rating: ReviewRating, reviewText: string) => Promise<void>;
    onCancel?: () => void;
    submitLabel?: string;
}

export function ReviewForm({
    assignmentId,
    revieweeId,
    reviewerType,
    initialRating,
    initialText = '',
    isEditing = false,
    onSubmit,
    onCancel,
    submitLabel = 'Submit Review',
}: ReviewFormProps) {
    const [rating, setRating] = useState<ReviewRating>(initialRating || 5);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [reviewText, setReviewText] = useState(initialText);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate input
        const validationErrors = validateReviewInput({
            assignment_id: assignmentId,
            reviewee_id: revieweeId,
            rating,
            review_text: reviewText,
            reviewer_type: reviewerType,
        });

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors([]);

        try {
            await onSubmit(rating, reviewText);
        } catch (error) {
            setErrors([error instanceof Error ? error.message : 'Failed to submit review']);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Selector */}
            <div className="space-y-3">
                <Label>Rating *</Label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value as ReviewRating)}
                            onMouseEnter={() => setHoveredRating(value)}
                            onMouseLeave={() => setHoveredRating(null)}
                            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                            aria-label={`Rate ${value} stars`}
                        >
                            <Star
                                className={cn(
                                    'h-8 w-8 transition-colors',
                                    (hoveredRating !== null ? value <= hoveredRating : value <= rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                )}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                        {getRatingLabel(hoveredRating !== null ? hoveredRating : rating)}
                    </span>
                </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
                <Label htmlFor="review-text">
                    Review *
                </Label>
                <Textarea
                    id="review-text"
                    placeholder="Share your experience with this assignment..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={6}
                    className="resize-none"
                    required
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Minimum 10 characters</span>
                    <span className={cn(
                        reviewText.length < 10 && 'text-destructive',
                        reviewText.length > 2000 && 'text-destructive'
                    )}>
                        {reviewText.length}/2000 characters
                    </span>
                </div>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
