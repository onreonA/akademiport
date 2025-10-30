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
      default: 'bg-card border border-border shadow-md',
      gradient: 'card-gradient shadow-lg',
      glass: 'card-glass shadow-lg',
      neon: 'card-neon shadow-lg',
    };

    const hoverClass = hover ? 'hover-lift-enhanced' : '';
    const glowClass = glow ? 'glow-primary' : '';

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
