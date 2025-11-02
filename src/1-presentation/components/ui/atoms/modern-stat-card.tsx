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
    bg: 'from-blue-500/10 to-blue-600/5',
    icon: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    progress: 'bg-blue-500',
    glow: 'glow-primary',
  },
  green: {
    bg: 'from-green-500/10 to-green-600/5',
    icon: 'bg-green-500/20 text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
    progress: 'bg-green-500',
    glow: 'glow-success',
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-600/5',
    icon: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    progress: 'bg-purple-500',
    glow: 'glow-secondary',
  },
  orange: {
    bg: 'from-orange-500/10 to-orange-600/5',
    icon: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
    progress: 'bg-orange-500',
    glow: 'glow-warning',
  },
  pink: {
    bg: 'from-pink-500/10 to-pink-600/5',
    icon: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/20',
    progress: 'bg-pink-500',
    glow: 'glow-danger',
  },
  cyan: {
    bg: 'from-cyan-500/10 to-cyan-600/5',
    icon: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/20',
    progress: 'bg-cyan-500',
    glow: 'glow-primary',
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
      variant="glass"
      hover
      glow={showGlow}
      onClick={onClick}
      className={cn(
        'p-6 bg-linear-to-br',
        colorScheme.bg,
        colorScheme.border,
        showGlow && colorScheme.glow,
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
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {value}
        </p>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>İlerleme</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
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
