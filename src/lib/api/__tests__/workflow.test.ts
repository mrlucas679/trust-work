/**
 * Workflow API Tests
 * 
 * Tests for workflow API functions with mocked Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
    supabase: {
        rpc: jest.fn(),
        from: jest.fn(),
        auth: {
            getUser: jest.fn(),
        },
    },
}));

import { supabase } from '@/lib/supabaseClient';
import {
    startAssignmentWork,
    completeAssignment,
    cancelAssignment,
    createReview,
    updateReview,
    getUserReviews,
    getAssignmentReviews,
    hasUserReviewed,
    canReviewAssignment,
} from '@/lib/api/workflow';

describe('Workflow API Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('startAssignmentWork', () => {
        it('should call RPC with correct parameters', async () => {
            const mockResult = { success: true };
            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: mockResult,
                error: null,
            });

            const result = await startAssignmentWork({
                assignment_id: 'assignment-123',
                application_id: 'application-456',
            });

            expect(supabase.rpc).toHaveBeenCalledWith('start_assignment_work', {
                p_assignment_id: 'assignment-123',
                p_application_id: 'application-456',
            });
            expect(result).toEqual(mockResult);
        });

        it('should handle errors gracefully', async () => {
            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: null,
                error: new Error('Database error'),
            });

            const result = await startAssignmentWork({
                assignment_id: 'assignment-123',
                application_id: 'application-456',
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('completeAssignment', () => {
        it('should call RPC with notes', async () => {
            const mockResult = { success: true };
            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: mockResult,
                error: null,
            });

            await completeAssignment({
                assignment_id: 'assignment-123',
                completion_notes: 'All tasks completed',
            });

            expect(supabase.rpc).toHaveBeenCalledWith('complete_assignment', {
                p_assignment_id: 'assignment-123',
                p_completion_notes: 'All tasks completed',
            });
        });

        it('should handle missing notes', async () => {
            const mockResult = { success: true };
            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: mockResult,
                error: null,
            });

            await completeAssignment({
                assignment_id: 'assignment-123',
            });

            expect(supabase.rpc).toHaveBeenCalledWith('complete_assignment', {
                p_assignment_id: 'assignment-123',
                p_completion_notes: null,
            });
        });
    });

    describe('cancelAssignment', () => {
        it('should validate reason before calling RPC', async () => {
            const result = await cancelAssignment({
                assignment_id: 'assignment-123',
                reason: 'short',
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('at least 10 characters');
            expect(supabase.rpc).not.toHaveBeenCalled();
        });

        it('should call RPC with valid reason', async () => {
            const mockResult = { success: true };
            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: mockResult,
                error: null,
            });

            await cancelAssignment({
                assignment_id: 'assignment-123',
                reason: 'Valid cancellation reason here',
            });

            expect(supabase.rpc).toHaveBeenCalledWith('cancel_assignment', {
                p_assignment_id: 'assignment-123',
                p_reason: 'Valid cancellation reason here',
            });
        });
    });

    describe('createReview', () => {
        beforeEach(() => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null,
            });
        });

        it('should validate input before creating', async () => {
            const result = await createReview({
                assignment_id: 'assignment-123',
                reviewee_id: 'user-456',
                rating: 0, // Invalid rating
                review_text: 'Test',
                reviewer_type: 'employer',
            });

            expect(result.error).toBeDefined();
            expect(result.review).toBeNull();
        });

        it('should require authentication', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const result = await createReview({
                assignment_id: 'assignment-123',
                reviewee_id: 'user-456',
                rating: 5,
                review_text: 'Great work on this assignment!',
                reviewer_type: 'employer',
            });

            expect(result.error).toBe('Authentication required');
            expect(result.review).toBeNull();
        });

        it('should create review with valid input', async () => {
            const mockReview = {
                id: 'review-123',
                assignment_id: 'assignment-123',
                rating: 5,
                review_text: 'Great work on this assignment!',
            };

            const mockFrom = {
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: mockReview,
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockFrom);

            const result = await createReview({
                assignment_id: 'assignment-123',
                reviewee_id: 'user-456',
                rating: 5,
                review_text: 'Great work on this assignment!',
                reviewer_type: 'employer',
            });

            expect(result.review).toEqual(mockReview);
            expect(result.error).toBeNull();
        });
    });

    describe('getUserReviews', () => {
        it('should fetch reviews for user', async () => {
            const mockReviews = [
                { id: 'review-1', rating: 5 },
                { id: 'review-2', rating: 4 },
            ];

            const mockFrom = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: mockReviews,
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockFrom);

            const result = await getUserReviews('user-123', 10);

            expect(result).toEqual(mockReviews);
            expect(mockFrom.eq).toHaveBeenCalledWith('reviewee_id', 'user-123');
            expect(mockFrom.eq).toHaveBeenCalledWith('flagged', false);
        });

        it('should handle errors gracefully', async () => {
            const mockFrom = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error('Database error'),
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockFrom);

            const result = await getUserReviews('user-123');

            expect(result).toEqual([]);
        });
    });

    describe('hasUserReviewed', () => {
        beforeEach(() => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null,
            });
        });

        it('should return true if review exists', async () => {
            const mockFrom = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                maybeSingle: jest.fn().mockResolvedValue({
                    data: { id: 'review-123' },
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockFrom);

            const result = await hasUserReviewed('assignment-123');

            expect(result).toBe(true);
        });

        it('should return false if no review exists', async () => {
            const mockFrom = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                maybeSingle: jest.fn().mockResolvedValue({
                    data: null,
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockFrom);

            const result = await hasUserReviewed('assignment-123');

            expect(result).toBe(false);
        });
    });

    describe('canReviewAssignment', () => {
        beforeEach(() => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null,
            });
        });

        it('should check if assignment is completed', async () => {
            const mockFrom = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: {
                        status: 'in_progress',
                        client_id: 'user-456',
                        freelancer_id: 'user-123',
                    },
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockFrom);

            const result = await canReviewAssignment('assignment-123');

            expect(result.canReview).toBe(false);
            expect(result.reason).toBe('Assignment not completed yet');
        });

        it('should check if user is participant', async () => {
            const mockFrom = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: {
                        status: 'completed',
                        client_id: 'user-456',
                        freelancer_id: 'user-789',
                    },
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockFrom);

            const result = await canReviewAssignment('assignment-123');

            expect(result.canReview).toBe(false);
            expect(result.reason).toBe('Not a participant in this assignment');
        });
    });
});
