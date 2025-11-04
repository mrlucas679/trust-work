import { Badge } from '@/components/ui/badge';
import { getApplicationStatusColor, getApplicationStatusText, type ApplicationStatus } from '@/types/applications';
import { cn } from '@/lib/utils';

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus;
    className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
    const colorMap = {
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        blue: 'bg-blue-100 text-blue-800 border-blue-300',
        green: 'bg-green-100 text-green-800 border-green-300',
        red: 'bg-red-100 text-red-800 border-red-300',
        gray: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    const color = getApplicationStatusColor(status);
    const text = getApplicationStatusText(status);

    return (
        <Badge variant="outline" className={cn(colorMap[color], className)}>
            {text}
        </Badge>
    );
}
