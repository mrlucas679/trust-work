import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Star } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    text: string;
    onClick: () => void;
  };
  highlight?: boolean;
  className?: string;
  children?: ReactNode;
}

export const FeatureCard = ({
  title,
  description,
  icon,
  badge,
  action,
  highlight = false,
  className,
  children
}: FeatureCardProps) => {
  return (
    <Card 
      className={cn(
        "h-full transition-all duration-200 hover:shadow-lg hover-scale",
        highlight && "border-primary/50 bg-primary/5",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn(
                "p-2 rounded-lg",
                highlight ? "bg-primary/20" : "bg-muted/50"
              )}>
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
                {highlight && <Star className="h-4 w-4 text-primary" />}
              </CardTitle>
            </div>
          </div>
          {badge && (
            <Badge variant={badge.variant || 'secondary'}>
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        
        {children}
        
        {action && (
          <Button 
            variant={highlight ? "default" : "outline"} 
            onClick={action.onClick}
            className="w-full"
          >
            {action.text}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className
}: StatsCardProps) => {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          {icon && (
            <div className="p-2 bg-muted/50 rounded-lg">
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            <Badge 
              variant={trend.positive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.positive ? '+' : ''}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureCard;