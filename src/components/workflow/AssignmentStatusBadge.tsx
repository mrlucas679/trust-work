/**
 * Assignment Status Badge
 * 
 * Displays assignment status with appropriate color and styling
 */

import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '@/types/workflow';
import type { AssignmentStatus } from '@/types/workflow';

interface AssignmentStatusBadgeProps {
    status: AssignmentStatus;
    className?: string;
}

export function AssignmentStatusBadge({ status, className }: AssignmentStatusBadgeProps) {
    const color = getStatusColor(status);
    const label = getStatusLabel(status);

    return (
        <Badge
            variant="secondary"
            className={className}
            style={{
                backgroundColor: `${color}20`,
                color: color,
                borderColor: color
            }}
        >
            {label}
        </Badge>
    );
}
