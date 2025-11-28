import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Wallet,
  ArrowRight,
  Lock,
  Unlock,
  Ban,
  DollarSign,
  Calendar,
  User,
  Building2,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { IEscrowPayment, IPayFastTransaction, EscrowStatus as EscrowStatusType } from '@/types/gig';

interface EscrowStatusProps {
  escrowPayment: IEscrowPayment;
  transaction?: IPayFastTransaction;
  userRole: 'client' | 'freelancer';
  onRelease?: () => void;
  onRefund?: () => void;
  onDispute?: () => void;
  isReleasing?: boolean;
  isRefunding?: boolean;
  className?: string;
}

const statusConfig: Record<EscrowStatusType, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description: 'Awaiting payment confirmation',
  },
  held: {
    label: 'Held in Escrow',
    icon: Lock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Funds are securely held',
  },
  released: {
    label: 'Released',
    icon: Unlock,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Payment released to freelancer',
  },
  refunded: {
    label: 'Refunded',
    icon: RefreshCw,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Funds returned to client',
  },
  disputed: {
    label: 'Disputed',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Under dispute resolution',
  },
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
};

export const EscrowStatus: React.FC<EscrowStatusProps> = ({
  escrowPayment,
  transaction,
  userRole,
  onRelease,
  onRefund,
  onDispute,
  isReleasing = false,
  isRefunding = false,
  className,
}) => {
  const config = statusConfig[escrowPayment.status];
  const StatusIcon = config.icon;

  const canRelease = userRole === 'client' && escrowPayment.status === 'held';
  const canRefund = userRole === 'client' && escrowPayment.status === 'held';
  const canDispute = escrowPayment.status === 'held' || escrowPayment.status === 'released';

  // Calculate platform fee and freelancer payout
  const platformFee = escrowPayment.amount * 0.1; // 10% platform fee
  const freelancerPayout = escrowPayment.amount - platformFee;

  // Calculate progress for visual representation
  const getProgressValue = (): number => {
    switch (escrowPayment.status) {
      case 'pending':
        return 25;
      case 'held':
        return 50;
      case 'released':
      case 'refunded':
        return 100;
      case 'disputed':
        return 75;
      default:
        return 0;
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Status Header Banner */}
      <div className={cn('px-6 py-4 border-b', config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full bg-white/80', config.color)}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className={cn('font-semibold', config.color)}>{config.label}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs', config.color)}>
            <Shield className="h-3 w-3 mr-1" />
            Protected
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Escrow Payment</CardTitle>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(escrowPayment.amount)}
          </span>
        </div>
        <CardDescription>
          {userRole === 'client'
            ? 'Your payment is protected until work is approved'
            : 'Funds will be released upon work approval'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Payment</span>
            <span>Held</span>
            <span>Complete</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        {/* Amount Breakdown */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment Breakdown
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium">{formatCurrency(escrowPayment.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (10%)</span>
              <span className="text-muted-foreground">-{formatCurrency(platformFee)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Freelancer Receives</span>
              <span className="text-green-600">{formatCurrency(freelancerPayout)}</span>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        {transaction && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transaction Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Transaction ID</span>
                <p className="font-mono text-xs truncate">{transaction.pf_payment_id || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Payment Method</span>
                <p className="capitalize">{transaction.payment_method || 'PayFast'}</p>
              </div>
              {transaction.created_at && (
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">Date</span>
                  <p>{format(new Date(transaction.created_at), 'dd MMM yyyy')}</p>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Status</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {transaction.status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Parties Involved */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-full">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground text-xs">Client</p>
              <p className="font-medium truncate">Protected Buyer</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground text-xs">Freelancer</p>
              <p className="font-medium truncate">Verified Seller</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </h4>
          <div className="relative pl-6 space-y-4">
            {/* Created */}
            <div className="relative">
              <div className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Payment Created</p>
                <p className="text-muted-foreground text-xs">
                  {escrowPayment.created_at
                    ? format(new Date(escrowPayment.created_at), 'dd MMM yyyy, HH:mm')
                    : 'Unknown'}
                </p>
              </div>
            </div>

            {/* Status-specific timeline items */}
            {escrowPayment.status === 'held' && (
              <div className="relative">
                <div className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <Lock className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Funds Secured</p>
                  <p className="text-muted-foreground text-xs">Awaiting work completion</p>
                </div>
              </div>
            )}

            {escrowPayment.status === 'released' && escrowPayment.released_at && (
              <div className="relative">
                <div className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Unlock className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Payment Released</p>
                  <p className="text-muted-foreground text-xs">
                    {format(new Date(escrowPayment.released_at), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
            )}

            {escrowPayment.status === 'refunded' && (
              <div className="relative">
                <div className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <RefreshCw className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Refund Processed</p>
                  <p className="text-muted-foreground text-xs">Funds returned to client</p>
                </div>
              </div>
            )}

            {escrowPayment.status === 'disputed' && (
              <div className="relative">
                <div className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertTriangle className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Dispute Opened</p>
                  <p className="text-muted-foreground text-xs">Under review by support team</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(canRelease || canRefund || canDispute) && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-3">
              {/* Release Payment */}
              {canRelease && onRelease && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="flex-1" disabled={isReleasing}>
                      {isReleasing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Releasing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Release Payment
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Release Payment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to release {formatCurrency(escrowPayment.amount)} to the
                        freelancer. This action cannot be undone. The freelancer will receive{' '}
                        {formatCurrency(freelancerPayout)} after platform fees.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onRelease}>
                        Yes, Release Payment
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Request Refund */}
              {canRefund && onRefund && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1" disabled={isRefunding}>
                      {isRefunding ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Request Refund
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Request Refund?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will initiate a refund request for {formatCurrency(escrowPayment.amount)}.
                        The freelancer will be notified and may dispute this request.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onRefund} className="bg-orange-600 hover:bg-orange-700">
                        Request Refund
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Open Dispute */}
              {canDispute && onDispute && (
                <Button variant="destructive" size="sm" onClick={onDispute}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Open Dispute
                </Button>
              )}
            </div>
          </>
        )}

        {/* Freelancer Waiting Message */}
        {userRole === 'freelancer' && escrowPayment.status === 'held' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Wallet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Payment Secured</p>
                <p className="text-blue-700">
                  Complete the work and submit your deliverables. Once the client approves,{' '}
                  {formatCurrency(freelancerPayout)} will be released to your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message for Released */}
        {escrowPayment.status === 'released' && userRole === 'freelancer' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Payment Received!</p>
                <p className="text-green-700">
                  {formatCurrency(freelancerPayout)} has been released to your account.
                  Funds will be deposited within 1-3 business days.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EscrowStatus;
