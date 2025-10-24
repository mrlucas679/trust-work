import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentProtectionProps {
  amount: number;
  currency?: string;
  status: 'pending' | 'held' | 'released' | 'disputed';
  milestones?: {
    id: string;
    description: string;
    amount: number;
    status: 'pending' | 'completed' | 'approved';
    dueDate?: string;
  }[];
  className?: string;
}

const PaymentProtection = ({ 
  amount, 
  currency = 'ZAR', 
  status,
  milestones = [],
  className 
}: PaymentProtectionProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Payment Pending',
          description: 'Funds are being processed and will be held in escrow',
          color: 'text-warning',
          bgColor: 'bg-warning/10'
        };
      case 'held':
        return {
          icon: Shield,
          label: 'Funds Protected',
          description: 'Payment is securely held in escrow until work completion',
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        };
      case 'released':
        return {
          icon: CheckCircle,
          label: 'Payment Released',
          description: 'Funds have been released to the freelancer',
          color: 'text-success',
          bgColor: 'bg-success/10'
        };
      case 'disputed':
        return {
          icon: AlertTriangle,
          label: 'Payment Disputed',
          description: 'Payment is under review due to a dispute',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10'
        };
      default:
        return {
          icon: Shield,
          label: 'Protected Payment',
          description: 'Your payment is secure',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Payment Protection
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className={cn("p-4 rounded-lg", config.bgColor)}>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            <div>
              <h3 className="font-semibold">{config.label}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-medium">Protected Amount:</span>
            <span className="text-lg font-bold">
              {currency} {amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Milestones Progress */}
        {milestones.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Project Milestones</h4>
              <Badge variant="outline">
                {completedMilestones}/{milestones.length} Complete
              </Badge>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{milestone.description}</p>
                    {milestone.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {currency} {milestone.amount.toLocaleString()}
                    </span>
                    <Badge 
                      variant={
                        milestone.status === 'completed' ? 'default' :
                        milestone.status === 'approved' ? 'secondary' : 'outline'
                      }
                    >
                      {milestone.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Features */}
        <div className="space-y-3">
          <h4 className="font-medium">Security Features</h4>
          
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>PCI DSS compliant processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>24/7 fraud monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Dispute resolution support</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {status === 'disputed' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              A dispute has been raised for this payment. Please check your messages for updates from our support team.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Shield className="h-4 w-4 mr-2" />
            Security Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentProtection;