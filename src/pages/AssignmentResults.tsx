import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Trophy,
    XCircle,
    CheckCircle,
    Clock,
    ArrowLeft,
    FileText,
    Share2,
    RefreshCw,
    Ticket,
    Sparkles,
    AlertCircle,
    Award
} from 'lucide-react';
import { SKILL_DISPLAY_NAMES, LEVEL_DISPLAY_NAMES, LEVEL_REQUIREMENTS, SkillCategory, AssignmentLevel, Question } from '@/types/assignments';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface LocationState {
    failed?: boolean;
    reason?: string;
    questions?: Question[];
    answers?: Record<number, string>;
    score: number;
    correctCount?: number;
    totalQuestions?: number;
    passed: boolean;
    timeTaken: number;
    autoSubmit?: boolean;
}

const AssignmentResults = () => {
    const navigate = useNavigate();
    const { skill, level } = useParams<{ skill: SkillCategory; level: AssignmentLevel }>();
    const location = useLocation();
    const state = location.state as LocationState;

    useEffect(() => {
        // Trigger confetti if passed with high score
        if (state?.passed && state.score >= 85) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [state]);

    if (!skill || !level || !state) {
        navigate('/assignments');
        return null;
    }

    const requirements = LEVEL_REQUIREMENTS[level];
    const { score, passed, timeTaken, failed, reason, correctCount, totalQuestions } = state;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} minutes ${secs} seconds`;
    };

    const earnedVoucher = passed && score >= 85;
    const questionsAway = totalQuestions
        ? Math.ceil(totalQuestions * 0.7) - correctCount!
        : 0;

    // Failed due to cheating attempt
    if (failed && reason) {
        return (
            <div className="min-h-screen bg-muted/20 p-6">
                <div className="max-w-3xl mx-auto">
                    <Card className="border-destructive">
                        <CardContent className="p-12 text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/20 mb-4">
                                <XCircle className="h-16 w-16 text-destructive" />
                            </div>

                            <h1 className="text-4xl font-bold text-destructive">Assignment Failed</h1>

                            <div className="space-y-2">
                                <p className="text-xl">
                                    {reason === 'tab-switch'
                                        ? 'You switched tabs during the assignment'
                                        : 'You switched to another window/app during the assignment'}
                                </p>
                                <p className="text-muted-foreground">
                                    This attempt has been marked as failed and recorded on your profile.
                                </p>
                            </div>

                            <Separator className="my-6" />

                            <div className="text-left space-y-3 bg-muted/50 rounded-lg p-6">
                                <h3 className="font-semibold text-lg">What happened?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our system detected that you left the assignment window. To maintain the integrity
                                    of the certification process, any attempt to switch tabs or applications results in
                                    an automatic failure.
                                </p>

                                <h3 className="font-semibold text-lg mt-4">What's next?</h3>
                                <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                                    <li>Wait 24 hours before your next attempt</li>
                                    <li>Retake costs: {requirements.retakeCost} Assignment Credits</li>
                                    <li>Find a quiet place without distractions</li>
                                    <li>Close all other tabs and applications before starting</li>
                                    <li>Ensure you won't be interrupted</li>
                                </ul>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                    onClick={() => navigate('/assignments')}
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Passed
    if (passed) {
        return (
            <div className="min-h-screen bg-muted/20 p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Card className="border-success">
                        <CardContent className="p-12 text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/20 mb-4">
                                <Trophy className="h-16 w-16 text-success" />
                            </div>

                            <h1 className="text-4xl font-bold">🎉 CONGRATULATIONS! 🎉</h1>

                            <Separator />

                            <div>
                                <p className="text-xl font-semibold text-success mb-2">
                                    {LEVEL_DISPLAY_NAMES[level]} LEVEL: PASSED
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    {SKILL_DISPLAY_NAMES[skill]}
                                </p>
                            </div>

                            <div>
                                <p className="text-6xl font-bold text-success mb-2">{score}%</p>
                                <p className="text-muted-foreground">
                                    ({correctCount}/{totalQuestions} correct)
                                </p>
                            </div>

                            <div className="flex justify-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-4xl">⭐</span>
                                ))}
                            </div>

                            <Separator />

                            <div className="space-y-3 text-left bg-success/5 rounded-lg p-6">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-success" />
                                    <p className="font-semibold">Certificate Unlocked!</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-success" />
                                    <p className="font-semibold">Added to your profile</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-success" />
                                    <p className="font-semibold">Visible to all clients</p>
                                </div>
                            </div>

                            {earnedVoucher && (
                                <Alert className="border-warning bg-warning/5">
                                    <Sparkles className="h-5 w-5 text-warning" />
                                    <AlertTitle className="text-lg font-bold">🎁 EXCELLENCE BONUS UNLOCKED!</AlertTitle>
                                    <AlertDescription className="space-y-2">
                                        <p className="font-semibold">You've earned a 30% Discount Voucher!</p>
                                        <p className="text-sm">Use it on your next assignment retake.</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="h-4 w-4" />
                                                <span>Expires in: 30 days</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>💰 Save up to {Math.ceil(requirements.retakeCost * 0.3)} credits!</span>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <p className="font-semibold">🎯 Next Challenge:</p>
                                {level === 'foundation' && (
                                    <p className="text-sm text-muted-foreground">
                                        Developer Level unlocks after completing 6 gigs total
                                    </p>
                                )}
                                {level === 'developer' && (
                                    <p className="text-sm text-muted-foreground">
                                        Advanced Level unlocks after completing 9 gigs total
                                    </p>
                                )}
                                {level === 'advanced' && (
                                    <p className="text-sm text-muted-foreground">
                                        Expert Level unlocks after completing 12 gigs total
                                    </p>
                                )}
                                {level === 'expert' && (
                                    <p className="text-sm text-muted-foreground">
                                        🏆 You've reached the highest certification level!
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Time taken: {formatTime(timeTaken)}</span>
                                </div>
                                <span>•</span>
                                <span>Completed: {new Date().toLocaleDateString()}</span>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3">
                                {/* View Certificate - ONLY for Expert level */}
                                {level === 'expert' && (
                                    <Button
                                        size="lg"
                                        className="w-full bg-verified hover:bg-verified/90"
                                        onClick={() => {
                                            // Generate assignment ID based on skill and level
                                            const assignmentId = `${skill}_${level}_attempt_1`;
                                            navigate(`/assessment/${assignmentId}/certificate`);
                                        }}
                                    >
                                        <Award className="h-5 w-5 mr-2" />
                                        View Your Certificate
                                    </Button>
                                )}
                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={() => navigate(`/assignments/${skill}/${level}/detailed-results`, { state })}
                                >
                                    <FileText className="h-5 w-5 mr-2" />
                                    View Detailed Results & Explanations
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => navigate('/assignments')}
                                    >
                                        <ArrowLeft className="h-5 w-5 mr-2" />
                                        Back to Dashboard
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => {
                                            // Placeholder for share functionality
                                            alert('Share functionality would be implemented here');
                                        }}
                                    >
                                        <Share2 className="h-5 w-5 mr-2" />
                                        Share Achievement
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Failed (score < 70%)
    return (
        <div className="min-h-screen bg-muted/20 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <Card className="border-warning">
                    <CardContent className="p-12 text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-warning/20 mb-4">
                            <AlertCircle className="h-16 w-16 text-warning" />
                        </div>

                        <h1 className="text-3xl font-bold">Keep Learning! Don't Give Up!</h1>

                        <Separator />

                        <div>
                            <p className="text-xl font-semibold text-destructive mb-2">
                                {LEVEL_DISPLAY_NAMES[level]} LEVEL: NOT PASSED
                            </p>
                            <p className="text-lg text-muted-foreground">
                                {SKILL_DISPLAY_NAMES[skill]}
                            </p>
                        </div>

                        <div>
                            <p className="text-6xl font-bold text-destructive mb-2">{score}%</p>
                            <p className="text-muted-foreground">
                                ({correctCount}/{totalQuestions} correct)
                            </p>
                        </div>

                        <div>
                            <p className="text-lg text-muted-foreground">Required to Pass: <span className="font-semibold">70%</span></p>
                            <p className="text-muted-foreground">
                                ({Math.ceil(totalQuestions! * 0.7)}/{totalQuestions} correct minimum)
                            </p>
                        </div>

                        <div className="flex justify-center gap-2">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-4xl">❌</span>
                            ))}
                        </div>

                        <Alert className="border-warning bg-warning/5">
                            <AlertCircle className="h-5 w-5 text-warning" />
                            <AlertDescription>
                                <p className="font-semibold text-lg">📊 You were {questionsAway} question(s) away from passing!</p>
                            </AlertDescription>
                        </Alert>

                        <Separator />

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                ⚠️ This score will appear on your profile but you can retake to improve!
                            </AlertDescription>
                        </Alert>

                        <div className="text-left space-y-3 bg-muted/50 rounded-lg p-6">
                            <h3 className="font-semibold text-lg">💡 What's Next:</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground ml-4 list-disc">
                                <li>Review the detailed explanations below</li>
                                <li>Study the areas you missed</li>
                                <li>Retake costs: <span className="font-semibold text-foreground">{requirements.retakeCost} Assignment Credits</span></li>
                                <li>Next attempt available in: <span className="font-semibold text-foreground">24 hours</span></li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Time taken: {formatTime(timeTaken)}</span>
                            </div>
                            <span>•</span>
                            <span>Attempted: {new Date().toLocaleDateString()}</span>
                        </div>

                        <Separator />

                        <div className="flex flex-col gap-3">
                            <Button
                                size="lg"
                                className="w-full"
                                onClick={() => navigate(`/assignments/${skill}/${level}/detailed-results`, { state })}
                            >
                                <FileText className="h-5 w-5 mr-2" />
                                View Questions & Learn From Mistakes
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate('/assignments')}
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AssignmentResults;
