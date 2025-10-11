'use client';

import React from 'react';

import { cn } from '@/lib/design-tokens';

export type StatusType =
  | 'online'
  | 'offline'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'in-progress'
  | 'cancelled'
  | 'draft'
  | 'published';

export interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  showText?: boolean;
  pulse?: boolean;
  className?: string;
}

/**
 * StatusBadge Component - Specialized for status indicators
 *
 * @example
 * <StatusBadge status="online" />
 * <StatusBadge status="active" showText />
 * <StatusBadge status="in-progress" pulse />
 * <StatusBadge status="pending" size="lg" showDot showText />
 */
export default function StatusBadge({
  status,
  size = 'md',
  showDot = true,
  showText = true,
  pulse = false,
  className,
}: StatusBadgeProps) {
  // Status configurations
  const statusConfig: Record<
    StatusType,
    {
      label: string;
      dotColor: string;
      textColor: string;
      bgColor: string;
    }
  > = {
    online: {
      label: 'Çevrimiçi',
      dotColor: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    offline: {
      label: 'Çevrimdışı',
      dotColor: 'bg-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
    },
    active: {
      label: 'Aktif',
      dotColor: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    inactive: {
      label: 'İnaktif',
      dotColor: 'bg-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
    },
    pending: {
      label: 'Beklemede',
      dotColor: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
    },
    approved: {
      label: 'Onaylandı',
      dotColor: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    rejected: {
      label: 'Reddedildi',
      dotColor: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
    },
    completed: {
      label: 'Tamamlandı',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    'in-progress': {
      label: 'Devam Ediyor',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    cancelled: {
      label: 'İptal Edildi',
      dotColor: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
    },
    draft: {
      label: 'Taslak',
      dotColor: 'bg-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
    },
    published: {
      label: 'Yayınlandı',
      dotColor: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      dot: 'w-1.5 h-1.5',
      padding: showText ? 'px-2 py-0.5' : 'p-1',
      text: 'text-xs',
      gap: 'gap-1',
    },
    md: {
      dot: 'w-2 h-2',
      padding: showText ? 'px-2.5 py-1' : 'p-1.5',
      text: 'text-sm',
      gap: 'gap-1.5',
    },
    lg: {
      dot: 'w-2.5 h-2.5',
      padding: showText ? 'px-3 py-1.5' : 'p-2',
      text: 'text-base',
      gap: 'gap-2',
    },
  };

  const config = statusConfig[status];
  const currentSize = sizeConfig[size];

  // If only dot is shown
  if (showDot && !showText) {
    return (
      <span className={cn('relative inline-flex', className)}>
        <span
          className={cn('rounded-full', currentSize.dot, config.dotColor)}
        />
        {pulse && (
          <span
            className={cn(
              'absolute inset-0',
              'rounded-full',
              config.dotColor,
              'animate-ping opacity-75'
            )}
          />
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        // Base
        'inline-flex items-center',
        'font-medium',
        'rounded-full',
        'transition-all duration-200',

        // Size
        currentSize.padding,
        currentSize.text,
        currentSize.gap,

        // Colors
        showText && config.bgColor,
        showText && config.textColor,

        // Custom
        className
      )}
    >
      {/* Dot */}
      {showDot && (
        <span className='relative inline-flex'>
          <span
            className={cn('rounded-full', currentSize.dot, config.dotColor)}
          />
          {pulse && (
            <span
              className={cn(
                'absolute inset-0',
                'rounded-full',
                config.dotColor,
                'animate-ping opacity-75'
              )}
            />
          )}
        </span>
      )}

      {/* Text */}
      {showText && <span className='truncate'>{config.label}</span>}
    </span>
  );
}
