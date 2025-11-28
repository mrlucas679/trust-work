/**
 * SkillTestTimer Component
 * 
 * Countdown timer display for skill tests
 * - Shows remaining time in MM:SS format
 * - Changes color when less than 5 minutes remaining
 * - Auto-submits test when timer reaches 0:00
 */

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillTestTimerProps {
  /** Time limit in seconds */
  timeLimit: number;
  /** Callback when timer expires */
  onTimeExpired: () => void;
  /** Optional className for styling */
  className?: string;
}

export function SkillTestTimer({
  timeLimit,
  onTimeExpired,
  className
}: SkillTestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0 && !hasExpired) {
      setHasExpired(true);
      onTimeExpired();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, hasExpired, onTimeExpired]);

  // Format time as MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Determine color based on time remaining
  const isLowTime = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-colors',
        isCritical && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        isLowTime && !isCritical && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
        !isLowTime && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        className
      )}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5 animate-pulse" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{formattedTime}</span>
      {isLowTime && (
        <span className="text-xs font-normal">
          {isCritical ? 'Time almost up!' : 'Hurry up!'}
        </span>
      )}
    </div>
  );
}
