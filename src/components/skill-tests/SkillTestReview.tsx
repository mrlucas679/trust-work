/**
 * SkillTestReview Component
 * 
 * Displays detailed review of skill test attempt
 * Shows all questions with user answers and explanations
 */

import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { SkillTestQuestion } from '@/types/skill-tests';

interface SkillTestReviewProps {
  /** Test attempt with questions and answers */
  questions: Array<{
    question: SkillTestQuestion;
    userAnswer: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
  }>;
  /** Callback when closing review */
  onClose: () => void;
}

export function SkillTestReview({ questions, onClose }: SkillTestReviewProps) {
  const getOptionText = (question: SkillTestQuestion, option: 'A' | 'B' | 'C' | 'D') => {
    switch (option) {
      case 'A': return question.optionA;
      case 'B': return question.optionB;
      case 'C': return question.optionC;
      case 'D': return question.optionD;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Test Review</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {questions.map((item, index) => (
                <Card key={item.question.id} className={cn(
                  'border-2',
                  item.isCorrect 
                    ? 'border-green-200 dark:border-green-800' 
                    : 'border-red-200 dark:border-red-800'
                )}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {item.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-2">
                          Question {index + 1} of {questions.length}
                        </div>
                        <CardTitle className="text-lg font-semibold leading-relaxed">
                          {item.question.questionText}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Options */}
                    <div className="space-y-2">
                      {(['A', 'B', 'C', 'D'] as const).map((option) => {
                        const isUserAnswer = item.userAnswer === option;
                        const isCorrectAnswer = item.question.correctAnswer === option;
                        
                        return (
                          <div
                            key={option}
                            className={cn(
                              'p-3 rounded-lg border-2',
                              isCorrectAnswer && 'bg-green-50 dark:bg-green-950 border-green-500',
                              isUserAnswer && !isCorrectAnswer && 'bg-red-50 dark:bg-red-950 border-red-500',
                              !isUserAnswer && !isCorrectAnswer && 'border-border'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-semibold">{option}.</span>
                              <span className="flex-1">{getOptionText(item.question, option)}</span>
                              {isCorrectAnswer && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                              )}
                            </div>
                            {isUserAnswer && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                Your answer
                              </div>
                            )}
                            {isCorrectAnswer && (
                              <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                Correct answer
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="flex gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Explanation
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {item.question.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-6 flex justify-center">
            <Button onClick={onClose}>Close Review</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
