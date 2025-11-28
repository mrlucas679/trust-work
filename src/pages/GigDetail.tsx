import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ArrowLeft,
    MapPin,
    Clock,
    DollarSign,
    Calendar,
    User2,
    Loader2,
    CheckCircle,
    MessageCircle,
    AlertCircle
} from "lucide-react";
import { getGigById, type Gig } from "@/lib/api/gigs";
import { getMyApplications, withdrawApplication, type ApplicationWithDetails } from "@/lib/api/applications";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/providers/SupabaseProvider";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";

const GigDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isJobSeeker, isEmployer } = useSupabase();

    const [gig, setGig] = useState<Gig | null>(null);
    const [application, setApplication] = useState<ApplicationWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    useEffect(() => {
        const fetchGigAndApplication = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                // Fetch gig details
                const gigData = await getGigById(id);
                setGig(gigData);

                // Fetch user's application if exists
                if (isJobSeeker) {
                    const applications = await getMyApplications();
                    const userApp = applications.find(app => app.assignment_id === id);
                    setApplication(userApp || null);
                }
            } catch (error) {
                toast({
                    title: "Failed to Load Gig",
                    description: error instanceof Error ? error.message : "Could not fetch gig details",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchGigAndApplication();
    }, [id, isJobSeeker, toast]);

    const handleWithdraw = async () => {
        if (!application) return;

        setIsWithdrawing(true);
        try {
            await withdrawApplication(application.id);
            setApplication(null);
            toast({
                title: "Application Withdrawn",
                description: "Your application has been withdrawn successfully.",
            });
        } catch (error) {
            toast({
                title: "Failed to Withdraw",
                description: error instanceof Error ? error.message : "Could not withdraw application",
                variant: "destructive"
            });
        } finally {
            setIsWithdrawing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading gig details...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!gig) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">Gig not found</p>
                        <Button onClick={() => navigate('/gigs')}>
                            Back to Gigs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-muted/20 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <Button
                    variant="ghost"
                    onClick={() => navigate('/gigs')}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Gigs
                </Button>

                {/* Main Gig Card */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <CardTitle className="text-2xl">{gig.title}</CardTitle>
                                    <Badge variant="secondary">Gig</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User2 className="h-4 w-4" />
                                        <span>Client</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Posted {new Date(gig.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <VerificationBadge
                                    type="verified"
                                    size="sm"
                                    details={[
                                        'Identity verified',
                                        'Payment method confirmed',
                                        'Positive review history'
                                    ]}
                                />
                                <RiskIndicator level="low" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{gig.description}</p>
                        </div>

                        <Separator />

                        {/* Key Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Budget</p>
                                    <p className="text-sm text-muted-foreground">
                                        {gig.budget_min && gig.budget_max
                                            ? `R${gig.budget_min.toLocaleString()} - R${gig.budget_max.toLocaleString()}`
                                            : gig.budget_min
                                                ? `From R${gig.budget_min.toLocaleString()}`
                                                : gig.budget_max
                                                    ? `Up to R${gig.budget_max.toLocaleString()}`
                                                    : 'Negotiable'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Deadline</p>
                                    <p className="text-sm text-muted-foreground">
                                        {gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'Flexible'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Location</p>
                                    <p className="text-sm text-muted-foreground">
                                        {gig.remote_allowed ? 'Remote' : gig.location || 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Status</p>
                                    <p className="text-sm text-muted-foreground capitalize">{gig.status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Required Skills */}
                        {gig.required_skills && gig.required_skills.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold mb-3">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {gig.required_skills.map(skill => (
                                            <Badge key={skill} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Skill Test Requirement */}
                        {gig.requires_skill_test && gig.skill_test_template_id && (
                            <>
                                <Separator />
                                <Alert className="border-primary/50 bg-primary/5">
                                    <AlertCircle className="h-4 w-4 text-primary" />
                                    <AlertDescription>
                                        <div className="font-semibold mb-2">
                                            🔍 Skill Test Required
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p>Difficulty: <Badge variant="outline" className="ml-1 capitalize">{gig.skill_test_difficulty || 'entry'}</Badge></p>
                                            <p>Passing Score: <span className="font-medium">{gig.skill_test_passing_score || 70}%</span></p>
                                        </div>
                                        <p className="mt-2">
                                            {isEmployer
                                                ? '✓ As an employer, you are exempt from skill tests.'
                                                : 'You must complete and pass this test before applying.'}
                                        </p>
                                    </AlertDescription>
                                </Alert>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Application Section */}
                {application ? (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl">Your Application</CardTitle>
                                <ApplicationStatusBadge status={application.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-muted-foreground">Submitted</p>
                                    <p>{new Date(application.created_at).toLocaleDateString()}</p>
                                </div>
                                {application.bid_amount && (
                                    <div>
                                        <p className="font-medium text-muted-foreground">Your Bid</p>
                                        <p>R{application.bid_amount.toLocaleString()}</p>
                                    </div>
                                )}
                                {application.estimated_duration && (
                                    <div>
                                        <p className="font-medium text-muted-foreground">Estimated Duration</p>
                                        <p>{application.estimated_duration}</p>
                                    </div>
                                )}
                                {application.reviewed_at && (
                                    <div>
                                        <p className="font-medium text-muted-foreground">Reviewed</p>
                                        <p>{new Date(application.reviewed_at).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <p className="font-medium mb-2">Your Proposal</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {application.proposal}
                                </p>
                            </div>

                            {application.rejection_reason && (
                                <>
                                    <Separator />
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <p className="font-medium mb-1">Rejection Reason</p>
                                            <p className="text-sm">{application.rejection_reason}</p>
                                        </AlertDescription>
                                    </Alert>
                                </>
                            )}

                            <div className="flex gap-3">
                                {application.status === 'pending' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/application/${application.id}/edit`)}
                                            className="flex-1"
                                        >
                                            Edit Application
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleWithdraw}
                                            disabled={isWithdrawing}
                                            className="flex-1"
                                        >
                                            {isWithdrawing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Withdrawing...
                                                </>
                                            ) : (
                                                'Withdraw Application'
                                            )}
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        toast({
                                            title: "Messaging Feature",
                                            description: "Direct messaging will be available soon.",
                                        });
                                    }}
                                    className="flex-1"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Message Client
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            {isJobSeeker ? (
                                <div className="text-center space-y-4">
                                    <p className="text-muted-foreground">You haven't applied to this gig yet.</p>
                                    <Button
                                        onClick={() => navigate(`/apply/${gig.id}`)}
                                        size="lg"
                                        className="w-full md:w-auto"
                                    >
                                        Apply Now
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <p className="text-muted-foreground">
                                        As an employer, you can view this gig but cannot apply to it.
                                    </p>
                                    {gig.client_id && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                toast({
                                                    title: "Messaging Feature",
                                                    description: "Direct messaging will be available soon.",
                                                });
                                            }}
                                        >
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            Contact Poster
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default GigDetail;
