'use client';

import React, { forwardRef } from 'react';
import { AlertCircle, Check, ChevronDown, type LucideIcon } from 'lucide-react';

import {
  cn,
  tokens,
  spacing,
  typography,
  color,
  radius,
} from '@/lib/design-tokens';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: LucideIcon;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  // Label & Description
  label?: string;
  description?: string;

  // Options
  options: SelectOption[] | string[];
  placeholder?: string;

  // Validation
  error?: string;
  success?: string;

  // Icons
  leftIcon?: LucideIcon;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Variants
  variant?: 'default' | 'filled' | 'outlined';

  // Additional
  helperText?: string;
  containerClassName?: string;
}

/**
 * Select Component with Design Tokens
 *
 * @example
 * // Basic
 * <Select
 *   label="Kategori"
 *   options={['Option 1', 'Option 2']}
 * />
 *
 * @example
 * // With objects
 * <Select
 *   label="Şehir"
 *   options={[
 *     { value: 'ist', label: 'İstanbul' },
 *     { value: 'ank', label: 'Ankara' }
 *   ]}
 * />
 *
 * @example
 * // With validation
 * <Select
 *   label="Durum"
 *   options={statuses}
 *   error={errors.status}
 * />
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      description,
      options,
      placeholder = 'Seçiniz...',
      error,
      success,
      leftIcon: LeftIcon,
      size = 'md',
      variant = 'default',
      helperText,
      containerClassName,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Normalize options to SelectOption[]
    const normalizedOptions: SelectOption[] = options.map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });

    // Size configurations
    const sizeConfig = {
      sm: {
        select: 'h-9 px-3 text-sm',
        icon: 'w-4 h-4',
        label: typography('bodySmall'),
      },
      md: {
        select: 'h-10 px-4 text-base',
        icon: 'w-5 h-5',
        label: typography('body'),
      },
      lg: {
        select: 'h-12 px-5 text-lg',
        icon: 'w-6 h-6',
        label: typography('bodyLarge'),
      },
    };

    // Variant configurations
    const variantConfig = {
      default: cn(
        'bg-white border border-gray-300',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
      ),
      filled: cn(
        'bg-gray-50 border border-transparent',
        'focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
      ),
      outlined: cn(
        'bg-transparent border-2 border-gray-300',
        'focus:border-blue-500'
      ),
    };

    // State classes
    const stateClasses = cn(
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      success &&
        'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
    );

    const currentSize = sizeConfig[size];

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              currentSize.label,
              'block font-medium text-gray-700 mb-1.5'
            )}
          >
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

        {/* Description */}
        {description && (
          <p className={cn(typography('bodySmall'), 'text-gray-500 mb-2')}>
            {description}
          </p>
        )}

        {/* Select Container */}
        <div className='relative'>
          {/* Left Icon */}
          {LeftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10'>
              <LeftIcon className={currentSize.icon} />
            </div>
          )}

          {/* Select */}
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full',
              radius('lg'),
              'transition-all duration-200',
              'outline-none',
              'appearance-none',
              'cursor-pointer',

              // Size
              currentSize.select,

              // Variant
              variantConfig[variant],

              // States
              stateClasses,

              // Icon padding
              LeftIcon && 'pl-10',
              'pr-10', // Always add right padding for chevron

              // Disabled state
              disabled && 'cursor-not-allowed',

              // Custom className
              className
            )}
            {...props}
          >
            {/* Placeholder */}
            <option value='' disabled>
              {placeholder}
            </option>

            {/* Options */}
            {normalizedOptions.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
            <ChevronDown className={currentSize.icon} />
          </div>
        </div>

        {/* Helper Text / Error / Success */}
        <div className='mt-1.5'>
          {/* Error Message */}
          {error && (
            <div className='flex items-center gap-1.5 text-red-600'>
              <AlertCircle className='w-4 h-4 flex-shrink-0' />
              <p className={typography('bodySmall')}>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && !error && (
            <div className='flex items-center gap-1.5 text-green-600'>
              <Check className='w-4 h-4 flex-shrink-0' />
              <p className={typography('bodySmall')}>{success}</p>
            </div>
          )}

          {/* Helper Text */}
          {helperText && !error && !success && (
            <p className={cn(typography('bodySmall'), 'text-gray-500')}>
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
