/**
 * @fileoverview Dispute detail component
 * Displays full dispute information with timeline and evidence
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Image,
  Video,
  ExternalLink,
  User,
  Shield,
  Calendar,
  Scale,
  Gavel,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IDispute, DisputeStatus, DisputeReason, ResolutionDecision } from '@/types/gig';
import { format, formatDistanceToNow } from 'date-fns';

interface DisputeDetailProps {
  dispute: IDispute;
  currentUserId: string;
  onRespond?: () => void;
  onViewGig?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  DisputeStatus,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  open: {
    label: 'Open',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
  },
  under_review: {
    label: 'Under Review',
    icon: Scale,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
  },
  awaiting_response: {
    label: 'Awaiting Response',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/20',
  },
  escalated: {
    label: 'Escalated',
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/20',
  },
  closed: {
    label: 'Closed',
    icon: XCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10 border-gray-500/20',
  },
};

const REASON_LABELS: Record<DisputeReason, string> = {
  quality_issue: 'Quality Issue',
  non_delivery: 'Non-Delivery',
  scope_change: 'Scope Change',
  payment_issue: 'Payment Issue',
  communication_breakdown: 'Communication Breakdown',
  deadline_missed: 'Deadline Missed',
  unauthorized_use: 'Unauthorized Use',
  other: 'Other',
};

const RESOLUTION_CONFIG: Record<
  ResolutionDecision,
  { label: string; description: string; color: string }
> = {
  favor_freelancer: {
    label: 'In Favor of Freelancer',
    description: 'Payment released to freelancer',
    color: 'text-green-600',
  },
  favor_client: {
    label: 'In Favor of Client',
    description: 'Full refund issued to client',
    color: 'text-blue-600',
  },
  split_payment: {
    label: 'Split Payment',
    description: 'Payment divided between parties',
    color: 'text-purple-600',
  },
  no_fault: {
    label: 'No Fault',
    description: 'Neither party found at fault',
    color: 'text-gray-600',
  },
  mutual_agreement: {
    label: 'Mutual Agreement',
    description: 'Resolved through mutual agreement',
    color: 'text-green-600',
  },
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function DisputeDetail({
  dispute,
  currentUserId,
  onRespond,
  onViewGig,
  className,
}: DisputeDetailProps) {
  const statusConfig = STATUS_CONFIG[dispute.status];
  const StatusIcon = statusConfig.icon;
  const isInitiator = dispute.initiated_by === currentUserId;
  const isRespondent = dispute.respondent_id === currentUserId;
  const needsResponse = dispute.status === 'awaiting_response' && isRespondent;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn('p-3 rounded-full', statusConfig.bgColor)}>
                <StatusIcon className={cn('h-6 w-6', statusConfig.color)} />
              </div>
              <div>
                <CardTitle className="text-xl">{dispute.title}</CardTitle>
                <CardDescription className="mt-1">
                  Dispute #{dispute.id.slice(0, 8)} • Filed{' '}
                  {formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true })}
                </CardDescription>
              </div>
            </div>
            <Badge className={cn('text-sm', statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Gig Reference */}
          {dispute.gig && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Related Gig: <span className="font-medium">{dispute.gig.title}</span>
                </span>
              </div>
              {onViewGig && (
                <Button variant="ghost" size="sm" onClick={onViewGig}>
                  View Gig <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          )}

          {/* Reason Badge */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Reason:</span>
            <Badge variant="outline">{REASON_LABELS[dispute.reason]}</Badge>
          </div>

          {/* Response Deadline Warning */}
          {needsResponse && dispute.response_deadline && (
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-orange-600 dark:text-orange-400">
                    Response Required
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please respond by{' '}
                    {format(new Date(dispute.response_deadline), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {onRespond && (
                  <Button size="sm" onClick={onRespond} className="ml-auto">
                    Respond Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parties Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Parties Involved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            {/* Initiator */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={dispute.initiator?.avatar_url} />
                <AvatarFallback>
                  {getInitials(dispute.initiator?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{dispute.initiator?.full_name || 'Unknown'}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    Initiator
                  </Badge>
                  {isInitiator && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground" />

            {/* Respondent */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={dispute.respondent?.avatar_url} />
                <AvatarFallback>
                  {getInitials(dispute.respondent?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{dispute.respondent?.full_name || 'Unknown'}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    Respondent
                  </Badge>
                  {isRespondent && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Tabs */}
      <Card>
        <Tabs defaultValue="details">
          <CardHeader className="pb-0">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="evidence">
                Evidence ({dispute.evidence_files?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              {dispute.status === 'resolved' && (
                <TabsTrigger value="resolution">Resolution</TabsTrigger>
              )}
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Details Tab */}
            <TabsContent value="details" className="mt-0 space-y-6">
              <div>
                <h4 className="font-medium mb-2">Initiator's Statement</h4>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm whitespace-pre-wrap">{dispute.description}</p>
                </div>
              </div>

              {dispute.respondent_evidence && (
                <div>
                  <h4 className="font-medium mb-2">Respondent's Response</h4>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm whitespace-pre-wrap">{dispute.respondent_evidence}</p>
                  </div>
                </div>
              )}

              {!dispute.respondent_evidence && dispute.status === 'awaiting_response' && (
                <div className="rounded-lg border-2 border-dashed p-6 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Awaiting response from the respondent
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Evidence Tab */}
            <TabsContent value="evidence" className="mt-0">
              {dispute.evidence_files && dispute.evidence_files.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {dispute.evidence_files.map((evidence) => {
                    const Icon =
                      evidence.type === 'image' || evidence.type === 'screenshot'
                        ? Image
                        : evidence.type === 'video'
                        ? Video
                        : FileText;

                    return (
                      <div
                        key={evidence.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 rounded-md bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{evidence.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {evidence.description || `Uploaded ${format(new Date(evidence.uploaded_at), 'MMM d, yyyy')}`}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No evidence files uploaded</p>
                </div>
              )}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-0">
              <div className="space-y-4">
                <TimelineItem
                  icon={AlertTriangle}
                  title="Dispute Filed"
                  description={`Filed by ${dispute.initiator?.full_name || 'user'}`}
                  date={dispute.created_at}
                  color="text-orange-500"
                />

                {dispute.status !== 'open' && (
                  <TimelineItem
                    icon={Scale}
                    title="Under Review"
                    description="Dispute is being reviewed by TrustWork"
                    date={dispute.reviewed_at || dispute.updated_at}
                    color="text-blue-500"
                  />
                )}

                {dispute.respondent_evidence && (
                  <TimelineItem
                    icon={MessageSquare}
                    title="Response Received"
                    description={`${dispute.respondent?.full_name || 'Respondent'} submitted their response`}
                    date={dispute.updated_at}
                    color="text-purple-500"
                  />
                )}

                {dispute.status === 'resolved' && dispute.resolved_at && (
                  <TimelineItem
                    icon={Gavel}
                    title="Dispute Resolved"
                    description={dispute.resolution_summary || 'The dispute has been resolved'}
                    date={dispute.resolved_at}
                    color="text-green-500"
                  />
                )}
              </div>
            </TabsContent>

            {/* Resolution Tab */}
            {dispute.status === 'resolved' && dispute.resolution_decision && (
              <TabsContent value="resolution" className="mt-0">
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Gavel className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className={cn('font-semibold', RESOLUTION_CONFIG[dispute.resolution_decision].color)}>
                          {RESOLUTION_CONFIG[dispute.resolution_decision].label}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {RESOLUTION_CONFIG[dispute.resolution_decision].description}
                        </p>
                      </div>
                    </div>

                    {dispute.payment_adjustment && dispute.payment_adjustment > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-md bg-background/50">
                        <span className="text-sm">Payment Adjustment</span>
                        <span className="font-semibold">
                          R{dispute.payment_adjustment.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {dispute.resolution_summary && (
                    <div>
                      <h4 className="font-medium mb-2">Resolution Summary</h4>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm whitespace-pre-wrap">{dispute.resolution_summary}</p>
                      </div>
                    </div>
                  )}

                  {dispute.resolved_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Resolved on {format(new Date(dispute.resolved_at), 'MMMM d, yyyy')}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  title,
  description,
  date,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  date: string;
  color: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn('p-2 rounded-full bg-muted', color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="w-px h-full bg-border mt-2" />
      </div>
      <div className="pb-6">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(date), 'MMM d, yyyy h:mm a')}
        </p>
      </div>
    </div>
  );
}

export default DisputeDetail;
