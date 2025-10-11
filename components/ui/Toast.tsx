'use client';

import React, { useEffect } from 'react';
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

import { cn, radius, shadow } from '@/lib/design-tokens';

export interface ToastProps {
  // Content
  title?: string;
  message: string;

  // Type
  type?: 'info' | 'success' | 'warning' | 'error';

  // Icon
  icon?: LucideIcon;

  // Duration & Auto-dismiss
  duration?: number; // milliseconds, 0 = never auto-dismiss
  onClose?: () => void;

  // Position (for styling reference)
  position?:
    | 'top-right'
    | 'top-center'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left';

  // Additional
  className?: string;
}

/**
 * Toast Component - Notification popup
 *
 * Note: This is a presentational component.
 * For a complete toast system, use with a toast context/provider.
 *
 * @example
 * <Toast
 *   type="success"
 *   message="İşlem başarıyla tamamlandı!"
 *   duration={3000}
 *   onClose={handleClose}
 * />
 */
export default function Toast({
  title,
  message,
  type = 'info',
  icon: CustomIcon,
  duration = 5000,
  onClose,
  position = 'top-right',
  className,
}: ToastProps) {
  // Auto-dismiss
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Type configurations
  const typeConfig = {
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-800',
    },
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-900',
      messageColor: 'text-green-800',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-800',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-900',
      messageColor: 'text-red-800',
    },
  };

  const config = typeConfig[type];
  const Icon = CustomIcon || config.icon;

  return (
    <div
      role='alert'
      className={cn(
        // Base
        'flex items-start gap-3',
        'p-4 pr-2',
        'w-full max-w-sm',
        radius('lg'),
        shadow('lg'),
        'border',

        // Animation
        'animate-fade-in',

        // Type
        config.bg,
        config.border,

        // Custom
        className
      )}
    >
      {/* Icon */}
      <div className='flex-shrink-0 mt-0.5'>
        <Icon className={cn('w-5 h-5', config.iconColor)} />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        {/* Title */}
        {title && (
          <p className={cn('text-sm font-semibold mb-1', config.titleColor)}>
            {title}
          </p>
        )}

        {/* Message */}
        <p className={cn('text-sm', config.messageColor)}>{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={cn(
          'flex-shrink-0',
          'p-1',
          'rounded',
          'transition-colors',
          config.iconColor,
          'hover:bg-black/5'
        )}
        aria-label='Close notification'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
}

/**
 * ToastContainer - Container for positioning toasts
 *
 * @example
 * <ToastContainer position="top-right">
 *   {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
 * </ToastContainer>
 */
export function ToastContainer({
  children,
  position = 'top-right',
  className,
}: {
  children: React.ReactNode;
  position?: ToastProps['position'];
  className?: string;
}) {
  // Position configurations
  const positionConfig = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div
      className={cn(
        'fixed z-50',
        'flex flex-col gap-2',
        'pointer-events-none',
        positionConfig[position],
        className
      )}
    >
      <div className='pointer-events-auto'>{children}</div>
    </div>
  );
}
