/**
 * @fileoverview GigCard - Display gig in a card format for listings
 * TrustWork Platform - Gig Card Component
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Briefcase, 
  TrendingUp,
  Calendar,
  Target,
  Users
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { IGig } from '@/types/gig';

interface GigCardProps {
  gig: IGig;
  onApply?: (gigId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function GigCard({ gig, onApply, showActions = true, className }: GigCardProps) {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: gig.currency || 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-ZA', {
      month: 'short',
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

  const daysLeft = getDaysUntilDeadline();
  const isUrgent = gig.urgent || (daysLeft !== null && daysLeft <= 3);

  const handleCardClick = () => {
    navigate(`/gigs/${gig.id}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) {
      onApply(gig.id);
    } else {
      navigate(`/gigs/${gig.id}/apply`);
    }
  };

  return (
    <Card 
      className={cn(
        'hover:shadow-lg transition-shadow cursor-pointer',
        isUrgent && 'border-orange-300',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {gig.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {gig.client && (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={gig.client.avatar_url} />
                    <AvatarFallback>
                      {gig.client.company_name?.charAt(0) || gig.client.full_name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {gig.client.company_name || gig.client.full_name}
                  </span>
                  {gig.client.is_verified && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      Verified
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
          {isUrgent && (
            <Badge variant="destructive" className="shrink-0">
              Urgent
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {gig.description}
        </p>

        {/* Budget & Timeline */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">
              {gig.budget_type === 'fixed' 
                ? formatCurrency(gig.budget_min)
                : `${formatCurrency(gig.budget_min)} - ${formatCurrency(gig.budget_max)}`
              }
            </span>
          </div>

          {gig.estimated_duration && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{gig.estimated_duration}</span>
            </div>
          )}

          {daysLeft !== null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{daysLeft} days left</span>
            </div>
          )}
        </div>

        {/* Skills & Experience */}
        <div className="space-y-2">
          {gig.required_skills && gig.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {gig.required_skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {gig.required_skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{gig.required_skills.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {gig.experience_level && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="capitalize">{gig.experience_level}</span>
              </div>
            )}
            {gig.remote_allowed && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>Remote OK</span>
              </div>
            )}
            {gig.milestones && gig.milestones.length > 0 && (
              <div className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                <span>{gig.milestones.length} Milestones</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          {gig.application_count !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{gig.application_count} applicants</span>
            </div>
          )}
          {gig.client && gig.client.total_gigs_completed !== undefined && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{gig.client.total_gigs_completed} gigs completed</span>
            </div>
          )}
          {gig.client && gig.client.overall_rating !== undefined && (
            <div className="flex items-center gap-1">
              <span>⭐ {gig.client.overall_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && gig.status === 'open' && (
        <CardFooter className="pt-3">
          <Button 
            className="w-full" 
            onClick={handleApplyClick}
          >
            Apply Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default GigCard;
