/**
 * @fileoverview Analytics page with role-specific dashboards
 * @module pages/Analytics
 */

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    StatCard,
    DateRangePicker,
    ExportButton,
    AnalyticsEmptyState,
    PerformanceBadge,
} from '@/components/analytics/DashboardComponents';
import { LineChart, AreaChart, MultiLineChart } from '@/components/analytics/Charts';
import { useCombinedAnalytics, useDateRange, useTransactions } from '@/hooks/useAnalytics';
import { useSupabase } from '@/providers/SupabaseProvider';
import { formatCurrency, formatPercentage, exportToCSV, exportToJSON } from '@/types/analytics';
import { DollarSign, TrendingUp, Briefcase, Star, Clock, Target } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_STATUS_LABELS, getTransactionStatusColor } from '@/types/analytics';
import { Badge } from '@/components/ui/badge';

export default function Analytics() {
    const { user } = useSupabase();
    const userRole = (user?.user_metadata?.role as 'freelancer' | 'client') || 'freelancer';

    const {
        dateRange,
        selectedPreset,
        presets,
        selectPreset,
        setCustomRange,
    } = useDateRange('Last 30 days');

    const { summary, performance, financial, timeSeries, isLoading, refetch } = useCombinedAnalytics(
        user?.id || '',
        userRole,
        dateRange
    );

    const { data: transactionsData, isLoading: isLoadingTransactions } = useTransactions(
        user?.id || '',
        { dateRange },
        10
    );

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
        setIsExporting(true);
        try {
            const dataToExport = {
                summary,
                performance,
                financial,
                timeSeries,
                transactions: transactionsData?.transactions || [],
                dateRange: {
                    start: dateRange.start.toISOString(),
                    end: dateRange.end.toISOString(),
                },
            };

            if (format === 'csv' && transactionsData?.transactions) {
                exportToCSV(
                    transactionsData.transactions.map((t) => ({
                        date: new Date(t.created_at).toLocaleDateString(),
                        type: TRANSACTION_TYPE_LABELS[t.type],
                        amount: t.amount,
                        status: TRANSACTION_STATUS_LABELS[t.status],
                        description: t.description || '',
                    })),
                    `analytics-${new Date().toISOString().split('T')[0]}`
                );
            } else if (format === 'json') {
                exportToJSON(dataToExport, `analytics-${new Date().toISOString().split('T')[0]}`);
            }
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Analytics"
                    subtitle="Track your performance and financial insights"
                />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <StatCard key={i} title="Loading..." value="..." isLoading />
                    ))}
                </div>
            </div>
        );
    }

    if (!summary && !performance && !financial) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Analytics"
                    subtitle="Track your performance and financial insights"
                />
                <AnalyticsEmptyState />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Analytics"
                subtitle={
                    userRole === 'freelancer'
                        ? 'Track your earnings and performance'
                        : 'Monitor your spending and project investments'
                }
                action={
                    <div className="flex items-center gap-2">
                        <DateRangePicker
                            dateRange={dateRange}
                            presets={presets}
                            selectedPreset={selectedPreset}
                            onPresetSelect={selectPreset}
                            onRangeChange={setCustomRange}
                        />
                        <ExportButton onExport={handleExport} isLoading={isExporting} />
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={userRole === 'freelancer' ? 'Total Earnings' : 'Total Spending'}
                    value={formatCurrency(
                        userRole === 'freelancer' ? summary?.totalEarnings || 0 : summary?.totalSpending || 0
                    )}
                    description="This period"
                    trend={summary?.earningsTrend}
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                    inverseTrend={userRole === 'client'}
                />
                <StatCard
                    title="Net Income"
                    value={formatCurrency(summary?.netIncome || 0)}
                    description="After fees"
                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Active Projects"
                    value={summary?.activeProjects || 0}
                    description={`${summary?.completedProjects || 0} completed`}
                    icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Average Rating"
                    value={performance?.avg_rating ? performance.avg_rating.toFixed(1) : 'N/A'}
                    description={performance?.avg_rating ? `${formatPercentage(performance.avg_completion_rate || 0)} completion` : 'No ratings yet'}
                    icon={<Star className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {userRole === 'freelancer' ? (
                            <AreaChart
                                data={timeSeries || []}
                                dataKey="earnings"
                                title="Earnings Over Time"
                                description="Your earnings trend"
                                color="#10b981"
                                isLoading={isLoading}
                            />
                        ) : (
                            <AreaChart
                                data={timeSeries || []}
                                dataKey="spending"
                                title="Spending Over Time"
                                description="Your spending trend"
                                color="#ef4444"
                                isLoading={isLoading}
                            />
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>Your overall performance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Completion Rate</span>
                                    </div>
                                    <span className="font-semibold">
                                        {formatPercentage(performance?.avg_completion_rate || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">On-Time Delivery</span>
                                    </div>
                                    <span className="font-semibold">
                                        {formatPercentage(performance?.on_time_percentage || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Total Projects</span>
                                    </div>
                                    <span className="font-semibold">
                                        {performance?.total_projects || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Rating</span>
                                    </div>
                                    <PerformanceBadge rating={performance?.avg_rating || null} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {timeSeries && timeSeries.length > 0 && userRole === 'freelancer' && (
                        <MultiLineChart
                            data={timeSeries}
                            lines={[
                                { dataKey: 'earnings', name: 'Earnings', color: '#10b981' },
                                { dataKey: 'fees', name: 'Fees', color: '#ef4444' },
                                { dataKey: 'net', name: 'Net', color: '#3b82f6' },
                            ]}
                            title="Financial Breakdown"
                            description="Compare earnings, fees, and net income"
                        />
                    )}
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                Your latest financial activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTransactions ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    Loading transactions...
                                </p>
                            ) : transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactionsData.transactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>
                                                    {new Date(transaction.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {TRANSACTION_TYPE_LABELS[transaction.type]}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatCurrency(transaction.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={getTransactionStatusColor(transaction.status)}
                                                    >
                                                        {TRANSACTION_STATUS_LABELS[transaction.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {transaction.description || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center py-8 text-muted-foreground">
                                    No transactions in this period
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Hours</CardTitle>
                                <CardDescription>Time worked</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {performance?.total_hours?.toFixed(1) || 0}h
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Across {performance?.completed_projects || 0} projects
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Average Rating</CardTitle>
                                <CardDescription>Client satisfaction</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {performance?.avg_rating?.toFixed(1) || 'N/A'}
                                    {performance?.avg_rating && <span className="text-lg text-muted-foreground">/5.0</span>}
                                </div>
                                <div className="mt-2">
                                    <PerformanceBadge rating={performance?.avg_rating || null} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Completion Rate</CardTitle>
                                <CardDescription>Project success</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {formatPercentage(performance?.avg_completion_rate || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatPercentage(performance?.on_time_percentage || 0)} on-time delivery
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
