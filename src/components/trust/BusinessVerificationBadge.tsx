/**
 * BusinessVerificationBadge Component
 * 
 * Displays business verification status badges on employer profiles
 * Shows different badge levels: basic, premium, enterprise
 */

import { Badge } from "@/components/ui/badge";
import {
    BadgeCheck,
    Shield,
    Award,
    Clock
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type BusinessVerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected';
export type BusinessBadgeLevel = 'none' | 'basic' | 'premium' | 'enterprise';

interface BusinessVerificationBadgeProps {
    status: BusinessVerificationStatus;
    badgeLevel?: BusinessBadgeLevel;
    verifiedAt?: string;
    businessName?: string;
    showTooltip?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const BusinessVerificationBadge = ({
    status,
    badgeLevel = 'none',
    verifiedAt,
    businessName,
    showTooltip = true,
    size = 'md'
}: BusinessVerificationBadgeProps) => {
    // Don't show badge for not_started status
    if (status === 'not_started' || status === 'rejected') {
        return null;
    }

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    };

    const iconSize = iconSizes[size];

    // Pending verification
    if (status === 'pending') {
        const badge = (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Clock className={`mr-1 ${iconSize}`} />
                Verification Pending
            </Badge>
        );

        if (!showTooltip) return badge;

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {badge}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Business verification in progress</p>
                        <p className="text-xs text-muted-foreground">
                            Typically processed within 1-2 business days
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Verified badges with different levels
    const getBadgeConfig = () => {
        switch (badgeLevel) {
            case 'enterprise':
                return {
                    icon: Award,
                    text: 'Enterprise Verified',
                    className: 'bg-purple-600 text-white border-purple-700',
                    description: 'Full vetting with background check and document verification'
                };
            case 'premium':
                return {
                    icon: Shield,
                    text: 'Premium Verified',
                    className: 'bg-blue-600 text-white border-blue-700',
                    description: 'Manual review and document verification completed'
                };
            case 'basic':
            default:
                return {
                    icon: BadgeCheck,
                    text: 'Verified Business',
                    className: 'bg-green-600 text-white border-green-700',
                    description: 'Business verified through automated checks'
                };
        }
    };

    const config = getBadgeConfig();
    const Icon = config.icon;

    const badge = (
        <Badge variant="default" className={config.className}>
            <Icon className={`mr-1 ${iconSize}`} />
            {config.text}
        </Badge>
    );

    if (!showTooltip) return badge;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent>
                    {businessName && (
                        <p className="font-medium">{businessName}</p>
                    )}
                    <p className="text-xs">{config.description}</p>
                    {verifiedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Verified on {new Date(verifiedAt).toLocaleDateString()}
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

/**
 * Compact version for use in lists
 */
interface CompactBusinessVerificationBadgeProps {
    status: BusinessVerificationStatus;
    badgeLevel?: BusinessBadgeLevel;
}

export const CompactBusinessVerificationBadge = ({
    status,
    badgeLevel = 'none'
}: CompactBusinessVerificationBadgeProps) => {
    if (status !== 'verified') return null;

    const getIcon = () => {
        switch (badgeLevel) {
            case 'enterprise':
                return <Award className="h-4 w-4 text-purple-600" />;
            case 'premium':
                return <Shield className="h-4 w-4 text-blue-600" />;
            case 'basic':
            default:
                return <BadgeCheck className="h-4 w-4 text-green-600" />;
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-flex items-center">
                        {getIcon()}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">Verified Business</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

/**
 * Profile header version with business name
 */
interface ProfileBusinessVerificationBadgeProps {
    businessName: string;
    status: BusinessVerificationStatus;
    badgeLevel?: BusinessBadgeLevel;
    verifiedAt?: string;
}

export const ProfileBusinessVerificationBadge = ({
    businessName,
    status,
    badgeLevel = 'none',
    verifiedAt
}: ProfileBusinessVerificationBadgeProps) => {
    if (status !== 'verified') return null;

    const getConfig = () => {
        switch (badgeLevel) {
            case 'enterprise':
                return {
                    icon: Award,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-200'
                };
            case 'premium':
                return {
                    icon: Shield,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200'
                };
            case 'basic':
            default:
                return {
                    icon: BadgeCheck,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200'
                };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${config.bgColor} ${config.borderColor}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
            <div className="flex-1">
                <p className="font-medium text-sm">{businessName}</p>
                <p className={`text-xs ${config.color}`}>
                    Verified Business
                    {verifiedAt && ` • ${new Date(verifiedAt).toLocaleDateString()}`}
                </p>
            </div>
        </div>
    );
};
