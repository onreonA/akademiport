'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

import {
  cn,
  tokens,
  spacing,
  typography,
  radius,
  shadow,
} from '@/lib/design-tokens';

export interface StatsCardProps {
  // Content
  title?: string;
  label?: string; // Alias for title for backward compatibility
  value: string | number;
  description?: string;

  // Icon
  icon?: LucideIcon | string;
  iconColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';

  // Trend
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  trendLabel?: string;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Style
  variant?: 'default' | 'gradient' | 'outline' | 'glass';

  // Interactive
  onClick?: () => void;
  loading?: boolean;

  // Additional
  className?: string;
}

/**
 * StatsCard Component - For displaying statistics and metrics
 *
 * @example
 * <StatsCard
 *   title="Toplam Kullanıcı"
 *   value="1,234"
 *   icon={Users}
 *   trend="up"
 *   trendValue="+12%"
 * />
 */
export default function StatsCard({
  title,
  label,
  value,
  description,
  icon: Icon,
  iconColor = 'primary',
  trend,
  trendValue,
  trendLabel = 'son 30 gün',
  size = 'md',
  variant = 'default',
  onClick,
  loading = false,
  className,
}: StatsCardProps) {
  // Use label as fallback for title
  const displayTitle = title || label || '';
  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      titleSize: 'text-xs',
      valueSize: 'text-2xl',
      icon: 'w-8 h-8 p-2',
      gap: 'gap-3',
    },
    md: {
      padding: 'p-6',
      titleSize: 'text-sm',
      valueSize: 'text-3xl',
      icon: 'w-10 h-10 p-2.5',
      gap: 'gap-4',
    },
    lg: {
      padding: 'p-8',
      titleSize: 'text-base',
      valueSize: 'text-4xl',
      icon: 'w-12 h-12 p-3',
      gap: 'gap-5',
    },
  };

  // Variant configurations
  const variantConfig = {
    default: cn(
      'bg-white',
      'border border-gray-200',
      shadow('md'),
      'hover:shadow-lg'
    ),
    gradient: cn(
      'bg-gradient-to-br from-blue-50 to-purple-50',
      'border border-blue-100',
      shadow('md'),
      'hover:shadow-lg'
    ),
    outline: cn(
      'bg-white',
      'border-2 border-gray-300',
      'hover:border-blue-400'
    ),
    glass: cn(
      'bg-white/60 backdrop-blur-lg',
      'border border-white/20',
      shadow('lg'),
      'hover:bg-white/80'
    ),
  };

  // Icon color configurations
  const iconColorConfig = {
    primary: 'bg-blue-100 text-blue-600',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
    info: 'bg-cyan-100 text-cyan-600',
  };

  // Trend configurations
  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  };

  const currentSize = sizeConfig[size];
  const trendKey = trend ? (trend.isPositive ? 'up' : 'down') : null;
  const TrendIcon = trendKey && trendConfig[trendKey] ? trendConfig[trendKey].icon : null;

  if (loading) {
    return (
      <div
        className={cn(
          'animate-pulse',
          radius('xl'),
          variantConfig[variant],
          currentSize.padding,
          className
        )}
      >
        <div className='h-4 bg-gray-200 rounded w-1/3 mb-4'></div>
        <div className='h-8 bg-gray-200 rounded w-2/3 mb-2'></div>
        <div className='h-3 bg-gray-200 rounded w-1/2'></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Base
        'transition-all duration-200',
        radius('xl'),

        // Size
        currentSize.padding,

        // Variant
        variantConfig[variant],

        // Interactive
        onClick && 'cursor-pointer hover:scale-[1.02]',

        // Custom
        className
      )}
      onClick={onClick}
    >
      <div className={cn('flex items-start justify-between', currentSize.gap)}>
        {/* Left: Content */}
        <div className='flex-1 min-w-0'>
          {/* Title */}
          <p
            className={cn(
              currentSize.titleSize,
              'text-gray-600 font-medium mb-2'
            )}
          >
            {displayTitle}
          </p>

          {/* Value */}
          <p
            className={cn(
              currentSize.valueSize,
              'font-bold text-gray-900 mb-2'
            )}
          >
            {value}
          </p>

          {/* Trend */}
          {trend && TrendIcon && trendKey && (
            <div className='flex items-center gap-1.5'>
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  'px-2 py-0.5',
                  'rounded-full',
                  'text-xs font-medium',
                  trendConfig[trendKey].color,
                  trendConfig[trendKey].bg
                )}
              >
                <TrendIcon className='w-3 h-3' />
                {trendValue}
              </span>
              {trendLabel && (
                <span className='text-xs text-gray-500'>{trendLabel}</span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className='text-xs text-gray-500 mt-2'>{description}</p>
          )}
        </div>

        {/* Right: Icon */}
        {Icon && (
          <div
            className={cn(
              'flex-shrink-0',
              'rounded-lg',
              currentSize.icon,
              iconColorConfig[iconColor]
            )}
          >
            {typeof Icon === 'string' ? (
              <i className={`${Icon} w-full h-full`}></i>
            ) : (
              <Icon className='w-full h-full' />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
