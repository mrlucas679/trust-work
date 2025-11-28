/**
 * FreelancerCard Component
 * 
 * Displays a freelancer's profile summary in search results.
 * Shows key information: avatar, name, title, rating, rate, skills, and verification status.
 * 
 * Features:
 * - Responsive card layout
 * - Verified badge for trusted freelancers
 * - Star rating display
 * - Hourly rate with ZAR formatting
 * - Skills with truncation
 * - Province/location badge
 * - Remote work indicator
 * - Click to view full profile
 * 
 * @example
 * ```tsx
 * <FreelancerCard
 *   freelancer={freelancerData}
 *   onClick={() => navigate(`/profile/${freelancerId}`)}
 * />
 * ```
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Clock, Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FreelancerSearchResult } from '@/types/search';

export interface FreelancerCardProps {
    freelancer: FreelancerSearchResult;
    onClick?: () => void;
    className?: string;
    showFullBio?: boolean;
}

export function FreelancerCard({
    freelancer,
    onClick,
    className,
    showFullBio = false,
}: FreelancerCardProps) {
    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Truncate bio
    const displayBio = showFullBio
        ? freelancer.bio
        : freelancer.bio.length > 120
            ? `${freelancer.bio.slice(0, 120)}...`
            : freelancer.bio;

    // Display up to 5 skills
    const displaySkills = freelancer.skills.slice(0, 5);
    const remainingSkills = freelancer.skills.length - displaySkills.length;

    return (
        <Card
            className={cn(
                'hover:shadow-md transition-shadow cursor-pointer group',
                className
            )}
            onClick={onClick}
        >
            <CardHeader>
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-16 w-16 border-2 border-muted">
                        <AvatarImage src={freelancer.avatar} alt={freelancer.fullName} />
                        <AvatarFallback className="text-lg font-semibold">
                            {getInitials(freelancer.fullName)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Name, Title, Verification */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                                    {freelancer.fullName}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {freelancer.title}
                                </p>
                            </div>
                            {freelancer.verified && (
                                <Badge
                                    variant="default"
                                    className="bg-verified hover:bg-verified shrink-0"
                                >
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified
                                </Badge>
                            )}
                        </div>

                        {/* Rating & Stats */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{freelancer.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground">
                                    ({freelancer.reviewCount})
                                </span>
                            </div>

                            <Separator orientation="vertical" className="h-4" />

                            {/* Jobs Completed */}
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span>{freelancer.jobsCompleted} jobs</span>
                            </div>

                            {/* Success Rate */}
                            {freelancer.successRate && (
                                <>
                                    <Separator orientation="vertical" className="h-4" />
                                    <span className="text-success font-medium">
                                        {freelancer.successRate}% success
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Bio */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {displayBio}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                    {displaySkills.map((skill) => (
                        <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs font-normal"
                        >
                            {skill}
                        </Badge>
                    ))}
                    {remainingSkills > 0 && (
                        <Badge
                            variant="outline"
                            className="text-xs font-normal"
                        >
                            +{remainingSkills} more
                        </Badge>
                    )}
                </div>

                {/* Location & Availability */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    {/* Location */}
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{freelancer.province}</span>
                        {freelancer.remote && (
                            <Badge variant="outline" className="text-xs ml-1">
                                Remote
                            </Badge>
                        )}
                    </div>

                    {/* Response Time */}
                    {freelancer.responseTime && (
                        <>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{freelancer.responseTime} response</span>
                            </div>
                        </>
                    )}

                    {/* Last Active */}
                    {freelancer.lastActive && (
                        <>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-muted-foreground">
                                Active {freelancer.lastActive}
                            </span>
                        </>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
                {/* Hourly Rate */}
                <div>
                    <p className="text-2xl font-bold">
                        {formatCurrency(freelancer.hourlyRate)}
                        <span className="text-sm font-normal text-muted-foreground">/hr</span>
                    </p>
                </div>

                {/* View Profile Button */}
                <Button
                    variant="default"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                >
                    View Profile
                </Button>
            </CardFooter>
        </Card>
    );
}

export default FreelancerCard;
