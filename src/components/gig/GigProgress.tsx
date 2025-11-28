/**
 * @fileoverview GigProgress - Real-time progress dashboard for ongoing gigs
 * TrustWork Platform - Gig Lifecycle Component
 * 
 * Displays milestone progress, deliverables, timeline, and communication
 */

import { useState, useMemo } from 'react';
import { format, differenceInDays, isPast } from 'date-fns';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Flag,
  MessageSquare,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  User,
  Briefcase,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Activity,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { IGig, IGigMilestone, MilestoneStatus, GigStatus } from '@/types/gig';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface GigProgressProps {
  gig: IGig;
  milestones: IGigMilestone[];
  isClient: boolean;
  freelancerName?: string;
  freelancerAvatar?: string;
  clientName?: string;
  clientAvatar?: string;
  onViewMilestone?: (milestoneId: string) => void;
  onSendMessage?: () => void;
  onViewDispute?: () => void;
  className?: string;
}

interface TimelineEvent {
  id: string;
  type: 'milestone_started' | 'milestone_submitted' | 'milestone_approved' | 'revision_requested' | 'payment_released' | 'gig_started' | 'gig_completed';
  title: string;
  description?: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'pending';
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMilestoneStatusConfig(status: MilestoneStatus) {
  const configs: Record<MilestoneStatus, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
    pending: { 
      color: 'text-gray-500', 
      bgColor: 'bg-gray-100 dark:bg-gray-800', 
      icon: <Clock className="h-4 w-4" />,
      label: 'Pending'
    },
    in_progress: { 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-100 dark:bg-blue-900/30', 
      icon: <Play className="h-4 w-4" />,
      label: 'In Progress'
    },
    submitted: { 
      color: 'text-amber-500', 
      bgColor: 'bg-amber-100 dark:bg-amber-900/30', 
      icon: <FileText className="h-4 w-4" />,
      label: 'Submitted'
    },
    approved: { 
      color: 'text-green-500', 
      bgColor: 'bg-green-100 dark:bg-green-900/30', 
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: 'Approved'
    },
    rejected: { 
      color: 'text-red-500', 
      bgColor: 'bg-red-100 dark:bg-red-900/30', 
      icon: <AlertTriangle className="h-4 w-4" />,
      label: 'Rejected'
    },
    revision_requested: { 
      color: 'text-orange-500', 
      bgColor: 'bg-orange-100 dark:bg-orange-900/30', 
      icon: <Pause className="h-4 w-4" />,
      label: 'Revision Requested'
    },
  };
  return configs[status] || configs.pending;
}

function getGigStatusBadge(status: GigStatus) {
  const variants: Record<GigStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    draft: { variant: 'secondary', label: 'Draft' },
    open: { variant: 'outline', label: 'Open' },
    in_progress: { variant: 'default', label: 'In Progress' },
    completed: { variant: 'default', label: 'Completed' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
    disputed: { variant: 'destructive', label: 'Disputed' },
  };
  const config = variants[status] || variants.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function calculateOverallProgress(milestones: IGigMilestone[]): number {
  if (milestones.length === 0) return 0;
  
  const completedPercentage = milestones.reduce((acc, m) => {
    if (m.status === 'approved') return acc + m.percentage;
    if (m.status === 'submitted') return acc + (m.percentage * 0.8); // 80% for submitted
    if (m.status === 'in_progress') return acc + (m.percentage * 0.3); // 30% for in progress
    return acc;
  }, 0);
  
  return Math.min(Math.round(completedPercentage), 100);
}

function generateTimeline(gig: IGig, milestones: IGigMilestone[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  
  // Gig started event
  if (gig.started_at) {
    events.push({
      id: 'gig_started',
      type: 'gig_started',
      title: 'Gig Started',
      description: 'Work has begun on this gig',
      timestamp: gig.started_at,
      status: 'success',
    });
  }
  
  // Milestone events
  milestones.forEach(milestone => {
    if (milestone.started_at) {
      events.push({
        id: `milestone_started_${milestone.id}`,
        type: 'milestone_started',
        title: `${milestone.title} started`,
        timestamp: milestone.started_at,
        status: 'pending',
      });
    }
    
    if (milestone.submitted_at) {
      events.push({
        id: `milestone_submitted_${milestone.id}`,
        type: 'milestone_submitted',
        title: `${milestone.title} submitted`,
        description: 'Awaiting client review',
        timestamp: milestone.submitted_at,
        status: 'warning',
      });
    }
    
    if (milestone.approved_at) {
      events.push({
        id: `milestone_approved_${milestone.id}`,
        type: 'milestone_approved',
        title: `${milestone.title} approved`,
        description: `R${milestone.amount.toLocaleString()} released`,
        timestamp: milestone.approved_at,
        status: 'success',
      });
    }
    
    if (milestone.revision_requested && milestone.updated_at) {
      events.push({
        id: `revision_${milestone.id}`,
        type: 'revision_requested',
        title: `Revision requested for ${milestone.title}`,
        description: milestone.client_notes || 'Changes requested',
        timestamp: milestone.updated_at,
        status: 'warning',
      });
    }
  });
  
  // Gig completed event
  if (gig.completed_at) {
    events.push({
      id: 'gig_completed',
      type: 'gig_completed',
      title: 'Gig Completed',
      description: 'All milestones approved',
      timestamp: gig.completed_at,
      status: 'success',
    });
  }
  
  // Sort by timestamp descending (newest first)
  return events.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function GigProgress({
  gig,
  milestones,
  isClient,
  freelancerName,
  freelancerAvatar,
  clientName,
  clientAvatar,
  onViewMilestone,
  onSendMessage,
  onViewDispute,
  className,
}: GigProgressProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const overallProgress = useMemo(() => calculateOverallProgress(milestones), [milestones]);
  const timeline = useMemo(() => generateTimeline(gig, milestones), [gig, milestones]);
  
  const completedMilestones = milestones.filter(m => m.status === 'approved').length;
  const pendingReviewMilestones = milestones.filter(m => m.status === 'submitted').length;
  const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
  
  const totalBudget = gig.budget || milestones.reduce((sum, m) => sum + m.amount, 0);
  const releasedAmount = milestones
    .filter(m => m.payment_released)
    .reduce((sum, m) => sum + m.amount, 0);
  const escrowAmount = totalBudget - releasedAmount;
  
  const daysUntilDeadline = gig.deadline 
    ? differenceInDays(new Date(gig.deadline), new Date())
    : null;
  const isOverdue = gig.deadline ? isPast(new Date(gig.deadline)) && gig.status !== 'completed' : false;
  
  const counterpartyName = isClient ? freelancerName : clientName;
  const counterpartyAvatar = isClient ? freelancerAvatar : clientAvatar;
  const counterpartyRole = isClient ? 'Freelancer' : 'Client';

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{gig.title}</CardTitle>
                {getGigStatusBadge(gig.status)}
              </div>
              <CardDescription>{gig.category}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {counterpartyName && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={counterpartyAvatar} alt={counterpartyName} />
                    <AvatarFallback>
                      {counterpartyName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{counterpartyName}</p>
                    <p className="text-muted-foreground text-xs">{counterpartyRole}</p>
                  </div>
                </div>
              )}
              {onSendMessage && (
                <Button variant="outline" size="sm" onClick={onSendMessage}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-2xl font-bold">{completedMilestones}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-amber-600">
                <Clock className="h-4 w-4" />
                <span className="text-2xl font-bold">{pendingReviewMilestones}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pending Review</p>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <Play className="h-4 w-4" />
                <span className="text-2xl font-bold">{inProgressMilestones}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">In Progress</p>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className={cn(
                "flex items-center justify-center gap-1",
                isOverdue ? "text-red-600" : daysUntilDeadline && daysUntilDeadline <= 3 ? "text-amber-600" : "text-muted-foreground"
              )}>
                <Calendar className="h-4 w-4" />
                <span className="text-2xl font-bold">
                  {isOverdue ? 'Overdue' : daysUntilDeadline !== null ? `${daysUntilDeadline}d` : '-'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isOverdue ? 'Past deadline' : 'Days left'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="milestones">
            <Flag className="h-4 w-4 mr-2" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Activity className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Budget Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-semibold text-lg">R{totalBudget.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Released</span>
                    <span>R{releasedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600">In Escrow</span>
                    <span>R{escrowAmount.toLocaleString()}</span>
                  </div>
                </div>
                <Progress 
                  value={(releasedAmount / totalBudget) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Deadline Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gig.started_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Started</span>
                    <span>{format(new Date(gig.started_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {gig.deadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className={cn(isOverdue && 'text-red-600 font-medium')}>
                      {format(new Date(gig.deadline), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                {gig.completed_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="text-green-600">
                      {format(new Date(gig.completed_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                
                {isOverdue && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">This gig is past its deadline</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dispute Warning */}
          {gig.status === 'disputed' && (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-600">Dispute in Progress</p>
                    <p className="text-sm text-muted-foreground">
                      This gig has an active dispute that needs resolution
                    </p>
                  </div>
                </div>
                {onViewDispute && (
                  <Button variant="outline" onClick={onViewDispute}>
                    View Dispute
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          {milestones.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Flag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No milestones defined for this gig</p>
              </CardContent>
            </Card>
          ) : (
            milestones.map((milestone, index) => {
              const statusConfig = getMilestoneStatusConfig(milestone.status);
              const isActive = milestone.status === 'in_progress' || milestone.status === 'submitted';
              
              return (
                <Card 
                  key={milestone.id}
                  className={cn(
                    'transition-all',
                    isActive && 'ring-2 ring-primary/20'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Order Number */}
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold',
                        statusConfig.bgColor,
                        statusConfig.color
                      )}>
                        {milestone.status === 'approved' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {milestone.description}
                            </p>
                          </div>
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                        </div>
                        
                        {/* Milestone Details */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R{milestone.amount.toLocaleString()}
                          </span>
                          <span>{milestone.percentage}% of total</span>
                          {milestone.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {format(new Date(milestone.dueDate), 'MMM d')}
                            </span>
                          )}
                          {milestone.revision_count > 0 && (
                            <span className="text-amber-600">
                              {milestone.revision_count}/{milestone.max_revisions} revisions used
                            </span>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        {onViewMilestone && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => onViewMilestone(milestone.id)}
                          >
                            View Details
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
              <CardDescription>Recent updates and events</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    
                    <div className="space-y-6">
                      {timeline.map((event, index) => (
                        <div key={event.id} className="relative flex gap-4 pl-10">
                          {/* Timeline dot */}
                          <div className={cn(
                            'absolute left-2.5 w-3 h-3 rounded-full border-2 border-background',
                            event.status === 'success' && 'bg-green-500',
                            event.status === 'warning' && 'bg-amber-500',
                            event.status === 'pending' && 'bg-blue-500',
                            !event.status && 'bg-muted-foreground'
                          )} />
                          
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{event.title}</p>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GigProgress;
