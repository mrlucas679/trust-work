/**
 * SaveSearchDialog Component
 * 
 * Modal dialog for saving current search filters
 */

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { SearchFilters } from '@/types/search';
import { createSavedSearch } from '@/lib/api/search';

interface SaveSearchDialogProps {
    filters: SearchFilters;
    searchType: 'assignments' | 'freelancers';
    userId: string;
    onSaved?: () => void;
    trigger?: React.ReactNode;
}

export function SaveSearchDialog({
    filters,
    searchType,
    userId,
    onSaved,
    trigger,
}: SaveSearchDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [alertEnabled, setAlertEnabled] = useState(false);
    const [alertFrequency, setAlertFrequency] = useState<'daily' | 'weekly'>('daily');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Please enter a name for this search');
            return;
        }

        setSaving(true);
        try {
            await createSavedSearch({
                user_id: userId,
                search_type: searchType,
                name: name.trim(),
                filters,
                alert_enabled: alertEnabled,
                alert_frequency: alertEnabled ? alertFrequency : undefined,
            });

            toast.success('Search saved successfully');
            setOpen(false);
            setName('');
            setAlertEnabled(false);
            setAlertFrequency('daily');
            onSaved?.();
        } catch (error) {
            console.error('Error saving search:', error);
            toast.error('Failed to save search');
        } finally {
            setSaving(false);
        }
    };

    // Generate a suggested name based on filters
    const getSuggestedName = () => {
        const parts: string[] = [];

        if (filters.query) {
            parts.push(filters.query);
        }
        if (filters.location) {
            parts.push(filters.location);
        }
        if (filters.province) {
            parts.push(filters.province);
        }
        if (filters.industry) {
            parts.push(filters.industry);
        }

        return parts.length > 0
            ? parts.slice(0, 3).join(' - ')
            : `${searchType === 'assignments' ? 'Job' : 'Freelancer'} Search`;
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen && !name) {
            setName(getSuggestedName());
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save Search
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save this search</DialogTitle>
                    <DialogDescription>
                        Save your search criteria to quickly access it later and optionally receive alerts
                        for new matches.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Search Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Web Development Jobs in Cape Town"
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                            Give your search a memorable name
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="alerts">Enable Alerts</Label>
                                <p className="text-xs text-muted-foreground">
                                    Get notified when new matches are found
                                </p>
                            </div>
                            <Switch
                                id="alerts"
                                checked={alertEnabled}
                                onCheckedChange={setAlertEnabled}
                            />
                        </div>

                        {alertEnabled && (
                            <div className="space-y-2 pl-4 border-l-2 border-muted">
                                <Label htmlFor="frequency">Alert Frequency</Label>
                                <Select value={alertFrequency} onValueChange={(value: 'daily' | 'weekly') => setAlertFrequency(value)}>
                                    <SelectTrigger id="frequency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    How often should we check for new matches?
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Show active filters summary */}
                    <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                        <p className="font-medium mb-2">Active Filters:</p>
                        {filters.query && (
                            <p className="text-muted-foreground">Search: {filters.query}</p>
                        )}
                        {filters.location && (
                            <p className="text-muted-foreground">Location: {filters.location}</p>
                        )}
                        {filters.province && (
                            <p className="text-muted-foreground">Province: {filters.province}</p>
                        )}
                        {filters.skills && filters.skills.length > 0 && (
                            <p className="text-muted-foreground">
                                Skills: {filters.skills.slice(0, 3).join(', ')}
                                {filters.skills.length > 3 && ` +${filters.skills.length - 3} more`}
                            </p>
                        )}
                        {filters.industry && (
                            <p className="text-muted-foreground">Industry: {filters.industry}</p>
                        )}
                        {filters.experienceLevel && (
                            <p className="text-muted-foreground">
                                Experience: {filters.experienceLevel}
                            </p>
                        )}
                        {filters.minBudget && filters.maxBudget && (
                            <p className="text-muted-foreground">
                                Budget: R{filters.minBudget.toLocaleString()} - R{filters.maxBudget.toLocaleString()}
                            </p>
                        )}
                        {filters.minRating && (
                            <p className="text-muted-foreground">
                                Min Rating: {filters.minRating}★
                            </p>
                        )}
                        {filters.availability && (
                            <p className="text-muted-foreground">
                                Availability: {filters.availability}
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || !name.trim()}>
                        {saving ? 'Saving...' : 'Save Search'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
