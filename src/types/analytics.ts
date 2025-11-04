/**
 * @fileoverview Analytics types and utilities
 * @module types/analytics
 */

/**
 * Transaction types
 */
export type TransactionType =
    | 'earning'
    | 'spending'
    | 'withdrawal'
    | 'deposit'
    | 'refund'
    | 'platform_fee'
    | 'bonus'
    | 'penalty';

/**
 * Transaction status
 */
export type TransactionStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded';

/**
 * Period types for analytics
 */
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Date range for filtering
 */
export interface DateRange {
    start: Date;
    end: Date;
}

/**
 * Transaction interface
 */
export interface Transaction {
    id: string;
    user_id: string;
    assignment_id: string | null;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    payment_method: string | null;
    payment_reference: string | null;
    description: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}

/**
 * Project statistics interface
 */
export interface ProjectStats {
    id: string;
    user_id: string;
    assignment_id: string | null;
    role: 'freelancer' | 'client';

    // Time tracking
    time_estimated_hours: number | null;
    time_actual_hours: number | null;
    time_efficiency_percent: number | null;

    // Quality metrics
    completion_rate: number | null;
    on_time_delivery: boolean | null;
    revision_count: number;

    // Ratings (1-5 scale)
    quality_rating: number | null;
    communication_rating: number | null;
    professionalism_rating: number | null;
    overall_rating: number | null;

    // Dates
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Analytics summary interface
 */
export interface AnalyticsSummary {
    id: string;
    user_id: string;
    period_type: PeriodType;
    period_start: string; // Date string
    period_end: string; // Date string

    // Earnings/Spending
    total_earnings: number;
    total_spending: number;
    platform_fees: number;
    net_amount: number;

    // Project counts
    projects_completed: number;
    projects_active: number;
    projects_cancelled: number;

    // Performance metrics
    avg_completion_rate: number | null;
    avg_rating: number | null;
    total_hours_worked: number | null;

    // Metadata
    currency: string;
    created_at: string;
    updated_at: string;
}

/**
 * Earnings overview
 */
export interface EarningsOverview {
    total_earnings: number;
    total_fees: number;
    net_earnings: number;
    transaction_count: number;
    avg_per_transaction: number;
    growth_percentage: number | null; // Compared to previous period
}

/**
 * Spending overview
 */
export interface SpendingOverview {
    total_spending: number;
    total_fees: number;
    transaction_count: number;
    avg_per_transaction: number;
    growth_percentage: number | null; // Compared to previous period
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    total_projects: number;
    completed_projects: number;
    active_projects: number;
    avg_rating: number | null;
    avg_completion_rate: number | null;
    total_hours: number;
    on_time_percentage: number | null;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
    date: string; // ISO date or display label
    value: number;
    label?: string;
    color?: string;
}

/**
 * Time series data
 */
export interface TimeSeriesData {
    period: string; // Date or label
    earnings?: number;
    spending?: number;
    projects?: number;
    hours?: number;
    [key: string]: string | number | undefined;
}

/**
 * Category breakdown (for pie charts)
 */
export interface CategoryBreakdown {
    category: string;
    value: number;
    percentage: number;
    color?: string;
}

/**
 * Analytics filters
 */
export interface AnalyticsFilters {
    dateRange?: DateRange;
    periodType?: PeriodType;
    transactionType?: TransactionType;
    status?: TransactionStatus;
    role?: 'freelancer' | 'client';
}

/**
 * Export options
 */
export interface ExportOptions {
    format: 'csv' | 'json' | 'pdf';
    dateRange: DateRange;
    includeTransactions?: boolean;
    includeProjects?: boolean;
    includeCharts?: boolean;
}

/**
 * Dashboard summary (quick stats)
 */
export interface DashboardSummary {
    // Financial
    totalEarnings: number;
    totalSpending: number;
    netIncome: number;
    pendingAmount: number;

    // Projects
    activeProjects: number;
    completedProjects: number;
    totalProjects: number;

    // Performance
    avgRating: number | null;
    completionRate: number | null;
    onTimeDelivery: number | null;

    // Trends (vs previous period)
    earningsTrend: number | null;
    projectsTrend: number | null;
    ratingTrend: number | null;
}

/**
 * Top earners/spenders
 */
export interface TopPerformer {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    total_amount: number;
    project_count: number;
    avg_rating: number | null;
}

/**
 * Constants
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    ZAR: 'R',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
    earning: 'Earning',
    spending: 'Spending',
    withdrawal: 'Withdrawal',
    deposit: 'Deposit',
    refund: 'Refund',
    platform_fee: 'Platform Fee',
    bonus: 'Bonus',
    penalty: 'Penalty',
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
};

export const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
};

export const CHART_COLORS = {
    earnings: '#10b981', // green
    spending: '#ef4444', // red
    net: '#3b82f6', // blue
    projects: '#8b5cf6', // purple
    hours: '#f59e0b', // amber
    rating: '#ec4899', // pink
} as const;

/**
 * Helper functions
 */

/**
 * Format currency amount
 */
export function formatCurrency(
    amount: number,
    currency: string = 'USD',
    showSymbol: boolean = true
): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (showSymbol) {
        return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
    }
    return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers (1000 -> 1K, 1000000 -> 1M)
 */
export function formatCompactNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
}

/**
 * Calculate percentage change
 */
export function calculateGrowth(current: number, previous: number): number | null {
    if (previous === 0) return current > 0 ? 100 : null;
    return ((current - previous) / previous) * 100;
}

/**
 * Calculate trend direction
 */
export function getTrendDirection(growth: number | null): 'up' | 'down' | 'neutral' {
    if (growth === null || Math.abs(growth) < 0.01) return 'neutral';
    return growth > 0 ? 'up' : 'down';
}

/**
 * Get color for trend
 */
export function getTrendColor(growth: number | null, inverse: boolean = false): string {
    const direction = getTrendDirection(growth);
    if (direction === 'neutral') return 'text-gray-500';

    const positive = inverse ? 'text-red-500' : 'text-green-500';
    const negative = inverse ? 'text-green-500' : 'text-red-500';

    return direction === 'up' ? positive : negative;
}

/**
 * Get transaction type color
 */
export function getTransactionTypeColor(type: TransactionType): string {
    const colors: Record<TransactionType, string> = {
        earning: 'text-green-600',
        spending: 'text-red-600',
        withdrawal: 'text-blue-600',
        deposit: 'text-blue-600',
        refund: 'text-yellow-600',
        platform_fee: 'text-gray-600',
        bonus: 'text-purple-600',
        penalty: 'text-red-600',
    };
    return colors[type] || 'text-gray-600';
}

/**
 * Get transaction status color
 */
export function getTransactionStatusColor(status: TransactionStatus): string {
    const colors: Record<TransactionStatus, string> = {
        pending: 'text-yellow-600 bg-yellow-50',
        processing: 'text-blue-600 bg-blue-50',
        completed: 'text-green-600 bg-green-50',
        failed: 'text-red-600 bg-red-50',
        cancelled: 'text-gray-600 bg-gray-50',
        refunded: 'text-purple-600 bg-purple-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
}

/**
 * Generate date range presets
 */
export function getDateRangePresets(): Array<{ label: string; range: DateRange }> {
    const now = new Date();

    return [
        {
            label: 'Last 7 days',
            range: {
                start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                end: now,
            },
        },
        {
            label: 'Last 30 days',
            range: {
                start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                end: now,
            },
        },
        {
            label: 'Last 90 days',
            range: {
                start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
                end: now,
            },
        },
        {
            label: 'This month',
            range: {
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: now,
            },
        },
        {
            label: 'Last month',
            range: {
                start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                end: new Date(now.getFullYear(), now.getMonth(), 0),
            },
        },
        {
            label: 'This year',
            range: {
                start: new Date(now.getFullYear(), 0, 1),
                end: now,
            },
        },
    ];
}

/**
 * Format date for display
 */
export function formatAnalyticsDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'long') {
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Group time series data by period
 */
export function groupByPeriod(
    data: Array<{ date: string; value: number }>,
    periodType: PeriodType
): TimeSeriesData[] {
    const grouped = new Map<string, number>();

    data.forEach((item) => {
        const date = new Date(item.date);
        let key: string;

        switch (periodType) {
            case 'daily':
                key = date.toISOString().split('T')[0];
                break;
            case 'weekly':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
                break;
            case 'monthly':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                break;
            case 'yearly':
                key = `${date.getFullYear()}`;
                break;
        }

        grouped.set(key, (grouped.get(key) || 0) + item.value);
    });

    return Array.from(grouped.entries())
        .map(([period, value]) => ({ period, value }))
        .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Calculate category percentages
 */
export function calculateCategoryPercentages(
    categories: Array<{ category: string; value: number }>
): CategoryBreakdown[] {
    const total = categories.reduce((sum, cat) => sum + cat.value, 0);

    return categories.map((cat, index) => ({
        category: cat.category,
        value: cat.value,
        percentage: total > 0 ? (cat.value / total) * 100 : 0,
        color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length],
    }));
}

/**
 * Validate date range
 */
export function isValidDateRange(range: DateRange): boolean {
    return range.start <= range.end;
}

/**
 * Get date range label
 */
export function getDateRangeLabel(range: DateRange): string {
    const start = formatAnalyticsDate(range.start, 'short');
    const end = formatAnalyticsDate(range.end, 'short');
    return `${start} - ${end}`;
}

/**
 * Export data as CSV
 */
export function exportToCSV(data: Array<Record<string, any>>, filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map((row) =>
            headers.map((header) => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            }).join(',')
        ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
}

/**
 * Export data as JSON
 */
export function exportToJSON(data: any, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
}
