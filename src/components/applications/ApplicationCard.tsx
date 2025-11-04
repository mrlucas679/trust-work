import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    DollarSign,
    ExternalLink,
    Link as LinkIcon,
    Mail,
    MapPin,
    Star,
    Loader2,
} from 'lucide-react';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { useUpdateApplicationStatus, useWithdrawApplication } from '@/hooks/useApplications';
import { toast } from '@/hooks/use-toast';
import {
    canWithdrawApplication,
    canUpdateApplicationStatus,
    formatProposedRate,
    getApplicationAgeDays,
    type ApplicationWithFreelancer,
    type ApplicationWithAssignment,
} from '@/types/applications';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
    application: ApplicationWithFreelancer | ApplicationWithAssignment;
    view: 'employer' | 'freelancer';
    onViewDetails?: (applicationId: string) => void;
    className?: string;
}

export function ApplicationCard({
    application,
    view,
    onViewDetails,
    className,
}: ApplicationCardProps) {
    const [withdrawReason, setWithdrawReason] = useState('');
    const [employerMessage, setEmployerMessage] = useState('');
    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<'shortlisted' | 'accepted' | 'rejected'>(
        'shortlisted'
    );

    const withdrawMutation = useWithdrawApplication();
    const updateStatusMutation = useUpdateApplicationStatus();

    const isFreelancerView = view === 'freelancer';
    const isEmployerView = view === 'employer';

    // Type guards for view-specific data
    const freelancerData =
        'display_name' in application
            ? {
                display_name: application.display_name,
                avatar_url: application.avatar_url,
                skills: application.skills,
                hourly_rate: application.hourly_rate,
                location: application.location,
                province: application.province,
                average_rating: application.average_rating,
                total_reviews: application.total_reviews,
                completed_projects: application.completed_projects,
            }
            : null;

    const assignmentData =
        'assignment_title' in application
            ? {
                assignment_title: application.assignment_title,
                assignment_description: application.assignment_description,
                budget_min: application.budget_min,
                budget_max: application.budget_max,
                assignment_status: application.assignment_status,
            }
            : null;

    const handleWithdraw = async () => {
        try {
            await withdrawMutation.mutateAsync({
                applicationId: application.id,
                input: withdrawReason ? { reason: withdrawReason } : undefined,
            });

            toast({
                title: 'Application withdrawn',
                description: 'Your application has been withdrawn successfully.',
            });

            setIsWithdrawDialogOpen(false);
            setWithdrawReason('');
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to withdraw application',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await updateStatusMutation.mutateAsync({
                applicationId: application.id,
                input: {
                    status: selectedAction,
                    employer_message: employerMessage || undefined,
                },
            });

            toast({
                title: 'Application updated',
                description: `Application has been ${selectedAction}.`,
            });

            setIsActionDialogOpen(false);
            setEmployerMessage('');
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update application',
                variant: 'destructive',
            });
        }
    };

    const ageDays = getApplicationAgeDays(application);

    return (
        <Card className={cn('hover:shadow-md transition-shadow', className)}>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    {isEmployerView && freelancerData && (
                        <div className="flex items-start gap-3 flex-1">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={freelancerData.avatar_url} alt={freelancerData.display_name} />
                                <AvatarFallback>
                                    {freelancerData.display_name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{freelancerData.display_name}</h3>
                                {freelancerData.location && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {freelancerData.location}
                                        {freelancerData.province && `, ${freelancerData.province}`}
                                    </p>
                                )}
                                {freelancerData.average_rating && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">{freelancerData.average_rating.toFixed(1)}</span>
                                        {freelancerData.total_reviews && (
                                            <span className="text-sm text-muted-foreground">
                                                ({freelancerData.total_reviews} reviews)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isFreelancerView && assignmentData && (
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{assignmentData.assignment_title}</h3>
                            {assignmentData.budget_min && assignmentData.budget_max && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    R{assignmentData.budget_min.toLocaleString()} - R
                                    {assignmentData.budget_max.toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col items-end gap-2">
                        <ApplicationStatusBadge status={application.status} />
                        <span className="text-xs text-muted-foreground">
                            {ageDays === 0 ? 'Today' : `${ageDays}d ago`}
                        </span>
                    </div>
                </div>

                {isEmployerView && freelancerData?.skills && freelancerData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {freelancerData.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {freelancerData.skills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                                +{freelancerData.skills.length - 5} more
                            </Badge>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold mb-2">Cover Letter</h4>
                    <p className="text-sm text-muted-foreground line-clamp-4">{application.cover_letter}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    {application.proposed_rate && (
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatProposedRate(application.proposed_rate)}</span>
                        </div>
                    )}

                    {application.proposed_timeline && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{application.proposed_timeline}</span>
                        </div>
                    )}

                    {application.availability_start && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Start: {format(new Date(application.availability_start), 'MMM d, yyyy')}</span>
                        </div>
                    )}
                </div>

                {application.portfolio_links && application.portfolio_links.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" />
                            Portfolio Links
                        </h4>
                        <ul className="space-y-1">
                            {application.portfolio_links.slice(0, 2).map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="truncate">{link}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {application.employer_message && (
                    <div className="bg-muted/50 p-3 rounded-md">
                        <h4 className="text-sm font-semibold mb-1">Message from Employer</h4>
                        <p className="text-sm text-muted-foreground">{application.employer_message}</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex gap-2">
                {onViewDetails && (
                    <Button variant="outline" onClick={() => onViewDetails(application.id)} className="flex-1">
                        View Details
                    </Button>
                )}

                {isFreelancerView && canWithdrawApplication(application.status) && (
                    <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1">
                                Withdraw
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Withdraw Application</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to withdraw your application? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                                <Label htmlFor="withdraw-reason">Reason (optional)</Label>
                                <Textarea
                                    id="withdraw-reason"
                                    placeholder="Please provide a reason for withdrawing..."
                                    value={withdrawReason}
                                    onChange={(e) => setWithdrawReason(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleWithdraw}
                                    disabled={withdrawMutation.isPending}
                                >
                                    {withdrawMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Withdraw Application
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {isEmployerView && canUpdateApplicationStatus(application.status) && (
                    <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex-1">Take Action</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Application Status</DialogTitle>
                                <DialogDescription>
                                    Choose an action for this application and optionally add a message.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Action</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={selectedAction === 'shortlisted' ? 'default' : 'outline'}
                                            onClick={() => setSelectedAction('shortlisted')}
                                            className="flex-1"
                                        >
                                            Shortlist
                                        </Button>
                                        <Button
                                            variant={selectedAction === 'accepted' ? 'default' : 'outline'}
                                            onClick={() => setSelectedAction('accepted')}
                                            className="flex-1"
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            variant={selectedAction === 'rejected' ? 'default' : 'outline'}
                                            onClick={() => setSelectedAction('rejected')}
                                            className="flex-1"
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employer-message">Message to Freelancer (optional)</Label>
                                    <Textarea
                                        id="employer-message"
                                        placeholder="Add a message for the freelancer..."
                                        value={employerMessage}
                                        onChange={(e) => setEmployerMessage(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
                                    {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardFooter>
        </Card>
    );
}
