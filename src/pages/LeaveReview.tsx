/**
 * LeaveReview Page
 * Allows employers and employees to submit reviews after employment ends
 * Part of Phase 10: Post-Employment Reviews
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/SupabaseProvider';
import { 
  createJobReview, 
  canUserReview,
  getPendingReviewOpportunities 
} from '@/lib/api/job-reviews';
import { getAssignment } from '@/lib/api/assignments';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Star,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function LeaveReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const applicationId = searchParams.get('application');
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(applicationId);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get pending review opportunities
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['pending-reviews', user?.id],
    queryFn: getPendingReviewOpportunities,
    enabled: !!user
  });

  // Get assignment details if application ID provided
  const { data: assignment } = useQuery({
    queryKey: ['assignment', opportunities.find(o => o.application_id === selectedOpportunity)?.assignment_id],
    queryFn: () => {
      const opp = opportunities.find(o => o.application_id === selectedOpportunity);
      return opp ? getAssignment(opp.assignment_id) : null;
    },
    enabled: !!selectedOpportunity && opportunities.length > 0
  });

  // Check if user can review selected application
  const { data: canReview = false } = useQuery({
    queryKey: ['can-review', selectedOpportunity],
    queryFn: () => canUserReview(selectedOpportunity!),
    enabled: !!selectedOpportunity
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: createJobReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      setSubmitSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
  });

  // Auto-select first opportunity if none selected
  useEffect(() => {
    if (!selectedOpportunity && opportunities.length > 0) {
      setSelectedOpportunity(opportunities[0].application_id);
    }
  }, [opportunities, selectedOpportunity]);

  if (opportunitiesLoading) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Loading review opportunities...</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (submitSuccess) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold mb-2">Review Submitted Successfully!</h2>
              <p className="text-muted-foreground mb-4">
                Thank you for sharing your feedback. Your review helps build trust in our community.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (opportunities.length === 0) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No Pending Reviews</h2>
              <p className="text-muted-foreground mb-6">
                You don't have any completed employment relationships to review at this time.
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Reviews can be submitted within 30 days after employment ends.
                  You'll be notified when you have opportunities to leave reviews.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const currentOpportunity = opportunities.find(o => o.application_id === selectedOpportunity);
  
  if (!currentOpportunity) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Selected review opportunity not found. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(currentOpportunity.review_window_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leave a Review</h1>
          <p className="text-muted-foreground">
            Share your experience to help build trust in our community
          </p>
        </div>

        {/* Review Window Alert */}
        {daysRemaining <= 7 && (
          <Alert className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              You have {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining to submit this review.
            </AlertDescription>
          </Alert>
        )}

        {/* Opportunity Selector (if multiple) */}
        {opportunities.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Select Employment to Review</CardTitle>
              <CardDescription>
                You have {opportunities.length} pending reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {opportunities.map((opp) => {
                  const oppDaysRemaining = Math.ceil(
                    (new Date(opp.review_window_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <button
                      key={opp.application_id}
                      onClick={() => setSelectedOpportunity(opp.application_id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedOpportunity === opp.application_id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {opp.is_employer ? (
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                            )}
                            <h3 className="font-semibold">{opp.job_title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {opp.is_employer ? 'Employee' : 'Employer'}: {opp.other_party_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {oppDaysRemaining} days left
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Ended {new Date(opp.employment_end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentOpportunity.job_title}</CardTitle>
                <CardDescription>
                  {currentOpportunity.is_employer ? 'Reviewing Employee' : 'Reviewing Employer'}:{' '}
                  {currentOpportunity.other_party_name}
                </CardDescription>
              </div>
              <Badge variant={currentOpportunity.is_employer ? 'default' : 'secondary'}>
                {currentOpportunity.is_employer ? 'As Employer' : 'As Employee'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Employment Ended:</span>
                <p className="font-medium">
                  {new Date(currentOpportunity.employment_end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Review Deadline:</span>
                <p className="font-medium">
                  {new Date(currentOpportunity.review_window_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        {canReview ? (
          <ReviewForm
            applicationId={currentOpportunity.application_id}
            revieweeId={currentOpportunity.is_employer 
              ? assignment?.employer_id || '' 
              : assignment?.freelancer_id || ''
            }
            reviewerType={currentOpportunity.is_employer ? 'employer' : 'employee'}
            jobTitle={currentOpportunity.job_title}
            employmentEndDate={currentOpportunity.employment_end_date}
            reviewWindowEnd={currentOpportunity.review_window_end}
            onSubmit={async (reviewData) => {
              await submitReviewMutation.mutateAsync(reviewData);
            }}
            isSubmitting={submitReviewMutation.isPending}
          />
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You cannot submit a review for this employment at this time. 
              This may be because you've already reviewed this person or the review window has expired.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AppLayout>
  );
}
