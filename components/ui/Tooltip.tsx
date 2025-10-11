'use client';

import React, { useState } from 'react';

import { cn, radius, shadow } from '@/lib/design-tokens';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  arrow?: boolean;
  className?: string;
}

/**
 * Tooltip Component - Hover information
 *
 * @example
 * <Tooltip content="Bu bir buton">
 *   <button>Hover me</button>
 * </Tooltip>
 *
 * <Tooltip content="Sil" position="top" arrow>
 *   <TrashIcon />
 * </Tooltip>
 */
export default function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  arrow = true,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const newTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimer(newTimer);
  };

  const handleMouseLeave = () => {
    if (timer) {
      clearTimeout(timer);
    }
    setIsVisible(false);
  };

  // Position configurations
  const positionConfig = {
    top: {
      tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      arrow: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
    },
    bottom: {
      tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
      arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
    },
    left: {
      tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
      arrow: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
    },
    right: {
      tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
      arrow: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
    },
  };

  const config = positionConfig[position];

  return (
    <div
      className='relative inline-flex'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      {children}

      {/* Tooltip */}
      {isVisible && (
        <div
          role='tooltip'
          className={cn(
            // Base
            'absolute z-50',
            'px-3 py-2',
            'bg-gray-900',
            'text-white text-sm',
            'whitespace-nowrap',
            radius('md'),
            shadow('lg'),
            
            // Animation
            'animate-fade-in',
            
            // Position
            config.tooltip,
            
            // Custom
            className
          )}
        >
          {content}

          {/* Arrow */}
          {arrow && (
            <div
              className={cn(
                'absolute',
                'w-0 h-0',
                'border-4',
                config.arrow
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

