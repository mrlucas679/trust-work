/**
 * @fileoverview Basic tests for analytics components
 * @module components/analytics/__tests__/Components.test
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { StatCard, PerformanceBadge } from '../DashboardComponents';
import { TrendingUp, TrendingDown } from 'lucide-react';

describe('Analytics Components', () => {
    describe('StatCard', () => {
        it('should render with title and value', () => {
            render(
                <StatCard
                    title="Total Earnings"
                    value="$5,000"
                    icon={TrendingUp}
                />
            );

            expect(screen.getByText('Total Earnings')).toBeDefined();
            expect(screen.getByText('$5,000')).toBeDefined();
        });

        it('should display positive trend', () => {
            render(
                <StatCard
                    title="Revenue"
                    value="$10,000"
                    trend={15.5}
                    icon={TrendingUp}
                />
            );

            const trendText = screen.getByText(/15.5%/);
            expect(trendText).toBeDefined();
        });

        it('should display negative trend', () => {
            render(
                <StatCard
                    title="Expenses"
                    value="$2,000"
                    trend={-10}
                    icon={TrendingDown}
                />
            );

            const trendText = screen.getByText(/-10.0%/);
            expect(trendText).toBeDefined();
        });
    });

    describe('PerformanceBadge', () => {
        it('should render Excellent rating', () => {
            render(<PerformanceBadge rating={4.8} />);
            expect(screen.getByText('Excellent')).toBeDefined();
        });

        it('should render Very Good rating', () => {
            render(<PerformanceBadge rating={4.2} />);
            expect(screen.getByText('Very Good')).toBeDefined();
        });

        it('should render Good rating', () => {
            render(<PerformanceBadge rating={3.5} />);
            expect(screen.getByText('Good')).toBeDefined();
        });

        it('should render Fair rating', () => {
            render(<PerformanceBadge rating={2.8} />);
            expect(screen.getByText('Fair')).toBeDefined();
        });

        it('should render Needs Improvement rating', () => {
            render(<PerformanceBadge rating={2.0} />);
            expect(screen.getByText('Needs Improvement')).toBeDefined();
        });

        it('should handle null rating', () => {
            render(<PerformanceBadge rating={null} />);
            expect(screen.getByText('No Rating')).toBeDefined();
        });
    });
});
