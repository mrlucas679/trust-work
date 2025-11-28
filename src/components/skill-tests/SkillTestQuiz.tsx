/**
 * SkillTestQuiz - Interactive quiz interface with timer and tab detection
 * 
 * Displays questions, manages answers, and enforces anti-cheat measures
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SkillTestTimer } from './SkillTestTimer';
import { SkillTestQuestionCard } from './SkillTestQuestionCard';
import { SkillTestProgressBar } from './SkillTestProgressBar';
import { useSubmitSkillTest } from '@/hooks/use-skill-test';
import type { SkillTestQuizProps, SkillTestQuestion } from '@/types/skill-tests';
import { AlertTriangle } from 'lucide-react';

export function SkillTestQuiz({
  attemptId,
  questions,
  timeLimit,
  onSubmit,
  onCheatDetected
}: SkillTestQuizProps) {
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTestMutation = useSubmitSkillTest();

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          
          // Instant fail on first tab switch
          if (newCount > 0) {
            handleCheatDetection();
          }
          
          return newCount;
        });
      }
    };

    const handleBlur = () => {
      // Additional detection for window blur
      setTabSwitches(prev => {
        const newCount = prev + 1;
        
        if (newCount > 0) {
          handleCheatDetection();
        }
        
        return newCount;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleCheatDetection]);

  const handleCheatDetection = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Submit test with cheat detection flag
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      await submitTestMutation.mutateAsync({
        attemptId,
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer
        })),
        timeTakenSeconds: timeTaken,
        tabSwitches: 1 // Flag as cheating
      });
      
      onCheatDetected();
    } catch (error) {
      console.error('Error submitting test after cheat detection:', error);
      onCheatDetected();
    }
  }, [attemptId, answers, startTime, submitTestMutation, onCheatDetected, isSubmitting]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle navigation
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle test submission
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      const result = await submitTestMutation.mutateAsync({
        attemptId,
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer
        })),
        timeTakenSeconds: timeTaken,
        tabSwitches: 0
      });
      
      onSubmit(result);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
      setIsSubmitting(false);
    }
  }, [attemptId, answers, startTime, submitTestMutation, onSubmit, isSubmitting]);

  // Handle time expiry
  const handleTimeExpired = useCallback(() => {
    handleSubmitTest();
  }, [handleSubmitTest]);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="space-y-6 py-4">
      {/* Header with Timer */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold">Skill Test in Progress</h2>
          <p className="text-sm text-muted-foreground">
            Answer all questions carefully
          </p>
        </div>
        <SkillTestTimer
          timeLimit={timeLimit}
          onTimeExpired={handleTimeExpired}
        />
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
        <div className="flex gap-2 items-center text-red-700 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-medium">
            Do not switch tabs or minimize this window. The test will automatically fail if you do.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <SkillTestProgressBar
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
      />

      {/* Question Card */}
      <SkillTestQuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        selectedAnswer={answers[currentQuestion.id]}
        onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion.id, answer)}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmitTest}
            disabled={!allAnswered || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        )}
      </div>

      {/* Submit Warning */}
      {!allAnswered && currentQuestionIndex === questions.length - 1 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Please answer all {questions.length} questions before submitting the test.
          </p>
        </div>
      )}
    </div>
  );
}
