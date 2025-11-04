/**
 * @fileoverview Custom hooks for analytics data
 * @module hooks/useAnalytics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
    getEarningsOverview,
    getSpendingOverview,
    getPerformanceMetrics,
    getDashboardSummary,
    getTransactions,
    getProjectStatsList,
    getEarningsTimeSeries,
    getSpendingTimeSeries,
    getAnalyticsSummary,
    createTransaction,
    updateTransactionStatus,
    createProjectStats,
    updateProjectStats,
} from '@/lib/api/analytics';
import type {
    DateRange,
    AnalyticsFilters,
    EarningsOverview,
    SpendingOverview,
    PerformanceMetrics,
    DashboardSummary,
    Transaction,
    ProjectStats,
    TimeSeriesData,
    TransactionStatus,
} from '@/types/analytics';
import { getDateRangePresets } from '@/types/analytics';

/**
 * Hook for earnings analytics
 */
export function useEarningsAnalytics(userId: string, dateRange?: DateRange) {
    return useQuery({
        queryKey: ['earnings', userId, dateRange?.start, dateRange?.end],
        queryFn: () => getEarningsOverview(userId, dateRange),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for spending analytics
 */
export function useSpendingAnalytics(userId: string, dateRange?: DateRange) {
    return useQuery({
        queryKey: ['spending', userId, dateRange?.start, dateRange?.end],
        queryFn: () => getSpendingOverview(userId, dateRange),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for performance metrics
 */
export function usePerformanceMetrics(userId: string, role?: 'freelancer' | 'client') {
    return useQuery({
        queryKey: ['performance', userId, role],
        queryFn: () => getPerformanceMetrics(userId, role),
        enabled: !!userId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook for dashboard summary
 */
export function useDashboardSummary(userId: string, role: 'freelancer' | 'client') {
    return useQuery({
        queryKey: ['dashboard-summary', userId, role],
        queryFn: () => getDashboardSummary(userId, role),
        enabled: !!userId && !!role,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for transactions list with pagination
 */
export function useTransactions(
    userId: string,
    filters?: AnalyticsFilters,
    limit: number = 50,
    offset: number = 0
) {
    return useQuery({
        queryKey: ['transactions', userId, filters, limit, offset],
        queryFn: () => getTransactions(userId, filters, limit, offset),
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        keepPreviousData: true, // For pagination
    });
}

/**
 * Hook for project stats list
 */
export function useProjectStats(
    userId: string,
    role?: 'freelancer' | 'client',
    limit: number = 50
) {
    return useQuery({
        queryKey: ['project-stats', userId, role, limit],
        queryFn: () => getProjectStatsList(userId, role, limit),
        enabled: !!userId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook for earnings time series
 */
export function useEarningsTimeSeries(userId: string, dateRange: DateRange) {
    return useQuery({
        queryKey: ['earnings-time-series', userId, dateRange.start, dateRange.end],
        queryFn: () => getEarningsTimeSeries(userId, dateRange),
        enabled: !!userId && !!dateRange,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for spending time series
 */
export function useSpendingTimeSeries(userId: string, dateRange: DateRange) {
    return useQuery({
        queryKey: ['spending-time-series', userId, dateRange.start, dateRange.end],
        queryFn: () => getSpendingTimeSeries(userId, dateRange),
        enabled: !!userId && !!dateRange,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for analytics summary by period
 */
export function useAnalyticsSummary(
    userId: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'yearly',
    limit: number = 12
) {
    return useQuery({
        queryKey: ['analytics-summary', userId, periodType, limit],
        queryFn: () => getAnalyticsSummary(userId, periodType, limit),
        enabled: !!userId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook for creating transactions
 */
export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            // Invalidate all analytics queries
            queryClient.invalidateQueries({ queryKey: ['earnings'] });
            queryClient.invalidateQueries({ queryKey: ['spending'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
        },
    });
}

/**
 * Hook for updating transaction status
 */
export function useUpdateTransactionStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: TransactionStatus }) =>
            updateTransactionStatus(id, status),
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['earnings'] });
            queryClient.invalidateQueries({ queryKey: ['spending'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        },
    });
}

/**
 * Hook for creating project stats
 */
export function useCreateProjectStats() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProjectStats,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-stats'] });
            queryClient.invalidateQueries({ queryKey: ['performance'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        },
    });
}

/**
 * Hook for updating project stats
 */
export function useUpdateProjectStats() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<ProjectStats> }) =>
            updateProjectStats(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-stats'] });
            queryClient.invalidateQueries({ queryKey: ['performance'] });
        },
    });
}

/**
 * Hook for managing date range state
 */
export function useDateRange(initialPreset: string = 'Last 30 days') {
    const presets = useMemo(() => getDateRangePresets(), []);
    const initialRange = useMemo(
        () => presets.find((p) => p.label === initialPreset)?.range || presets[1].range,
        [presets, initialPreset]
    );

    const [dateRange, setDateRange] = useState<DateRange>(initialRange);
    const [selectedPreset, setSelectedPreset] = useState<string>(initialPreset);

    const selectPreset = (label: string) => {
        const preset = presets.find((p) => p.label === label);
        if (preset) {
            setDateRange(preset.range);
            setSelectedPreset(label);
        }
    };

    const setCustomRange = (range: DateRange) => {
        setDateRange(range);
        setSelectedPreset('Custom');
    };

    return {
        dateRange,
        selectedPreset,
        presets,
        selectPreset,
        setCustomRange,
        setDateRange,
    };
}

/**
 * Hook for managing analytics filters
 */
export function useAnalyticsFilters(initialFilters?: AnalyticsFilters) {
    const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters || {});

    const updateFilter = <K extends keyof AnalyticsFilters>(
        key: K,
        value: AnalyticsFilters[K]
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const clearFilter = (key: keyof AnalyticsFilters) => {
        setFilters((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };

    const clearAllFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return {
        filters,
        setFilters,
        updateFilter,
        clearFilter,
        clearAllFilters,
        hasActiveFilters,
    };
}

/**
 * Hook for combined analytics data (for dashboard)
 */
export function useCombinedAnalytics(
    userId: string,
    role: 'freelancer' | 'client',
    dateRange?: DateRange
) {
    const summary = useDashboardSummary(userId, role);
    const performance = usePerformanceMetrics(userId, role);

    // Always call both hooks, but only use one based on role
    const earnings = useEarningsAnalytics(userId, dateRange);
    const spending = useSpendingAnalytics(userId, dateRange);

    const defaultRange = useMemo(() => getDefaultDateRange(), []);
    const activeRange = dateRange || defaultRange;

    const earningsTimeSeries = useEarningsTimeSeries(userId, activeRange);
    const spendingTimeSeries = useSpendingTimeSeries(userId, activeRange);

    const financialData = role === 'freelancer' ? earnings : spending;
    const timeSeries = role === 'freelancer' ? earningsTimeSeries : spendingTimeSeries;

    const isLoading =
        summary.isLoading || performance.isLoading || financialData.isLoading || timeSeries.isLoading;

    const isError =
        summary.isError || performance.isError || financialData.isError || timeSeries.isError;

    return {
        summary: summary.data,
        performance: performance.data,
        financial: financialData.data,
        timeSeries: timeSeries.data,
        isLoading,
        isError,
        refetch: () => {
            summary.refetch();
            performance.refetch();
            earnings.refetch();
            spending.refetch();
            earningsTimeSeries.refetch();
            spendingTimeSeries.refetch();
        },
    };
}

/**
 * Helper to get default date range (last 30 days)
 */
function getDefaultDateRange(): DateRange {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
}
