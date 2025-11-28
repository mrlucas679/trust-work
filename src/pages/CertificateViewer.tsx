import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockUserAssignmentProfile } from '@/data/mockAssignmentData';
import { ArrowLeft, Award, Calendar, CheckCircle, Target, Clock } from 'lucide-react';

export default function CertificateViewer() {
    const { assessmentId } = useParams<{ assessmentId: string }>();
    const navigate = useNavigate();

    // Find the assignment in the user's profile
    const assignment = mockUserAssignmentProfile.assignments.find(
        (a) => a.assignmentId === assessmentId
    );

    // If assignment not found, show error
    if (!assignment) {
        return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-destructive">Certificate Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            This certificate could not be found. It may not exist or you may not have access to it.
                        </p>
                        <Button onClick={() => navigate('/assignments')} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Assignments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // CRITICAL: Certificates are ONLY available for Expert level
    if (assignment.level !== 'expert') {
        return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-warning">Certificate Not Available</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Certificates are only awarded for completing the <strong>Expert level</strong> of a skill.
                            Keep progressing through the levels to earn your certificate!
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Your Level:</span>
                                <span className="font-medium capitalize">{assignment.levelDisplayName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={assignment.passed ? "outline" : "destructive"}>
                                    {assignment.passed ? 'Passed' : 'Not Passed'}
                                </Badge>
                            </div>
                        </div>
                        <Button onClick={() => navigate('/assignments')} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Assignments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if passed
    if (!assignment.passed) {
        return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-warning">Certificate Not Available</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            A certificate is only available for passed Expert level assessments. This assessment was not passed.
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Score:</span>
                                <span className="font-medium">{assignment.scorePercentage}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant="destructive">Not Passed</Badge>
                            </div>
                        </div>
                        <Button onClick={() => navigate('/assignments')} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Assignments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Format dates
    const completedDate = new Date(assignment.completedAt).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const timeTakenMinutes = Math.floor(assignment.timeTaken / 60);
    const timeTakenSeconds = assignment.timeTaken % 60;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button onClick={() => navigate('/assignments')} variant="ghost">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Assignments
                    </Button>
                    <Badge variant="outline" className="border-verified text-verified">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Expert Certified
                    </Badge>
                </div>

                {/* Main Certificate Card */}
                <Card className="border-2 border-verified">
                    <CardHeader className="text-center space-y-4 pb-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-verified/10 flex items-center justify-center">
                            <Award className="h-10 w-10 text-verified" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                                Certificate of Completion
                            </p>
                            <CardTitle className="text-3xl">{assignment.skillDisplayName}</CardTitle>
                            <p className="text-xl text-muted-foreground mt-2">
                                {assignment.levelDisplayName} Level
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Recipient */}
                        <div className="text-center py-4 border-y">
                            <p className="text-sm text-muted-foreground mb-1">This certifies that</p>
                            <p className="text-2xl font-semibold">{mockUserAssignmentProfile.userName}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                has successfully completed the assessment
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Target className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Score</p>
                                            <p className="text-2xl font-bold">{assignment.scorePercentage}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Questions</p>
                                            <p className="text-2xl font-bold">
                                                {assignment.correctAnswers}/{assignment.totalQuestions}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Completed</p>
                                            <p className="text-lg font-semibold">{completedDate}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Time Taken</p>
                                            <p className="text-lg font-semibold">
                                                {timeTakenMinutes}m {timeTakenSeconds}s
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Certificate ID */}
                        <div className="text-center pt-4 border-t">
                            <p className="text-xs text-muted-foreground">Certificate ID</p>
                            <p className="text-sm font-mono text-muted-foreground mt-1">
                                {assignment.assignmentId}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Assessment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Attempt</p>
                                <p className="font-medium">#{assignment.attemptNumber}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Device</p>
                                <p className="font-medium capitalize">{assignment.deviceType}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Browser</p>
                                <p className="font-medium">{assignment.browserInfo}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge variant="outline" className="border-verified text-verified">
                                    Passed
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
