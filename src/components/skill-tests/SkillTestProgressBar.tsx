/**
 * SkillTestProgressBar Component
 * 
 * Visual progress indicator for skill test completion
 */

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SkillTestProgressBarProps {
  /** Current question number (1-indexed) */
  current: number;
  /** Total number of questions */
  total: number;
  /** Optional className */
  className?: string;
}

export function SkillTestProgressBar({
  current,
  total,
  className
}: SkillTestProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {current} of {total}
        </span>
        <span className="font-medium">{percentage}% Complete</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
