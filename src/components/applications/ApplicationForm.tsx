import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { sanitizeUrl } from '@/lib/security/sanitization';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSubmitApplication } from '@/hooks/useApplications';
import { toast } from '@/hooks/use-toast';
import type { CreateApplicationInput } from '@/types/applications';

const applicationSchema = z.object({
    cover_letter: z
        .string()
        .min(50, 'Cover letter must be at least 50 characters')
        .max(5000, 'Cover letter must be less than 5000 characters'),
    proposed_rate: z.coerce
        .number()
        .min(0, 'Rate must be positive')
        .max(1000000, 'Rate seems too high')
        .optional(),
    proposed_timeline: z.string().optional(),
    availability_start: z.date().optional(),
    portfolio_links: z.array(z.string().url()).optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
    assignmentId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ApplicationForm({ assignmentId, onSuccess, onCancel }: ApplicationFormProps) {
    const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
    const [newLink, setNewLink] = useState('');
    const submitMutation = useSubmitApplication();

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            cover_letter: '',
            proposed_rate: undefined,
            proposed_timeline: '',
            availability_start: undefined,
            portfolio_links: [],
        },
    });

    const handleAddLink = () => {
        if (newLink.trim()) {
            try {
                new URL(newLink);
                setPortfolioLinks([...portfolioLinks, newLink]);
                setNewLink('');
            } catch {
                toast({
                    title: 'Invalid URL',
                    description: 'Please enter a valid URL',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleRemoveLink = (index: number) => {
        setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
    };

    const onSubmit = async (values: ApplicationFormValues) => {
        try {
            const input: CreateApplicationInput = {
                assignment_id: assignmentId,
                cover_letter: values.cover_letter,
                proposed_rate: values.proposed_rate,
                proposed_timeline: values.proposed_timeline || undefined,
                availability_start: values.availability_start?.toISOString(),
                portfolio_links: portfolioLinks,
            };

            await submitMutation.mutateAsync(input);

            toast({
                title: 'Application submitted',
                description: 'Your application has been submitted successfully.',
            });

            onSuccess?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to submit application',
                variant: 'destructive',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="cover_letter"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Letter *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell the employer why you're the best fit for this project..."
                                    rows={8}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Explain your relevant experience, approach, and why you're interested (50-5000 characters)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="proposed_rate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Proposed Rate (Optional)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        R
                                    </span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-8"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </div>
                            </FormControl>
                            <FormDescription>
                                Your proposed hourly rate or project fee (optional)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="proposed_timeline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Proposed Timeline (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., 2 weeks, 1 month"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                How long you estimate the project will take
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="availability_start"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Availability Start Date (Optional)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full pl-3 text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}
                                        >
                                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                When you can start working on this project
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <FormLabel>Portfolio Links (Optional)</FormLabel>
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://example.com/portfolio"
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddLink();
                                }
                            }}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={handleAddLink}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {portfolioLinks.length > 0 && (
                        <ul className="space-y-2 mt-2">
                            {portfolioLinks.map((link, index) => {
                                // Sanitize URL to prevent XSS attacks
                                const sanitizedLink = sanitizeUrl(link);
                                if (!sanitizedLink) return null;

                                return (
                                    <li key={index} className="flex items-center gap-2 text-sm">
                                        <a
                                            href={sanitizedLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-blue-600 hover:underline truncate"
                                        >
                                            {sanitizedLink}
                                        </a>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleRemoveLink(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Add links to relevant portfolio projects or work samples
                    </p>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="flex-1"
                    >
                        {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}
