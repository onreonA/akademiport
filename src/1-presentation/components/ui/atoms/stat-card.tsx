/**
 * Stat Card Component
 *
 * Professional stat card with trend indicators and icons
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Badge } from './badge';
import { cn } from '@/presentation/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan' | 'gray';
  loading?: boolean;
  className?: string;
}

const colorVariants = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    trend: {
      up: 'text-blue-600 dark:text-blue-400',
      down: 'text-blue-600 dark:text-blue-400',
      neutral: 'text-blue-500 dark:text-blue-500',
    },
  },
  green: {
    icon: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    trend: {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-green-600 dark:text-green-400',
      neutral: 'text-green-500 dark:text-green-500',
    },
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    trend: {
      up: 'text-purple-600 dark:text-purple-400',
      down: 'text-purple-600 dark:text-purple-400',
      neutral: 'text-purple-500 dark:text-purple-500',
    },
  },
  orange: {
    icon: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-800',
    trend: {
      up: 'text-orange-600 dark:text-orange-400',
      down: 'text-orange-600 dark:text-orange-400',
      neutral: 'text-orange-500 dark:text-orange-500',
    },
  },
  red: {
    icon: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    trend: {
      up: 'text-red-600 dark:text-red-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-red-500 dark:text-red-500',
    },
  },
  cyan: {
    icon: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    border: 'border-cyan-200 dark:border-cyan-800',
    trend: {
      up: 'text-cyan-600 dark:text-cyan-400',
      down: 'text-cyan-600 dark:text-cyan-400',
      neutral: 'text-cyan-500 dark:text-cyan-500',
    },
  },
  gray: {
    icon: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-950',
    border: 'border-gray-200 dark:border-gray-800',
    trend: {
      up: 'text-gray-600 dark:text-gray-400',
      down: 'text-gray-600 dark:text-gray-400',
      neutral: 'text-gray-500 dark:text-gray-500',
    },
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  loading = false,
  className,
}: StatCardProps) {
  const colorVariant = colorVariants[color];

  if (loading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const formatTrendValue = (value: number) => {
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      case 'neutral':
        return <Minus className="h-3 w-3" />;
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div
            className={cn('p-2 rounded-lg transition-colors', colorVariant.bg, colorVariant.icon)}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <div className={cn('flex items-center gap-1', colorVariant.trend[trend.direction])}>
              {getTrendIcon(trend.direction)}
              <span className="text-xs font-medium">{formatTrendValue(trend.value)}</span>
            </div>
            {trend.period && <span className="text-xs text-muted-foreground">{trend.period}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
