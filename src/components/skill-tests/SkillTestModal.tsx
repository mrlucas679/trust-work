/**
 * SkillTestModal - Main orchestrator for skill test flow
 * 
 * Manages test stages: warning → quiz → results → review
 */

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SkillTestWarning } from './SkillTestWarning';
import { SkillTestQuiz } from './SkillTestQuiz';
import { SkillTestResults } from './SkillTestResults';
import { SkillTestReview } from './SkillTestReview';
import { useStartSkillTest, useSkillTestTemplate } from '@/hooks/use-skill-test';
import type { SkillTestModalProps } from '@/types/skill-tests';
import { Loader2 } from 'lucide-react';

type TestStage = 'warning' | 'quiz' | 'results' | 'review';

export function SkillTestModal({
  isOpen,
  onClose,
  templateId,
  difficulty,
  passingScore,
  gigId,
  jobId,
  onTestComplete
}: SkillTestModalProps) {
  const [stage, setStage] = useState<TestStage>('warning');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
  } | null>(null);

  const { data: template, isLoading: templateLoading } = useSkillTestTemplate(templateId);
  const startTestMutation = useStartSkillTest();

  // Handle starting the test after user agrees to warning
  const handleStartTest = async () => {
    try {
      const response = await startTestMutation.mutateAsync({
        templateId,
        difficulty,
        gigId,
        jobId
      });
      
      setAttemptId(response.attemptId);
      setStage('quiz');
    } catch (error) {
      console.error('Failed to start test:', error);
      alert('Failed to start test. Please try again.');
    }
  };

  // Handle test submission from quiz component
  const handleTestSubmit = (results: {
    attemptId: string;
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    timeTakenSeconds: number;
  }) => {
    setTestResults({
      score: results.score,
      passed: results.passed,
      correctAnswers: results.correctAnswers,
      totalQuestions: results.totalQuestions,
      timeTaken: results.timeTakenSeconds
    });
    setStage('results');
    
    // Notify parent component
    onTestComplete?.(results.attemptId, results.passed, results.score);
  };

  // Handle tab switch detection (automatic fail)
  const handleCheatDetected = () => {
    setTestResults({
      score: 0,
      passed: false,
      correctAnswers: 0,
      totalQuestions: 0,
      timeTaken: 0
    });
    setStage('results');
    
    if (attemptId) {
      onTestComplete?.(attemptId, false, 0);
    }
  };

  // Handle review button click
  const handleReview = () => {
    setStage('review');
  };

  // Handle close from results or review
  const handleCloseModal = () => {
    setStage('warning');
    setAttemptId(null);
    setTestResults(null);
    onClose();
  };

  // Handle cancel from warning
  const handleCancel = () => {
    handleCloseModal();
  };

  if (templateLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading test...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!template) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <div className="py-8 text-center text-destructive">
            Failed to load test template. Please try again.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Prevent closing during quiz
          if (stage === 'quiz') {
            e.preventDefault();
          }
        }}
      >
        {stage === 'warning' && (
          <SkillTestWarning
            templateName={template.name}
            difficulty={difficulty}
            questionCount={
              difficulty === 'entry' ? 5 : difficulty === 'mid' ? 10 : 15
            }
            timeLimit={40}
            passingScore={passingScore}
            onAgree={handleStartTest}
            onCancel={handleCancel}
            isLoading={startTestMutation.isPending}
          />
        )}

        {stage === 'quiz' && attemptId && startTestMutation.data && (
          <SkillTestQuiz
            attemptId={attemptId}
            questions={startTestMutation.data.questions}
            timeLimit={startTestMutation.data.timeLimit}
            onSubmit={handleTestSubmit}
            onCheatDetected={handleCheatDetected}
          />
        )}

        {stage === 'results' && testResults && (
          <SkillTestResults
            score={testResults.score}
            passed={testResults.passed}
            correctAnswers={testResults.correctAnswers}
            totalQuestions={testResults.totalQuestions}
            passingScore={passingScore}
            timeTaken={testResults.timeTaken}
            onReview={attemptId ? handleReview : undefined}
            onClose={handleCloseModal}
          />
        )}

        {stage === 'review' && attemptId && (
          <SkillTestReview
            attemptId={attemptId}
            onClose={handleCloseModal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
