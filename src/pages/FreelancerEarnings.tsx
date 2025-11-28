/**
 * @fileoverview Freelancer Earnings page
 * Dashboard for freelancers to track earnings, payouts, and bank account management
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
  Building2,
  ArrowDownToLine,
  Calendar,
  CreditCard,
  Loader2,
  ExternalLink,
  ChevronRight,
  Shield,
  Info,
  BanknoteIcon,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useMyPayouts, 
  usePaymentStats, 
  useMyBankAccount,
  useRequestPayout,
} from '@/hooks/use-gig-lifecycle';
import { BankAccountForm } from '@/components/gig/BankAccountForm';
import type { IFreelancerPayout, PayoutStatus } from '@/types/gig';
import { format, formatDistanceToNow, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500', icon: Loader2 },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500', icon: AlertCircle },
};

export default function FreelancerEarnings() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBankForm, setShowBankForm] = useState(false);

  // Fetch data
  const { data: payouts = [], isLoading: payoutsLoading } = useMyPayouts();
  const { data: stats, isLoading: statsLoading } = usePaymentStats();
  const { data: bankAccount, isLoading: bankLoading } = useMyBankAccount();
  const requestPayout = useRequestPayout();

  // Calculate earnings metrics
  const totalEarned = stats?.totalEarned || 0;
  const availableForPayout = stats?.availableForPayout || 0;
  const pendingPayouts = stats?.pendingPayouts || 0;
  const inEscrow = stats?.inEscrow || 0;

  // Monthly comparison
  const thisMonth = payouts.filter((p: IFreelancerPayout) => {
    const date = new Date(p.created_at);
    return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
  });
  const lastMonth = payouts.filter((p: IFreelancerPayout) => {
    const date = new Date(p.created_at);
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const thisMonthTotal = thisMonth.reduce((sum: number, p: IFreelancerPayout) => 
    p.status === 'completed' ? sum + p.amount : sum, 0
  );
  const lastMonthTotal = lastMonth.reduce((sum: number, p: IFreelancerPayout) => 
    p.status === 'completed' ? sum + p.amount : sum, 0
  );
  const monthlyChange = lastMonthTotal > 0 
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  const handleRequestPayout = async () => {
    if (availableForPayout <= 0 || !bankAccount) return;
    await requestPayout.mutateAsync({ amount: availableForPayout });
  };

  const isLoading = payoutsLoading || statsLoading || bankLoading;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Earnings & Payouts</h1>
            <p className="text-muted-foreground">
              Track your income and manage payouts
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showBankForm} onOpenChange={setShowBankForm}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  {bankAccount ? 'Update Bank' : 'Add Bank Account'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Bank Account Details</DialogTitle>
                  <DialogDescription>
                    Add your South African bank account for payouts
                  </DialogDescription>
                </DialogHeader>
                <BankAccountForm 
                  existingAccount={bankAccount}
                  onSuccess={() => setShowBankForm(false)}
                />
              </DialogContent>
            </Dialog>
            <Button 
              onClick={handleRequestPayout}
              disabled={availableForPayout <= 0 || !bankAccount || requestPayout.isPending}
            >
              {requestPayout.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowDownToLine className="h-4 w-4 mr-2" />
              )}
              Request Payout
            </Button>
          </div>
        </div>

        {/* Bank Account Warning */}
        {!bankAccount && !bankLoading && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Bank Account Required</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your bank account details to receive payouts for completed gigs.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setShowBankForm(true)}
                  >
                    Add Bank Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">R{totalEarned.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
                <div className="p-2 rounded-full bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">R{availableForPayout.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">R{pendingPayouts.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Pending Payouts</p>
                </div>
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">R{inEscrow.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">In Escrow</p>
                </div>
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-xl font-bold">R{thisMonthTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Month</span>
                  <span className="text-lg text-muted-foreground">
                    R{lastMonthTotal.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  {monthlyChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    monthlyChange >= 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">from last month</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Completed gigs this month</span>
                  <span className="font-medium">{thisMonth.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Average per gig</span>
                  <span className="font-medium">
                    R{thisMonth.length > 0 ? Math.round(thisMonthTotal / thisMonth.length).toLocaleString() : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Platform fees paid</span>
                  <span className="font-medium text-muted-foreground">
                    R{Math.round(thisMonthTotal * 0.1).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payouts">Payout History</TabsTrigger>
            <TabsTrigger value="earnings">Earnings Breakdown</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Bank Account Status */}
            {bankAccount && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Connected Bank Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">{bankAccount.bank_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ****{bankAccount.account_number?.slice(-4)} • {bankAccount.account_holder}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Payouts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Payouts</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('payouts')}>
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-8">
                    <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No payouts yet</p>
                    <p className="text-sm text-muted-foreground">
                      Complete gigs to start earning
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payouts.slice(0, 5).map((payout: IFreelancerPayout) => {
                      const status = PAYOUT_STATUS_CONFIG[payout.status];
                      const StatusIcon = status.icon;
                      return (
                        <div
                          key={payout.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'p-2 rounded-full',
                              payout.status === 'completed' ? 'bg-green-500/10' : 'bg-muted'
                            )}>
                              <StatusIcon className={cn(
                                'h-4 w-4',
                                payout.status === 'completed' ? 'text-green-500' :
                                payout.status === 'processing' ? 'text-blue-500 animate-spin' :
                                payout.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                              )} />
                            </div>
                            <div>
                              <p className="font-medium">R{payout.amount.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(payout.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Earnings Info */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium">How Earnings Work</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Payments are held in escrow until milestone completion</li>
                      <li>• 10% platform fee is deducted from each payment</li>
                      <li>• Payouts are processed within 2-3 business days</li>
                      <li>• EFT payouts have a 0.5% processing fee</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payout History</CardTitle>
                <CardDescription>All your payout transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <div className="text-center py-12">
                    <BanknoteIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">No payouts yet</p>
                    <p className="text-sm text-muted-foreground">
                      Your payout history will appear here
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout: IFreelancerPayout) => {
                        const status = PAYOUT_STATUS_CONFIG[payout.status];
                        return (
                          <TableRow key={payout.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {format(new Date(payout.created_at), 'MMM d, yyyy')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(payout.created_at), 'h:mm a')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-600">
                                R{payout.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{payout.bank_name || 'Unknown'}</p>
                                <p className="text-muted-foreground">
                                  ****{payout.account_number?.slice(-4)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={status.color}>{status.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <code className="text-xs text-muted-foreground">
                                {payout.reference || payout.id.slice(0, 8)}
                              </code>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Breakdown Tab */}
          <TabsContent value="earnings">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Earnings Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        R{totalEarned.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Gross Earnings</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 text-center">
                      <p className="text-3xl font-bold text-red-600">
                        -R{Math.round(totalEarned * 0.1).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Platform Fees (10%)</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-3xl font-bold text-primary">
                        R{Math.round(totalEarned * 0.9).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Net Earnings</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Completed Payments</span>
                      <span className="font-medium">
                        {payouts.filter((p: IFreelancerPayout) => p.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pending Payments</span>
                      <span className="font-medium">
                        {payouts.filter((p: IFreelancerPayout) => p.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Average Payment</span>
                      <span className="font-medium">
                        R{payouts.length > 0 
                          ? Math.round(totalEarned / payouts.length).toLocaleString() 
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm text-muted-foreground">Quick Links:</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/gigs">
                        <Wallet className="h-4 w-4 mr-2" />
                        My Gigs
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/disputes">
                        <Shield className="h-4 w-4 mr-2" />
                        Disputes
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/help">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Help Center
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
