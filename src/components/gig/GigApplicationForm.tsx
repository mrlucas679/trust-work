/**
 * @fileoverview GigApplicationForm - Form for applying to gigs
 * TrustWork Platform - Gig Application Form
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { IGig, IMilestoneBase } from '@/types/gig';

const applicationSchema = z.object({
  proposal: z.string().min(100, 'Proposal must be at least 100 characters'),
  bidAmount: z.number().min(1, 'Bid amount is required'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
  coverLetter: z.string().optional(),
  portfolioLinks: z.array(z.string().url('Invalid URL')).optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface GigApplicationFormProps {
  gig: IGig;
  onSubmit: (data: ApplicationFormData & { milestoneProposal?: IMilestoneBase[] }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function GigApplicationForm({
  gig,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: GigApplicationFormProps) {
  const [portfolioLinks, setPortfolioLinks] = React.useState<string[]>(['']);
  const [milestoneProposal, setMilestoneProposal] = React.useState<IMilestoneBase[]>(
    gig.milestones || []
  );

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      proposal: '',
      bidAmount: gig.budget_type === 'fixed' ? gig.budget_min : undefined,
      estimatedDuration: gig.estimated_duration || '',
      coverLetter: '',
      portfolioLinks: [],
    },
  });

  const handleAddLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };

  const handleRemoveLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...portfolioLinks];
    newLinks[index] = value;
    setPortfolioLinks(newLinks);
  };

  const handleMilestoneChange = (index: number, field: keyof IMilestoneBase, value: string | number) => {
    const newMilestones = [...milestoneProposal];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestoneProposal(newMilestones);
  };

  const handleSubmit = (data: ApplicationFormData) => {
    const validLinks = portfolioLinks.filter(link => link.trim() !== '');
    
    onSubmit({
      ...data,
      portfolioLinks: validLinks.length > 0 ? validLinks : undefined,
      milestoneProposal: milestoneProposal.length > 0 ? milestoneProposal : undefined,
    });
  };

  const totalMilestonePercentage = milestoneProposal.reduce(
    (sum, m) => sum + (m.percentage || 0),
    0
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Proposal */}
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe how you'll complete this gig, your relevant experience, and why you're the best fit..."
                  rows={6}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                Minimum 100 characters. Be specific about your approach and timeline.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bid Amount */}
        <FormField
          control={form.control}
          name="bidAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Bid Amount (ZAR) *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={gig.budget_min}
                  max={gig.budget_type === 'range' ? gig.budget_max : undefined}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  disabled={gig.budget_type === 'fixed'}
                />
              </FormControl>
              <FormDescription>
                {gig.budget_type === 'fixed'
                  ? `Fixed budget: R${gig.budget_min.toLocaleString()}`
                  : `Budget range: R${gig.budget_min.toLocaleString()} - R${gig.budget_max.toLocaleString()}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estimated Duration */}
        <FormField
          control={form.control}
          name="estimatedDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., 2 weeks, 1 month, 3-4 days"
                />
              </FormControl>
              <FormDescription>
                How long will it take you to complete this project?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cover Letter */}
        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add a personal message to the client..."
                  rows={4}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Portfolio Links */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Portfolio Links (Optional)</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLink}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          </div>
          <div className="space-y-2">
            {portfolioLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder="https://example.com/portfolio"
                    type="url"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLink(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <FormDescription>
            <LinkIcon className="h-3.5 w-3.5 inline mr-1" />
            Add links to relevant work samples or portfolio pieces
          </FormDescription>
        </div>

        {/* Milestone Proposal */}
        {gig.milestones && gig.milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Milestone Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and adjust the milestone breakdown if needed
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestoneProposal.map((milestone, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Milestone {index + 1}</h4>
                    <Badge variant="outline">{milestone.percentage}%</Badge>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) =>
                        handleMilestoneChange(index, 'description', e.target.value)
                      }
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Percentage</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={milestone.percentage}
                        onChange={(e) =>
                          handleMilestoneChange(index, 'percentage', parseFloat(e.target.value))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <Input
                        type="date"
                        value={milestone.dueDate?.split('T')[0] || ''}
                        onChange={(e) =>
                          handleMilestoneChange(index, 'dueDate', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {totalMilestonePercentage !== 100 && (
                <p className="text-sm text-destructive">
                  ⚠️ Milestone percentages must add up to 100% (Currently: {totalMilestonePercentage}%)
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || (milestoneProposal.length > 0 && totalMilestonePercentage !== 100)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
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
        </div>
      </form>
    </Form>
  );
}

export default GigApplicationForm;
