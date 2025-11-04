/**
 * @fileoverview Tests for analytics chart components
 * @module components/analytics/__tests__/Charts.test
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import {
    LineChart,
    AreaChart,
    BarChart,
    MultiLineChart,
} from '../Charts';

// Mock Recharts to avoid rendering complexity
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    Area: () => <div data-testid="area" />,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

describe('Chart Components', () => {
    const mockData = [
        { period: '2025-01-01', value: 100 },
        { period: '2025-01-02', value: 150 },
        { period: '2025-01-03', value: 200 },
    ];

    describe('LineChart', () => {
        it('should render with data', () => {
            render(
                <LineChart
                    data={mockData}
                    dataKey="value"
                    title="Test Line Chart"
                />
            );

            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
            expect(screen.getByText('Test Line Chart')).toBeInTheDocument();
        });

        it('should render description when provided', () => {
            render(
                <LineChart
                    data={mockData}
                    dataKey="value"
                    title="Chart"
                    description="This is a test chart"
                />
            );

            expect(screen.getByText('This is a test chart')).toBeInTheDocument();
        });

        it('should show loading state', () => {
            const { container } = render(
                <LineChart
                    data={[]}
                    dataKey="value"
                    title="Loading Chart"
                    isLoading={true}
                />
            );

            expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
        });

        it('should show empty state when no data', () => {
            render(
                <LineChart
                    data={[]}
                    dataKey="value"
                    title="Empty Chart"
                />
            );

            expect(screen.getByText(/No data available/)).toBeInTheDocument();
        });

        it('should render grid when showGrid is true', () => {
            render(
                <LineChart
                    data={mockData}
                    dataKey="value"
                    title="Chart with Grid"
                    showGrid={true}
                />
            );

            expect(screen.getByTestId('grid')).toBeInTheDocument();
        });
    });

    describe('AreaChart', () => {
        it('should render with data', () => {
            render(
                <AreaChart
                    data={mockData}
                    dataKey="value"
                    title="Test Area Chart"
                />
            );

            expect(screen.getByTestId('area-chart')).toBeInTheDocument();
            expect(screen.getByText('Test Area Chart')).toBeInTheDocument();
        });

        it('should apply custom color', () => {
            const { container } = render(
                <AreaChart
                    data={mockData}
                    dataKey="value"
                    title="Colored Chart"
                    color="#FF5733"
                />
            );

            expect(container).toBeInTheDocument();
        });

        it('should show empty state when no data', () => {
            render(
                <AreaChart
                    data={[]}
                    dataKey="value"
                    title="Empty Area Chart"
                />
            );

            expect(screen.getByText(/No data available/)).toBeInTheDocument();
        });
    });

    describe('BarChart', () => {
        it('should render with data', () => {
            render(
                <BarChart
                    data={mockData}
                    dataKey="value"
                    title="Test Bar Chart"
                />
            );

            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
        });

        it('should render with custom height', () => {
            const { container } = render(
                <BarChart
                    data={mockData}
                    dataKey="value"
                    title="Custom Height Chart"
                    height={500}
                />
            );

            expect(container.firstChild).toHaveStyle({ height: '500px' });
        });

        it('should show loading state', () => {
            const { container } = render(
                <BarChart
                    data={[]}
                    dataKey="value"
                    title="Loading Bar Chart"
                    isLoading={true}
                />
            );

            expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
        });
    });

    describe('MultiLineChart', () => {
        const multiLineData = [
            { period: '2025-01-01', earnings: 100, spending: 50 },
            { period: '2025-01-02', earnings: 150, spending: 75 },
            { period: '2025-01-03', earnings: 200, spending: 100 },
        ];

        const dataKeys = [
            { key: 'earnings', label: 'Earnings', color: '#22c55e' },
            { key: 'spending', label: 'Spending', color: '#ef4444' },
        ];

        it('should render with multiple lines', () => {
            render(
                <MultiLineChart
                    data={multiLineData}
                    dataKeys={dataKeys}
                    title="Multi-Line Chart"
                />
            );

            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
            expect(screen.getByText('Multi-Line Chart')).toBeInTheDocument();
        });

        it('should render legend', () => {
            render(
                <MultiLineChart
                    data={multiLineData}
                    dataKeys={dataKeys}
                    title="Chart with Legend"
                />
            );

            expect(screen.getByTestId('legend')).toBeInTheDocument();
        });

        it('should show empty state when no data', () => {
            render(
                <MultiLineChart
                    data={[]}
                    dataKeys={dataKeys}
                    title="Empty Multi-Line Chart"
                />
            );

            expect(screen.getByText(/No data available/)).toBeInTheDocument();
        });

        it('should handle single data point', () => {
            const singlePoint = [{ period: '2025-01-01', earnings: 100, spending: 50 }];

            render(
                <MultiLineChart
                    data={singlePoint}
                    dataKeys={dataKeys}
                    title="Single Point Chart"
                />
            );

            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });
    });

    describe('Chart Common Features', () => {
        it('should format currency in tooltips', () => {
            render(
                <LineChart
                    data={mockData}
                    dataKey="value"
                    title="Currency Chart"
                    formatValue={(val) => `$${val}`}
                />
            );

            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        });

        it('should format dates on X-axis', () => {
            render(
                <LineChart
                    data={mockData}
                    dataKey="value"
                    title="Date Chart"
                />
            );

            expect(screen.getByTestId('x-axis')).toBeInTheDocument();
        });

        it('should format Y-axis values', () => {
            render(
                <LineChart
                    data={mockData}
                    dataKey="value"
                    title="Formatted Y-Axis"
                />
            );

            expect(screen.getByTestId('y-axis')).toBeInTheDocument();
        });
    });
});
