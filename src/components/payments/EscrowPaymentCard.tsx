/**
 * @fileoverview Escrow payment card component
 * Displays escrow payment details with actions
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  RefreshCw,
  Wallet,
  Calendar,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReleasePayment, useRefundPayment } from '@/hooks/use-gig-lifecycle';
import type { IEscrowPayment, EscrowStatus, PayoutStatus } from '@/types/gig';
import { formatDistanceToNow, format } from 'date-fns';

interface EscrowPaymentCardProps {
  payment: IEscrowPayment;
  isClient?: boolean;
  isFreelancer?: boolean;
  showActions?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  EscrowStatus,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
  },
  held: {
    label: 'Held in Escrow',
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
  },
  released: {
    label: 'Released',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/20',
  },
  refunded: {
    label: 'Refunded',
    icon: RefreshCw,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
  },
  disputed: {
    label: 'Disputed',
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/20',
  },
};

const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string }> = {
  pending: { label: 'Payout Pending', color: 'text-yellow-500' },
  processing: { label: 'Processing Payout', color: 'text-blue-500' },
  completed: { label: 'Paid Out', color: 'text-green-500' },
  failed: { label: 'Payout Failed', color: 'text-red-500' },
};

export function EscrowPaymentCard({
  payment,
  isClient = false,
  isFreelancer = false,
  showActions = true,
  className,
}: EscrowPaymentCardProps) {
  const releasePayment = useReleasePayment();
  const refundPayment = useRefundPayment();

  const statusConfig = STATUS_CONFIG[payment.status];
  const StatusIcon = statusConfig.icon;

  const netAmount = payment.amount - payment.platform_fee;

  const handleRelease = async () => {
    await releasePayment.mutateAsync(payment.id);
  };

  const handleRefund = async () => {
    await refundPayment.mutateAsync({ paymentId: payment.id });
  };

  const isProcessing = releasePayment.isPending || refundPayment.isPending;
  const canRelease = isClient && payment.status === 'held';
  const canRefund = payment.status === 'held' && isClient;

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Status Banner */}
      <div className={cn('px-4 py-2 border-b', statusConfig.bgColor)}>
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
          <span className={cn('font-medium text-sm', statusConfig.color)}>
            {statusConfig.label}
          </span>
          {payment.status === 'released' && payment.payout_status && (
            <Badge variant="outline" className={PAYOUT_STATUS_CONFIG[payment.payout_status].color}>
              {PAYOUT_STATUS_CONFIG[payment.payout_status].label}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">R{payment.amount.toLocaleString()}</CardTitle>
            <CardDescription>
              {payment.gig?.title || `Payment #${payment.id.slice(0, 8)}`}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="capitalize">
                  {payment.payment_method}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Payment Method</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount Breakdown */}
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gross Amount</span>
            <span>R{payment.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee (10%)</span>
            <span className="text-orange-500">-R{payment.platform_fee.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>{isFreelancer ? 'You Receive' : 'Freelancer Receives'}</span>
            <span className="text-green-600">R{netAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>{format(new Date(payment.created_at), 'MMM d, yyyy')}</span>
          </div>
          {payment.held_at && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Held:</span>
              <span>{formatDistanceToNow(new Date(payment.held_at), { addSuffix: true })}</span>
            </div>
          )}
          {payment.released_at && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Released:</span>
              <span>{format(new Date(payment.released_at), 'MMM d, yyyy')}</span>
            </div>
          )}
          {payment.refunded_at && (
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Refunded:</span>
              <span>{format(new Date(payment.refunded_at), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <User className="h-3 w-3" />
              Client
            </div>
            <p className="font-medium text-sm truncate">
              {payment.payer?.full_name || payment.payer?.company_name || 'Unknown'}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Wallet className="h-3 w-3" />
              Freelancer
            </div>
            <p className="font-medium text-sm truncate">
              {payment.recipient?.full_name || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Payout Error */}
        {payment.payout_error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-red-600 dark:text-red-400">Payout Error</p>
                <p className="text-xs text-muted-foreground">{payment.payout_error}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {showActions && (canRelease || canRefund) && (
        <CardFooter className="flex gap-2 border-t pt-4">
          {canRelease && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex-1" disabled={isProcessing}>
                  {releasePayment.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                  )}
                  Release Payment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Release Payment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will release <strong>R{netAmount.toLocaleString()}</strong> to the
                    freelancer. This action cannot be undone. Only release payment if you are
                    satisfied with the completed work.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRelease}>Release Payment</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canRefund && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isProcessing}>
                  {refundPayment.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Request Refund
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Request Refund?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will initiate a refund of <strong>R{payment.amount.toLocaleString()}</strong>.
                    The freelancer will be notified and may dispute this request.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRefund}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Request Refund
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default EscrowPaymentCard;
