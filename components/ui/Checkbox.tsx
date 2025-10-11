'use client';

import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';

import {
  cn,
  tokens,
  spacing,
  typography,
  color,
  radius,
} from '@/lib/design-tokens';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Label
  label?: string;
  description?: string;

  // Validation
  error?: string;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Indeterminate state
  indeterminate?: boolean;

  // Additional
  containerClassName?: string;
  labelClassName?: string;
}

/**
 * Checkbox Component with Design Tokens
 *
 * @example
 * // Basic
 * <Checkbox label="Kabul ediyorum" />
 *
 * @example
 * // With description
 * <Checkbox
 *   label="Koşulları kabul et"
 *   description="Kullanım şartlarını okudum ve kabul ediyorum"
 * />
 *
 * @example
 * // Indeterminate state
 * <Checkbox
 *   label="Tümünü seç"
 *   indeterminate={someSelected}
 *   checked={allSelected}
 * />
 *
 * @example
 * // With error
 * <Checkbox
 *   label="Gerekli alan"
 *   error="Bu alanı işaretlemelisiniz"
 * />
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      indeterminate = false,
      containerClassName,
      labelClassName,
      className,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    // Size configurations
    const sizeConfig = {
      sm: {
        box: 'w-4 h-4',
        icon: 'w-3 h-3',
        label: typography('bodySmall'),
        gap: 'gap-2',
      },
      md: {
        box: 'w-5 h-5',
        icon: 'w-4 h-4',
        label: typography('body'),
        gap: 'gap-2.5',
      },
      lg: {
        box: 'w-6 h-6',
        icon: 'w-5 h-5',
        label: typography('bodyLarge'),
        gap: 'gap-3',
      },
    };

    const currentSize = sizeConfig[size];

    return (
      <div
        className={cn('flex items-start', currentSize.gap, containerClassName)}
      >
        {/* Checkbox Container */}
        <div className='relative flex-shrink-0 mt-0.5'>
          {/* Hidden Input */}
          <input
            ref={ref}
            type='checkbox'
            disabled={disabled}
            checked={checked}
            className={cn('sr-only peer', className)}
            {...props}
          />

          {/* Custom Checkbox */}
          <div
            className={cn(
              // Base styles
              currentSize.box,
              radius('md'),
              'border-2',
              'transition-all duration-200',
              'flex items-center justify-center',

              // Default state
              'border-gray-300 bg-white',

              // Hover state
              'peer-hover:border-blue-400',

              // Focus state
              'peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:border-blue-500',

              // Checked state
              'peer-checked:bg-blue-600 peer-checked:border-blue-600',
              'peer-checked:hover:bg-blue-700',

              // Indeterminate state
              indeterminate && 'bg-blue-600 border-blue-600',

              // Disabled state
              disabled &&
                'opacity-50 cursor-not-allowed peer-hover:border-gray-300',

              // Error state
              error && 'border-red-500 peer-focus:ring-red-500/20'
            )}
          >
            {/* Check Icon */}
            {checked && !indeterminate && (
              <Check
                className={cn(currentSize.icon, 'text-white')}
                strokeWidth={3}
              />
            )}

            {/* Indeterminate Icon */}
            {indeterminate && (
              <Minus
                className={cn(currentSize.icon, 'text-white')}
                strokeWidth={3}
              />
            )}
          </div>
        </div>

        {/* Label & Description */}
        {(label || description) && (
          <div className='flex-1'>
            {label && (
              <label
                className={cn(
                  currentSize.label,
                  'block font-medium text-gray-700 cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed',
                  labelClassName
                )}
              >
                {label}
              </label>
            )}

            {description && (
              <p
                className={cn(
                  typography('bodySmall'),
                  'text-gray-500 mt-0.5',
                  disabled && 'opacity-50'
                )}
              >
                {description}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <p className={cn(typography('bodySmall'), 'text-red-600 mt-1')}>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
