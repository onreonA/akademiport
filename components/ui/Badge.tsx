'use client';

import React from 'react';
import { X, type LucideIcon } from 'lucide-react';

import { cn, tokens, spacing, typography, radius } from '@/lib/design-tokens';

export interface BadgeProps {
  children: React.ReactNode;

  // Variant
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';

  // Size
  size?: 'xs' | 'sm' | 'md' | 'lg';

  // Style
  style?: 'solid' | 'soft' | 'outline' | 'ghost';

  // Icon
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';

  // Removable
  removable?: boolean;
  onRemove?: () => void;

  // Dot indicator
  dot?: boolean;

  // Additional
  className?: string;
  onClick?: () => void;
}

/**
 * Badge Component with Design Tokens
 *
 * @example
 * <Badge variant="success">Aktif</Badge>
 * <Badge variant="primary" icon={User}>Admin</Badge>
 * <Badge variant="warning" dot>Beklemede</Badge>
 * <Badge variant="error" removable onRemove={handleRemove}>Tag</Badge>
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  style = 'soft',
  icon: Icon,
  iconPosition = 'left',
  removable = false,
  onRemove,
  dot = false,
  className,
  onClick,
}: BadgeProps) {
  // Size configurations
  const sizeConfig = {
    xs: {
      padding: 'px-1.5 py-0.5',
      text: 'text-xs',
      icon: 'w-3 h-3',
      dot: 'w-1.5 h-1.5',
      gap: 'gap-1',
    },
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      icon: 'w-3.5 h-3.5',
      dot: 'w-2 h-2',
      gap: 'gap-1',
    },
    md: {
      padding: 'px-2.5 py-1',
      text: 'text-sm',
      icon: 'w-4 h-4',
      dot: 'w-2 h-2',
      gap: 'gap-1.5',
    },
    lg: {
      padding: 'px-3 py-1.5',
      text: 'text-base',
      icon: 'w-5 h-5',
      dot: 'w-2.5 h-2.5',
      gap: 'gap-2',
    },
  };

  // Variant + Style configurations
  const variantStyles = {
    default: {
      solid: 'bg-gray-600 text-white',
      soft: 'bg-gray-100 text-gray-800 border border-gray-200',
      outline: 'bg-transparent text-gray-700 border border-gray-300',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-50',
    },
    primary: {
      solid: 'bg-blue-600 text-white',
      soft: 'bg-blue-50 text-blue-700 border border-blue-200',
      outline: 'bg-transparent text-blue-600 border border-blue-400',
      ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
    },
    secondary: {
      solid: 'bg-gray-700 text-white',
      soft: 'bg-gray-100 text-gray-700 border border-gray-200',
      outline: 'bg-transparent text-gray-700 border border-gray-400',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    },
    success: {
      solid: 'bg-green-600 text-white',
      soft: 'bg-green-50 text-green-700 border border-green-200',
      outline: 'bg-transparent text-green-600 border border-green-400',
      ghost: 'bg-transparent text-green-600 hover:bg-green-50',
    },
    warning: {
      solid: 'bg-yellow-500 text-white',
      soft: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      outline: 'bg-transparent text-yellow-600 border border-yellow-400',
      ghost: 'bg-transparent text-yellow-600 hover:bg-yellow-50',
    },
    error: {
      solid: 'bg-red-600 text-white',
      soft: 'bg-red-50 text-red-700 border border-red-200',
      outline: 'bg-transparent text-red-600 border border-red-400',
      ghost: 'bg-transparent text-red-600 hover:bg-red-50',
    },
    info: {
      solid: 'bg-cyan-600 text-white',
      soft: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
      outline: 'bg-transparent text-cyan-600 border border-cyan-400',
      ghost: 'bg-transparent text-cyan-600 hover:bg-cyan-50',
    },
  };

  const currentSize = sizeConfig[size];
  const currentStyle = variantStyles[variant][style];

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

        // Variant + Style
        currentStyle,

        // Interactive
        onClick && 'cursor-pointer hover:scale-105',

        // Custom
        className
      )}
      onClick={onClick}
    >
      {/* Dot Indicator */}
      {dot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            currentSize.dot,
            variant === 'default' && 'bg-gray-400',
            variant === 'primary' && 'bg-blue-500',
            variant === 'secondary' && 'bg-gray-500',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'error' && 'bg-red-500',
            variant === 'info' && 'bg-cyan-500'
          )}
        />
      )}

      {/* Left Icon */}
      {Icon && iconPosition === 'left' && (
        <Icon className={cn(currentSize.icon, 'flex-shrink-0')} />
      )}

      {/* Content */}
      <span className='truncate'>{children}</span>

      {/* Right Icon */}
      {Icon && iconPosition === 'right' && (
        <Icon className={cn(currentSize.icon, 'flex-shrink-0')} />
      )}

      {/* Remove Button */}
      {removable && (
        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={cn(
            'flex-shrink-0',
            'rounded-full',
            'transition-colors',
            'hover:bg-black/10',
            size === 'xs' && 'p-0.5',
            size === 'sm' && 'p-0.5',
            size === 'md' && 'p-1',
            size === 'lg' && 'p-1'
          )}
          aria-label='Remove'
        >
          <X className={currentSize.icon} />
        </button>
      )}
    </span>
  );
}
