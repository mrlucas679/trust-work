/**
 * @fileoverview Reusable chart components using Recharts
 * @module components/analytics/charts
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Area,
    AreaChart as RechartsAreaChart,
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart as RechartsLineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatCurrency, formatAnalyticsDate } from '@/types/analytics';
import type { TimeSeriesData } from '@/types/analytics';

interface ChartProps {
    data: TimeSeriesData[];
    title?: string;
    description?: string;
    isLoading?: boolean;
    className?: string;
}

interface LineChartProps extends ChartProps {
    dataKey: string;
    color?: string;
    showGrid?: boolean;
}

interface AreaChartProps extends ChartProps {
    dataKey: string;
    color?: string;
    showGrid?: boolean;
}

interface BarChartProps extends ChartProps {
    dataKey: string;
    color?: string;
    showGrid?: boolean;
}

interface MultiLineChartProps extends ChartProps {
    lines: Array<{
        dataKey: string;
        name: string;
        color: string;
    }>;
    showGrid?: boolean;
}

/**
 * Custom tooltip for charts
 */
const CustomTooltip = ({ active, payload, label, isCurrency = true }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
            <p className="text-sm font-medium text-muted-foreground mb-2">
                {formatAnalyticsDate(label, 'short')}
            </p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4">
                    <span className="text-sm flex items-center gap-2">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        {entry.name}:
                    </span>
                    <span className="text-sm font-semibold">
                        {isCurrency ? formatCurrency(entry.value) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

/**
 * Line Chart Component
 */
export function LineChart({
    data,
    dataKey,
    color = '#10b981',
    title,
    description,
    isLoading,
    showGrid = true,
    className,
}: LineChartProps) {
    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">Loading chart...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={data}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatAnalyticsDate(value, 'short')}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatCurrency(value, 'USD', true)}
                                className="text-muted-foreground"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={2}
                                dot={{ fill: color, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Area Chart Component
 */
export function AreaChart({
    data,
    dataKey,
    color = '#3b82f6',
    title,
    description,
    isLoading,
    showGrid = true,
    className,
}: AreaChartProps) {
    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">Loading chart...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsAreaChart data={data}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatAnalyticsDate(value, 'short')}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatCurrency(value, 'USD', true)}
                                className="text-muted-foreground"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                fill={color}
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        </RechartsAreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Bar Chart Component
 */
export function BarChart({
    data,
    dataKey,
    color = '#8b5cf6',
    title,
    description,
    isLoading,
    showGrid = true,
    className,
}: BarChartProps) {
    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">Loading chart...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={data}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatAnalyticsDate(value, 'short')}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatCurrency(value, 'USD', true)}
                                className="text-muted-foreground"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Multi-Line Chart Component (for comparing multiple metrics)
 */
export function MultiLineChart({
    data,
    lines,
    title,
    description,
    isLoading,
    showGrid = true,
    className,
}: MultiLineChartProps) {
    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">Loading chart...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={data}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatAnalyticsDate(value, 'short')}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatCurrency(value, 'USD', true)}
                                className="text-muted-foreground"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {lines.map((line) => (
                                <Line
                                    key={line.dataKey}
                                    type="monotone"
                                    dataKey={line.dataKey}
                                    name={line.name}
                                    stroke={line.color}
                                    strokeWidth={2}
                                    dot={{ fill: line.color, r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            ))}
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
