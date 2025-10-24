import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Shield, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  type: 'verified' | 'flagged' | 'pending' | 'premium';
  details?: string[];
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

const VerificationBadge = ({ type, details = [], showTooltip = true, size = 'md' }: VerificationBadgeProps) => {
  const getVerificationConfig = () => {
    switch (type) {
      case 'verified':
        return {
          variant: 'outline' as const,
          className: 'border-verified text-verified bg-verified/5',
          icon: CheckCircle,
          label: 'Verified',
          description: 'Company verified through multiple security checks'
        };
      case 'premium':
        return {
          variant: 'default' as const,
          className: 'border-primary text-primary-foreground bg-primary',
          icon: Shield,
          label: 'Premium',
          description: 'Premium verified employer with enhanced security'
        };
      case 'flagged':
        return {
          variant: 'destructive' as const,
          className: '',
          icon: AlertTriangle,
          label: 'Flagged',
          description: 'This employer has been flagged for suspicious activity'
        };
      case 'pending':
        return {
          variant: 'outline' as const,
          className: 'border-warning text-warning bg-warning/5',
          icon: AlertCircle,
          label: 'Pending',
          description: 'Verification in progress - exercise caution'
        };
      default:
        return {
          variant: 'outline' as const,
          className: '',
          icon: AlertCircle,
          label: 'Unknown',
          description: 'Verification status unknown'
        };
    }
  };

  const config = getVerificationConfig();
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  const badgeContent = (
    <Badge 
      variant={config.variant}
      className={cn(
        config.className,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        'transition-all duration-200 hover:scale-102'
      )}
    >
      <Icon className={cn(iconSize, 'mr-1')} />
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{config.description}</p>
            {details.length > 0 && (
              <ul className="text-xs space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-muted-foreground">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;