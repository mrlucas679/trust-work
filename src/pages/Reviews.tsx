import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, Flag, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Reviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    jobId: '',
    type: 'employer' // or 'jobseeker'
  });

  const reviews = [
    {
      id: 1,
      reviewer: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg",
        isEmployer: true,
        verified: true
      },
      reviewee: {
        name: "Alex Chen",
        type: "Job Seeker"
      },
      rating: 5,
      comment: "Excellent work quality and communication. Delivered the project on time and exceeded expectations. Highly recommended for web development projects.",
      date: "2024-01-15",
      jobTitle: "React Developer",
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      reviewer: {
        name: "Tech Solutions Inc",
        avatar: "/placeholder.svg",
        isEmployer: true,
        verified: true
      },
      reviewee: {
        name: "Maria Garcia",
        type: "Job Seeker"
      },
      rating: 4,
      comment: "Great attention to detail and professional attitude. Minor delays in communication but overall a positive experience.",
      date: "2024-01-10",
      jobTitle: "UI/UX Designer",
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      reviewer: {
        name: "David Kim",
        avatar: "/placeholder.svg",
        isEmployer: false,
        verified: true
      },
      reviewee: {
        name: "StartupCo",
        type: "Employer"
      },
      rating: 5,
      comment: "Amazing company culture and clear project requirements. Payment was prompt and the team was very supportive throughout the project.",
      date: "2024-01-08",
      jobTitle: "Full-Stack Developer",
      helpful: 15,
      verified: true
    }
  ];

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
              } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Review Submitted",
      description: "Your review has been submitted and will be visible after verification."
    });
    setShowReviewForm(false);
    setNewReview({ rating: 0, comment: '', jobId: '', type: 'employer' });
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'employers') return review.reviewee.type === 'Employer';
    if (filter === 'jobseekers') return review.reviewee.type === 'Job Seeker';
    return true;
  });

  return (
    <div className="bg-background">
      <div className="space-y-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reviews & Ratings</h1>
              <p className="text-muted-foreground">
                See what others are saying and share your experience
              </p>
            </div>
            <Button onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Review Type</label>
                  <select
                    value={newReview.type}
                    onChange={(e) => setNewReview({ ...newReview, type: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="employer">Review an Employer</option>
                    <option value="jobseeker">Review a Job Seeker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Job/Project ID</label>
                  <input
                    type="text"
                    value={newReview.jobId}
                    onChange={(e) => setNewReview({ ...newReview, jobId: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter the job or project ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  {renderStars(newReview.rating, true, (rating) =>
                    setNewReview({ ...newReview, rating })
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Review</label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Submit Review</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Reviews
          </Button>
          <Button
            variant={filter === 'employers' ? 'default' : 'outline'}
            onClick={() => setFilter('employers')}
            size="sm"
          >
            <Filter className="h-4 w-4 mr-1" />
            Employers
          </Button>
          <Button
            variant={filter === 'jobseekers' ? 'default' : 'outline'}
            onClick={() => setFilter('jobseekers')}
            size="sm"
          >
            <Filter className="h-4 w-4 mr-1" />
            Job Seekers
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={review.reviewer.avatar} />
                    <AvatarFallback>
                      {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{review.reviewer.name}</h3>
                      {review.reviewer.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        reviewed {review.reviewee.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        for {review.jobTitle}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        • {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm mb-4 text-muted-foreground">
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                      {review.verified && (
                        <Badge variant="outline" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                No reviews match your current filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reviews;