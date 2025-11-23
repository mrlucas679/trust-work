import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
    Star,
    ArrowLeft,
    Send,
    Loader2,
    CheckCircle,
    MessageSquare,
    TrendingUp,
    Clock,
    Award,
    ThumbsUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/providers/SupabaseProvider";
import { cn } from "@/lib/utils";
import { createReview } from "@/lib/api/reviews";

const COMMON_SKILLS = [
    "Communication",
    "Problem Solving",
    "Time Management",
    "Technical Skills",
    "Creativity",
    "Attention to Detail",
    "Teamwork",
    "Leadership",
    "Adaptability",
    "Work Ethic"
];

interface RatingCategory {
    key: "overall" | "communication" | "quality" | "timeliness" | "professionalism";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const RATING_CATEGORIES: RatingCategory[] = [
    {
        key: "overall",
        label: "Overall Experience",
        icon: Star,
        description: "Your overall satisfaction with working together"
    },
    {
        key: "communication",
        label: "Communication",
        icon: MessageSquare,
        description: "Responsiveness and clarity of communication"
    },
    {
        key: "quality",
        label: "Quality of Work",
        icon: TrendingUp,
        description: "Quality and accuracy of deliverables"
    },
    {
        key: "timeliness",
        label: "Timeliness",
        icon: Clock,
        description: "Meeting deadlines and time commitments"
    },
    {
        key: "professionalism",
        label: "Professionalism",
        icon: Award,
        description: "Professional conduct and work ethic"
    }
];

const ReviewSubmit = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useSupabase();

    const revieweeId = searchParams.get("userId");
    const revieweeName = searchParams.get("userName") || "User";
    const assignmentType = searchParams.get("type") as "job" | "gig" || "gig";

    const [ratings, setRatings] = useState({
        overall: 0,
        communication: 0,
        quality: 0,
        timeliness: 0,
        professionalism: 0
    });

    const [hoveredRatings, setHoveredRatings] = useState({
        overall: 0,
        communication: 0,
        quality: 0,
        timeliness: 0,
        professionalism: 0
    });

    const [reviewText, setReviewText] = useState("");
    const [wouldWorkAgain, setWouldWorkAgain] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRatingClick = (category: keyof typeof ratings, rating: number) => {
        setRatings(prev => ({ ...prev, [category]: rating }));
    };

    const handleRatingHover = (category: keyof typeof ratings, rating: number) => {
        setHoveredRatings(prev => ({ ...prev, [category]: rating }));
    };

    const handleRatingLeave = (category: keyof typeof ratings) => {
        setHoveredRatings(prev => ({ ...prev, [category]: 0 }));
    };

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const renderStars = (category: keyof typeof ratings) => {
        const currentRating = ratings[category];
        const hoverRating = hoveredRatings[category];
        const displayRating = hoverRating || currentRating;

        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(category, star)}
                        onMouseEnter={() => handleRatingHover(category, star)}
                        onMouseLeave={() => handleRatingLeave(category)}
                        className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                        <Star
                            className={cn(
                                "h-8 w-8 transition-colors",
                                star <= displayRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                            )}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                    {currentRating > 0 ? `${currentRating}/5` : "Not rated"}
                </span>
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !revieweeId || !id) {
            toast({
                title: "Error",
                description: "Missing required information to submit review.",
                variant: "destructive"
            });
            return;
        }

        // Validate that at least overall rating is provided
        if (ratings.overall === 0) {
            toast({
                title: "Rating Required",
                description: "Please provide at least an overall rating.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await createReview({
                assignment_id: id,
                reviewee_id: revieweeId,
                overall_rating: ratings.overall,
                communication_rating: ratings.communication || undefined,
                quality_rating: ratings.quality || undefined,
                timeliness_rating: ratings.timeliness || undefined,
                professionalism_rating: ratings.professionalism || undefined,
                review_text: reviewText.trim() || undefined,
                would_work_again: wouldWorkAgain,
                skills_demonstrated: selectedSkills.length > 0 ? selectedSkills : undefined
            });

            toast({
                title: "Review Submitted",
                description: `Thank you for reviewing ${revieweeName}!`
            });

            // Navigate back to the assignment or user profile
            navigate(`/profile/${revieweeId}`);
        } catch (error) {
            toast({
                title: "Failed to Submit Review",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = ratings.overall > 0 && !isSubmitting;

    return (
        <div className="container max-w-3xl py-8">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Star className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Write a Review</CardTitle>
                            <CardDescription>
                                Share your experience working with {revieweeName}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Rating Categories */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Rate Your Experience</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Click the stars to rate each category (5 stars is best)
                                </p>
                            </div>

                            {RATING_CATEGORIES.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <div key={category.key} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-base font-medium">
                                                {category.label}
                                                {category.key === "overall" && (
                                                    <span className="text-destructive ml-1">*</span>
                                                )}
                                            </Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {category.description}
                                        </p>
                                        {renderStars(category.key)}
                                    </div>
                                );
                            })}
                        </div>

                        <Separator />

                        {/* Review Text */}
                        <div className="space-y-3">
                            <Label htmlFor="review-text" className="text-base font-medium">
                                Write Your Review (Optional)
                            </Label>
                            <Textarea
                                id="review-text"
                                placeholder={`Share details about your experience working with ${revieweeName}. What did they do well? What could be improved?`}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={6}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                {reviewText.length}/1000 characters
                            </p>
                        </div>

                        <Separator />

                        {/* Would Work Again */}
                        <div className="flex items-start space-x-3 p-4 rounded-lg border bg-muted/30">
                            <Checkbox
                                id="work-again"
                                checked={wouldWorkAgain}
                                onCheckedChange={(checked) => setWouldWorkAgain(checked as boolean)}
                                className="mt-0.5"
                            />
                            <div className="space-y-1 flex-1">
                                <Label
                                    htmlFor="work-again"
                                    className="text-base font-medium cursor-pointer flex items-center gap-2"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    I would work with {revieweeName} again
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    This helps build trust in the community
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Skills Demonstrated */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">
                                Skills Demonstrated (Optional)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Select the skills that {revieweeName} demonstrated during this {assignmentType}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_SKILLS.map((skill) => (
                                    <Badge
                                        key={skill}
                                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                        className="cursor-pointer transition-colors hover:bg-primary/20"
                                        onClick={() => toggleSkill(skill)}
                                    >
                                        {selectedSkills.includes(skill) && (
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Info Alert */}
                        <Alert>
                            <AlertDescription className="text-sm">
                                Reviews are public and help build trust in the TrustWork community.
                                Please be honest and constructive in your feedback.
                            </AlertDescription>
                        </Alert>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Review
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReviewSubmit;
