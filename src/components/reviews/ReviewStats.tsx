/**
 * ReviewStats Component
 * Displays aggregated review statistics for a user
 * Shows overall rating, total reviews, and breakdown by role
 */

import { useQuery } from '@tanstack/react-query';
import { Star, TrendingUp, Users, Briefcase, UserCheck } from 'lucide-react';
import { getUserReviewStats, getUserRatingDistribution } from '@/lib/api/job-reviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewStatsProps {
  userId: string;
  showDetailed?: boolean;
}

export function ReviewStats({ userId, showDetailed = true }: ReviewStatsProps) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['review-stats', userId],
    queryFn: () => getUserReviewStats(userId),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: distribution, isLoading: distLoading } = useQuery({
    queryKey: ['rating-distribution', userId],
    queryFn: () => getUserRatingDistribution(userId),
    enabled: showDetailed,
    staleTime: 5 * 60 * 1000
  });

  if (statsLoading) {
    return <ReviewStatsSkeleton />;
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No reviews yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalReviews = stats.total_reviews;
  const avgRating = stats.average_rating;

  return (
    <div className="space-y-6">
      {/* Overall Rating Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            Overall Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            {showDetailed && !distLoading && distribution && (
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = distribution[rating] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium w-8">{rating}★</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Breakdown */}
      {showDetailed && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* As Employee */}
          {stats.as_employee_count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCheck className="h-4 w-4" />
                  As Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {stats.as_employee_rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(stats.as_employee_rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-muted-foreground">
                      {stats.as_employee_count}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.as_employee_count === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Reviews from employers about work performance
                </p>
              </CardContent>
            </Card>
          )}

          {/* As Employer */}
          {stats.as_employer_count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4" />
                  As Employer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {stats.as_employer_rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(stats.as_employer_rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-muted-foreground">
                      {stats.as_employer_count}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.as_employer_count === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Reviews from employees about work environment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Trust Indicator */}
      {avgRating >= 4.5 && totalReviews >= 10 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                Highly Rated Professional
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Consistently excellent reviews from the community
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewStatsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Skeleton className="h-16 w-16 mx-auto" />
              <Skeleton className="h-4 w-24 mt-2 mx-auto" />
              <Skeleton className="h-3 w-16 mt-1 mx-auto" />
            </div>
            <div className="flex-1 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-2 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
