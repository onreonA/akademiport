/**
 * Gradient Header Component
 *
 * Modern header with gradient background, circular progress, and actions
 * Inspired by the design examples provided
 */

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  progress?: number;
  actions?: React.ReactNode;
  className?: string;
}

export function GradientHeader({
  title,
  subtitle,
  icon: Icon,
  progress,
  actions,
  className,
}: GradientHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl md:rounded-2xl bg-linear-to-r from-primary via-primary/90 to-secondary p-4 md:p-6 lg:p-8 shadow-xl',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-white/10 rounded-full animate-pulse" />
        <div
          className="absolute -bottom-4 -left-4 w-24 md:w-32 h-24 md:h-32 bg-white/5 rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-12 md:w-16 h-12 md:h-16 bg-white/5 rounded-full animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
        <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
          {Icon && (
            <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl hover:bg-white/30 transition-all duration-300 shrink-0">
              <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 bg-linear-to-r from-white to-white/90 bg-clip-text text-transparent truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/80 text-sm md:text-base lg:text-lg truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
          {progress !== undefined && (
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 80 80">
                  {/* Background Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                    fill="none"
                    className="md:stroke-8"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="white"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out md:stroke-8"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-base md:text-lg">{progress}%</span>
                </div>
              </div>
            </div>
          )}

          {actions && <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
