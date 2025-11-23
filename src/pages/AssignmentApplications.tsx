import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    User,
    Calendar,
    Banknote,
    Clock,
    FileText,
    AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAssignment, type Assignment } from '@/lib/api/assignments';
import {
    getAssignmentApplications,
    reviewApplication,
    type ApplicationWithDetails
} from '@/lib/api/applications';

export default function AssignmentApplications() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!assignmentId) {
                navigate('/jobs');
                return;
            }

            setIsLoading(true);
            try {
                const [assignmentData, applicationsData] = await Promise.all([
                    getAssignment(assignmentId),
                    getAssignmentApplications(assignmentId)
                ]);

                setAssignment(assignmentData);
                setApplications(applicationsData);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to load applications',
                    variant: 'destructive'
                });
                navigate('/jobs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentId]);

    const handleAccept = async (applicationId: string) => {
        setReviewingId(applicationId);
        try {
            await reviewApplication(applicationId, {
                status: 'accepted'
            });

            toast({
                title: 'Application Accepted',
                description: 'The freelancer has been notified of your decision.'
            });

            // Refresh applications
            const updatedApplications = await getAssignmentApplications(assignmentId!);
            setApplications(updatedApplications);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to accept application',
                variant: 'destructive'
            });
        } finally {
            setReviewingId(null);
        }
    };

    const handleReject = async (applicationId: string) => {
        const reason = rejectionReason[applicationId];
        if (!reason || reason.trim().length === 0) {
            toast({
                title: 'Rejection Reason Required',
                description: 'Please provide a reason for rejecting this application.',
                variant: 'destructive'
            });
            return;
        }

        setReviewingId(applicationId);
        try {
            await reviewApplication(applicationId, {
                status: 'rejected',
                rejection_reason: reason
            });

            toast({
                title: 'Application Rejected',
                description: 'The freelancer has been notified with your feedback.'
            });

            // Refresh applications
            const updatedApplications = await getAssignmentApplications(assignmentId!);
            setApplications(updatedApplications);

            // Clear rejection reason
            setRejectionReason(prev => {
                const updated = { ...prev };
                delete updated[applicationId];
                return updated;
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to reject application',
                variant: 'destructive'
            });
        } finally {
            setReviewingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            case 'reviewing':
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Reviewing</Badge>;
            default:
                return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
        }
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="container mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Loading applications...</p>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    if (!assignment) {
        return (
            <AppLayout>
                <div className="container mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground mb-4">Job not found</p>
                            <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const pendingApplications = applications.filter(app => app.status === 'pending');
    const reviewingApplications = applications.filter(app => app.status === 'reviewing');
    const acceptedApplications = applications.filter(app => app.status === 'accepted');
    const rejectedApplications = applications.filter(app => app.status === 'rejected');

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div>
                    <Button variant="ghost" onClick={() => navigate('/jobs')} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Jobs
                    </Button>
                    <h1 className="text-3xl font-bold mb-2">Applications for: {assignment.title}</h1>
                    <p className="text-muted-foreground">
                        Review and manage applications for this job posting
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-primary">{applications.length}</p>
                                <p className="text-sm text-muted-foreground">Total Applications</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-500">{pendingApplications.length}</p>
                                <p className="text-sm text-muted-foreground">Pending Review</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-500">{acceptedApplications.length}</p>
                                <p className="text-sm text-muted-foreground">Accepted</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-500">{rejectedApplications.length}</p>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Empty State */}
                {applications.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                When freelancers apply to your job, their applications will appear here.
                            </p>
                            <Button onClick={() => navigate('/jobs')}>View All Jobs</Button>
                        </CardContent>
                    </Card>
                )}

                {/* Pending Applications */}
                {pendingApplications.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Pending Review ({pendingApplications.length})</h2>
                        {pendingApplications.map(application => (
                            <Card key={application.id} className="border-l-4 border-l-yellow-500">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle>Freelancer Application</CardTitle>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Applied {new Date(application.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(application.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Bid Amount</p>
                                            <p className="text-lg font-semibold flex items-center gap-1">
                                                <Banknote className="h-4 w-4" />
                                                R{application.bid_amount.toLocaleString()}
                                            </p>
                                        </div>
                                        {application.estimated_duration && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Estimated Duration</p>
                                                <p className="text-lg font-semibold flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {application.estimated_duration}
                                                </p>
                                            </div>
                                        )}
                                        {application.estimated_start_date && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Can Start</p>
                                                <p className="text-lg font-semibold">
                                                    {new Date(application.estimated_start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-semibold mb-2">Proposal</h4>
                                        <p className="text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                                            {application.proposal}
                                        </p>
                                    </div>

                                    {application.cover_letter && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Cover Letter</h4>
                                            <p className="text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                                                {application.cover_letter}
                                            </p>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="space-y-3">
                                        <Label htmlFor={`rejection-${application.id}`}>
                                            Rejection Reason (optional for accept, required for reject)
                                        </Label>
                                        <Textarea
                                            id={`rejection-${application.id}`}
                                            placeholder="Provide feedback if rejecting this application..."
                                            value={rejectionReason[application.id] || ''}
                                            onChange={(e) => setRejectionReason(prev => ({
                                                ...prev,
                                                [application.id]: e.target.value
                                            }))}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            className="flex-1 bg-green-500 hover:bg-green-600"
                                            onClick={() => handleAccept(application.id)}
                                            disabled={reviewingId === application.id}
                                        >
                                            {reviewingId === application.id ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                                            ) : (
                                                <><CheckCircle className="h-4 w-4 mr-2" />Accept Application</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => handleReject(application.id)}
                                            disabled={reviewingId === application.id}
                                        >
                                            {reviewingId === application.id ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                                            ) : (
                                                <><XCircle className="h-4 w-4 mr-2" />Reject Application</>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Accepted Applications */}
                {acceptedApplications.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-green-600">Accepted ({acceptedApplications.length})</h2>
                        {acceptedApplications.map(application => (
                            <Card key={application.id} className="border-l-4 border-l-green-500 bg-green-50/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                <User className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <CardTitle>Accepted Freelancer</CardTitle>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Accepted {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : 'Recently'}
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(application.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Agreed Amount</p>
                                            <p className="text-lg font-semibold">R{application.bid_amount.toLocaleString()}</p>
                                        </div>
                                        {application.estimated_duration && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Duration</p>
                                                <p className="text-lg font-semibold">{application.estimated_duration}</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => navigate(`/messages`)}
                                    >
                                        Message Freelancer
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Rejected Applications */}
                {rejectedApplications.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-red-600">Rejected ({rejectedApplications.length})</h2>
                        {rejectedApplications.map(application => (
                            <Card key={application.id} className="border-l-4 border-l-red-500 bg-red-50/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                                <User className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <CardTitle>Rejected Application</CardTitle>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Rejected {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : 'Recently'}
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(application.status)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                                        <p className="text-sm text-red-700">{application.rejection_reason || 'No reason provided'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
