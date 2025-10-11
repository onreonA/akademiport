'use client';

import React, { forwardRef } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, type LucideIcon } from 'lucide-react';

import { cn, tokens, spacing, typography, color, radius } from '@/lib/design-tokens';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Label & Description
  label?: string;
  description?: string;
  
  // Validation
  error?: string;
  success?: string;
  
  // Icons
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  
  // States
  loading?: boolean;
  
  // Size
  size?: 'sm' | 'md' | 'lg';
  
  // Variants
  variant?: 'default' | 'filled' | 'outlined' | 'ghost';
  
  // Password toggle
  showPasswordToggle?: boolean;
  
  // Additional
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
  containerClassName?: string;
}

/**
 * Input Component with Design Tokens
 * 
 * @example
 * // Basic
 * <Input label="Email" placeholder="email@example.com" />
 * 
 * @example
 * // With validation
 * <Input 
 *   label="Email" 
 *   error={errors.email}
 *   leftIcon={Mail}
 * />
 * 
 * @example
 * // Password with toggle
 * <Input 
 *   type="password"
 *   label="Şifre"
 *   showPasswordToggle
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      description,
      error,
      success,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      loading,
      size = 'md',
      variant = 'default',
      showPasswordToggle,
      helperText,
      maxLength,
      showCount,
      containerClassName,
      className,
      type = 'text',
      disabled,
      required,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);

    // Handle character count
    React.useEffect(() => {
      if (showCount && typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value, showCount]);

    // Size configurations
    const sizeConfig = {
      sm: {
        input: 'h-9 px-3 text-sm',
        icon: 'w-4 h-4',
        label: typography('bodySmall'),
      },
      md: {
        input: 'h-10 px-4 text-base',
        icon: 'w-5 h-5',
        label: typography('body'),
      },
      lg: {
        input: 'h-12 px-5 text-lg',
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
      ghost: cn(
        'bg-transparent border-0 border-b-2 border-gray-300 rounded-none',
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
    const inputType = showPasswordToggle && showPassword ? 'text' : type;

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label className={cn(currentSize.label, 'block font-medium text-gray-700 mb-1.5')}>
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

        {/* Input Container */}
        <div className='relative'>
          {/* Left Icon */}
          {LeftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
              <LeftIcon className={currentSize.icon} />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled || loading}
            value={value}
            maxLength={maxLength}
            className={cn(
              // Base styles
              'w-full',
              radius('lg'),
              'transition-all duration-200',
              'outline-none',
              
              // Size
              currentSize.input,
              
              // Variant
              variantConfig[variant],
              
              // States
              stateClasses,
              
              // Icon padding
              LeftIcon && 'pl-10',
              (RightIcon || loading || showPasswordToggle) && 'pr-10',
              
              // Custom className
              className
            )}
            {...props}
          />

          {/* Right Side Icons */}
          <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
            {/* Loading Spinner */}
            {loading && (
              <Loader2 className={cn(currentSize.icon, 'text-gray-400 animate-spin')} />
            )}

            {/* Password Toggle */}
            {showPasswordToggle && type === 'password' && !loading && (
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-gray-400 hover:text-gray-600 transition-colors'
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className={currentSize.icon} />
                ) : (
                  <Eye className={currentSize.icon} />
                )}
              </button>
            )}

            {/* Right Icon */}
            {RightIcon && !loading && (
              <RightIcon className={cn(currentSize.icon, 'text-gray-400')} />
            )}
          </div>
        </div>

        {/* Helper Text / Error / Success / Character Count */}
        <div className='mt-1.5 flex items-center justify-between gap-2'>
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
                <AlertCircle className='w-4 h-4 flex-shrink-0' />
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

          {/* Character Count */}
          {showCount && maxLength && (
            <p className={cn(
              typography('bodySmall'),
              charCount > maxLength ? 'text-red-600' : 'text-gray-500'
            )}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

