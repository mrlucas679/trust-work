/**
 * SkillTestResults Component
 * 
 * Displays skill test results after submission
 * Shows score, pass/fail status, and action buttons
 */

import { CheckCircle2, XCircle, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SkillTestResultsProps } from '@/types/skill-tests';

export function SkillTestResults({
  score,
  passed,
  correctAnswers,
  totalQuestions,
  passingScore,
  timeTaken,
  onReview,
  onClose
}: SkillTestResultsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          {passed ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <CardTitle className="text-2xl text-green-600">Congratulations!</CardTitle>
              <CardDescription>You passed the skill test</CardDescription>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <XCircle className="h-16 w-16 text-red-600" />
              <CardTitle className="text-2xl text-red-600">Test Not Passed</CardTitle>
              <CardDescription>Better luck next time</CardDescription>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score display */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                className={passed ? 'text-green-600' : 'text-red-600'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">{score}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Target className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
              <div className="text-2xl font-bold">
                {correctAnswers}/{totalQuestions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
              <div className="text-2xl font-bold">{formatTime(timeTaken)}</div>
            </div>
          </div>
        </div>

        {/* Passing score indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Passing Score Required</span>
            <span className="font-medium">{passingScore}%</span>
          </div>
          <Progress value={passingScore} className="h-2" />
        </div>

        {/* Pass/Fail message */}
        {passed ? (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Great job!</strong> You scored {score}%, which is above the passing score of {passingScore}%. 
              Your application will proceed with this test result attached.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Unfortunately, you didn't pass.</strong> You scored {score}%, but the passing score is {passingScore}%. 
              Your application cannot proceed without passing this test. You can retry after 7 days.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button variant="outline" onClick={onReview}>
          Review Answers
        </Button>
        <Button onClick={onClose}>
          {passed ? 'Continue to Application' : 'Close'}
        </Button>
      </CardFooter>
    </Card>
  );
}
