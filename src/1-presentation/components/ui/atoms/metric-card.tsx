/**
 * Metric Card Component
 *
 * Advanced metric card with progress indicators and visual elements
 */

'use client';

import * as React from 'react';
import { Card, CardContent } from './card';
import { cn } from '@/presentation/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  progress?: number; // 0-100
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

const colorVariants = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-950',
    progress: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    icon: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-950',
    progress: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-950',
    progress: 'bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    icon: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-950',
    progress: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
  },
  red: {
    icon: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-950',
    progress: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
  },
  cyan: {
    icon: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    progress: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  gray: {
    icon: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-950',
    progress: 'bg-gray-500',
    text: 'text-gray-600 dark:text-gray-400',
  },
};

const sizeVariants = {
  sm: {
    card: 'p-4',
    icon: 'h-4 w-4',
    value: 'text-lg',
    label: 'text-xs',
  },
  md: {
    card: 'p-6',
    icon: 'h-5 w-5',
    value: 'text-xl',
    label: 'text-sm',
  },
  lg: {
    card: 'p-8',
    icon: 'h-6 w-6',
    value: 'text-2xl',
    label: 'text-base',
  },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  progress,
  trend,
  color = 'blue',
  size = 'md',
  loading = false,
  className,
}: MetricCardProps) {
  const colorVariant = colorVariants[color];
  const sizeVariant = sizeVariants[size];

  if (loading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardContent className={sizeVariant.card}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className={cn('bg-muted animate-pulse rounded', sizeVariant.icon)} />
            </div>
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            {progress !== undefined && (
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-muted animate-pulse h-2 rounded-full w-1/3" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTrendValue = (value: number) => {
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        className
      )}
    >
      <CardContent className={sizeVariant.card}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className={cn('font-medium text-muted-foreground', sizeVariant.label)}>{label}</p>
            {Icon && (
              <div
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  colorVariant.bg,
                  colorVariant.icon
                )}
              >
                <Icon className={sizeVariant.icon} />
              </div>
            )}
          </div>

          {/* Value */}
          <div className={cn('font-bold', sizeVariant.value, colorVariant.text)}>{value}</div>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500 ease-out',
                    colorVariant.progress
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>İlerleme</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-2">
              <div className={cn('flex items-center gap-1 text-xs font-medium', colorVariant.text)}>
                <span>{formatTrendValue(trend.value)}</span>
                {trend.period && <span className="text-muted-foreground">({trend.period})</span>}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
