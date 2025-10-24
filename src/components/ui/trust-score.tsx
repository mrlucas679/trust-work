import { Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Progress } from './progress';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { cn } from '@/lib/utils';

interface TrustScoreProps {
    score: number; // 0-100
    verifiedAt?: Date;
    className?: string;
}

export const TrustScore = ({ score, verifiedAt, className }: TrustScoreProps) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-success bg-success/10';
        if (score >= 60) return 'text-warning bg-warning/10';
        return 'text-destructive bg-destructive/10';
    };

    const getScoreIcon = (score: number) => {
        if (score >= 80) return CheckCircle;
        if (score >= 60) return Clock;
        return AlertTriangle;
    };

    const ScoreIcon = getScoreIcon(score);

    return (
        <div className={cn('p-4 rounded-lg border', className)}>
            <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Trust Score</h3>
            </div>

            <div className="space-y-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            <ScoreIcon className={cn('h-4 w-4', getScoreColor(score))} />
                            <Progress value={score} className="h-2" />
                            <span className="text-sm font-medium">{score}%</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Trust score based on verification level and community feedback</p>
                    </TooltipContent>
                </Tooltip>

                {verifiedAt && (
                    <div className="text-xs text-muted-foreground">
                        Last verified: {verifiedAt.toLocaleDateString()}
                    </div>
                )}

                <div className="text-xs">
                    {score >= 80 ? (
                        <span className="text-success">Highly trusted member</span>
                    ) : score >= 60 ? (
                        <span className="text-warning">Trust score needs improvement</span>
                    ) : (
                        <span className="text-destructive">Additional verification required</span>
                    )}
                </div>
            </div>
        </div>
    );
};
