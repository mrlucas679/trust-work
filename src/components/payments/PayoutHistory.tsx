/**
 * @fileoverview Payout history component
 * Displays freelancer payout history and pending payouts
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowDownLeft,
  Building2,
  Calendar,
  TrendingUp,
  RefreshCw,
  Download,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyPayments, usePaymentStats } from '@/hooks/use-gig-lifecycle';
import type { IEscrowPayment, PayoutStatus } from '@/types/gig';
import { format, formatDistanceToNow } from 'date-fns';

interface PayoutHistoryProps {
  className?: string;
}

const PAYOUT_STATUS_CONFIG: Record<
  PayoutStatus,
  { label: string; icon: React.ElementType; color: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-500',
    badgeVariant: 'outline',
  },
  processing: {
    label: 'Processing',
    icon: RefreshCw,
    color: 'text-blue-500',
    badgeVariant: 'secondary',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-500',
    badgeVariant: 'default',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    color: 'text-red-500',
    badgeVariant: 'destructive',
  },
};

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend && (
            <span
              className={cn(
                'text-xs mb-1',
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function PayoutRow({ payment }: { payment: IEscrowPayment }) {
  const statusConfig = PAYOUT_STATUS_CONFIG[payment.payout_status || 'pending'];
  const StatusIcon = statusConfig.icon;
  const netAmount = payment.amount - payment.platform_fee;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowDownLeft className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {payment.gig?.title || `Gig #${payment.assignment_id?.slice(0, 8)}`}
            </p>
            <p className="text-xs text-muted-foreground">
              From {payment.payer?.full_name || payment.payer?.company_name || 'Client'}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right font-semibold text-green-600">
        +R{netAmount.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig.badgeVariant} className="gap-1">
          <StatusIcon className={cn('h-3 w-3', statusConfig.color)} />
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {payment.payout_completed_at
          ? format(new Date(payment.payout_completed_at), 'MMM d, yyyy')
          : payment.released_at
          ? formatDistanceToNow(new Date(payment.released_at), { addSuffix: true })
          : '-'}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {payment.payout_reference || '-'}
      </TableCell>
    </TableRow>
  );
}

export function PayoutHistory({ className }: PayoutHistoryProps) {
  const [activeTab, setActiveTab] = useState('all');

  const { data: payments, isLoading: paymentsLoading, refetch } = useMyPayments();
  const { data: stats, isLoading: statsLoading } = usePaymentStats();

  // Filter payments that have been released (eligible for payout)
  const releasedPayments = payments?.filter((p) => p.status === 'released') || [];
  const pendingPayouts = releasedPayments.filter((p) => p.payout_status === 'pending');
  const processingPayouts = releasedPayments.filter((p) => p.payout_status === 'processing');
  const completedPayouts = releasedPayments.filter((p) => p.payout_status === 'completed');
  const failedPayouts = releasedPayments.filter((p) => p.payout_status === 'failed');

  const getFilteredPayments = () => {
    switch (activeTab) {
      case 'pending':
        return pendingPayouts;
      case 'processing':
        return processingPayouts;
      case 'completed':
        return completedPayouts;
      case 'failed':
        return failedPayouts;
      default:
        return releasedPayments;
    }
  };

  const filteredPayments = getFilteredPayments();

  // Calculate totals
  const totalEarnings = releasedPayments.reduce((sum, p) => sum + (p.amount - p.platform_fee), 0);
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + (p.amount - p.platform_fee), 0);
  const processingAmount = processingPayouts.reduce((sum, p) => sum + (p.amount - p.platform_fee), 0);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Earnings"
          value={`R${totalEarnings.toLocaleString()}`}
          subtitle="All time"
          icon={TrendingUp}
          loading={paymentsLoading}
        />
        <StatsCard
          title="Available"
          value={`R${pendingAmount.toLocaleString()}`}
          subtitle="Ready for payout"
          icon={Wallet}
          loading={paymentsLoading}
        />
        <StatsCard
          title="Processing"
          value={`R${processingAmount.toLocaleString()}`}
          subtitle="Being transferred"
          icon={RefreshCw}
          loading={paymentsLoading}
        />
        <StatsCard
          title="Completed Payouts"
          value={completedPayouts.length.toString()}
          subtitle="Total transactions"
          icon={CheckCircle}
          loading={paymentsLoading}
        />
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Payout History
              </CardTitle>
              <CardDescription>Track your earnings and payouts</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={paymentsLoading}
              >
                {paymentsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({releasedPayments.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingPayouts.length})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({processingPayouts.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedPayouts.length})
              </TabsTrigger>
              {failedPayouts.length > 0 && (
                <TabsTrigger value="failed" className="text-red-500">
                  Failed ({failedPayouts.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {paymentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">No payouts yet</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'all'
                      ? 'Complete gigs and get paid to see your payout history here.'
                      : `No ${activeTab} payouts at the moment.`}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gig</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <PayoutRow key={payment.id} payment={payment} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bank Account Reminder */}
      {pendingPayouts.length > 0 && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  R{pendingAmount.toLocaleString()} ready for payout
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure your bank account details are up to date to receive your earnings.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Update Bank Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PayoutHistory;
