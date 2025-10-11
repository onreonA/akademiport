'use client';

import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, type LucideIcon } from 'lucide-react';

import { cn, radius, shadow } from '@/lib/design-tokens';

export interface InfoCardProps {
  // Content
  title?: string;
  children: React.ReactNode;

  // Type
  type?: 'info' | 'success' | 'warning' | 'error';

  // Icon
  icon?: LucideIcon;
  showIcon?: boolean;

  // Dismissible
  dismissible?: boolean;
  onDismiss?: () => void;

  // Action
  action?: {
    label: string;
    onClick: () => void;
  };

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Variant
  variant?: 'solid' | 'soft' | 'outline' | 'bordered-left';

  // Additional
  className?: string;
}

/**
 * InfoCard Component - For alerts, messages, and notifications
 *
 * @example
 * <InfoCard type="success">
 *   İşlem başarıyla tamamlandı!
 * </InfoCard>
 *
 * <InfoCard
 *   type="warning"
 *   title="Dikkat"
 *   dismissible
 * >
 *   Lütfen profilinizi güncelleyin.
 * </InfoCard>
 */
export default function InfoCard({
  title,
  children,
  type = 'info',
  icon: CustomIcon,
  showIcon = true,
  dismissible = false,
  onDismiss,
  action,
  size = 'md',
  variant = 'soft',
  className,
}: InfoCardProps) {
  // Type configurations
  const typeConfig = {
    info: {
      icon: Info,
      solid: 'bg-blue-600 text-white',
      soft: 'bg-blue-50 text-blue-900 border-blue-200',
      outline: 'bg-white text-blue-900 border-blue-400',
      borderedLeft: 'bg-blue-50 text-blue-900 border-l-4 border-l-blue-500 border border-blue-200',
      iconColor: 'text-blue-600',
      buttonColor: 'text-blue-700 hover:bg-blue-200',
    },
    success: {
      icon: CheckCircle,
      solid: 'bg-green-600 text-white',
      soft: 'bg-green-50 text-green-900 border-green-200',
      outline: 'bg-white text-green-900 border-green-400',
      borderedLeft: 'bg-green-50 text-green-900 border-l-4 border-l-green-500 border border-green-200',
      iconColor: 'text-green-600',
      buttonColor: 'text-green-700 hover:bg-green-200',
    },
    warning: {
      icon: AlertTriangle,
      solid: 'bg-yellow-600 text-white',
      soft: 'bg-yellow-50 text-yellow-900 border-yellow-200',
      outline: 'bg-white text-yellow-900 border-yellow-400',
      borderedLeft: 'bg-yellow-50 text-yellow-900 border-l-4 border-l-yellow-500 border border-yellow-200',
      iconColor: 'text-yellow-600',
      buttonColor: 'text-yellow-700 hover:bg-yellow-200',
    },
    error: {
      icon: AlertCircle,
      solid: 'bg-red-600 text-white',
      soft: 'bg-red-50 text-red-900 border-red-200',
      outline: 'bg-white text-red-900 border-red-400',
      borderedLeft: 'bg-red-50 text-red-900 border-l-4 border-l-red-500 border border-red-200',
      iconColor: 'text-red-600',
      buttonColor: 'text-red-700 hover:bg-red-200',
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-3',
      iconSize: 'w-4 h-4',
      titleSize: 'text-sm',
      contentSize: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      padding: 'p-4',
      iconSize: 'w-5 h-5',
      titleSize: 'text-base',
      contentSize: 'text-sm',
      gap: 'gap-3',
    },
    lg: {
      padding: 'p-6',
      iconSize: 'w-6 h-6',
      titleSize: 'text-lg',
      contentSize: 'text-base',
      gap: 'gap-4',
    },
  };

  const config = typeConfig[type];
  const Icon = CustomIcon || config.icon;
  const currentSize = sizeConfig[size];

  // Variant style mapping
  const variantStyle = {
    solid: config.solid,
    soft: config.soft,
    outline: config.outline,
    'bordered-left': config.borderedLeft,
  };

  return (
    <div
      className={cn(
        // Base
        'relative',
        radius('lg'),
        shadow('sm'),
        
        // Size
        currentSize.padding,
        
        // Variant
        variantStyle[variant],
        variant === 'outline' && 'border-2',
        (variant === 'soft' || variant === 'bordered-left') && 'border',
        
        // Custom
        className
      )}
    >
      <div className={cn('flex items-start', currentSize.gap)}>
        {/* Icon */}
        {showIcon && Icon && (
          <div className='flex-shrink-0 mt-0.5'>
            <Icon
              className={cn(
                currentSize.iconSize,
                variant === 'solid' ? 'text-white' : config.iconColor
              )}
            />
          </div>
        )}

        {/* Content */}
        <div className='flex-1 min-w-0'>
          {/* Title */}
          {title && (
            <h3
              className={cn(
                currentSize.titleSize,
                'font-semibold mb-1',
                variant === 'solid' ? 'text-white' : 'text-inherit'
              )}
            >
              {title}
            </h3>
          )}

          {/* Message */}
          <div
            className={cn(
              currentSize.contentSize,
              variant === 'solid' ? 'text-white/90' : 'text-inherit'
            )}
          >
            {children}
          </div>

          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-3',
                'text-sm font-medium',
                'underline',
                'transition-colors',
                variant === 'solid' ? 'text-white hover:text-white/80' : config.buttonColor
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0',
              'p-1',
              'rounded',
              'transition-colors',
              variant === 'solid'
                ? 'text-white/80 hover:text-white hover:bg-white/20'
                : `${config.iconColor} hover:bg-black/5`
            )}
            aria-label='Dismiss'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
    </div>
  );
}

