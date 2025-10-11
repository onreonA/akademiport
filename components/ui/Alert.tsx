'use client';

import React from 'react';
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  type LucideIcon,
} from 'lucide-react';

import { cn, radius } from '@/lib/design-tokens';

export interface AlertProps {
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  variant?: 'default' | 'subtle' | 'left-accent';
  icon?: LucideIcon | false;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Alert Component - Simple inline alerts
 *
 * @example
 * <Alert type="success">
 *   İşlem başarıyla tamamlandı!
 * </Alert>
 *
 * <Alert type="warning" dismissible onDismiss={handleDismiss}>
 *   Dikkat: Profilinizi güncellemeyi unutmayın.
 * </Alert>
 */
export default function Alert({
  children,
  type = 'info',
  variant = 'default',
  icon,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  // Type configurations
  const typeConfig = {
    info: {
      icon: Info,
      default: 'bg-blue-50 text-blue-900 border-blue-200',
      subtle: 'bg-blue-50/50 text-blue-800 border-blue-100',
      leftAccent:
        'bg-blue-50 text-blue-900 border-l-4 border-l-blue-500 border border-blue-200',
      iconColor: 'text-blue-500',
    },
    success: {
      icon: CheckCircle,
      default: 'bg-green-50 text-green-900 border-green-200',
      subtle: 'bg-green-50/50 text-green-800 border-green-100',
      leftAccent:
        'bg-green-50 text-green-900 border-l-4 border-l-green-500 border border-green-200',
      iconColor: 'text-green-500',
    },
    warning: {
      icon: AlertTriangle,
      default: 'bg-yellow-50 text-yellow-900 border-yellow-200',
      subtle: 'bg-yellow-50/50 text-yellow-800 border-yellow-100',
      leftAccent:
        'bg-yellow-50 text-yellow-900 border-l-4 border-l-yellow-500 border border-yellow-200',
      iconColor: 'text-yellow-500',
    },
    error: {
      icon: AlertCircle,
      default: 'bg-red-50 text-red-900 border-red-200',
      subtle: 'bg-red-50/50 text-red-800 border-red-100',
      leftAccent:
        'bg-red-50 text-red-900 border-l-4 border-l-red-500 border border-red-200',
      iconColor: 'text-red-500',
    },
  };

  const config = typeConfig[type];
  const IconComponent = icon === false ? null : icon || config.icon;

  // Variant style mapping
  const variantStyle = {
    default: config.default,
    subtle: config.subtle,
    'left-accent': config.leftAccent,
  };

  return (
    <div
      role='alert'
      className={cn(
        // Base
        'flex items-start gap-3',
        'p-4',
        radius('lg'),
        'border',

        // Variant
        variantStyle[variant],

        // Custom
        className
      )}
    >
      {/* Icon */}
      {IconComponent && (
        <div className='flex-shrink-0 mt-0.5'>
          <IconComponent className={cn('w-5 h-5', config.iconColor)} />
        </div>
      )}

      {/* Content */}
      <div className='flex-1 text-sm'>{children}</div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0',
            'p-1',
            'rounded',
            'transition-colors',
            config.iconColor,
            'hover:bg-black/5'
          )}
          aria-label='Dismiss alert'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  );
}
