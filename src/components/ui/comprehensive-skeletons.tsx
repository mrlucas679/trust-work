import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Profile Page Skeleton
 * Used when loading user profiles
 */
export const ProfileSkeleton = () => (
    <div className="space-y-8">
        {/* Profile Header */}
        <Card>
            <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
                    <div className="flex-1 w-full space-y-3">
                        <Skeleton className="h-8 w-48" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-full max-w-md" />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Skills/Content Sections */}
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 flex-wrap">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </CardContent>
        </Card>
    </div>
);

/**
 * Message List Skeleton
 * Used when loading message/conversation lists
 */
export const MessageListSkeleton = () => (
    <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

/**
 * Table Skeleton
 * Used for data tables and list views
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
    <div className="space-y-3">
        {/* Header */}
        <div className="flex gap-4 pb-3 border-b">
            {[...Array(columns)].map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 py-3">
                {[...Array(columns)].map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-4 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

/**
 * Form Skeleton
 * Used when loading forms
 */
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
    <div className="space-y-6">
        {[...Array(fields)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
        ))}
        <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
        </div>
    </div>
);

/**
 * Dashboard Grid Skeleton
 * Used for dashboard pages with cards
 */
export const DashboardGridSkeleton = () => (
    <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/**
 * Assignment/Quiz Skeleton
 * Used when loading quizzes or assessments
 */
export const QuizSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ))}
                <div className="flex justify-between pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardContent>
        </Card>
    </div>
);

/**
 * List Item Skeleton
 * Reusable for any list-based content
 */
export const ListItemSkeleton = () => (
    <div className="flex items-center gap-3 p-4 border-b last:border-0">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
    </div>
);
