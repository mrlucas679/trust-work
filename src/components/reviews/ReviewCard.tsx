import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewWithProfiles } from '@/types/reviews';
import { format } from 'date-fns';

// Legacy props interface for gig reviews
interface LegacyReviewCardProps {
    reviewerName: string;
    reviewerAvatar?: string;
    reviewerRole?: "Job Seeker" | "Employer";
    date: string;
    overallRating: number;
    communicationRating?: number;
    qualityRating?: number;
    timelinessRating?: number;
    professionalismRating?: number;
    reviewText?: string;
    skillsDemonstrated?: string[];
    wouldWorkAgain?: boolean;
    helpful?: number;
    className?: string;
}

// New props interface for job employment reviews
interface JobReviewCardProps {
    review: ReviewWithProfiles;
    showReviewee?: boolean;
    className?: string;
}

type ReviewCardProps = LegacyReviewCardProps | JobReviewCardProps;

// Type guard to check if props are for job employment review
function isJobReviewProps(props: ReviewCardProps): props is JobReviewCardProps {
    return 'review' in props;
}

/**
 * ReviewCard Component
 * 
 * Displays either a gig review (legacy) or job employment review (Phase 10)
 * Supports expandable review text for long reviews
 */
const ReviewCard = (props: ReviewCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Handle job employment reviews (new format)
    if (isJobReviewProps(props)) {
        const { review, showReviewee = false, className } = props;
        const displayPerson = showReviewee ? review.reviewee_profile : review.reviewer_profile;
        const displayName = displayPerson?.display_name || displayPerson?.full_name || displayPerson?.email?.split('@')[0] || 'Anonymous';
        const isEmployer = review.reviewer_type === 'employer';

        // Calculate overall rating from component ratings
        const ratings = isEmployer
            ? [
                review.technical_skills_rating,
                review.communication_rating,
                review.work_quality_rating,
                review.professionalism_rating
              ].filter(r => r !== null) as number[]
            : [
                review.work_environment_rating,
                review.management_rating,
                review.compensation_rating,
                review.career_growth_rating
              ].filter(r => r !== null) as number[];

        const overallRating = review.overall_rating || (
            ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
        );

        return (
            <Card className={cn("hover:shadow-md transition-shadow", className)}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage 
                                    src={displayPerson?.avatar_url} 
                                    alt={displayName} 
                                />
                                <AvatarFallback>
                                    {displayName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm">{displayName}</h4>
                                    <Badge variant="outline" className="text-xs">
                                        {showReviewee 
                                            ? (isEmployer ? 'Employee' : 'Employer')
                                            : (isEmployer ? 'Employer' : 'Employee')
                                        }
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={cn(
                                            "h-5 w-5",
                                            star <= overallRating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                                {overallRating.toFixed(1)}/5.0
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Employer reviewing employee */}
                    {isEmployer && (
                        <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                            {review.technical_skills_rating && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Technical Skills</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-3 w-3",
                                                    star <= review.technical_skills_rating!
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {review.communication_rating && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Communication</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-3 w-3",
                                                    star <= review.communication_rating!
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {review.work_quality_rating && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Work Quality</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-3 w-3",
                                                    star <= review.work_quality_rating!
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {review.professionalism_rating && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Professionalism</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-3 w-3",
                                                    star <= review.professionalism_rating!
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Employee reviewing employer */}
                    {!isEmployer && (
                        <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                            {review.work_environment_rating && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Work Environment</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-3 w-3",
                                                    star <= review.work_environment_rating!
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {review.management_rating && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Management</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-3 w-3",
                                                    star <= review.management_rating!
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {review.compensation_rating && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Compensation</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-3 w-3",
                                                    star <= review.compensation_rating!
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {review.career_growth_rating && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Career Growth</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-3 w-3",
                                                    star <= review.career_growth_rating!
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Review text */}
                    {review.review_text && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {review.review_text.length > 200 && !isExpanded
                                    ? review.review_text.slice(0, 200) + "..."
                                    : review.review_text}
                            </p>
                            {review.review_text.length > 200 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="h-8 px-2 text-xs"
                                >
                                    {isExpanded ? (
                                        <>
                                            <ChevronUp className="h-3 w-3 mr-1" />
                                            Show less
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-3 w-3 mr-1" />
                                            Read more
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Would recommend badge */}
                    {review.would_recommend && (
                        <div className="flex items-center gap-2 pt-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Would recommend
                            </Badge>
                        </div>
                    )}

                    {/* Helpful counter */}
                    {review.helpful_count > 0 && (
                        <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                                {review.helpful_count} {review.helpful_count === 1 ? "person" : "people"} found this helpful
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Handle legacy gig reviews (original format)
    const {
        reviewerName,
        reviewerAvatar,
        reviewerRole,
        date,
        overallRating,
        communicationRating,
        qualityRating,
        timelinessRating,
        professionalismRating,
        reviewText,
        skillsDemonstrated,
        wouldWorkAgain,
        helpful,
        className
    } = props;

    // Helper to render star rating
    const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
        const sizeClasses = {
            sm: "h-3 w-3",
            md: "h-4 w-4",
            lg: "h-5 w-5"
        };

        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            sizeClasses[size],
                            star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                        )}
                    />
                ))}
            </div>
        );
    };

    // Truncate text for preview
    const shouldTruncate = reviewText && reviewText.length > 200;
    const displayText = shouldTruncate && !isExpanded
        ? reviewText.slice(0, 200) + "..."
        : reviewText;

    return (
        <Card className={cn("hover:shadow-md transition-shadow", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={reviewerAvatar} alt={reviewerName} />
                            <AvatarFallback>
                                {reviewerName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{reviewerName}</h4>
                                {reviewerRole && (
                                    <Badge variant="outline" className="text-xs">
                                        {reviewerRole}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{date}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        {renderStars(overallRating, "lg")}
                        <span className="text-xs font-medium text-muted-foreground">
                            {overallRating.toFixed(1)}/5.0
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Breakdown ratings */}
                {(communicationRating || qualityRating || timelinessRating || professionalismRating) && (
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                        {communicationRating && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Communication</span>
                                {renderStars(communicationRating, "sm")}
                            </div>
                        )}
                        {qualityRating && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Quality</span>
                                {renderStars(qualityRating, "sm")}
                            </div>
                        )}
                        {timelinessRating && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Timeliness</span>
                                {renderStars(timelinessRating, "sm")}
                            </div>
                        )}
                        {professionalismRating && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Professionalism</span>
                                {renderStars(professionalismRating, "sm")}
                            </div>
                        )}
                    </div>
                )}

                {/* Review text */}
                {reviewText && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {displayText}
                        </p>
                        {shouldTruncate && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-8 px-2 text-xs"
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="h-3 w-3 mr-1" />
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3 w-3 mr-1" />
                                        Read more
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}

                {/* Would work again badge */}
                {wouldWorkAgain && (
                    <div className="flex items-center gap-2 pt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Would work again
                        </Badge>
                    </div>
                )}

                {/* Skills demonstrated */}
                {skillsDemonstrated && skillsDemonstrated.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Skills Demonstrated:</p>
                        <div className="flex flex-wrap gap-2">
                            {skillsDemonstrated.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Helpful counter */}
                {helpful !== undefined && helpful > 0 && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            {helpful} {helpful === 1 ? "person" : "people"} found this helpful
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReviewCard;
