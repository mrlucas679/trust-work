/**
 * @fileoverview GigDetail - Full gig view with all details
 * TrustWork Platform - Gig Detail Component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar,
  Target,
  Users,
  Star,
  CheckCircle2,
  Zap,
  Briefcase,
  TrendingUp,
  FileText,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { IGig, GigStatus } from '@/types/gig';

interface GigDetailProps {
  gig: IGig;
  isClient?: boolean;
  isFreelancer?: boolean;
  isApplied?: boolean;
  onApply?: () => void;
  onMessage?: () => void;
  onManage?: () => void;
  className?: string;
}

const statusConfig: Record<GigStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
}> = {
  draft: { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  open: { label: 'Open for Applications', color: 'text-green-600', bgColor: 'bg-green-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100' },
  disputed: { label: 'Under Dispute', color: 'text-orange-600', bgColor: 'bg-orange-100' },
};

export function GigDetail({
  gig,
  isClient = false,
  isFreelancer = false,
  isApplied = false,
  onApply,
  onMessage,
  onManage,
  className,
}: GigDetailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: gig.currency || 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getDaysUntilDeadline = () => {
    if (!gig.deadline) return null;
    const now = new Date();
    const deadline = new Date(gig.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getClientInitials = () => {
    if (gig.client?.company_name) {
      return gig.client.company_name.substring(0, 2).toUpperCase();
    }
    if (gig.client?.full_name) {
      return gig.client.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'CL';
  };

  const status = statusConfig[gig.status];
  const daysLeft = getDaysUntilDeadline();
  const isUrgent = gig.urgent || (daysLeft !== null && daysLeft <= 3);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          {/* Status & Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={cn(status.bgColor, status.color, 'border-0')}>
              {status.label}
            </Badge>
            {gig.urgent && (
              <Badge variant="destructive">
                <Zap className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
            {gig.remote_allowed && (
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                Remote OK
              </Badge>
            )}
            {gig.requires_skill_test && (
              <Badge variant="secondary">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Skill Test Required
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4">{gig.title}</h1>

          {/* Client Info */}
          {gig.client && (
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={gig.client.avatar_url} />
                <AvatarFallback>{getClientInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {gig.client.company_name || gig.client.full_name}
                  </p>
                  {gig.client.is_verified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent>Verified Client</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {gig.client.overall_rating !== undefined && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {gig.client.overall_rating.toFixed(1)} ({gig.client.total_reviews} reviews)
                    </span>
                  )}
                  {gig.client.total_gigs_completed !== undefined && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {gig.client.total_gigs_completed} gigs completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="text-lg font-bold text-green-600">
                {gig.budget_type === 'fixed' 
                  ? formatCurrency(gig.budget_min)
                  : `${formatCurrency(gig.budget_min)} - ${formatCurrency(gig.budget_max)}`
                }
              </p>
            </div>
            {gig.estimated_duration && (
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{gig.estimated_duration}</p>
              </div>
            )}
            {gig.deadline && (
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className={cn(
                  'text-lg font-semibold',
                  isUrgent && 'text-orange-600'
                )}>
                  {formatDate(gig.deadline)}
                  {daysLeft !== null && (
                    <span className="text-sm font-normal ml-1">
                      ({daysLeft} days)
                    </span>
                  )}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="text-lg font-semibold capitalize">{gig.experience_level}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {!isClient && gig.status === 'open' && !isApplied && onApply && (
              <Button size="lg" onClick={onApply}>
                Apply for this Gig
              </Button>
            )}
            {!isClient && isApplied && (
              <Button size="lg" variant="secondary" disabled>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Already Applied
              </Button>
            )}
            {isClient && onManage && (
              <Button size="lg" onClick={onManage}>
                Manage Gig
              </Button>
            )}
            {onMessage && (
              <Button size="lg" variant="outline" onClick={onMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{gig.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      {gig.deliverables && gig.deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Deliverables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {gig.deliverables.map((deliverable, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{deliverable}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {gig.milestones && gig.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Payment Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gig.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{milestone.description}</p>
                  {milestone.dueDate && (
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDate(milestone.dueDate)}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-green-600">
                    {formatCurrency(gig.budget_min * (milestone.percentage / 100))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {milestone.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Required Skills */}
      {gig.required_skills && gig.required_skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gig.required_skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Sidebar (for larger screens, could be moved) */}
      {gig.application_count !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{gig.application_count}</div>
              <div className="text-muted-foreground">
                freelancers have applied to this gig
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning for urgent gigs */}
      {isUrgent && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-800">Urgent Timeline</p>
                <p className="text-sm text-orange-700">
                  This gig has a tight deadline. Make sure you can commit to the timeline before applying.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GigDetail;
