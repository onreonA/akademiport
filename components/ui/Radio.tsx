'use client';

import React, { forwardRef } from 'react';

import {
  cn,
  tokens,
  spacing,
  typography,
  color,
  radius,
} from '@/lib/design-tokens';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Label
  label?: string;
  description?: string;

  // Validation
  error?: string;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Additional
  containerClassName?: string;
  labelClassName?: string;
}

/**
 * Radio Component with Design Tokens
 *
 * @example
 * // Single Radio
 * <Radio label="Seçenek 1" name="option" value="1" />
 *
 * @example
 * // Radio Group (use RadioGroup component instead)
 * <Radio label="Option A" name="choice" value="a" />
 * <Radio label="Option B" name="choice" value="b" />
 *
 * @example
 * // With description
 * <Radio
 *   label="Premium Plan"
 *   description="$29/month - All features"
 * />
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      containerClassName,
      labelClassName,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Size configurations
    const sizeConfig = {
      sm: {
        circle: 'w-4 h-4',
        dot: 'w-2 h-2',
        label: typography('bodySmall'),
        gap: 'gap-2',
      },
      md: {
        circle: 'w-5 h-5',
        dot: 'w-2.5 h-2.5',
        label: typography('body'),
        gap: 'gap-2.5',
      },
      lg: {
        circle: 'w-6 h-6',
        dot: 'w-3 h-3',
        label: typography('bodyLarge'),
        gap: 'gap-3',
      },
    };

    const currentSize = sizeConfig[size];

    return (
      <div
        className={cn('flex items-start', currentSize.gap, containerClassName)}
      >
        {/* Radio Container */}
        <div className='relative flex-shrink-0 mt-0.5'>
          {/* Hidden Input */}
          <input
            ref={ref}
            type='radio'
            disabled={disabled}
            className={cn('sr-only peer', className)}
            {...props}
          />

          {/* Custom Radio */}
          <div
            className={cn(
              // Base styles
              currentSize.circle,
              'rounded-full',
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
              'peer-checked:border-blue-600',

              // Disabled state
              disabled &&
                'opacity-50 cursor-not-allowed peer-hover:border-gray-300',

              // Error state
              error && 'border-red-500 peer-focus:ring-red-500/20'
            )}
          >
            {/* Inner Dot (shown when checked) */}
            <div
              className={cn(
                currentSize.dot,
                'rounded-full',
                'bg-blue-600',
                'scale-0',
                'peer-checked:scale-100',
                'transition-transform duration-200'
              )}
              style={{
                transform: props.checked ? 'scale(1)' : 'scale(0)',
              }}
            />
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

Radio.displayName = 'Radio';

export default Radio;
