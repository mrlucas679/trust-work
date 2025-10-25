import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Trophy, CheckCircle, XCircle, Lock, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    UserAssignmentProfile,
    SkillCategory,
    AssignmentLevel,
    SKILL_DISPLAY_NAMES,
    LEVEL_DISPLAY_NAMES
} from '@/types/assignments';
import { mockUserAssignmentProfile } from '@/data/mockAssignmentData';

interface CertificationDisplayProps {
    isOwnProfile?: boolean;
    userProfile?: UserAssignmentProfile;
}

const CertificationDisplay = ({ isOwnProfile = true, userProfile }: CertificationDisplayProps) => {
    const navigate = useNavigate();
    const profile = userProfile || mockUserAssignmentProfile;
    const skills: SkillCategory[] = ['digital-marketing', 'graphic-design', 'content-writing'];
    const levels: AssignmentLevel[] = ['foundation', 'developer', 'advanced', 'expert'];

    const getCertificationStatusIcon = (passed: boolean, attempts: number) => {
        if (passed) {
            return <CheckCircle className="h-5 w-5 text-success" />;
        } else if (attempts > 0) {
            return <XCircle className="h-5 w-5 text-destructive" />;
        } else {
            return <Lock className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getCompletedLevels = (skill: SkillCategory) => {
        return levels.filter(level => profile.certifications[skill][level].passed).length;
    };

    const getHighestLevelPassed = (skill: SkillCategory): AssignmentLevel | null => {
        const reversedLevels = [...levels].reverse();
        for (const level of reversedLevels) {
            if (profile.certifications[skill][level].passed) {
                return level;
            }
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-warning" />
                        {isOwnProfile ? 'My Certifications' : 'Verified Skills & Certifications'}
                    </CardTitle>
                    {isOwnProfile && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/assignments')}
                        >
                            Take More Assignments
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Stats */}
                {isOwnProfile && (
                    <>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{profile.gigsCompleted}/12</p>
                                <p className="text-sm text-muted-foreground">Total Gigs Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold flex items-center justify-center gap-2">
                                    <Coins className="h-6 w-6 text-warning" />
                                    {profile.assignmentCredits} AC
                                </p>
                                <p className="text-sm text-muted-foreground">Assignment Credits</p>
                            </div>
                        </div>
                        <Separator />
                    </>
                )}

                {/* Skills */}
                <div className="space-y-6">
                    {skills.map((skill) => {
                        const completedLevels = getCompletedLevels(skill);
                        const highestLevel = getHighestLevelPassed(skill);
                        const progressPercentage = (completedLevels / 4) * 100;

                        return (
                            <div key={skill} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">{SKILL_DISPLAY_NAMES[skill]}</h3>
                                    {highestLevel && (
                                        <Badge variant="outline" className="border-success text-success">
                                            {LEVEL_DISPLAY_NAMES[highestLevel]} Level
                                        </Badge>
                                    )}
                                </div>

                                <Progress value={progressPercentage} className="h-2" />

                                <div className="grid grid-cols-2 gap-3">
                                    {levels.map((level) => {
                                        const cert = profile.certifications[skill][level];

                                        return (
                                            <div
                                                key={level}
                                                className={`p-3 rounded-lg border ${cert.passed
                                                        ? 'bg-success/5 border-success/30'
                                                        : cert.attempts > 0
                                                            ? 'bg-destructive/5 border-destructive/30'
                                                            : 'bg-muted/30 border-muted'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getCertificationStatusIcon(cert.passed, cert.attempts)}
                                                    <span className="font-medium text-sm">
                                                        {LEVEL_DISPLAY_NAMES[level]}
                                                    </span>
                                                </div>
                                                {cert.bestScore !== null && (
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-sm font-semibold ${cert.passed ? 'text-success' : 'text-destructive'}`}>
                                                            {cert.bestScore}%
                                                        </span>
                                                        {cert.lastAttemptDate && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(cert.lastAttemptDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {cert.attempts === 0 && (
                                                    <span className="text-xs text-muted-foreground">Not attempted</span>
                                                )}
                                                {!cert.passed && cert.attempts > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {isOwnProfile ? `Retake available${cert.nextRetakeAvailable ? ' soon' : ''}` : 'In progress'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {!isOwnProfile && highestLevel && (
                                    <div className="text-sm text-muted-foreground flex items-start gap-2 mt-2">
                                        <span>💡</span>
                                        <span>
                                            {highestLevel === 'foundation' && 'Strong foundational skills'}
                                            {highestLevel === 'developer' && 'Proficient in intermediate concepts'}
                                            {highestLevel === 'advanced' && 'Advanced expertise demonstrated'}
                                            {highestLevel === 'expert' && 'Master-level certification achieved'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default CertificationDisplay;
