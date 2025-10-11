'use client';

import React from 'react';
import { Check } from 'lucide-react';

import { cn, radius } from '@/lib/design-tokens';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

/**
 * ProgressBar Component - Linear progress indicator
 *
 * @example
 * <ProgressBar value={60} />
 * <ProgressBar value={75} color="success" showLabel />
 * <ProgressBar value={45} animated striped />
 */
export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Size configurations
  const sizeConfig = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Color configurations
  const colorConfig = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-cyan-600',
  };

  return (
    <div className={className}>
      {/* Label */}
      {(showLabel || label) && (
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-700'>
            {label || 'İlerleme'}
          </span>
          {showLabel && (
            <span className='text-sm font-semibold text-gray-900'>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div
        className={cn(
          'w-full bg-gray-200 overflow-hidden',
          radius('full'),
          sizeConfig[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            radius('full'),
            colorConfig[color],
            animated && 'animate-pulse',
            striped &&
              'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:2rem_100%] animate-[shimmer_2s_infinite]'
          )}
          style={{ width: `${percentage}%` }}
          role='progressbar'
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

export interface ProgressCircleProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

/**
 * ProgressCircle Component - Circular progress indicator
 *
 * @example
 * <ProgressCircle value={75} />
 * <ProgressCircle value={60} size={120} color="success" showLabel />
 */
export function ProgressCircle({
  value,
  size = 100,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
  label,
  className,
}: ProgressCircleProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Color configurations
  const colorConfig = {
    primary: 'stroke-blue-600',
    secondary: 'stroke-gray-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-600',
    error: 'stroke-red-600',
    info: 'stroke-cyan-600',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className='transform -rotate-90'>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className='stroke-gray-200'
          fill='none'
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={cn('transition-all duration-500 ease-out', colorConfig[color])}
          fill='none'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-2xl font-bold text-gray-900'>
            {Math.round(percentage)}%
          </span>
          {label && <span className='text-xs text-gray-600 mt-1'>{label}</span>}
        </div>
      )}
    </div>
  );
}

export interface ProgressStepsProps {
  steps: Array<{
    label: string;
    description?: string;
  }>;
  currentStep: number; // 0-based index
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * ProgressSteps Component - Step-by-step progress indicator
 *
 * @example
 * <ProgressSteps
 *   steps={[
 *     { label: 'Bilgiler', description: 'Temel bilgiler' },
 *     { label: 'Detaylar', description: 'Detay bilgileri' },
 *     { label: 'Onay', description: 'Son onay' }
 *   ]}
 *   currentStep={1}
 * />
 */
export function ProgressSteps({
  steps,
  currentStep,
  color = 'primary',
  orientation = 'horizontal',
  className,
}: ProgressStepsProps) {
  // Color configurations
  const colorConfig = {
    primary: { active: 'bg-blue-600 border-blue-600', text: 'text-blue-600' },
    secondary: { active: 'bg-gray-600 border-gray-600', text: 'text-gray-600' },
    success: { active: 'bg-green-600 border-green-600', text: 'text-green-600' },
    warning: { active: 'bg-yellow-600 border-yellow-600', text: 'text-yellow-600' },
    error: { active: 'bg-red-600 border-red-600', text: 'text-red-600' },
    info: { active: 'bg-cyan-600 border-cyan-600', text: 'text-cyan-600' },
  };

  const config = colorConfig[color];

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <React.Fragment key={index}>
            {/* Step */}
            <div
              className={cn(
                'flex items-center gap-3',
                orientation === 'vertical' && 'w-full'
              )}
            >
              {/* Circle */}
              <div
                className={cn(
                  'flex items-center justify-center',
                  'w-10 h-10',
                  'rounded-full',
                  'border-2',
                  'font-semibold text-sm',
                  'transition-all duration-200',
                  isCompleted && cn(config.active, 'text-white'),
                  isCurrent && cn('border-2', config.active.split(' ')[1], 'bg-white', config.text),
                  isPending && 'border-gray-300 bg-white text-gray-400'
                )}
              >
                {isCompleted ? <Check className='w-5 h-5' /> : index + 1}
              </div>

              {/* Label */}
              <div className='flex-1'>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCompleted && config.text,
                    isCurrent && 'text-gray-900',
                    isPending && 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className='text-xs text-gray-500 mt-0.5'>{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  orientation === 'horizontal'
                    ? 'h-0.5 flex-1 mx-4'
                    : 'w-0.5 h-12 ml-5',
                  'transition-colors duration-200',
                  index < currentStep ? config.active.split(' ')[0] : 'bg-gray-300'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Export all as Progress namespace
const Progress = {
  Bar: ProgressBar,
  Circle: ProgressCircle,
  Steps: ProgressSteps,
};

export default Progress;

