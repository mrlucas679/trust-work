import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Send, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAssignment, type Assignment } from "@/lib/api/assignments";
import { submitApplication, hasApplied } from "@/lib/api/applications";

const Apply = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    const [formData, setFormData] = useState({
        proposal: '',
        coverLetter: '',
        bidAmount: '',
        estimatedDuration: '',
        estimatedStartDate: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                navigate('/jobs');
                return;
            }

            setIsLoading(true);
            try {
                const [assignmentData, applied] = await Promise.all([
                    getAssignment(id),
                    hasApplied(id)
                ]);

                setAssignment(assignmentData);
                setAlreadyApplied(applied);

                if (applied) {
                    toast({
                        title: 'Already Applied',
                        description: 'You have already applied to this job.',
                        variant: 'destructive'
                    });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to load job details',
                    variant: 'destructive'
                });
                navigate('/jobs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleApply = async () => {
        if (!assignment) return;

        // Validate required fields
        if (!formData.proposal || !formData.coverLetter || !formData.bidAmount) {
            toast({
                title: 'Missing Information',
                description: 'Please fill in all required fields (Proposal, Cover Letter, and Bid Amount).',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await submitApplication({
                assignment_id: assignment.id,
                proposal: formData.proposal,
                cover_letter: formData.coverLetter,
                bid_amount: parseInt(formData.bidAmount),
                estimated_duration: formData.estimatedDuration || undefined,
                estimated_start_date: formData.estimatedStartDate || undefined
            });

            toast({
                title: 'Application Submitted!',
                description: 'Your application has been sent successfully. The employer will review it soon.'
            });

            navigate('/applications');
        } catch (error) {
            toast({
                title: 'Submission Failed',
                description: error instanceof Error ? error.message : 'Failed to submit application',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-muted/20 p-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading job details...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="bg-muted/20 p-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">Job not found</p>
                        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-muted/20 p-6">
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => navigate(`/job/${id}`)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Job Details
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Apply for {assignment.title}</CardTitle>
                        </div>
                        <p className="text-muted-foreground">Your information is protected and encrypted</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {alreadyApplied && (
                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-destructive mb-1">Already Applied</h3>
                                        <p className="text-sm text-muted-foreground">
                                            You have already submitted an application for this job. Check your applications page for status.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="proposal">Proposal *</Label>
                            <Textarea
                                id="proposal"
                                placeholder="Describe your approach to this project and why you're the best fit..."
                                rows={5}
                                value={formData.proposal}
                                onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                                disabled={alreadyApplied}
                            />
                            <p className="text-xs text-muted-foreground">
                                Explain how you'll complete this project successfully
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coverLetter">Cover Letter *</Label>
                            <Textarea
                                id="coverLetter"
                                placeholder="Tell the employer about your relevant experience and qualifications..."
                                rows={4}
                                value={formData.coverLetter}
                                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                disabled={alreadyApplied}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bidAmount">Your Bid Amount (ZAR) *</Label>
                                <Input
                                    id="bidAmount"
                                    type="number"
                                    placeholder="50000"
                                    value={formData.bidAmount}
                                    onChange={(e) => setFormData({ ...formData, bidAmount: e.target.value })}
                                    disabled={alreadyApplied}
                                />
                                {assignment.budget_min && assignment.budget_max && (
                                    <p className="text-xs text-muted-foreground">
                                        Budget range: R{assignment.budget_min.toLocaleString()} - R{assignment.budget_max.toLocaleString()}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                                <Input
                                    id="estimatedDuration"
                                    placeholder="e.g., 2 weeks, 1 month"
                                    value={formData.estimatedDuration}
                                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                                    disabled={alreadyApplied}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedStartDate">Estimated Start Date</Label>
                            <Input
                                id="estimatedStartDate"
                                type="date"
                                value={formData.estimatedStartDate}
                                onChange={(e) => setFormData({ ...formData, estimatedStartDate: e.target.value })}
                                disabled={alreadyApplied}
                            />
                        </div>

                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                Security & Privacy
                            </h3>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Your application is encrypted end-to-end</li>
                                <li>• Personal information is only shared with the employer</li>
                                <li>• You can withdraw your application anytime</li>
                                <li>• Employers cannot see other applicants' details</li>
                            </ul>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleApply}
                            disabled={isSubmitting || alreadyApplied}
                            size="lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting Application...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    {alreadyApplied ? 'Already Applied' : 'Send Application'}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Apply;
