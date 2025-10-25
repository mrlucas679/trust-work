import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Trophy,
    Lock,
    CheckCircle,
    XCircle,
    Clock,
    Coins,
    Info,
    AlertCircle,
    Ticket
} from 'lucide-react';
import {
    SkillCategory,
    AssignmentLevel,
    SKILL_DISPLAY_NAMES,
    LEVEL_DISPLAY_NAMES,
    LEVEL_REQUIREMENTS
} from '@/types/assignments';
import {
    mockUserAssignmentProfile,
    getLevelStatus,
    canRetakeNow,
    getTimeUntilRetake,
    isLevelUnlocked
} from '@/data/mockAssignmentData';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AssignmentDashboard = () => {
    const navigate = useNavigate();
    const [showCreditGuide, setShowCreditGuide] = useState(false);
    const userProfile = mockUserAssignmentProfile;

    const skills: SkillCategory[] = ['digital-marketing', 'graphic-design', 'content-writing'];
    const levels: AssignmentLevel[] = ['foundation', 'developer', 'advanced', 'expert'];

    const handleStartAssignment = (skill: SkillCategory, level: AssignmentLevel) => {
        navigate(`/assignments/${skill}/${level}/warning`);
    };

    const renderLevelCard = (skill: SkillCategory, level: AssignmentLevel) => {
        const status = getLevelStatus(skill, level, userProfile);
        const cert = userProfile.certifications[skill][level];
        const requirements = LEVEL_REQUIREMENTS[level];
        const unlocked = isLevelUnlocked(skill, level, userProfile);
        const canRetake = canRetakeNow(skill, level, userProfile);
        const timeUntilRetake = getTimeUntilRetake(skill, level, userProfile);

        // Check if user has a voucher
        const hasVoucher = userProfile.discountVouchers.some(v => !v.used);
        const voucherDiscount = hasVoucher ? 0.3 : 0;
        const retakeCostWithVoucher = Math.ceil(requirements.retakeCost * (1 - voucherDiscount));

        // Status badge and colors
        let statusIcon;
        let statusColor;
        let statusText;

        if (status === 'passed') {
            statusIcon = <CheckCircle className="h-5 w-5" />;
            statusColor = 'text-success border-success bg-success/10';
            statusText = 'PASSED';
        } else if (status === 'failed') {
            statusIcon = <XCircle className="h-5 w-5" />;
            statusColor = 'text-destructive border-destructive bg-destructive/10';
            statusText = 'FAILED';
        } else if (status === 'unlocked') {
            statusIcon = <Trophy className="h-5 w-5" />;
            statusColor = 'text-primary border-primary bg-primary/10';
            statusText = 'UNLOCKED';
        } else {
            statusIcon = <Lock className="h-5 w-5" />;
            statusColor = 'text-muted-foreground border-muted bg-muted/10';
            statusText = 'LOCKED';
        }

        return (
            <Card key={`${skill}-${level}`} className={`${statusColor} border-2`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {statusIcon}
                            {LEVEL_DISPLAY_NAMES[level]} - {statusText}
                        </CardTitle>
                        {status === 'passed' && (
                            <Badge variant="outline" className="border-success text-success">
                                {cert.bestScore}%
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {status === 'passed' && (
                        <>
                            <div className="text-sm">
                                <p className="text-muted-foreground">Your Score: <span className="font-semibold text-foreground">{cert.bestScore}%</span></p>
                                <p className="text-muted-foreground">Completed: {new Date(cert.lastAttemptDate!).toLocaleDateString()}</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleStartAssignment(skill, level)}
                                    disabled={!canRetake}
                                >
                                    <Coins className="h-4 w-4 mr-2" />
                                    Retake to Improve - {requirements.retakeCost} AC
                                </Button>
                                {timeUntilRetake && (
                                    <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Next retake available in: {timeUntilRetake}
                                    </p>
                                )}
                                {!timeUntilRetake && canRetake && (
                                    <p className="text-xs text-success text-center">Next retake available: Now</p>
                                )}
                            </div>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="text-sm space-y-1">
                                <p className="text-muted-foreground">Your Score: <span className="font-semibold text-destructive">{cert.bestScore}%</span></p>
                                <p className="text-muted-foreground">Required: <span className="font-semibold">70%</span> ({Math.ceil(requirements.totalQuestions * 0.7)}/{requirements.totalQuestions} correct)</p>
                                <p className="text-warning font-medium">You were {Math.ceil(requirements.totalQuestions * 0.7) - Math.floor((cert.bestScore! / 100) * requirements.totalQuestions)} question(s) away!</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Cost to retake: {requirements.retakeCost} AC</p>
                                {hasVoucher && (
                                    <div className="bg-warning/10 border border-warning rounded-md p-3 space-y-2">
                                        <p className="text-xs font-medium flex items-center gap-1">
                                            <Ticket className="h-4 w-4" />
                                            USE VOUCHER: Pay only {retakeCostWithVoucher} AC (30% off)
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                                                onClick={() => handleStartAssignment(skill, level)}
                                                disabled={!canRetake || userProfile.assignmentCredits < retakeCostWithVoucher}
                                            >
                                                Retake with Voucher
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleStartAssignment(skill, level)}
                                    disabled={!canRetake || userProfile.assignmentCredits < requirements.retakeCost}
                                >
                                    <Coins className="h-4 w-4 mr-2" />
                                    Retake ({requirements.retakeCost} AC)
                                </Button>
                                {timeUntilRetake && (
                                    <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Next retake available in: {timeUntilRetake}
                                    </p>
                                )}
                                {!timeUntilRetake && canRetake && userProfile.assignmentCredits < requirements.retakeCost && (
                                    <p className="text-xs text-destructive text-center">Insufficient credits</p>
                                )}
                            </div>
                        </>
                    )}

                    {status === 'unlocked' && (
                        <>
                            <div className="text-sm space-y-1">
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {requirements.totalQuestions} questions | {requirements.timeAllowed} minutes
                                </p>
                                <p className="text-muted-foreground">Pass score: <span className="font-semibold">70%</span></p>
                                <p className="text-success font-medium">First attempt: FREE</p>
                            </div>
                            <Separator />
                            <Button
                                className="w-full"
                                onClick={() => handleStartAssignment(skill, level)}
                            >
                                Take Assignment
                            </Button>
                        </>
                    )}

                    {status === 'locked' && (
                        <>
                            <div className="text-sm space-y-2">
                                <p className="font-medium">Requirements to unlock:</p>
                                <ul className="space-y-1 text-muted-foreground">
                                    {userProfile.gigsCompleted < requirements.totalGigsRequired && (
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">•</span>
                                            Complete {requirements.totalGigsRequired - userProfile.gigsCompleted} more gig(s)
                                            ({userProfile.gigsCompleted}/{requirements.totalGigsRequired})
                                        </li>
                                    )}
                                    {requirements.previousLevelRequired && !userProfile.certifications[skill][requirements.previousLevelRequired].passed && (
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">•</span>
                                            Pass {LEVEL_DISPLAY_NAMES[requirements.previousLevelRequired]} level first
                                        </li>
                                    )}
                                    {unlocked && (
                                        <li className="flex items-start gap-2 text-success">
                                            <CheckCircle className="h-4 w-4 mt-0.5" />
                                            All requirements met!
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-muted/20 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Skill Certifications</h1>
                    <p className="text-muted-foreground">
                        Complete assignments to earn certifications and showcase your expertise
                    </p>
                </div>

                {/* Credits Overview */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Assignment Credits</p>
                                <p className="text-3xl font-bold flex items-center gap-2">
                                    <Coins className="h-8 w-8 text-warning" />
                                    {userProfile.assignmentCredits} AC
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Discount Vouchers</p>
                                <p className="text-3xl font-bold flex items-center gap-2">
                                    <Ticket className="h-8 w-8 text-warning" />
                                    {userProfile.discountVouchers.filter(v => !v.used).length}
                                    {userProfile.discountVouchers.length > 0 && (
                                        <span className="text-sm font-normal text-muted-foreground">(30% off)</span>
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Gigs Completed</p>
                                <p className="text-3xl font-bold flex items-center gap-2">
                                    <Trophy className="h-8 w-8 text-success" />
                                    {userProfile.gigsCompleted}/12
                                </p>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCreditGuide(!showCreditGuide)}
                        >
                            <Info className="h-4 w-4 mr-2" />
                            How to Earn More Credits?
                        </Button>

                        {showCreditGuide && (
                            <Alert className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm space-y-2">
                                    <p className="font-semibold">Earn Assignment Credits by:</p>
                                    <ul className="space-y-1 ml-4 list-disc">
                                        <li>Complete any gig: +5 AC</li>
                                        <li>Complete gig with 5-star rating: +8 AC</li>
                                        <li>Complete ahead of deadline: +7 AC</li>
                                        <li>Client gives bonus/tip: +10 AC</li>
                                        <li>Complete 5 gigs in one week: +10 bonus AC</li>
                                        <li>Maintain 4.5+ average rating: +3 AC per week</li>
                                    </ul>
                                    <p className="font-semibold mt-3">Excellence Bonus:</p>
                                    <p>Pass any assignment on FIRST attempt with 85%+ score to earn a 30% discount voucher for your next retake!</p>
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Skills Sections */}
                {skills.map((skill) => (
                    <div key={skill}>
                        <Card>
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Trophy className="h-6 w-6" />
                                    {SKILL_DISPLAY_NAMES[skill]}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {levels.map((level) => renderLevelCard(skill, level))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignmentDashboard;
