/**
 * SavedSearchesList Component
 * 
 * Displays and manages user's saved searches
 */

import { useState } from 'react';
import { Search, Trash2, Play, Edit2, Bell, BellOff, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { SavedSearch } from '@/types/search';
import { deleteSavedSearch, updateSavedSearch } from '@/lib/api/search';

interface SavedSearchesListProps {
    searches: SavedSearch[];
    loading?: boolean;
    onExecute: (search: SavedSearch) => void;
    onEdit?: (search: SavedSearch) => void;
    onDeleted?: () => void;
}

export function SavedSearchesList({
    searches,
    loading = false,
    onExecute,
    onEdit,
    onDeleted,
}: SavedSearchesListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingAlertId, setTogglingAlertId] = useState<string | null>(null);

    const handleDelete = async (searchId: string) => {
        try {
            await deleteSavedSearch(searchId);
            toast.success('Saved search deleted');
            onDeleted?.();
        } catch (error) {
            console.error('Error deleting saved search:', error);
            toast.error('Failed to delete saved search');
        }
    };

    const handleToggleAlert = async (search: SavedSearch) => {
        setTogglingAlertId(search.id);
        try {
            await updateSavedSearch(search.id, {
                alert_enabled: !search.alert_enabled,
            });
            toast.success(
                search.alert_enabled ? 'Alert disabled' : 'Alert enabled'
            );
            onDeleted?.(); // Refresh the list
        } catch (error) {
            console.error('Error toggling alert:', error);
            toast.error('Failed to update alert settings');
        } finally {
            setTogglingAlertId(null);
        }
    };

    if (loading) {
        return <SavedSearchesSkeleton />;
    }

    if (searches.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No saved searches</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                        Save your searches to quickly access them later and get alerts for new matches.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {searches.map((search) => (
                    <Card key={search.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base line-clamp-1">{search.name}</CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        {search.search_type === 'assignments' ? 'Job Search' : 'Freelancer Search'}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onExecute(search)}>
                                            <Play className="h-4 w-4 mr-2" />
                                            Run Search
                                        </DropdownMenuItem>
                                        {onEdit && (
                                            <DropdownMenuItem onClick={() => onEdit(search)}>
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => handleToggleAlert(search)}
                                            disabled={togglingAlertId === search.id}
                                        >
                                            {search.alert_enabled ? (
                                                <>
                                                    <BellOff className="h-4 w-4 mr-2" />
                                                    Disable Alerts
                                                </>
                                            ) : (
                                                <>
                                                    <Bell className="h-4 w-4 mr-2" />
                                                    Enable Alerts
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setDeletingId(search.id)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        <CardContent className="pb-3 flex-1">
                            <div className="space-y-2 text-sm">
                                {/* Display active filters */}
                                {search.filters.query && (
                                    <div>
                                        <span className="text-muted-foreground">Query: </span>
                                        <span className="font-medium">{search.filters.query}</span>
                                    </div>
                                )}
                                {search.filters.location && (
                                    <div>
                                        <span className="text-muted-foreground">Location: </span>
                                        <span className="font-medium">{search.filters.location}</span>
                                    </div>
                                )}
                                {search.filters.skills && search.filters.skills.length > 0 && (
                                    <div>
                                        <span className="text-muted-foreground">Skills: </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {search.filters.skills.slice(0, 3).map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {search.filters.skills.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{search.filters.skills.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {search.filters.minBudget && search.filters.maxBudget && (
                                    <div>
                                        <span className="text-muted-foreground">Budget: </span>
                                        <span className="font-medium">
                                            R{search.filters.minBudget.toLocaleString()} - R{search.filters.maxBudget.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {search.filters.minRating && (
                                    <div>
                                        <span className="text-muted-foreground">Min Rating: </span>
                                        <span className="font-medium">{search.filters.minRating}★</span>
                                    </div>
                                )}
                            </div>

                            {/* Alert status */}
                            {search.alert_enabled && (
                                <Badge variant="default" className="mt-3">
                                    <Bell className="h-3 w-3 mr-1" />
                                    Alerts {search.alert_frequency}
                                </Badge>
                            )}

                            {/* Last run */}
                            {search.last_run_at && (
                                <p className="text-xs text-muted-foreground mt-3">
                                    Last run {formatDistanceToNow(new Date(search.last_run_at), { addSuffix: true })}
                                </p>
                            )}
                        </CardContent>

                        <CardFooter className="pt-3">
                            <Button
                                onClick={() => onExecute(search)}
                                className="w-full"
                                size="sm"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Run Search
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete saved search?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your saved search
                            {deletingId && searches.find((s) => s.id === deletingId)?.alert_enabled &&
                                ' and disable all alerts'}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deletingId) {
                                    handleDelete(deletingId);
                                    setDeletingId(null);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function SavedSearchesSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6 mt-2" />
                        <Skeleton className="h-4 w-4/6 mt-2" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-9 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
