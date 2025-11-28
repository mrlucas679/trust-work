/**
 * ReviewForm Component
 * Form for submitting job employment reviews (employee or employer)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReviewerType, CreateEmployeeReviewInput, CreateEmployerReviewInput } from '@/types/reviews';
import { REVIEW_TEXT_MIN_LENGTH, REVIEW_TEXT_MAX_LENGTH } from '@/types/reviews';
import { createJobReview } from '@/lib/api/job-reviews';
import { useToast } from '@/hooks/use-toast';

// Employee review schema (employee reviewing employer)
const employeeReviewSchema = z.object({
  work_environment_rating: z.number().min(1).max(5),
  management_rating: z.number().min(1).max(5),
  compensation_rating: z.number().min(1).max(5),
  career_growth_rating: z.number().min(1).max(5),
  review_text: z.string()
    .min(REVIEW_TEXT_MIN_LENGTH, `Review must be at least ${REVIEW_TEXT_MIN_LENGTH} characters`)
    .max(REVIEW_TEXT_MAX_LENGTH, `Review must be at most ${REVIEW_TEXT_MAX_LENGTH} characters`),
  would_recommend: z.boolean()
});

// Employer review schema (employer reviewing employee)
const employerReviewSchema = z.object({
  technical_skills_rating: z.number().min(1).max(5),
  communication_rating: z.number().min(1).max(5),
  work_quality_rating: z.number().min(1).max(5),
  professionalism_rating: z.number().min(1).max(5),
  review_text: z.string()
    .min(REVIEW_TEXT_MIN_LENGTH, `Review must be at least ${REVIEW_TEXT_MIN_LENGTH} characters`)
    .max(REVIEW_TEXT_MAX_LENGTH, `Review must be at most ${REVIEW_TEXT_MAX_LENGTH} characters`),
  would_recommend: z.boolean()
});

interface ReviewFormProps {
  applicationId: string;
  revieweeId: string;
  positionTitle: string;
  employmentDurationMonths: number;
  reviewWindowStart: string;
  reviewWindowEnd: string;
  reviewerType: ReviewerType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  applicationId,
  revieweeId,
  positionTitle,
  employmentDurationMonths,
  reviewWindowStart,
  reviewWindowEnd,
  reviewerType,
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = reviewerType === 'employee' ? employeeReviewSchema : employerReviewSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: reviewerType === 'employee'
      ? {
          work_environment_rating: 0,
          management_rating: 0,
          compensation_rating: 0,
          career_growth_rating: 0,
          review_text: '',
          would_recommend: true
        }
      : {
          technical_skills_rating: 0,
          communication_rating: 0,
          work_quality_rating: 0,
          professionalism_rating: 0,
          review_text: '',
          would_recommend: true
        }
  });

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
      {value === 0 && <p className="text-sm text-red-500">Please select a rating</p>}
    </div>
  );

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const reviewInput = {
        ...data,
        application_id: applicationId,
        reviewee_id: revieweeId,
        position_title: positionTitle,
        employment_duration_months: employmentDurationMonths,
        review_window_start: reviewWindowStart,
        review_window_end: reviewWindowEnd
      };

      await createJobReview(reviewInput, reviewerType);
      
      toast({
        title: 'Review submitted successfully',
        description: 'Your review has been submitted and will be visible after moderation.'
      });
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Failed to submit review',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {reviewerType === 'employee' ? 'Review Your Employer' : 'Review Your Employee'}
        </CardTitle>
        <p className="text-sm text-gray-500">
          Position: {positionTitle} • Duration: {employmentDurationMonths} months
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Categories */}
            <div className="space-y-4">
              {reviewerType === 'employee' ? (
                <>
                  <FormField
                    control={form.control}
                    name="work_environment_rating"
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label="Work Environment"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="management_rating"
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label="Management Quality"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="compensation_rating"
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label="Compensation & Benefits"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="career_growth_rating"
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label="Career Growth Opportunities"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="technical_skills_rating"
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label="Technical Skills"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="communication_rating"
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label="Communication Skills"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="work_quality_rating"
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label="Work Quality"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="professionalism_rating"
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label="Professionalism"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            {/* Review Text */}
            <FormField
              control={form.control}
              name="review_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormDescription>
                    Share your experience ({REVIEW_TEXT_MIN_LENGTH}-{REVIEW_TEXT_MAX_LENGTH} characters)
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your detailed review here..."
                      rows={6}
                      className="resize-none"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-gray-500">
                    <FormMessage />
                    <span>
                      {field.value.length}/{REVIEW_TEXT_MAX_LENGTH}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Would Recommend */}
            <FormField
              control={form.control}
              name="would_recommend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Would you recommend {reviewerType === 'employee' ? 'this employer' : 'this employee'}?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value ? 'yes' : 'no'}
                      onValueChange={(v) => field.onChange(v === 'yes')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
