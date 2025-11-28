/**
 * @fileoverview MilestoneTracker - Track and manage gig milestones
 * TrustWork Platform - Milestone Progress UI
 */

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Link as LinkIcon,
  RotateCcw,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMilestones, useMilestoneStats } from '@/hooks/use-gig-lifecycle';
import type { IGigMilestone, MilestoneStatus } from '@/types/gig';

interface MilestoneTrackerProps {
  gigId: string;
  isClient: boolean;
  onSubmitMilestone?: (milestone: IGigMilestone) => void;
  onApproveMilestone?: (milestone: IGigMilestone) => void;
  onRejectMilestone?: (milestone: IGigMilestone) => void;
  onRequestRevision?: (milestone: IGigMilestone) => void;
  onReleasePayment?: (milestone: IGigMilestone) => void;
  className?: string;
}

const statusConfig: Record<MilestoneStatus, { 
  label: string; 
  color: string; 
  icon: React.ElementType;
  bgColor: string;
}> = {
  pending: { 
    label: 'Pending', 
    color: 'text-gray-500', 
    icon: Clock,
    bgColor: 'bg-gray-100'
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'text-blue-500', 
    icon: Clock,
    bgColor: 'bg-blue-100'
  },
  submitted: { 
    label: 'Submitted', 
    color: 'text-yellow-600', 
    icon: Upload,
    bgColor: 'bg-yellow-100'
  },
  approved: { 
    label: 'Approved', 
    color: 'text-green-500', 
    icon: CheckCircle2,
    bgColor: 'bg-green-100'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'text-red-500', 
    icon: AlertCircle,
    bgColor: 'bg-red-100'
  },
  revision_requested: { 
    label: 'Revision Needed', 
    color: 'text-orange-500', 
    icon: RotateCcw,
    bgColor: 'bg-orange-100'
  },
};

export function MilestoneTracker({
  gigId,
  isClient,
  onSubmitMilestone,
  onApproveMilestone,
  onRejectMilestone,
  onRequestRevision,
  onReleasePayment,
  className,
}: MilestoneTrackerProps) {
  const { data: milestones, isLoading: milestonesLoading } = useMilestones(gigId);
  const { data: stats, isLoading: statsLoading } = useMilestoneStats(gigId);
  const [expandedMilestone, setExpandedMilestone] = React.useState<string | null>(null);

  if (milestonesLoading || statsLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-2 bg-gray-200 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No milestones defined for this gig.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Project Milestones</CardTitle>
          {stats && (
            <Badge variant="outline" className="text-sm">
              {stats.completed}/{stats.total} Complete
            </Badge>
          )}
        </div>
        {stats && (
          <div className="space-y-2">
            <Progress value={stats.percentageComplete} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.percentageComplete}% Complete</span>
              <span>{formatCurrency(stats.releasedAmount)} / {formatCurrency(stats.totalAmount)} Released</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.map((milestone, index) => {
          const config = statusConfig[milestone.status];
          const StatusIcon = config.icon;
          const isExpanded = expandedMilestone === milestone.id;
          
          return (
            <Collapsible
              key={milestone.id}
              open={isExpanded}
              onOpenChange={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
            >
              <div 
                className={cn(
                  'border rounded-lg transition-colors',
                  milestone.status === 'approved' && 'border-green-200 bg-green-50/50',
                  milestone.status === 'submitted' && 'border-yellow-200 bg-yellow-50/50',
                  milestone.status === 'revision_requested' && 'border-orange-200 bg-orange-50/50',
                )}
              >
                <CollapsibleTrigger asChild>
                  <div className="p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          config.bgColor
                        )}>
                          <StatusIcon className={cn('h-4 w-4', config.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {index + 1}. {milestone.title}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {milestone.percentage}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(milestone.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-xs', config.bgColor, config.color)}>
                          {config.label}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 space-y-4">
                    {/* Description */}
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    )}

                    {/* Due Date */}
                    {milestone.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Deliverables */}
                    {milestone.deliverable_files && milestone.deliverable_files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Deliverables:</p>
                        <div className="space-y-1">
                          {milestone.deliverable_files.map((file, i) => (
                            <a
                              key={i}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              {file.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {milestone.deliverable_links && milestone.deliverable_links.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Links:</p>
                        <div className="space-y-1">
                          {milestone.deliverable_links.map((link, i) => (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              <LinkIcon className="h-4 w-4" />
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submission Notes */}
                    {milestone.submission_notes && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-blue-700">Freelancer Notes:</p>
                        <p className="text-sm text-blue-600">{milestone.submission_notes}</p>
                      </div>
                    )}

                    {/* Client Notes / Revision Request */}
                    {milestone.client_notes && (
                      <div className={cn(
                        'p-3 rounded-md',
                        milestone.status === 'revision_requested' ? 'bg-orange-50' : 'bg-gray-50'
                      )}>
                        <p className={cn(
                          'text-sm font-medium',
                          milestone.status === 'revision_requested' ? 'text-orange-700' : 'text-gray-700'
                        )}>
                          {milestone.status === 'revision_requested' ? 'Revision Request:' : 'Client Notes:'}
                        </p>
                        <p className={cn(
                          'text-sm',
                          milestone.status === 'revision_requested' ? 'text-orange-600' : 'text-gray-600'
                        )}>
                          {milestone.client_notes}
                        </p>
                      </div>
                    )}

                    {/* Revision Count */}
                    {milestone.revision_count > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Revisions: {milestone.revision_count} / {milestone.max_revisions}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {/* Freelancer Actions */}
                      {!isClient && (
                        <>
                          {(milestone.status === 'pending' || milestone.status === 'in_progress' || milestone.status === 'revision_requested') && (
                            <Button
                              size="sm"
                              onClick={() => onSubmitMilestone?.(milestone)}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Submit Deliverable
                            </Button>
                          )}
                        </>
                      )}

                      {/* Client Actions */}
                      {isClient && (
                        <>
                          {milestone.status === 'submitted' && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => onApproveMilestone?.(milestone)}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Approve this milestone and proceed to payment release
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onRequestRevision?.(milestone)}
                                disabled={milestone.revision_count >= milestone.max_revisions}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Request Revision
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onRejectMilestone?.(milestone)}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {milestone.status === 'approved' && !milestone.payment_released && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => onReleasePayment?.(milestone)}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Release Payment ({formatCurrency(milestone.amount)})
                            </Button>
                          )}

                          {milestone.payment_released && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Payment Released
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default MilestoneTracker;
