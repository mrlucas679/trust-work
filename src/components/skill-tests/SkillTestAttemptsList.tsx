/**
 * SkillTestAttemptsList Component
 * 
 * Displays list of skill test attempts for a job/gig (employer view)
 */

import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SkillTestAttemptWithApplicant } from '@/types/skill-tests';
import { formatDistanceToNow } from 'date-fns';

interface SkillTestAttemptsListProps {
  /** List of test attempts */
  attempts: SkillTestAttemptWithApplicant[];
  /** Whether data is loading */
  isLoading?: boolean;
}

export function SkillTestAttemptsList({
  attempts,
  isLoading = false
}: SkillTestAttemptsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading test results...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No applicants have taken the skill test yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const passedCount = attempts.filter(a => a.passed).length;
  const passRate = Math.round((passedCount / attempts.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Test Results</CardTitle>
        <CardDescription>
          {attempts.length} attempt{attempts.length !== 1 ? 's' : ''} • {passedCount} passed ({passRate}% pass rate)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card key={attempt.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Applicant Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{attempt.applicant.displayName}</span>
                        {attempt.passed ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Passed
                          </Badge>
                        ) : attempt.status === 'failed_cheat' ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Failed (Cheat)
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                      
                      {/* Test Details */}
                      <div className="text-sm text-muted-foreground space-y-1">
                        {attempt.template && (
                          <div>Test: {attempt.template.name} ({attempt.difficulty} level)</div>
                        )}
                        <div className="flex items-center gap-4">
                          <span>Score: {attempt.score}%</span>
                          <span>•</span>
                          <span>Passing: {attempt.passingScore}%</span>
                          {attempt.timeTakenSeconds && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
                              </span>
                            </>
                          )}
                        </div>
                        {attempt.tabSwitches > 0 && (
                          <div className="text-red-600 dark:text-red-400 font-medium">
                            ⚠️ Tab switches detected: {attempt.tabSwitches}
                          </div>
                        )}
                        <div className="text-xs">
                          Completed {formatDistanceToNow(new Date(attempt.completedAt || attempt.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    {/* Score Circle */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - attempt.score / 100)}`}
                            className={attempt.passed ? 'text-green-600' : 'text-red-600'}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold">{attempt.score}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Score</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
