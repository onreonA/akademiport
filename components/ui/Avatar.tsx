'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

import { cn } from '@/lib/design-tokens';

export interface AvatarProps {
  // Image
  src?: string;
  alt?: string;

  // Fallback
  fallback?: string; // Initials
  icon?: React.ReactNode;

  // Size
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // Shape
  shape?: 'circle' | 'square' | 'rounded';

  // Status indicator
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;

  // Border
  border?: boolean;
  borderColor?: string;

  // Additional
  className?: string;
  onClick?: () => void;
}

/**
 * Avatar Component - User profile pictures
 *
 * @example
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar fallback="JD" status="online" showStatus />
 * <Avatar size="xl" shape="square" />
 */
export default function Avatar({
  src,
  alt = 'User avatar',
  fallback,
  icon,
  size = 'md',
  shape = 'circle',
  status,
  showStatus = false,
  border = false,
  borderColor = 'border-white',
  className,
  onClick,
}: AvatarProps) {
  // Size configurations
  const sizeConfig = {
    xs: {
      container: 'w-6 h-6',
      text: 'text-xs',
      status: 'w-1.5 h-1.5',
      icon: 'w-3 h-3',
    },
    sm: {
      container: 'w-8 h-8',
      text: 'text-sm',
      status: 'w-2 h-2',
      icon: 'w-4 h-4',
    },
    md: {
      container: 'w-10 h-10',
      text: 'text-base',
      status: 'w-2.5 h-2.5',
      icon: 'w-5 h-5',
    },
    lg: {
      container: 'w-12 h-12',
      text: 'text-lg',
      status: 'w-3 h-3',
      icon: 'w-6 h-6',
    },
    xl: {
      container: 'w-16 h-16',
      text: 'text-xl',
      status: 'w-3.5 h-3.5',
      icon: 'w-8 h-8',
    },
    '2xl': {
      container: 'w-20 h-20',
      text: 'text-2xl',
      status: 'w-4 h-4',
      icon: 'w-10 h-10',
    },
  };

  // Shape configurations
  const shapeConfig = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  // Status configurations
  const statusConfig = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const currentSize = sizeConfig[size];

  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Avatar Container */}
      <div
        className={cn(
          // Base
          'flex items-center justify-center',
          'overflow-hidden',
          'bg-gray-200',
          'text-gray-600',
          'font-semibold',
          'select-none',
          
          // Size
          currentSize.container,
          currentSize.text,
          
          // Shape
          shapeConfig[shape],
          
          // Border
          border && cn('ring-2', borderColor),
          
          // Interactive
          onClick && 'cursor-pointer hover:opacity-80 transition-opacity'
        )}
        onClick={onClick}
      >
        {/* Image */}
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className='object-cover'
            sizes={currentSize.container}
          />
        ) : fallback ? (
          // Initials
          <span>{fallback}</span>
        ) : icon ? (
          // Custom icon
          icon
        ) : (
          // Default icon
          <User className={currentSize.icon} />
        )}
      </div>

      {/* Status Indicator */}
      {showStatus && status && (
        <span
          className={cn(
            'absolute',
            'rounded-full',
            'ring-2 ring-white',
            
            // Size
            currentSize.status,
            
            // Position (bottom-right)
            'bottom-0 right-0',
            
            // Status color
            statusConfig[status]
          )}
        />
      )}
    </div>
  );
}

/**
 * AvatarGroup Component - Multiple avatars stacked
 *
 * @example
 * <AvatarGroup max={3}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar src="/user3.jpg" />
 * </AvatarGroup>
 */
export function AvatarGroup({
  children,
  max = 3,
  size = 'md',
  className,
}: {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}) {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remaining = childArray.length - max;

  // Size for overlap
  const overlapConfig = {
    xs: '-space-x-2',
    sm: '-space-x-2',
    md: '-space-x-3',
    lg: '-space-x-4',
    xl: '-space-x-5',
    '2xl': '-space-x-6',
  };

  return (
    <div className={cn('flex items-center', overlapConfig[size], className)}>
      {visibleChildren.map((child, index) => (
        <div key={index} className='relative'>
          {React.cloneElement(child as React.ReactElement, {
            size,
            border: true,
            borderColor: 'border-white',
          })}
        </div>
      ))}

      {/* Remaining count */}
      {remaining > 0 && (
        <Avatar
          fallback={`+${remaining}`}
          size={size}
          border
          borderColor='border-white'
        />
      )}
    </div>
  );
}

