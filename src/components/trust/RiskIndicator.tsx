import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskIndicatorProps {
  level: 'low' | 'medium' | 'high';
  reasons?: string[];
  className?: string;
}

const RiskIndicator = ({ level, reasons = [], className }: RiskIndicatorProps) => {
  const getRiskConfig = () => {
    switch (level) {
      case 'low':
        return {
          label: 'Low Risk',
          icon: Shield,
          className: 'bg-success/10 text-success border-success/20',
          description: 'This opportunity has been thoroughly vetted and shows minimal risk factors.'
        };
      case 'medium':
        return {
          label: 'Medium Risk',
          icon: AlertCircle,
          className: 'bg-warning/10 text-warning border-warning/20',
          description: 'Some risk factors detected. Please review carefully before proceeding.'
        };
      case 'high':
        return {
          label: 'High Risk',
          icon: AlertTriangle,
          className: 'bg-destructive/10 text-destructive border-destructive/20',
          description: 'Multiple risk factors detected. Exercise extreme caution.'
        };
      default:
        return {
          label: 'Unknown Risk',
          icon: AlertCircle,
          className: 'bg-muted/10 text-muted-foreground border-muted/20',
          description: 'Risk assessment unavailable.'
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  const indicator = (
    <Badge 
      variant="outline"
      className={cn(
        config.className,
        'text-xs font-medium transition-all duration-200 hover:scale-102',
        className
      )}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );

  if (reasons.length === 0) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{config.description}</p>
            {reasons.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Risk factors:</p>
                <ul className="text-xs space-y-1">
                  {reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-muted-foreground">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RiskIndicator;