/**
 * Gradient Header Component
 *
 * Modern header with gradient background, circular progress, and actions
 * Inspired by the design examples provided
 */

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  progress?: number;
  actions?: React.ReactNode;
  className?: string;
}

export function GradientHeader({
  title,
  subtitle,
  icon: Icon,
  progress,
  actions,
  className,
}: GradientHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 md:p-6 lg:p-8 shadow-sm',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
        <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
          {Icon && (
            <div className="p-2 md:p-3 bg-primary/10 rounded-lg md:rounded-xl transition-all duration-300 shrink-0">
              <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
          {progress !== undefined && (
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 80 80">
                  {/* Background Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="rgb(229 231 235)"
                    strokeWidth="6"
                    fill="none"
                    className="md:stroke-8 dark:stroke-gray-700"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="rgb(14 165 233)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out md:stroke-8 dark:stroke-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-900 dark:text-white font-bold text-base md:text-lg">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {actions && <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
