/**
 * Modern Stat Card Component
 *
 * Enhanced stat card with gradient backgrounds, progress bars, and glow effects
 * Inspired by the design examples provided
 */

import * as React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { EnhancedCard } from './enhanced-card';

export interface ModernStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  progress?: number;
  showGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

const colorSchemes = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    progress: 'bg-blue-600',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    progress: 'bg-green-600',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    progress: 'bg-purple-600',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    progress: 'bg-orange-600',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/20',
    icon: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
    progress: 'bg-pink-600',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    icon: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    progress: 'bg-cyan-600',
  },
};

export function ModernStatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  progress,
  showGlow = false,
  className,
  onClick,
}: ModernStatCardProps) {
  const colorScheme = colorSchemes[color];

  return (
    <EnhancedCard
      variant="default"
      hover
      onClick={onClick}
      className={cn(
        'p-6 border',
        colorScheme.bg,
        colorScheme.border,
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'p-3 rounded-xl transition-all duration-300',
            colorScheme.icon,
            showGlow && 'hover:scale-110'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full',
              trend.direction === 'up' && 'text-green-600 dark:text-green-400 bg-green-500/10',
              trend.direction === 'down' && 'text-red-600 dark:text-red-400 bg-red-500/10',
              trend.direction === 'neutral' && 'text-gray-600 dark:text-gray-400 bg-gray-500/10'
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
            {trend.value > 0 && '+'}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>İlerleme</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-out',
                colorScheme.progress
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </EnhancedCard>
  );
}
