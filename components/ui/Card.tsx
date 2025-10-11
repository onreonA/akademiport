import React from 'react';

import {
  cn,
  tokens,
  color,
  spacing,
  radius,
  shadow as shadowHelper,
  typography,
} from '@/lib/design-tokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'base' | 'elevated' | 'flat' | 'glass';
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

/**
 * Reusable Card Component with Design Tokens
 *
 * @example
 * <Card variant="elevated" hover padding="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 */
export default function Card({
  children,
  className = '',
  variant = 'base',
  hover = false,
  shadow = 'sm',
  padding = 'md',
  onClick,
}: CardProps) {
  // Use pre-composed tokens for variants
  const variantClasses = {
    base: tokens.card.base,
    elevated: tokens.card.elevated,
    flat: tokens.card.flat,
    glass: tokens.card.glass,
  };

  const paddingClasses = {
    sm: spacing(4, 'p'),
    md: spacing(6, 'p'),
    lg: spacing(8, 'p'),
  };

  const hoverClasses = hover
    ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        shadowHelper(shadow),
        hover && hoverClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Card Header Component with Design Tokens
 */
export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        spacing(4, 'm', 'b'),
        spacing(4, 'p', 'b'),
        color('secondary', 200, 'border'),
        'border-b',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Card Title Component with Design Tokens
 */
export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cn(typography('heading4'), className)}>{children}</h3>;
}

/**
 * Card Content Component with Design Tokens
 */
export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(typography('body'), className)}>{children}</div>;
}

/**
 * Card Footer Component with Design Tokens
 */
export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        spacing(4, 'm', 't'),
        spacing(4, 'p', 't'),
        color('secondary', 200, 'border'),
        'border-t',
        className
      )}
    >
      {children}
    </div>
  );
}
