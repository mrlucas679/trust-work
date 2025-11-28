/**
 * @fileoverview Client Payments page
 * Dashboard for clients to track payments, escrow, and transaction history
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DollarSign,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Download,
  ExternalLink,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  RefreshCw,
  Info,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useMyPayments, 
  usePaymentStats,
} from '@/hooks/use-gig-lifecycle';
import type { IEscrowPayment, EscrowStatus, IPayFastTransaction } from '@/types/gig';
import { format, formatDistanceToNow, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const ESCROW_STATUS_CONFIG: Record<EscrowStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-gray-500', icon: Clock },
  funded: { label: 'Funded', color: 'bg-blue-500', icon: Shield },
  released: { label: 'Released', color: 'bg-green-500', icon: CheckCircle },
  refunded: { label: 'Refunded', color: 'bg-yellow-500', icon: RefreshCw },
  disputed: { label: 'Disputed', color: 'bg-red-500', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: XCircle },
};

const PAYMENT_METHOD_ICONS: Record<string, React.ElementType> = {
  eft: Wallet,
  card: CreditCard,
  default: DollarSign,
};

export default function ClientPayments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  // Fetch data
  const { data: payments = [], isLoading: paymentsLoading } = useMyPayments('client');
  const { data: stats, isLoading: statsLoading } = usePaymentStats();

  // Calculate metrics
  const totalSpent = stats?.totalSpent || 0;
  const inEscrow = stats?.inEscrow || 0;
  const released = stats?.released || 0;
  const refunded = stats?.refunded || 0;

  // Monthly comparison
  const thisMonthPayments = payments.filter((p: IEscrowPayment) => {
    const date = new Date(p.created_at);
    return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
  });
  const lastMonthPayments = payments.filter((p: IEscrowPayment) => {
    const date = new Date(p.created_at);
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const thisMonthTotal = thisMonthPayments.reduce((sum: number, p: IEscrowPayment) => sum + p.amount, 0);
  const lastMonthTotal = lastMonthPayments.reduce((sum: number, p: IEscrowPayment) => sum + p.amount, 0);

  // Filter payments
  const filteredPayments = payments.filter((payment: IEscrowPayment) => {
    // Status filter
    if (statusFilter !== 'all' && payment.status !== statusFilter) return false;

    // Date range filter
    if (dateRange !== 'all') {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (paymentDate < weekAgo) return false;
      } else if (dateRange === 'month') {
        if (paymentDate < startOfMonth(now)) return false;
      } else if (dateRange === '3months') {
        const threeMonthsAgo = subMonths(now, 3);
        if (paymentDate < threeMonthsAgo) return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.gig?.title?.toLowerCase().includes(query) ||
        payment.freelancer?.full_name?.toLowerCase().includes(query) ||
        payment.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Tab filtering
  const tabFilteredPayments = filteredPayments.filter((payment: IEscrowPayment) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'escrow') return payment.status === 'funded';
    if (activeTab === 'released') return payment.status === 'released';
    if (activeTab === 'refunded') return payment.status === 'refunded';
    if (activeTab === 'disputed') return payment.status === 'disputed';
    return true;
  });

  const isLoading = paymentsLoading || statsLoading;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className="text-muted-foreground">
              Manage your payments and escrow transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/gig-management">
                <Eye className="h-4 w-4 mr-2" />
                View Gigs
              </Link>
            </Button>
            <Button asChild>
              <Link to="/post-gig">
                <DollarSign className="h-4 w-4 mr-2" />
                Post New Gig
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">R{totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">R{inEscrow.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">In Escrow</p>
                </div>
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">R{released.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Released</p>
                </div>
                <div className="p-2 rounded-full bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">R{refunded.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Refunded</p>
                </div>
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <RefreshCw className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Spending Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">R{thisMonthTotal.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {thisMonthPayments.length} transactions
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last Month</p>
                <p className="text-xl text-muted-foreground">R{lastMonthTotal.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {lastMonthPayments.length} transactions
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Change</p>
                <div className="flex items-center gap-2">
                  {thisMonthTotal >= lastMonthTotal ? (
                    <>
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                      <span className="text-xl font-bold text-green-500">
                        +R{(thisMonthTotal - lastMonthTotal).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-5 w-5 text-red-500" />
                      <span className="text-xl font-bold text-red-500">
                        -R{(lastMonthTotal - thisMonthTotal).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by gig, freelancer, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="funded">In Escrow</SelectItem>
              <SelectItem value="released">Released</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs and Payments List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">
              All ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="escrow">
              In Escrow ({payments.filter((p: IEscrowPayment) => p.status === 'funded').length})
            </TabsTrigger>
            <TabsTrigger value="released">
              Released ({payments.filter((p: IEscrowPayment) => p.status === 'released').length})
            </TabsTrigger>
            <TabsTrigger value="refunded">
              Refunded ({payments.filter((p: IEscrowPayment) => p.status === 'refunded').length})
            </TabsTrigger>
            <TabsTrigger value="disputed">
              Disputed ({payments.filter((p: IEscrowPayment) => p.status === 'disputed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : tabFilteredPayments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No payments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Your payment history will appear here'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gig / Freelancer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tabFilteredPayments.map((payment: IEscrowPayment) => {
                      const status = ESCROW_STATUS_CONFIG[payment.status];
                      const StatusIcon = status.icon;
                      const PaymentIcon = PAYMENT_METHOD_ICONS[payment.payment_method || 'default'] || DollarSign;

                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={payment.freelancer?.avatar_url} />
                                <AvatarFallback>
                                  {payment.freelancer?.full_name?.[0] || 'F'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium line-clamp-1">
                                  {payment.gig?.title || 'Unknown Gig'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {payment.freelancer?.full_name || 'Unknown'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">R{payment.amount.toLocaleString()}</p>
                              {payment.platform_fee && (
                                <p className="text-xs text-muted-foreground">
                                  Fee: R{payment.platform_fee.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm capitalize">
                                {payment.payment_method || 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('gap-1', status.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">
                                {format(new Date(payment.created_at), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/gigs/${payment.gig_id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {payment.status === 'disputed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/disputes/${payment.dispute_id}`)}
                                >
                                  View Dispute
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Escrow Info */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium">Escrow Protection</h4>
                <p className="text-sm text-muted-foreground">
                  All payments are held securely in escrow until you approve the completed work. 
                  This protects both you and the freelancer.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Funds are held securely until work is approved
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Milestone-based releases for better control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Dispute resolution available if issues arise
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-muted-foreground">Quick Actions:</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/gig-management">
                  <Wallet className="h-4 w-4 mr-2" />
                  Manage Gigs
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/disputes">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View Disputes
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/help">
                  <Info className="h-4 w-4 mr-2" />
                  Payment Help
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
