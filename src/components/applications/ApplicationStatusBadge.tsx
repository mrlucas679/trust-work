import { Badge } from "@/components/ui/badge";
import { Clock, Eye, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationStatusBadgeProps {
    status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
}

/**
 * ApplicationStatusBadge Component
 * 
 * Displays application status with color-coded badges and icons
 * 
 * Status Colors:
 * - Pending: Yellow (awaiting review)
 * - Reviewing: Blue (being evaluated)
 * - Accepted: Green (application successful)
 * - Rejected: Red (application declined)
 * - Withdrawn: Gray (user cancelled)
 */
const ApplicationStatusBadge = ({
    status,
    size = 'md',
    showIcon = true,
    className
}: ApplicationStatusBadgeProps) => {
    const statusConfig = {
        pending: {
            label: 'Pending',
            icon: Clock,
            variant: 'secondary' as const,
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
        },
        reviewing: {
            label: 'Under Review',
            icon: Eye,
            variant: 'secondary' as const,
            className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
        },
        accepted: {
            label: 'Accepted',
            icon: CheckCircle,
            variant: 'secondary' as const,
            className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
        },
        rejected: {
            label: 'Rejected',
            icon: XCircle,
            variant: 'secondary' as const,
            className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300'
        },
        withdrawn: {
            label: 'Withdrawn',
            icon: MinusCircle,
            variant: 'secondary' as const,
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
        }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5'
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    };

    return (
        <Badge
            variant={config.variant}
            className={cn(
                config.className,
                sizeClasses[size],
                'flex items-center gap-1.5 font-medium',
                className
            )}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {config.label}
        </Badge>
    );
};

export default ApplicationStatusBadge;
