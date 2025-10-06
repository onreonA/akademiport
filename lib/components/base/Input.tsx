// =====================================================
// INPUT COMPONENT
// =====================================================
// Standardize edilmiş input component
'use client';
import { forwardRef } from 'react';

import { cn } from '../utils/cn';
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
}
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      help,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'default',
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const baseClasses =
      'block transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
    const variantClasses = {
      default:
        'border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500',
      filled:
        'border-0 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500',
      outlined:
        'border-2 border-gray-300 rounded-lg bg-transparent focus:border-blue-500 focus:ring-blue-500',
    };
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };
    const widthClasses = fullWidth ? 'w-full' : '';
    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '';
    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className='block text-sm font-medium text-gray-700'
          >
            {label}
          </label>
        )}
        <div className='relative'>
          {leftIcon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-400'>{leftIcon}</span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseClasses,
              variantClasses[variant],
              sizeClasses[size],
              widthClasses,
              errorClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <span className='text-gray-400'>{rightIcon}</span>
            </div>
          )}
        </div>
        {error && <p className='text-sm text-red-600'>{error}</p>}
        {help && !error && <p className='text-sm text-gray-500'>{help}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
