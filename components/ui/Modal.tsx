'use client';

import React, { useEffect } from 'react';

import {
  cn,
  color,
  spacing,
  radius,
  shadow,
  typography,
} from '@/lib/design-tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
}

/**
 * Reusable Modal Component with Design Tokens
 *
 * @example
 * <Modal isOpen={isOpen} onClose={handleClose} title="Modal Title" size="md">
 *   <p>Modal content</p>
 * </Modal>
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = 'md',
  closeOnOverlayClick = true,
  footer,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        spacing(4, 'p')
      )}
    >
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden='true'
      />

      {/* Modal */}
      <div
        className={cn(
          'relative',
          color('secondary', 50, 'bg'),
          radius('xl'),
          shadow('xl'),
          'w-full max-h-[90vh] overflow-auto',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div
            className={cn(
              'sticky top-0 z-10',
              color('secondary', 50, 'bg'),
              color('secondary', 200, 'border'),
              'border-b',
              spacing(6, 'p', 'x'),
              spacing(4, 'p', 'y'),
              'flex items-center justify-between',
              'rounded-t-xl'
            )}
          >
            <div>
              {title && <h2 className={typography('heading4')}>{title}</h2>}
              {subtitle && (
                <p className={cn(typography('bodySmall'), 'mt-1')}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={cn(
                color('secondary', 400, 'text'),
                'hover:text-gray-600',
                'transition-colors',
                spacing(1, 'p'),
                'hover:bg-gray-100',
                radius('lg')
              )}
              aria-label='Close modal'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn(spacing(6, 'p', 'x'), spacing(4, 'p', 'y'))}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              'sticky bottom-0',
              color('secondary', 50, 'bg'),
              color('secondary', 200, 'border'),
              'border-t',
              spacing(6, 'p', 'x'),
              spacing(4, 'p', 'y'),
              'flex items-center justify-end',
              spacing(3, 'gap'),
              'rounded-b-xl'
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Modal Footer Component with Design Tokens
 */
export function ModalFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'sticky bottom-0',
        color('secondary', 50, 'bg'),
        color('secondary', 200, 'border'),
        'border-t',
        spacing(6, 'p', 'x'),
        spacing(4, 'p', 'y'),
        'flex items-center justify-end',
        spacing(3, 'gap'),
        'rounded-b-xl',
        className
      )}
    >
      {children}
    </div>
  );
}
