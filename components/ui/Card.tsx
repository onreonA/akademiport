import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

/**
 * Reusable Card Component
 *
 * @example
 * <Card shadow="md" hover padding="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 */
export default function Card({
  children,
  className = '',
  hover = false,
  shadow = 'sm',
  padding = 'md',
  onClick,
}: CardProps) {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = 'bg-white rounded-xl border border-gray-200';
  const hoverClasses = hover
    ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div
      className={`${baseClasses} ${shadowClasses[shadow]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Card Header Component
 */
export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 pb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Title Component
 */
export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

/**
 * Card Content Component
 */
export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`text-gray-600 ${className}`}>{children}</div>;
}

/**
 * Card Footer Component
 */
export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
