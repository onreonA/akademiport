'use client';

/**
 * Training Progress Bar Component
 *
 * Displays training progress with percentage and visual bar
 */

import * as React from 'react';
import { cn } from '@/presentation/lib/utils';

export interface TrainingProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TrainingProgressBar({
  progress,
  className,
  showPercentage = true,
  label,
  size = 'md',
}: TrainingProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className={cn('font-medium', clampedProgress === 100 && 'text-green-600')}>
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-secondary rounded-full overflow-hidden', heightClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            clampedProgress === 100
              ? 'bg-green-500'
              : clampedProgress >= 50
                ? 'bg-blue-500'
                : 'bg-orange-500'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
