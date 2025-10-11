'use client';

import React from 'react';
import { X, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/design-tokens';

export interface TagProps {
  children: React.ReactNode;

  // Variant
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink' | 'orange';

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Icon
  icon?: LucideIcon;

  // Removable
  removable?: boolean;
  onRemove?: () => void;

  // Interactive
  onClick?: () => void;
  selected?: boolean;

  // Additional
  className?: string;
}

/**
 * Tag Component - More interactive than Badge
 *
 * @example
 * <Tag variant="primary">React</Tag>
 * <Tag variant="success" icon={Check}>Completed</Tag>
 * <Tag variant="error" removable onRemove={handleRemove}>JavaScript</Tag>
 * <Tag selected onClick={handleClick}>Selected Tag</Tag>
 */
export default function Tag({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  removable = false,
  onRemove,
  onClick,
  selected = false,
  className,
}: TagProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };

  // Variant configurations (more colorful than Badge)
  const variantStyles = {
    default: {
      base: 'bg-gray-100 text-gray-700 border border-gray-300',
      hover: 'hover:bg-gray-200 hover:border-gray-400',
      selected: 'bg-gray-700 text-white border-gray-700',
    },
    primary: {
      base: 'bg-blue-100 text-blue-700 border border-blue-300',
      hover: 'hover:bg-blue-200 hover:border-blue-400',
      selected: 'bg-blue-600 text-white border-blue-600',
    },
    secondary: {
      base: 'bg-gray-100 text-gray-700 border border-gray-300',
      hover: 'hover:bg-gray-200 hover:border-gray-400',
      selected: 'bg-gray-700 text-white border-gray-700',
    },
    success: {
      base: 'bg-green-100 text-green-700 border border-green-300',
      hover: 'hover:bg-green-200 hover:border-green-400',
      selected: 'bg-green-600 text-white border-green-600',
    },
    warning: {
      base: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      hover: 'hover:bg-yellow-200 hover:border-yellow-400',
      selected: 'bg-yellow-600 text-white border-yellow-600',
    },
    error: {
      base: 'bg-red-100 text-red-700 border border-red-300',
      hover: 'hover:bg-red-200 hover:border-red-400',
      selected: 'bg-red-600 text-white border-red-600',
    },
    info: {
      base: 'bg-cyan-100 text-cyan-700 border border-cyan-300',
      hover: 'hover:bg-cyan-200 hover:border-cyan-400',
      selected: 'bg-cyan-600 text-white border-cyan-600',
    },
    purple: {
      base: 'bg-purple-100 text-purple-700 border border-purple-300',
      hover: 'hover:bg-purple-200 hover:border-purple-400',
      selected: 'bg-purple-600 text-white border-purple-600',
    },
    pink: {
      base: 'bg-pink-100 text-pink-700 border border-pink-300',
      hover: 'hover:bg-pink-200 hover:border-pink-400',
      selected: 'bg-pink-600 text-white border-pink-600',
    },
    orange: {
      base: 'bg-orange-100 text-orange-700 border border-orange-300',
      hover: 'hover:bg-orange-200 hover:border-orange-400',
      selected: 'bg-orange-600 text-white border-orange-600',
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantStyles[variant];

  const isInteractive = !!(onClick || removable);

  return (
    <span
      className={cn(
        // Base
        'inline-flex items-center',
        'font-medium',
        'rounded-md',
        'transition-all duration-200',

        // Size
        currentSize.padding,
        currentSize.text,
        currentSize.gap,

        // Variant
        selected ? currentVariant.selected : currentVariant.base,

        // Interactive
        isInteractive && 'cursor-pointer',
        isInteractive && !selected && currentVariant.hover,
        isInteractive && 'hover:shadow-sm',

        // Custom
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      {Icon && <Icon className={cn(currentSize.icon, 'flex-shrink-0')} />}

      {/* Content */}
      <span className='truncate'>{children}</span>

      {/* Remove Button */}
      {removable && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={cn(
            'flex-shrink-0',
            'rounded',
            'transition-colors',
            selected ? 'hover:bg-white/20' : 'hover:bg-black/10',
            size === 'sm' && 'p-0.5',
            size === 'md' && 'p-0.5',
            size === 'lg' && 'p-1'
          )}
          aria-label='Remove tag'
        >
          <X className={currentSize.icon} />
        </button>
      )}
    </span>
  );
}

