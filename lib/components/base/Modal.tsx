// =====================================================
// MODAL COMPONENT
// =====================================================
// Standardize edilmiş modal component
'use client';
import { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn';
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}
const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      size = 'md',
      children,
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      className,
    },
    ref
  ) => {
    // Handle escape key
    useEffect(() => {
      if (!closeOnEscape || !isOpen) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEscape]);
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
      full: 'max-w-full mx-4',
    };
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    };
    const modalContent = (
      <div
        className='fixed inset-0 z-50 overflow-y-auto'
        aria-labelledby='modal-title'
        role='dialog'
        aria-modal='true'
      >
        <div className='flex min-h-screen items-center justify-center p-4 text-center sm:p-0'>
          {/* Overlay */}
          <div
            className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
            onClick={handleOverlayClick}
          />
          {/* Modal */}
          <div
            ref={ref}
            className={cn(
              'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full',
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className='px-4 py-3 border-b border-gray-200 sm:px-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    {title && (
                      <h3
                        id='modal-title'
                        className='text-lg font-medium text-gray-900'
                      >
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className='mt-1 text-sm text-gray-500'>
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      type='button'
                      className='rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      onClick={onClose}
                    >
                      <span className='sr-only'>Close</span>
                      <svg
                        className='h-6 w-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Body */}
            <div className='px-4 py-3 sm:px-6'>{children}</div>
          </div>
        </div>
      </div>
    );
    // Render modal in portal
    return createPortal(modalContent, document.body);
  }
);
Modal.displayName = 'Modal';
// Modal sub-components
export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}
export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-4 py-3 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  )
);
ModalHeader.displayName = 'ModalHeader';
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}
export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 py-3', className)} {...props}>
      {children}
    </div>
  )
);
ModalBody.displayName = 'ModalBody';
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}
export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-4 py-3 border-t border-gray-200 flex justify-end space-x-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
ModalFooter.displayName = 'ModalFooter';
export default Modal;
