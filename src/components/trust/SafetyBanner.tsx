import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SafetyBannerProps {
  type: 'general' | 'warning' | 'flagged';
  dismissible?: boolean;
  className?: string;
}

const SafetyBanner = ({ type, dismissible = true, className }: SafetyBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const getBannerConfig = () => {
    switch (type) {
      case 'general':
        return {
          icon: Shield,
          title: 'Stay Safe on TrustWork',
          description: 'Always verify employer details and never pay upfront fees for job opportunities.',
          tips: [
            'Check for verified badges on job postings',
            'Research the company independently',
            'Be cautious of unusually high salaries for simple tasks',
            'Report suspicious activity immediately'
          ],
          variant: 'default' as const,
          className: 'border-primary/20 bg-primary/5'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          title: 'Exercise Caution',
          description: 'This opportunity has some risk factors. Please review carefully.',
          tips: [
            'Verify all company contact information',
            'Ask for proper documentation and contracts',
            'Never provide personal financial information upfront',
            'Trust your instincts - if something feels wrong, it probably is'
          ],
          variant: 'destructive' as const,
          className: 'border-warning/20 bg-warning/5'
        };
      case 'flagged':
        return {
          icon: AlertTriangle,
          title: 'High Risk - Proceed with Extreme Caution',
          description: 'This job posting has been flagged by our safety systems.',
          tips: [
            'This employer has not been verified',
            'Multiple risk factors have been detected',
            'Do not provide personal or financial information',
            'Consider looking for verified opportunities instead'
          ],
          variant: 'destructive' as const,
          className: 'border-destructive/20 bg-destructive/5'
        };
      default:
        return {
          icon: Shield,
          title: 'Safety Information',
          description: 'General safety guidelines for job seekers.',
          tips: [],
          variant: 'default' as const,
          className: ''
        };
    }
  };

  const config = getBannerConfig();
  const Icon = config.icon;

  return (
    <Alert className={cn(config.className, 'animate-fade-in', className)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{config.title}</h3>
              <AlertDescription className="text-sm mb-3">
                {config.description}
              </AlertDescription>
            </div>
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="h-6 w-6 p-0 hover:bg-background/50"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {config.tips.length > 0 && (
            <ul className="text-xs space-y-1 mb-3">
              {config.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Safety Guidelines
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Report Issue
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default SafetyBanner;