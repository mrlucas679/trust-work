/**
 * @fileoverview Tests for analytics dashboard components
 * @module components/analytics/__tests__/DashboardComponents.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import {
    StatCard,
    DateRangePicker,
    ExportButton,
    PerformanceBadge,
    AnalyticsEmptyState,
} from '../DashboardComponents';
import { TrendingUp, TrendingDown } from 'lucide-react';

describe('DashboardComponents', () => {
    describe('StatCard', () => {
        it('should render with title and value', () => {
            render(
                <StatCard
                    title="Total Earnings"
                    value="$5,000"
                    icon={TrendingUp}
                />
            );

            expect(screen.getByText('Total Earnings')).toBeInTheDocument();
            expect(screen.getByText('$5,000')).toBeInTheDocument();
        });

        it('should display positive trend correctly', () => {
            render(
                <StatCard
                    title="Revenue"
                    value="$10,000"
                    trend={15.5}
                    icon={TrendingUp}
                />
            );

            expect(screen.getByText(/15.5%/)).toBeInTheDocument();
            expect(screen.getByText(/vs last period/)).toBeInTheDocument();
        });

        it('should display negative trend correctly', () => {
            render(
                <StatCard
                    title="Expenses"
                    value="$2,000"
                    trend={-10}
                    icon={TrendingDown}
                />
            );

            expect(screen.getByText(/-10.0%/)).toBeInTheDocument();
        });

        it('should show loading state', () => {
            const { container } = render(
                <StatCard
                    title="Loading"
                    value="$0"
                    icon={TrendingUp}
                    isLoading={true}
                />
            );

            expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
        });

        it('should render with description', () => {
            render(
                <StatCard
                    title="Projects"
                    value="15"
                    description="Active projects this month"
                    icon={TrendingUp}
                />
            );

            expect(screen.getByText('Active projects this month')).toBeInTheDocument();
        });
    });

    describe('PerformanceBadge', () => {
        it('should render Excellent rating correctly', () => {
            render(<PerformanceBadge rating={4.8} />);
            expect(screen.getByText('Excellent')).toBeInTheDocument();
        });

        it('should render Very Good rating correctly', () => {
            render(<PerformanceBadge rating={4.2} />);
            expect(screen.getByText('Very Good')).toBeInTheDocument();
        });

        it('should render Good rating correctly', () => {
            render(<PerformanceBadge rating={3.5} />);
            expect(screen.getByText('Good')).toBeInTheDocument();
        });

        it('should render Fair rating correctly', () => {
            render(<PerformanceBadge rating={2.8} />);
            expect(screen.getByText('Fair')).toBeInTheDocument();
        });

        it('should render Needs Improvement rating correctly', () => {
            render(<PerformanceBadge rating={2.0} />);
            expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
        });

        it('should handle null rating', () => {
            render(<PerformanceBadge rating={null} />);
            expect(screen.getByText('No Rating')).toBeInTheDocument();
        });

        it('should handle undefined rating', () => {
            render(<PerformanceBadge rating={undefined} />);
            expect(screen.getByText('No Rating')).toBeInTheDocument();
        });

        it('should handle custom className', () => {
            const { container } = render(
                <PerformanceBadge rating={4.5} className="custom-class" />
            );
            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('DateRangePicker', () => {
        const mockOnChange = jest.fn();
        const defaultProps = {
            value: {
                start: new Date('2025-01-01'),
                end: new Date('2025-01-31'),
            },
            onChange: mockOnChange,
        };

        beforeEach(() => {
            mockOnChange.mockClear();
        });

        it('should render with initial date range', () => {
            render(<DateRangePicker {...defaultProps} />);
            expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
            expect(screen.getByText(/Jan 31, 2025/)).toBeInTheDocument();
        });

        it('should show preset options when clicked', async () => {
            render(<DateRangePicker {...defaultProps} />);

            const trigger = screen.getByRole('button');
            fireEvent.click(trigger);

            await waitFor(() => {
                expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
                expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
                expect(screen.getByText('This Month')).toBeInTheDocument();
            });
        });

        it('should call onChange when preset is selected', async () => {
            render(<DateRangePicker {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));

            await waitFor(() => {
                const preset = screen.getByText('Last 7 Days');
                fireEvent.click(preset);
            });

            expect(mockOnChange).toHaveBeenCalled();
        });

        it('should display custom range option', async () => {
            render(<DateRangePicker {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));

            await waitFor(() => {
                expect(screen.getByText('Custom Range')).toBeInTheDocument();
            });
        });
    });

    describe('ExportButton', () => {
        const mockOnExport = jest.fn();

        beforeEach(() => {
            mockOnExport.mockClear();
        });

        it('should render export button', () => {
            render(<ExportButton onExport={mockOnExport} />);
            expect(screen.getByText('Export')).toBeInTheDocument();
        });

        it('should show export options when clicked', async () => {
            render(<ExportButton onExport={mockOnExport} />);

            const button = screen.getByText('Export');
            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByText('Export as CSV')).toBeInTheDocument();
                expect(screen.getByText('Export as JSON')).toBeInTheDocument();
            });
        });

        it('should call onExport with CSV format', async () => {
            render(<ExportButton onExport={mockOnExport} />);

            fireEvent.click(screen.getByText('Export'));

            await waitFor(() => {
                const csvOption = screen.getByText('Export as CSV');
                fireEvent.click(csvOption);
            });

            expect(mockOnExport).toHaveBeenCalledWith('csv');
        });

        it('should call onExport with JSON format', async () => {
            render(<ExportButton onExport={mockOnExport} />);

            fireEvent.click(screen.getByText('Export'));

            await waitFor(() => {
                const jsonOption = screen.getByText('Export as JSON');
                fireEvent.click(jsonOption);
            });

            expect(mockOnExport).toHaveBeenCalledWith('json');
        });

        it('should disable button when isLoading is true', () => {
            render(<ExportButton onExport={mockOnExport} isLoading={true} />);
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });
    });

    describe('AnalyticsEmptyState', () => {
        it('should render with default message', () => {
            render(<AnalyticsEmptyState />);
            expect(screen.getByText(/No data available/)).toBeInTheDocument();
        });

        it('should render with custom title', () => {
            render(<AnalyticsEmptyState title="No transactions found" />);
            expect(screen.getByText('No transactions found')).toBeInTheDocument();
        });

        it('should render with custom description', () => {
            render(
                <AnalyticsEmptyState description="Start by creating your first project" />
            );
            expect(screen.getByText('Start by creating your first project')).toBeInTheDocument();
        });

        it('should display icon', () => {
            const { container } = render(<AnalyticsEmptyState />);
            expect(container.querySelector('svg')).toBeInTheDocument();
        });

        it('should render action button when provided', () => {
            const mockAction = jest.fn();
            render(
                <AnalyticsEmptyState
                    actionLabel="Get Started"
                    onAction={mockAction}
                />
            );

            const button = screen.getByText('Get Started');
            expect(button).toBeInTheDocument();

            fireEvent.click(button);
            expect(mockAction).toHaveBeenCalled();
        }); it('should not render action button when not provided', () => {
            render(<AnalyticsEmptyState />);
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });
});
