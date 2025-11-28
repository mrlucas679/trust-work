/**
 * SkillTestQuestionCard Component
 * 
 * Displays a single skill test question with multiple choice options
 */

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface SkillTestQuestionCardProps {
  /** Question number (1-indexed) */
  questionNumber: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Question text */
  questionText: string;
  /** Option A text */
  optionA: string;
  /** Option B text */
  optionB: string;
  /** Option C text */
  optionC: string;
  /** Option D text */
  optionD: string;
  /** Currently selected answer */
  selectedAnswer?: 'A' | 'B' | 'C' | 'D';
  /** Callback when answer is selected */
  onAnswerSelect: (answer: 'A' | 'B' | 'C' | 'D') => void;
  /** Optional className */
  className?: string;
}

export function SkillTestQuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  optionA,
  optionB,
  optionC,
  optionD,
  selectedAnswer,
  onAnswerSelect,
  className
}: SkillTestQuestionCardProps) {
  const options = [
    { value: 'A' as const, text: optionA },
    { value: 'B' as const, text: optionB },
    { value: 'C' as const, text: optionC },
    { value: 'D' as const, text: optionD },
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          {selectedAnswer && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Answered
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-relaxed">{questionText}</h3>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedAnswer} onValueChange={onAnswerSelect}>
          <div className="space-y-3">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent',
                  selectedAnswer === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
                onClick={() => onAnswerSelect(option.value)}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`option-${option.value}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`option-${option.value}`}
                  className="flex-1 cursor-pointer font-normal leading-relaxed"
                >
                  <span className="font-semibold mr-2">{option.value}.</span>
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
