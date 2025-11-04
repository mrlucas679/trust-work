/**
 * @fileoverview Tests for analytics API functions
 * @module lib/api/__tests__/analytics.test
 */

import {
    getEarningsOverview,
    getSpendingOverview,
    getPerformanceMetrics,
    getDashboardSummary,
    getTransactions,
    getEarningsTimeSeries,
    getSpendingTimeSeries,
    createTransaction,
    updateTransactionStatus,
} from '../analytics';
import { supabase } from '@/lib/supabaseClient';

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
    supabase: {
        rpc: jest.fn(),
        from: jest.fn(),
    },
}));

describe('Analytics API', () => {
    const mockUserId = 'user-123';
    const mockDateRange = {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getEarningsOverview', () => {
        it('should fetch earnings overview successfully', async () => {
            const mockData = [{
                total_earnings: 5000,
                total_fees: 500,
                net_earnings: 4500,
                transaction_count: 10,
                avg_per_transaction: 500,
            }];

            // Mock will be called twice: once for current period, once for previous period
            (supabase.rpc as jest.Mock)
                .mockResolvedValueOnce({ data: mockData, error: null }) // Current period
                .mockResolvedValueOnce({ data: [{ total_earnings: 0 }], error: null }); // Previous period (0 earnings = no growth calc)

            const result = await getEarningsOverview(mockUserId, mockDateRange);

            expect(supabase.rpc).toHaveBeenCalledWith('get_earnings_summary', {
                p_user_id: mockUserId,
                p_start_date: '2025-01-01',
                p_end_date: '2025-01-31',
            });

            expect(result).toEqual({
                total_earnings: 5000,
                total_fees: 500,
                net_earnings: 4500,
                transaction_count: 10,
                avg_per_transaction: 500,
                growth_percentage: null, // No growth because previous period has 0 earnings
            });
        });

        it('should handle errors gracefully', async () => {
            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: null,
                error: new Error('Database error'),
            });

            await expect(getEarningsOverview(mockUserId)).rejects.toThrow(
                'Failed to fetch earnings overview'
            );
        });
    });

    describe('getSpendingOverview', () => {
        it('should fetch spending overview successfully', async () => {
            const mockData = [{
                total_spending: 3000,
                total_fees: 300,
                transaction_count: 5,
                avg_per_transaction: 600,
            }];

            // Mock will be called twice: current and previous period
            (supabase.rpc as jest.Mock)
                .mockResolvedValueOnce({ data: mockData, error: null })
                .mockResolvedValueOnce({ data: [{ total_spending: 0 }], error: null });

            const result = await getSpendingOverview(mockUserId, mockDateRange);

            expect(result).toEqual({
                total_spending: 3000,
                total_fees: 300,
                transaction_count: 5,
                avg_per_transaction: 600,
                growth_percentage: null, // No growth because previous period has 0 spending
            });
        });
    });

    describe('getPerformanceMetrics', () => {
        it('should fetch performance metrics successfully', async () => {
            const mockData = [{
                total_projects: 15,
                completed_projects: 12,
                active_projects: 3,
                avg_rating: 4.5,
                avg_completion_rate: 95.5,
                total_hours: 120.5,
                on_time_percentage: 90.0,
            }];

            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: mockData,
                error: null,
            });

            const result = await getPerformanceMetrics(mockUserId, 'freelancer');

            expect(supabase.rpc).toHaveBeenCalledWith('get_project_statistics', {
                p_user_id: mockUserId,
                p_role: 'freelancer',
            });

            expect(result).toEqual({
                total_projects: 15,
                completed_projects: 12,
                active_projects: 3,
                avg_rating: 4.5,
                avg_completion_rate: 95.5,
                total_hours: 120.5,
                on_time_percentage: 90.0,
            });
        });
    });

    describe('getTransactions', () => {
        it('should fetch transactions with filters', async () => {
            const mockTransactions = [
                {
                    id: 'txn-1',
                    user_id: mockUserId,
                    type: 'earning',
                    amount: 500,
                    status: 'completed',
                    created_at: '2025-01-15T10:00:00Z',
                },
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                gte: jest.fn().mockReturnThis(),
                lte: jest.fn().mockReturnThis(),
                range: jest.fn().mockResolvedValue({
                    data: mockTransactions,
                    error: null,
                    count: 1,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockQuery);

            const result = await getTransactions(mockUserId, { dateRange: mockDateRange }, 50, 0);

            expect(result).toEqual({
                transactions: mockTransactions,
                total: 1,
            });

            expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockQuery.gte).toHaveBeenCalledWith('created_at', mockDateRange.start.toISOString());
            expect(mockQuery.lte).toHaveBeenCalledWith('created_at', mockDateRange.end.toISOString());
        });
    });

    describe('getEarningsTimeSeries', () => {
        it('should fetch and group earnings time series data', async () => {
            const mockData = [
                {
                    created_at: '2025-01-15T10:00:00Z',
                    amount: 500,
                    type: 'earning',
                },
                {
                    created_at: '2025-01-15T14:00:00Z',
                    amount: 50,
                    type: 'platform_fee',
                },
                {
                    created_at: '2025-01-16T10:00:00Z',
                    amount: 300,
                    type: 'earning',
                },
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                gte: jest.fn().mockReturnThis(),
                lte: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: mockData,
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockQuery);

            const result = await getEarningsTimeSeries(mockUserId, mockDateRange);

            expect(result).toHaveLength(2); // Two distinct dates
            expect(result[0]).toHaveProperty('period');
            expect(result[0]).toHaveProperty('earnings');
            expect(result[0]).toHaveProperty('fees');
            expect(result[0]).toHaveProperty('net');
        });
    });

    describe('createTransaction', () => {
        it('should create a new transaction', async () => {
            const newTransaction = {
                user_id: mockUserId,
                type: 'earning' as const,
                amount: 500,
                currency: 'USD',
                status: 'completed' as const,
                payment_method: null,
                payment_reference: null,
                description: 'Project payment',
                metadata: {},
                completed_at: null,
                assignment_id: null,
            };

            const mockQuery = {
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { id: 'txn-1', ...newTransaction },
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockQuery);

            const result = await createTransaction(newTransaction);

            expect(result).toHaveProperty('id', 'txn-1');
            expect(result.user_id).toBe(mockUserId);
            expect(mockQuery.insert).toHaveBeenCalledWith(newTransaction);
        });
    });

    describe('updateTransactionStatus', () => {
        it('should update transaction status to completed', async () => {
            const transactionId = 'txn-1';
            const mockQuery = {
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: {
                        id: transactionId,
                        status: 'completed',
                        completed_at: expect.any(String),
                    },
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockQuery);

            const result = await updateTransactionStatus(transactionId, 'completed');

            expect(result.status).toBe('completed');
            expect(result).toHaveProperty('completed_at');
            expect(mockQuery.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'completed',
                    completed_at: expect.any(String),
                })
            );
        });
    });

    describe('getDashboardSummary', () => {
        it('should fetch combined dashboard data for freelancers', async () => {
            // Mock earnings overview
            (supabase.rpc as jest.Mock)
                .mockResolvedValueOnce({
                    data: [{
                        total_earnings: 5000,
                        total_fees: 500,
                        net_earnings: 4500,
                        transaction_count: 10,
                        avg_per_transaction: 500,
                    }],
                    error: null,
                })
                // Mock performance metrics
                .mockResolvedValueOnce({
                    data: [{
                        total_projects: 15,
                        completed_projects: 12,
                        active_projects: 3,
                        avg_rating: 4.5,
                        avg_completion_rate: 95.5,
                        total_hours: 120.5,
                        on_time_percentage: 90.0,
                    }],
                    error: null,
                });

            // Mock pending transactions
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ amount: 100 }, { amount: 200 }],
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockQuery);

            const result = await getDashboardSummary(mockUserId, 'freelancer');

            expect(result).toEqual({
                totalEarnings: 5000,
                totalSpending: 0,
                netIncome: 4500,
                pendingAmount: 300,
                activeProjects: 3,
                completedProjects: 12,
                totalProjects: 15,
                avgRating: 4.5,
                completionRate: 95.5,
                onTimeDelivery: 90.0,
                earningsTrend: null,
                projectsTrend: null,
                ratingTrend: null,
            });
        });
    });
});
