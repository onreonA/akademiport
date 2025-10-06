// =====================================================
// BADGE COMPONENT
// =====================================================
// Standardize edilmiş badge component
'use client';
import { forwardRef } from 'react';

import { cn } from '../utils/cn';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      color = 'blue',
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    const variantClasses = {
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      outline: 'border border-gray-300 bg-white text-gray-700',
    };
    const colorClasses = {
      blue:
        variant === 'primary'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-blue-100 text-blue-800',
      green:
        variant === 'primary'
          ? 'bg-green-100 text-green-800'
          : 'bg-green-100 text-green-800',
      red:
        variant === 'primary'
          ? 'bg-red-100 text-red-800'
          : 'bg-red-100 text-red-800',
      yellow:
        variant === 'primary'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-yellow-100 text-yellow-800',
      purple:
        variant === 'primary'
          ? 'bg-purple-100 text-purple-800'
          : 'bg-purple-100 text-purple-800',
      pink:
        variant === 'primary'
          ? 'bg-pink-100 text-pink-800'
          : 'bg-pink-100 text-pink-800',
      gray:
        variant === 'primary'
          ? 'bg-gray-100 text-gray-800'
          : 'bg-gray-100 text-gray-800',
    };
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm',
    };
    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variant === 'outline' ? variantClasses.outline : colorClasses[color],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
export default Badge;
