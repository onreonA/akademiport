/**
 * Enhanced Card Component
 *
 * Modern card component with glassmorphism, gradient, and neon effects
 * Inspired by the design examples provided
 */

import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass' | 'neon';
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'default', hover = true, glow = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm',
      gradient: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm',
      glass: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm',
      neon: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm',
    };

    const hoverClass = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
    const glowClass = '';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-300',
          variants[variant],
          hoverClass,
          glowClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export { EnhancedCard };
