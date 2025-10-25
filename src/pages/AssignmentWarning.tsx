import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    Clock,
    FileText,
    CheckCircle,
    Lock,
    Timer,
    Eye,
    Ban,
    Coins,
    ArrowLeft
} from 'lucide-react';
import { SKILL_DISPLAY_NAMES, LEVEL_DISPLAY_NAMES, LEVEL_REQUIREMENTS, SkillCategory, AssignmentLevel } from '@/types/assignments';
import { mockUserAssignmentProfile } from '@/data/mockAssignmentData';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AssignmentWarning = () => {
    const navigate = useNavigate();
    const { skill, level } = useParams<{ skill: SkillCategory; level: AssignmentLevel }>();
    const [agreedToRules, setAgreedToRules] = useState(false);

    if (!skill || !level) {
        navigate('/assignments');
        return null;
    }

    const userProfile = mockUserAssignmentProfile;
    const requirements = LEVEL_REQUIREMENTS[level];
    const cert = userProfile.certifications[skill][level];
    const isFirstAttempt = cert.attempts === 0;

    const handleStart = () => {
        if (agreedToRules) {
            navigate(`/assignments/${skill}/${level}/take`);
        }
    };

    const handleCancel = () => {
        navigate('/assignments');
    };

    return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
            <Card className="max-w-3xl w-full border-warning shadow-2xl">
                <CardContent className="p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/20 mb-4">
                            <AlertTriangle className="h-10 w-10 text-warning" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">⚠️ IMPORTANT - READ CAREFULLY</h1>
                    </div>

                    {/* Assignment Details */}
                    <div className="bg-muted/50 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-center mb-4">
                            {LEVEL_DISPLAY_NAMES[level]} Level: {SKILL_DISPLAY_NAMES[skill]}
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Questions</p>
                                    <p className="font-semibold">{requirements.totalQuestions} Questions</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Time Limit</p>
                                    <p className="font-semibold">{requirements.timeAllowed} Minutes</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-success" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Pass Score</p>
                                    <p className="font-semibold">70% ({Math.ceil(requirements.totalQuestions * 0.7)}/{requirements.totalQuestions} correct)</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-warning" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Cost</p>
                                    <p className="font-semibold">{isFirstAttempt ? 'FREE (First attempt)' : `${requirements.retakeCost} AC`}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Critical Rules */}
                    <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-bold text-center text-destructive">
                            ⚠️ CRITICAL RULES - PLEASE READ:
                        </h3>

                        <Alert variant="destructive" className="border-2">
                            <Ban className="h-5 w-5" />
                            <AlertDescription>
                                <div className="space-y-3 mt-2">
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">1</span>
                                        <div>
                                            <p className="font-semibold">Once started, you CANNOT leave the assignment</p>
                                            <p className="text-sm text-muted-foreground">No exit button will be available</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">2</span>
                                        <div>
                                            <p className="font-semibold">Switching apps or tabs will AUTOMATICALLY FAIL the assignment</p>
                                            <p className="text-sm text-muted-foreground">This will be recorded and credits will be lost if it's a paid retake</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">3</span>
                                        <div>
                                            <p className="font-semibold">You must complete all {requirements.totalQuestions} questions</p>
                                            <p className="text-sm text-muted-foreground">Unanswered questions will be marked as incorrect</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">4</span>
                                        <div>
                                            <p className="font-semibold">Timer cannot be paused or reset</p>
                                            <p className="text-sm text-muted-foreground">Auto-submit when time runs out</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">5</span>
                                        <div>
                                            <p className="font-semibold">Your score will appear on your profile (visible to clients)</p>
                                            <p className="text-sm text-muted-foreground">Both passed and failed attempts are shown for transparency</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">6</span>
                                        <div>
                                            <p className="font-semibold">Next retake costs {requirements.retakeCost} credits with a 24-hour waiting period</p>
                                            <p className="text-sm text-muted-foreground">Make sure you're ready before starting</p>
                                        </div>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* Additional Tips */}
                    <div className="bg-primary/5 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-primary" />
                            Preparation Tips:
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground ml-7 list-disc">
                            <li>Find a quiet place without distractions</li>
                            <li>Ensure stable internet connection</li>
                            <li>Close all other tabs and applications</li>
                            <li>Have at least {requirements.timeAllowed + 5} minutes available</li>
                            <li>Don't start if you might be interrupted</li>
                        </ul>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="bg-muted rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="agree"
                                checked={agreedToRules}
                                onCheckedChange={(checked) => setAgreedToRules(checked as boolean)}
                                className="mt-1"
                            />
                            <label
                                htmlFor="agree"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                I have read and understand all the rules above. I am in a quiet place with a stable internet
                                connection, and I am ready to complete this assignment without interruption.
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            onClick={handleCancel}
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1"
                            disabled={!agreedToRules}
                            onClick={handleStart}
                        >
                            <Timer className="h-5 w-5 mr-2" />
                            I Understand - Start Now
                        </Button>
                    </div>

                    {!agreedToRules && (
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Please check the box above to confirm you understand the rules
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AssignmentWarning;
