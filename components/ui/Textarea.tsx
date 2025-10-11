'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, type LucideIcon } from 'lucide-react';

import { cn, tokens, spacing, typography, color, radius } from '@/lib/design-tokens';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Label & Description
  label?: string;
  description?: string;

  // Validation
  error?: string;
  success?: string;

  // Icons
  icon?: LucideIcon;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Variants
  variant?: 'default' | 'filled' | 'outlined';

  // Character Count
  showCount?: boolean;
  maxLength?: number;

  // Auto Resize
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;

  // Additional
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
}

/**
 * Textarea Component with Design Tokens
 *
 * @example
 * // Basic
 * <Textarea label="Açıklama" placeholder="Açıklama girin..." />
 *
 * @example
 * // With character count
 * <Textarea
 *   label="Bio"
 *   maxLength={500}
 *   showCount
 * />
 *
 * @example
 * // Auto-resize
 * <Textarea
 *   label="Mesaj"
 *   autoResize
 *   minRows={3}
 *   maxRows={10}
 * />
 *
 * @example
 * // With validation
 * <Textarea
 *   label="Notlar"
 *   error={errors.notes}
 * />
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      description,
      error,
      success,
      icon: Icon,
      size = 'md',
      variant = 'default',
      showCount = false,
      maxLength,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      helperText,
      containerClassName,
      labelClassName,
      className,
      disabled,
      required,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>((value as string) || '');
    const [textareaHeight, setTextareaHeight] = useState<number | undefined>();

    // Sync internal value with external value
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value as string);
      }
    }, [value]);

    // Auto-resize logic
    useEffect(() => {
      if (autoResize && ref && typeof ref !== 'function' && ref.current) {
        const textarea = ref.current;
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const minHeight = lineHeight * minRows;
        const maxHeight = lineHeight * maxRows;

        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        setTextareaHeight(newHeight);
      }
    }, [internalValue, autoResize, minRows, maxRows, ref]);

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // Respect maxLength if provided
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      setInternalValue(newValue);
      onChange?.(e);
    };

    // Size configurations
    const sizeConfig = {
      sm: {
        textarea: 'px-3 py-2 text-sm',
        label: typography('bodySmall'),
        icon: 'w-4 h-4',
      },
      md: {
        textarea: 'px-4 py-2.5 text-base',
        label: typography('body'),
        icon: 'w-5 h-5',
      },
      lg: {
        textarea: 'px-5 py-3 text-lg',
        label: typography('bodyLarge'),
        icon: 'w-6 h-6',
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
      success && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
    );

    const currentSize = sizeConfig[size];

    // Calculate rows for non-auto-resize mode
    const rows = !autoResize ? minRows : undefined;

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              currentSize.label,
              'block font-medium text-gray-700 mb-1.5',
              labelClassName
            )}
          >
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

        {/* Description */}
        {description && (
          <p className={cn(typography('bodySmall'), 'text-gray-500 mb-2')}>{description}</p>
        )}

        {/* Textarea Container */}
        <div className='relative'>
          {/* Icon (Top Right) */}
          {Icon && (
            <div className='absolute right-3 top-3 text-gray-400 pointer-events-none'>
              <Icon className={currentSize.icon} />
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={ref}
            disabled={disabled}
            rows={rows}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            maxLength={maxLength}
            style={
              autoResize && textareaHeight
                ? { height: `${textareaHeight}px`, overflow: 'hidden' }
                : undefined
            }
            className={cn(
              // Base styles
              'w-full',
              radius('lg'),
              'transition-all duration-200',
              'outline-none',
              'resize-none',

              // Size
              currentSize.textarea,

              // Variant
              variantConfig[variant],

              // States
              stateClasses,

              // Icon padding
              Icon && 'pr-10',

              // Disabled state
              disabled && 'cursor-not-allowed',

              // Custom className
              className
            )}
            {...props}
          />
        </div>

        {/* Footer Section */}
        <div className='mt-1.5 flex items-start justify-between gap-2'>
          {/* Left: Error / Success / Helper Text */}
          <div className='flex-1'>
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
                <CheckCircle className='w-4 h-4 flex-shrink-0' />
                <p className={typography('bodySmall')}>{success}</p>
              </div>
            )}

            {/* Helper Text */}
            {helperText && !error && !success && (
              <p className={cn(typography('bodySmall'), 'text-gray-500')}>{helperText}</p>
            )}
          </div>

          {/* Right: Character Count */}
          {showCount && maxLength && (
            <p
              className={cn(
                typography('bodySmall'),
                'text-gray-500 flex-shrink-0',
                internalValue.length >= maxLength * 0.9 && 'text-orange-500',
                internalValue.length === maxLength && 'text-red-500 font-semibold'
              )}
            >
              {internalValue.length}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

