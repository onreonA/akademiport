/**
 * Empty State Component
 *
 * Professional empty state with illustrations and actions
 */

'use client';

import * as React from 'react';
import { Button } from './button';
import { cn } from '@/presentation/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeVariants = {
  sm: {
    container: 'py-8',
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm',
    spacing: 'space-y-3',
  },
  md: {
    container: 'py-12',
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base',
    spacing: 'space-y-4',
  },
  lg: {
    container: 'py-16',
    icon: 'h-20 w-20',
    title: 'text-2xl',
    description: 'text-lg',
    spacing: 'space-y-6',
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  const sizeVariant = sizeVariants[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeVariant.container,
        className
      )}
    >
      <div className={cn('flex flex-col items-center', sizeVariant.spacing)}>
        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'rounded-full bg-muted flex items-center justify-center text-muted-foreground',
              sizeVariant.icon
            )}
          >
            <Icon className="h-1/2 w-1/2" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <h3 className={cn('font-semibold text-foreground', sizeVariant.title)}>{title}</h3>
          {description && (
            <p className={cn('text-muted-foreground max-w-md', sizeVariant.description)}>
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'default'}
                size={size === 'sm' ? 'sm' : 'default'}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
                size={size === 'sm' ? 'sm' : 'default'}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
