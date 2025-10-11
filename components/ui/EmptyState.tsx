'use client';

import React from 'react';
import { type LucideIcon } from 'lucide-react';

import Button from '@/components/ui/Button';
import {
  cn,
  tokens,
  spacing,
  typography,
  color,
  radius,
} from '@/lib/design-tokens';
import {
  emptyStateConfigs,
  type EmptyStateType,
  type ColorTheme,
} from '@/lib/empty-state-configs';

export interface EmptyStateProps {
  // Preset type veya custom
  type?: EmptyStateType | 'custom';

  // Custom overrides
  title?: string;
  description?: string;
  icon?: LucideIcon;

  // Styling
  color?: ColorTheme;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'base' | 'elevated' | 'flat' | 'glass';

  // Action
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  };

  // Help text
  helpText?: string[];

  // Animation
  animated?: boolean;

  // Additional
  className?: string;
}

/**
 * EmptyState Component with Design Tokens
 *
 * @example
 * // Preset kullanımı
 * <EmptyState type="no-projects" />
 *
 * @example
 * // Custom kullanımı
 * <EmptyState
 *   type="no-results"
 *   title="Özel başlık"
 *   action={{
 *     label: "Yeni Ekle",
 *     onClick: handleAdd
 *   }}
 * />
 */
export default function EmptyState({
  type = 'no-data',
  title,
  description,
  icon: CustomIcon,
  color: customColor,
  size = 'md',
  variant = 'flat',
  action,
  helpText,
  animated = true,
  className = '',
}: EmptyStateProps) {
  // Get config from preset
  const config = type !== 'custom' ? emptyStateConfigs[type] : null;

  // Merge with custom props
  const Icon = CustomIcon || config?.icon;
  const finalTitle = title || config?.title || 'Veri Bulunamadı';
  const finalDescription =
    description || config?.description || 'Gösterilecek veri bulunmamaktadır.';
  const finalColor = customColor || config?.color || 'secondary';
  const finalHelpText = helpText || config?.helpText;
  const finalAction =
    action ||
    (config?.showAction && config?.defaultActionText
      ? {
          label: config.defaultActionText,
          onClick: () => {},
          variant: 'primary' as const,
        }
      : undefined);

  // Size config
  const sizeConfig = {
    sm: {
      iconSize: 'w-12 h-12',
      iconInnerSize: 'w-6 h-6',
      padding: spacing(6, 'p'),
      titleClass: typography('heading4'),
      descClass: 'text-sm',
    },
    md: {
      iconSize: 'w-16 h-16',
      iconInnerSize: 'w-8 h-8',
      padding: spacing(8, 'p'),
      titleClass: typography('heading3'),
      descClass: 'text-base',
    },
    lg: {
      iconSize: 'w-20 h-20',
      iconInnerSize: 'w-10 h-10',
      padding: spacing(12, 'p'),
      titleClass: typography('heading2'),
      descClass: 'text-lg',
    },
  };

  // Color config
  const colorConfig = {
    primary: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    secondary: {
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    error: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    info: {
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  };

  const currentSize = sizeConfig[size];
  const currentColor = colorConfig[finalColor];

  // Variant config
  const variantClasses = {
    base: cn(currentColor.bgColor, 'border-2', currentColor.borderColor),
    elevated: cn(
      tokens.card.elevated,
      currentColor.bgColor,
      'border',
      currentColor.borderColor
    ),
    flat: cn(currentColor.bgColor, 'border', currentColor.borderColor),
    glass: cn('bg-white/60 backdrop-blur-sm border', currentColor.borderColor),
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        radius('xl'),
        currentSize.padding,
        'text-center',
        animated && 'animate-fade-in',
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <div className='flex justify-center mb-6'>
          <div
            className={cn(
              currentSize.iconSize,
              currentColor.iconBg,
              'rounded-full flex items-center justify-center',
              animated && 'animate-scale-in'
            )}
          >
            <Icon
              className={cn(currentSize.iconInnerSize, currentColor.iconColor)}
            />
          </div>
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          currentSize.titleClass,
          'text-gray-800 mb-3 font-semibold'
        )}
      >
        {finalTitle}
      </h3>

      {/* Description */}
      <p
        className={cn(
          currentSize.descClass,
          'text-gray-600 mb-6 max-w-md mx-auto'
        )}
      >
        {finalDescription}
      </p>

      {/* Action Button */}
      {finalAction && finalAction.onClick && (
        <div className='mb-6'>
          <Button
            variant={finalAction.variant || 'primary'}
            onClick={finalAction.onClick}
            size={size}
          >
            {finalAction.label}
          </Button>
        </div>
      )}

      {/* Help Text */}
      {finalHelpText && finalHelpText.length > 0 && (
        <div className='mt-6 p-4 bg-white bg-opacity-50 rounded-lg'>
          <h4 className='text-sm font-medium text-gray-700 mb-2'>
            Ne yapabilirsiniz?
          </h4>
          <ul className='text-xs text-gray-600 space-y-1 text-left max-w-sm mx-auto'>
            {finalHelpText.map((text, index) => (
              <li key={index}>• {text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * CompactEmptyState Component
 * Compact version for smaller spaces
 */
export function CompactEmptyState({
  message,
  icon: Icon,
  className = '',
}: {
  message: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        spacing(8, 'p', 'y'),
        'text-gray-500',
        className
      )}
    >
      <div className='text-center'>
        {Icon && <Icon className={cn('w-8 h-8 mx-auto mb-2 text-gray-300')} />}
        <p className={typography('bodySmall')}>{message}</p>
      </div>
    </div>
  );
}

/**
 * LoadingEmptyState Component
 * Loading state with spinner
 */
export function LoadingEmptyState({
  message = 'Yükleniyor...',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        spacing(8, 'p', 'y'),
        className
      )}
    >
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
        <p className={cn(typography('bodySmall'), 'text-gray-500')}>
          {message}
        </p>
      </div>
    </div>
  );
}
