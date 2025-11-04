/**
 * Workflow Type System Tests
 * 
 * Tests for validation functions, helper functions, and type guards
 */

import {
    validateReviewInput,
    validateCancelReason,
    isValidAssignmentStatus,
    isValidReviewRating,
    canTransitionToStatus,
    getStatusLabel,
    getStatusColor,
    getRatingLabel,
    calculateAverageRating,
    type CreateReviewInput,
    type AssignmentStatus,
} from '../workflow';

describe('Workflow Validation Functions', () => {
    describe('validateReviewInput', () => {
        const validInput: CreateReviewInput = {
            assignment_id: 'test-123',
            reviewee_id: 'user-456',
            rating: 5,
            review_text: 'This is a valid review with enough characters',
            reviewer_type: 'employer',
        };

        it('should pass validation for valid input', () => {
            const errors = validateReviewInput(validInput);
            expect(errors).toHaveLength(0);
        });

        it('should reject rating below 1', () => {
            const errors = validateReviewInput({
                ...validInput,
                rating: 0,
            });
            expect(errors).toContain('Rating must be between 1 and 5');
        });

        it('should reject rating above 5', () => {
            const errors = validateReviewInput({
                ...validInput,
                rating: 6,
            });
            expect(errors).toContain('Rating must be between 1 and 5');
        });

        it('should reject review text shorter than 10 characters', () => {
            const errors = validateReviewInput({
                ...validInput,
                review_text: 'Too short',
            });
            expect(errors).toContain('Review text must be at least 10 characters');
        });

        it('should reject review text longer than 2000 characters', () => {
            const longText = 'a'.repeat(2001);
            const errors = validateReviewInput({
                ...validInput,
                review_text: longText,
            });
            expect(errors).toContain('Review text must not exceed 2000 characters');
        });

        it('should reject empty review text', () => {
            const errors = validateReviewInput({
                ...validInput,
                review_text: '   ',
            });
            expect(errors).toContain('Review text must be at least 10 characters');
        });

        it('should accept review text at minimum length (10 chars)', () => {
            const errors = validateReviewInput({
                ...validInput,
                review_text: '1234567890',
            });
            expect(errors).toHaveLength(0);
        });

        it('should accept review text at maximum length (2000 chars)', () => {
            const maxText = 'a'.repeat(2000);
            const errors = validateReviewInput({
                ...validInput,
                review_text: maxText,
            });
            expect(errors).toHaveLength(0);
        });

        it('should return multiple errors for multiple issues', () => {
            const errors = validateReviewInput({
                ...validInput,
                rating: 0,
                review_text: 'short',
            });
            expect(errors.length).toBeGreaterThan(1);
        });
    });

    describe('validateCancelReason', () => {
        it('should pass validation for valid reason', () => {
            const errors = validateCancelReason('This is a valid cancellation reason');
            expect(errors).toHaveLength(0);
        });

        it('should reject reason shorter than 10 characters', () => {
            const errors = validateCancelReason('Too short');
            expect(errors).toContain('Cancellation reason must be at least 10 characters');
        });

        it('should reject reason longer than 500 characters', () => {
            const longReason = 'a'.repeat(501);
            const errors = validateCancelReason(longReason);
            expect(errors).toContain('Cancellation reason must not exceed 500 characters');
        });

        it('should reject empty reason', () => {
            const errors = validateCancelReason('   ');
            expect(errors).toContain('Cancellation reason must be at least 10 characters');
        });

        it('should accept reason at minimum length (10 chars)', () => {
            const errors = validateCancelReason('1234567890');
            expect(errors).toHaveLength(0);
        });

        it('should accept reason at maximum length (500 chars)', () => {
            const maxReason = 'a'.repeat(500);
            const errors = validateCancelReason(maxReason);
            expect(errors).toHaveLength(0);
        });
    });

    describe('Type Guards', () => {
        describe('isValidAssignmentStatus', () => {
            it('should return true for valid statuses', () => {
                expect(isValidAssignmentStatus('open')).toBe(true);
                expect(isValidAssignmentStatus('in_progress')).toBe(true);
                expect(isValidAssignmentStatus('completed')).toBe(true);
                expect(isValidAssignmentStatus('cancelled')).toBe(true);
            });

            it('should return false for invalid statuses', () => {
                expect(isValidAssignmentStatus('pending')).toBe(false);
                expect(isValidAssignmentStatus('active')).toBe(false);
                expect(isValidAssignmentStatus('')).toBe(false);
                expect(isValidAssignmentStatus('OPEN')).toBe(false);
            });
        });

        describe('isValidReviewRating', () => {
            it('should return true for valid ratings', () => {
                expect(isValidReviewRating(1)).toBe(true);
                expect(isValidReviewRating(2)).toBe(true);
                expect(isValidReviewRating(3)).toBe(true);
                expect(isValidReviewRating(4)).toBe(true);
                expect(isValidReviewRating(5)).toBe(true);
            });

            it('should return false for invalid ratings', () => {
                expect(isValidReviewRating(0)).toBe(false);
                expect(isValidReviewRating(6)).toBe(false);
                expect(isValidReviewRating(-1)).toBe(false);
                expect(isValidReviewRating(3.5)).toBe(false);
            });
        });
    });

    describe('Status Transition Rules', () => {
        describe('canTransitionToStatus', () => {
            it('should allow open -> in_progress', () => {
                expect(canTransitionToStatus('open', 'in_progress')).toBe(true);
            });

            it('should allow in_progress -> completed', () => {
                expect(canTransitionToStatus('in_progress', 'completed')).toBe(true);
            });

            it('should allow open -> cancelled', () => {
                expect(canTransitionToStatus('open', 'cancelled')).toBe(true);
            });

            it('should allow in_progress -> cancelled', () => {
                expect(canTransitionToStatus('in_progress', 'cancelled')).toBe(true);
            });

            it('should not allow open -> completed', () => {
                expect(canTransitionToStatus('open', 'completed')).toBe(false);
            });

            it('should not allow completed -> in_progress', () => {
                expect(canTransitionToStatus('completed', 'in_progress')).toBe(false);
            });

            it('should not allow cancelled -> any status', () => {
                expect(canTransitionToStatus('cancelled', 'open')).toBe(false);
                expect(canTransitionToStatus('cancelled', 'in_progress')).toBe(false);
                expect(canTransitionToStatus('cancelled', 'completed')).toBe(false);
            });

            it('should not allow completed -> cancelled', () => {
                expect(canTransitionToStatus('completed', 'cancelled')).toBe(false);
            });

            it('should allow same status (no-op)', () => {
                expect(canTransitionToStatus('open', 'open')).toBe(true);
                expect(canTransitionToStatus('in_progress', 'in_progress')).toBe(true);
            });
        });
    });

    describe('Helper Functions', () => {
        describe('getStatusLabel', () => {
            it('should return correct labels', () => {
                expect(getStatusLabel('open')).toBe('Open');
                expect(getStatusLabel('in_progress')).toBe('In Progress');
                expect(getStatusLabel('completed')).toBe('Completed');
                expect(getStatusLabel('cancelled')).toBe('Cancelled');
            });
        });

        describe('getStatusColor', () => {
            it('should return correct colors', () => {
                expect(getStatusColor('open')).toBe('#3b82f6'); // blue
                expect(getStatusColor('in_progress')).toBe('#f59e0b'); // amber
                expect(getStatusColor('completed')).toBe('#10b981'); // green
                expect(getStatusColor('cancelled')).toBe('#6b7280'); // gray
            });
        });

        describe('getRatingLabel', () => {
            it('should return correct labels for ratings', () => {
                expect(getRatingLabel(5)).toBe('Excellent');
                expect(getRatingLabel(4)).toBe('Good');
                expect(getRatingLabel(3)).toBe('Average');
                expect(getRatingLabel(2)).toBe('Below Average');
                expect(getRatingLabel(1)).toBe('Poor');
            });

            it('should handle edge cases', () => {
                expect(getRatingLabel(0)).toBe('Unknown');
                expect(getRatingLabel(6)).toBe('Unknown');
            });
        });

        describe('calculateAverageRating', () => {
            it('should calculate average correctly', () => {
                expect(calculateAverageRating([5, 4, 3, 2, 1])).toBe(3);
                expect(calculateAverageRating([5, 5, 5])).toBe(5);
                expect(calculateAverageRating([1, 1, 1])).toBe(1);
            });

            it('should handle decimals correctly', () => {
                expect(calculateAverageRating([5, 4])).toBe(4.5);
                expect(calculateAverageRating([5, 4, 3])).toBeCloseTo(4, 1);
            });

            it('should return 0 for empty array', () => {
                expect(calculateAverageRating([])).toBe(0);
            });

            it('should handle single rating', () => {
                expect(calculateAverageRating([5])).toBe(5);
            });
        });
    });
});
