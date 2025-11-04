/**
 * @fileoverview Dashboard components for analytics
 * @module components/analytics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown, Download, Minus } from 'lucide-react';
import { formatCurrency, formatPercentage, getTrendDirection } from '@/types/analytics';
import type { DateRange } from '@/types/analytics';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: number | null;
    isLoading?: boolean;
    icon?: React.ReactNode;
    inverseTrend?: boolean;
}

interface DateRangePickerProps {
    dateRange: DateRange;
    presets: Array<{ label: string; range: DateRange }>;
    selectedPreset: string;
    onPresetSelect: (label: string) => void;
    onRangeChange: (range: DateRange) => void;
}

interface ExportButtonProps {
    onExport: (format: 'csv' | 'json' | 'pdf') => void;
    isLoading?: boolean;
}

/**
 * Stat Card Component
 */
export function StatCard({
    title,
    value,
    description,
    trend,
    isLoading,
    icon,
    inverseTrend = false,
}: StatCardProps) {
    const trendDirection = getTrendDirection(trend);
    const trendColor =
        trendDirection === 'neutral'
            ? 'text-muted-foreground'
            : trendDirection === 'up'
                ? inverseTrend
                    ? 'text-red-500'
                    : 'text-green-500'
                : inverseTrend
                    ? 'text-green-500'
                    : 'text-red-500';

    const TrendIcon =
        trendDirection === 'up'
            ? TrendingUp
            : trendDirection === 'down'
                ? TrendingDown
                : Minus;

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    {icon}
                </CardHeader>
                <CardContent>
                    <div className="h-7 bg-muted animate-pulse rounded" />
                    {description && <div className="h-4 bg-muted animate-pulse rounded mt-1" />}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend !== undefined) && (
                    <div className="flex items-center gap-2 mt-1">
                        {trend !== undefined && trend !== null && (
                            <div className={cn('flex items-center text-xs font-medium', trendColor)}>
                                <TrendIcon className="h-3 w-3 mr-1" />
                                {formatPercentage(Math.abs(trend))}
                            </div>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Date Range Picker Component
 */
export function DateRangePicker({
    dateRange,
    presets,
    selectedPreset,
    onPresetSelect,
    onRangeChange,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [tempRange, setTempRange] = React.useState<DateRange>(dateRange);

    const handleApplyCustomRange = () => {
        onRangeChange(tempRange);
        setIsOpen(false);
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedPreset} onValueChange={onPresetSelect}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    {presets.map((preset) => (
                        <SelectItem key={preset.label} value={preset.label}>
                            {preset.label}
                        </SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom Range</SelectItem>
                </SelectContent>
            </Select>

            {selectedPreset === 'Custom' && (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(dateRange.start, 'MMM dd, yyyy')} -{' '}
                            {format(dateRange.end, 'MMM dd, yyyy')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <div className="p-3 border-b">
                            <p className="text-sm font-medium">Select Date Range</p>
                        </div>
                        <div className="flex gap-2 p-3">
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Start Date</p>
                                <Calendar
                                    mode="single"
                                    selected={tempRange.start}
                                    onSelect={(date) => date && setTempRange({ ...tempRange, start: date })}
                                    disabled={(date) => date > tempRange.end || date > new Date()}
                                />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">End Date</p>
                                <Calendar
                                    mode="single"
                                    selected={tempRange.end}
                                    onSelect={(date) => date && setTempRange({ ...tempRange, end: date })}
                                    disabled={(date) => date < tempRange.start || date > new Date()}
                                />
                            </div>
                        </div>
                        <div className="p-3 border-t flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleApplyCustomRange}>
                                Apply
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}

/**
 * Export Button Component
 */
export function ExportButton({ onExport, isLoading }: ExportButtonProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40" align="end">
                <div className="space-y-2">
                    <p className="text-sm font-medium mb-2">Export Format</p>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => onExport('csv')}
                    >
                        Export as CSV
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => onExport('json')}
                    >
                        Export as JSON
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => onExport('pdf')}
                        disabled
                    >
                        Export as PDF (Soon)
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

/**
 * Performance Badge Component
 */
export function PerformanceBadge({ rating }: { rating: number | null }) {
    if (rating === null || rating === undefined) {
        return <Badge variant="secondary">No Rating</Badge>;
    }

    if (rating >= 4.5) {
        return <Badge className="bg-green-500 hover:bg-green-600">Excellent</Badge>;
    }
    if (rating >= 4.0) {
        return <Badge className="bg-blue-500 hover:bg-blue-600">Very Good</Badge>;
    }
    if (rating >= 3.5) {
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Good</Badge>;
    }
    if (rating >= 3.0) {
        return <Badge className="bg-orange-500 hover:bg-orange-600">Fair</Badge>;
    }
    return <Badge variant="destructive">Needs Improvement</Badge>;
}

/**
 * Empty State Component
 */
export function AnalyticsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
            <p className="text-muted-foreground max-w-md mb-4">
                Start completing projects to see your earnings, performance metrics, and insights.
            </p>
        </div>
    );
}

import React from 'react';
