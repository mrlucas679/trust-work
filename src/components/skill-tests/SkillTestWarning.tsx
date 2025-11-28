/**
 * SkillTestWarning - Pre-test rules and agreement screen
 * 
 * Displays test rules and requires user acknowledgment before starting
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Clock, Award, AlertCircle, Eye, Monitor } from 'lucide-react';
import type { SkillTestWarningProps } from '@/types/skill-tests';
import { DIFFICULTY_CONFIG } from '@/types/skill-tests';

export function SkillTestWarning({
  templateName,
  difficulty,
  questionCount,
  timeLimit,
  passingScore,
  onAgree,
  onCancel,
  isLoading = false
}: SkillTestWarningProps) {
  const [agreed, setAgreed] = useState(false);

  const difficultyInfo = DIFFICULTY_CONFIG[difficulty];

  const rules = [
    {
      icon: Monitor,
      title: 'No Tab Switching',
      description: 'Switching tabs or minimizing the window will automatically fail the test. Stay focused on this window.',
      critical: true
    },
    {
      icon: Clock,
      title: `${timeLimit}-Minute Time Limit`,
      description: 'The test will automatically submit when time runs out. Make sure you have uninterrupted time.',
      critical: false
    },
    {
      icon: Award,
      title: `${passingScore}% Passing Score`,
      description: `You need to score at least ${passingScore}% to pass. Each question is worth equal points.`,
      critical: false
    },
    {
      icon: AlertCircle,
      title: '7-Day Cooldown',
      description: 'If you fail, you must wait 7 days before retaking this test for the same job/gig.',
      critical: true
    },
    {
      icon: Eye,
      title: 'Single Attempt',
      description: 'Once you start, you cannot pause or restart. Complete the test in one session.',
      critical: false
    }
  ];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-500">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Important: Read Before Starting</h2>
        </div>
        <p className="text-lg font-medium text-foreground">
          {templateName} - {difficultyInfo.label}
        </p>
        <p className="text-sm text-muted-foreground">
          {questionCount} questions • {timeLimit} minutes • {passingScore}% to pass
        </p>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Test Rules:</h3>
        <div className="grid gap-4">
          {rules.map((rule, index) => {
            const Icon = rule.icon;
            return (
              <div
                key={index}
                className={`flex gap-3 p-4 rounded-lg border ${
                  rule.critical
                    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                    : 'border-border bg-muted/50'
                }`}
              >
                <div className={`mt-0.5 ${rule.critical ? 'text-red-600 dark:text-red-500' : 'text-primary'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{rule.title}</p>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
              Tab Switching Detection Active
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              We monitor window focus. If you switch tabs, minimize the window, or use other applications during the test,
              it will be automatically submitted and marked as failed. This is to ensure test integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-background">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-1"
          />
          <label
            htmlFor="agree"
            className="text-sm font-medium leading-relaxed cursor-pointer select-none"
          >
            I understand and agree to all test rules. I have {timeLimit} uninterrupted minutes available and will not
            switch tabs or minimize the window during the test.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onAgree}
            disabled={!agreed || isLoading}
          >
            {isLoading ? 'Starting Test...' : 'I Agree - Start Test'}
          </Button>
        </div>
      </div>
    </div>
  );
}
