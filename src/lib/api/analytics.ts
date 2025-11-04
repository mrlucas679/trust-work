/**
 * @fileoverview Analytics API functions
 * @module lib/api/analytics
 */

import { supabase } from '../supabaseClient';
import type {
    Transaction,
    ProjectStats,
    AnalyticsSummary,
    EarningsOverview,
    SpendingOverview,
    PerformanceMetrics,
    DashboardSummary,
    TimeSeriesData,
    DateRange,
    AnalyticsFilters,
    TransactionType,
    TransactionStatus,
} from '@/types/analytics';

/**
 * Get earnings overview for a user
 */
export async function getEarningsOverview(
    userId: string,
    dateRange?: DateRange
): Promise<EarningsOverview> {
    try {
        // Get current period earnings
        const { data: current, error } = await supabase.rpc('get_earnings_summary', {
            p_user_id: userId,
            p_start_date: dateRange?.start.toISOString().split('T')[0],
            p_end_date: dateRange?.end.toISOString().split('T')[0],
        });

        if (error) throw error;

        const currentData = Array.isArray(current) ? current[0] : current;

        // Get previous period for growth calculation
        let growthPercentage: number | null = null;
        if (dateRange) {
            const daysDiff = Math.ceil(
                (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
            );
            const previousStart = new Date(dateRange.start);
            previousStart.setDate(previousStart.getDate() - daysDiff);
            const previousEnd = new Date(dateRange.start);
            previousEnd.setDate(previousEnd.getDate() - 1);

            const { data: previous } = await supabase.rpc('get_earnings_summary', {
                p_user_id: userId,
                p_start_date: previousStart.toISOString().split('T')[0],
                p_end_date: previousEnd.toISOString().split('T')[0],
            });

            const previousData = Array.isArray(previous) ? previous[0] : previous;
            if (previousData && previousData.total_earnings > 0) {
                growthPercentage =
                    ((currentData.total_earnings - previousData.total_earnings) /
                        previousData.total_earnings) *
                    100;
            }
        }

        return {
            total_earnings: Number(currentData.total_earnings) || 0,
            total_fees: Number(currentData.total_fees) || 0,
            net_earnings: Number(currentData.net_earnings) || 0,
            transaction_count: Number(currentData.transaction_count) || 0,
            avg_per_transaction: Number(currentData.avg_per_transaction) || 0,
            growth_percentage: growthPercentage,
        };
    } catch (error) {
        console.error('Error fetching earnings overview:', error);
        throw new Error('Failed to fetch earnings overview');
    }
}

/**
 * Get spending overview for a user
 */
export async function getSpendingOverview(
    userId: string,
    dateRange?: DateRange
): Promise<SpendingOverview> {
    try {
        // Get current period spending
        const { data: current, error } = await supabase.rpc('get_spending_summary', {
            p_user_id: userId,
            p_start_date: dateRange?.start.toISOString().split('T')[0],
            p_end_date: dateRange?.end.toISOString().split('T')[0],
        });

        if (error) throw error;

        const currentData = Array.isArray(current) ? current[0] : current;

        // Get previous period for growth calculation
        let growthPercentage: number | null = null;
        if (dateRange) {
            const daysDiff = Math.ceil(
                (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
            );
            const previousStart = new Date(dateRange.start);
            previousStart.setDate(previousStart.getDate() - daysDiff);
            const previousEnd = new Date(dateRange.start);
            previousEnd.setDate(previousEnd.getDate() - 1);

            const { data: previous } = await supabase.rpc('get_spending_summary', {
                p_user_id: userId,
                p_start_date: previousStart.toISOString().split('T')[0],
                p_end_date: previousEnd.toISOString().split('T')[0],
            });

            const previousData = Array.isArray(previous) ? previous[0] : previous;
            if (previousData && previousData.total_spending > 0) {
                growthPercentage =
                    ((currentData.total_spending - previousData.total_spending) /
                        previousData.total_spending) *
                    100;
            }
        }

        return {
            total_spending: Number(currentData.total_spending) || 0,
            total_fees: Number(currentData.total_fees) || 0,
            transaction_count: Number(currentData.transaction_count) || 0,
            avg_per_transaction: Number(currentData.avg_per_transaction) || 0,
            growth_percentage: growthPercentage,
        };
    } catch (error) {
        console.error('Error fetching spending overview:', error);
        throw new Error('Failed to fetch spending overview');
    }
}

/**
 * Get performance metrics for a user
 */
export async function getPerformanceMetrics(
    userId: string,
    role?: 'freelancer' | 'client'
): Promise<PerformanceMetrics> {
    try {
        const { data, error } = await supabase.rpc('get_project_statistics', {
            p_user_id: userId,
            p_role: role || null,
        });

        if (error) throw error;

        const result = Array.isArray(data) ? data[0] : data;

        return {
            total_projects: Number(result.total_projects) || 0,
            completed_projects: Number(result.completed_projects) || 0,
            active_projects: Number(result.active_projects) || 0,
            avg_rating: result.avg_rating ? Number(result.avg_rating) : null,
            avg_completion_rate: result.avg_completion_rate ? Number(result.avg_completion_rate) : null,
            total_hours: Number(result.total_hours) || 0,
            on_time_percentage: result.on_time_percentage ? Number(result.on_time_percentage) : null,
        };
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        throw new Error('Failed to fetch performance metrics');
    }
}

/**
 * Get dashboard summary (quick stats)
 */
export async function getDashboardSummary(
    userId: string,
    role: 'freelancer' | 'client'
): Promise<DashboardSummary> {
    try {
        // Get financial overview
        const financialPromise =
            role === 'freelancer'
                ? getEarningsOverview(userId)
                : getSpendingOverview(userId);

        // Get performance metrics
        const metricsPromise = getPerformanceMetrics(userId, role);

        // Get pending transactions
        const pendingPromise = supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId)
            .in('status', ['pending', 'processing']);

        const [financial, metrics, { data: pending }] = await Promise.all([
            financialPromise,
            metricsPromise,
            pendingPromise,
        ]);

        const pendingAmount = pending?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        return {
            totalEarnings: role === 'freelancer' ? (financial as EarningsOverview).total_earnings : 0,
            totalSpending: role === 'client' ? (financial as SpendingOverview).total_spending : 0,
            netIncome:
                role === 'freelancer'
                    ? (financial as EarningsOverview).net_earnings
                    : -(financial as SpendingOverview).total_spending,
            pendingAmount,
            activeProjects: metrics.active_projects,
            completedProjects: metrics.completed_projects,
            totalProjects: metrics.total_projects,
            avgRating: metrics.avg_rating,
            completionRate: metrics.avg_completion_rate,
            onTimeDelivery: metrics.on_time_percentage,
            earningsTrend: financial.growth_percentage,
            projectsTrend: null, // Would need historical project count
            ratingTrend: null, // Would need historical rating
        };
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        throw new Error('Failed to fetch dashboard summary');
    }
}

/**
 * Get transactions with filters
 */
export async function getTransactions(
    userId: string,
    filters?: AnalyticsFilters,
    limit: number = 50,
    offset: number = 0
): Promise<{ transactions: Transaction[]; total: number }> {
    try {
        let query = supabase
            .from('transactions')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters?.dateRange) {
            query = query
                .gte('created_at', filters.dateRange.start.toISOString())
                .lte('created_at', filters.dateRange.end.toISOString());
        }

        if (filters?.transactionType) {
            query = query.eq('type', filters.transactionType);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            transactions: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

/**
 * Get project statistics list
 */
export async function getProjectStatsList(
    userId: string,
    role?: 'freelancer' | 'client',
    limit: number = 50
): Promise<ProjectStats[]> {
    try {
        let query = supabase
            .from('project_stats')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (role) {
            query = query.eq('role', role);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching project stats:', error);
        throw new Error('Failed to fetch project statistics');
    }
}

/**
 * Get earnings time series data
 */
export async function getEarningsTimeSeries(
    userId: string,
    dateRange: DateRange
): Promise<TimeSeriesData[]> {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('created_at, amount, type')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .in('type', ['earning', 'platform_fee'])
            .gte('created_at', dateRange.start.toISOString())
            .lte('created_at', dateRange.end.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by date
        const grouped = new Map<string, { earnings: number; fees: number }>();

        data?.forEach((transaction) => {
            const date = transaction.created_at.split('T')[0];
            const current = grouped.get(date) || { earnings: 0, fees: 0 };

            if (transaction.type === 'earning') {
                current.earnings += Number(transaction.amount);
            } else if (transaction.type === 'platform_fee') {
                current.fees += Number(transaction.amount);
            }

            grouped.set(date, current);
        });

        return Array.from(grouped.entries())
            .map(([period, values]) => ({
                period,
                earnings: values.earnings,
                fees: values.fees,
                net: values.earnings - values.fees,
            }))
            .sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
        console.error('Error fetching earnings time series:', error);
        throw new Error('Failed to fetch earnings time series');
    }
}

/**
 * Get spending time series data
 */
export async function getSpendingTimeSeries(
    userId: string,
    dateRange: DateRange
): Promise<TimeSeriesData[]> {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('created_at, amount, type')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .in('type', ['spending', 'platform_fee'])
            .gte('created_at', dateRange.start.toISOString())
            .lte('created_at', dateRange.end.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by date
        const grouped = new Map<string, { spending: number; fees: number }>();

        data?.forEach((transaction) => {
            const date = transaction.created_at.split('T')[0];
            const current = grouped.get(date) || { spending: 0, fees: 0 };

            if (transaction.type === 'spending') {
                current.spending += Number(transaction.amount);
            } else if (transaction.type === 'platform_fee') {
                current.fees += Number(transaction.amount);
            }

            grouped.set(date, current);
        });

        return Array.from(grouped.entries())
            .map(([period, values]) => ({
                period,
                spending: values.spending,
                fees: values.fees,
                total: values.spending + values.fees,
            }))
            .sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
        console.error('Error fetching spending time series:', error);
        throw new Error('Failed to fetch spending time series');
    }
}

/**
 * Get analytics summary by period
 */
export async function getAnalyticsSummary(
    userId: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'yearly',
    limit: number = 12
): Promise<AnalyticsSummary[]> {
    try {
        const { data, error } = await supabase
            .from('analytics_summary')
            .select('*')
            .eq('user_id', userId)
            .eq('period_type', periodType)
            .order('period_start', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        throw new Error('Failed to fetch analytics summary');
    }
}

/**
 * Create a transaction
 */
export async function createTransaction(
    transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
): Promise<Transaction> {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transaction)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error('Failed to create transaction');
    }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus
): Promise<Transaction> {
    try {
        const updates: Partial<Transaction> = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', transactionId)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error updating transaction status:', error);
        throw new Error('Failed to update transaction status');
    }
}

/**
 * Create project stats
 */
export async function createProjectStats(
    stats: Omit<ProjectStats, 'id' | 'created_at' | 'updated_at'>
): Promise<ProjectStats> {
    try {
        const { data, error } = await supabase
            .from('project_stats')
            .insert(stats)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error creating project stats:', error);
        throw new Error('Failed to create project stats');
    }
}

/**
 * Update project stats
 */
export async function updateProjectStats(
    statsId: string,
    updates: Partial<ProjectStats>
): Promise<ProjectStats> {
    try {
        const { data, error } = await supabase
            .from('project_stats')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', statsId)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error updating project stats:', error);
        throw new Error('Failed to update project stats');
    }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error fetching transaction:', error);
        throw new Error('Failed to fetch transaction');
    }
}

/**
 * Delete transaction
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', transactionId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw new Error('Failed to delete transaction');
    }
}
