'use client';

import React from 'react';
import { type LucideIcon } from 'lucide-react';

import { cn, radius, shadow } from '@/lib/design-tokens';

export interface MetricCardProps {
  // Content
  title: string;
  value: string | number;
  subtitle?: string;

  // Icon
  icon?: LucideIcon;
  iconColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';

  // Progress
  progress?: number; // 0-100
  progressColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';

  // Footer items
  footerItems?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Variant
  variant?: 'default' | 'gradient' | 'glass';

  // Interactive
  onClick?: () => void;

  // Additional
  className?: string;
}

/**
 * MetricCard Component - Advanced metrics with progress bars
 *
 * @example
 * <MetricCard
 *   title="Proje İlerlemesi"
 *   value="73%"
 *   progress={73}
 *   icon={Activity}
 *   footerItems={[
 *     { label: 'Tamamlanan', value: 12, color: 'text-green-600' },
 *     { label: 'Kalan', value: 5, color: 'text-gray-600' }
 *   ]}
 * />
 */
export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'primary',
  progress,
  progressColor = 'primary',
  footerItems,
  size = 'md',
  variant = 'default',
  onClick,
  className,
}: MetricCardProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      titleSize: 'text-xs',
      valueSize: 'text-xl',
      subtitleSize: 'text-xs',
      icon: 'w-8 h-8 p-2',
      footerText: 'text-xs',
    },
    md: {
      padding: 'p-6',
      titleSize: 'text-sm',
      valueSize: 'text-3xl',
      subtitleSize: 'text-sm',
      icon: 'w-10 h-10 p-2.5',
      footerText: 'text-sm',
    },
    lg: {
      padding: 'p-8',
      titleSize: 'text-base',
      valueSize: 'text-4xl',
      subtitleSize: 'text-base',
      icon: 'w-12 h-12 p-3',
      footerText: 'text-base',
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
      'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30',
      'border border-blue-100',
      shadow('md'),
      'hover:shadow-lg'
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

  // Progress color configurations
  const progressColorConfig = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-cyan-600',
  };

  const currentSize = sizeConfig[size];

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
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1 min-w-0'>
          {/* Title */}
          <p
            className={cn(
              currentSize.titleSize,
              'text-gray-600 font-medium mb-2'
            )}
          >
            {title}
          </p>

          {/* Value */}
          <p className={cn(currentSize.valueSize, 'font-bold text-gray-900')}>
            {value}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className={cn(currentSize.subtitleSize, 'text-gray-500 mt-1')}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'flex-shrink-0',
              'rounded-lg',
              currentSize.icon,
              iconColorConfig[iconColor]
            )}
          >
            <Icon className='w-full h-full' />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs text-gray-600 font-medium'>İlerleme</span>
            <span className='text-xs text-gray-900 font-semibold'>
              {progress}%
            </span>
          </div>
          <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out rounded-full',
                progressColorConfig[progressColor]
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Items */}
      {footerItems && footerItems.length > 0 && (
        <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
          {footerItems.map((item, index) => (
            <div key={index} className='flex flex-col'>
              <span className='text-xs text-gray-500 mb-1'>{item.label}</span>
              <span
                className={cn(
                  currentSize.footerText,
                  'font-semibold',
                  item.color || 'text-gray-900'
                )}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
