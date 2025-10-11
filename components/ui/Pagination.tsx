'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

import { cn, radius } from '@/lib/design-tokens';

export interface PaginationProps {
  // Required
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  // Display options
  siblingCount?: number; // Pages shown on each side of current
  showFirstLast?: boolean;
  showPrevNext?: boolean;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Variant
  variant?: 'default' | 'rounded' | 'pills';

  // Additional
  disabled?: boolean;
  className?: string;
}

/**
 * Pagination Component - Page navigation
 *
 * @example
 * <Pagination
 *   currentPage={5}
 *   totalPages={20}
 *   onPageChange={setCurrentPage}
 * />
 *
 * @example
 * <Pagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={handlePageChange}
 *   siblingCount={2}
 *   showFirstLast
 *   variant="pills"
 * />
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  size = 'md',
  variant = 'default',
  disabled = false,
  className,
}: PaginationProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-8 h-8 text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      button: 'w-10 h-10 text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      button: 'w-12 h-12 text-base',
      icon: 'w-5 h-5',
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      base: cn(radius('md'), 'border border-gray-300'),
      active: 'bg-blue-600 text-white border-blue-600',
      inactive: 'bg-white text-gray-700 hover:bg-gray-50',
    },
    rounded: {
      base: 'rounded-full border border-gray-300',
      active: 'bg-blue-600 text-white border-blue-600',
      inactive: 'bg-white text-gray-700 hover:bg-gray-50',
    },
    pills: {
      base: 'rounded-full',
      active: 'bg-blue-600 text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Generate page numbers with ellipsis
  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const totalNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    const totalBlocks = totalNumbers + 2; // + 2 ellipsis

    if (totalPages <= totalBlocks) {
      // Show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    // Always show first page
    pages.push(1);

    if (showLeftEllipsis) {
      pages.push('ellipsis');
    }

    // Show pages around current
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (showRightEllipsis) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  // Button component
  const PageButton = ({
    page,
    isActive = false,
    isDisabled = false,
    onClick,
    children,
    ariaLabel,
  }: {
    page?: number;
    isActive?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    ariaLabel?: string;
  }) => (
    <button
      type='button'
      onClick={onClick}
      disabled={isDisabled || disabled}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        // Base
        'inline-flex items-center justify-center',
        'font-medium',
        'transition-all duration-200',

        // Size
        currentSize.button,

        // Variant
        currentVariant.base,
        isActive ? currentVariant.active : currentVariant.inactive,

        // Disabled
        (isDisabled || disabled) && 'opacity-50 cursor-not-allowed',

        // Active
        isActive && 'cursor-default'
      )}
    >
      {children}
    </button>
  );

  if (totalPages <= 1) {
    return null; // Don't show pagination for single page
  }

  return (
    <nav
      aria-label='Pagination'
      className={cn('flex items-center gap-1', className)}
    >
      {/* First Page */}
      {showFirstLast && (
        <PageButton
          onClick={() => onPageChange(1)}
          isDisabled={currentPage === 1}
          ariaLabel='İlk sayfa'
        >
          <ChevronsLeft className={currentSize.icon} />
        </PageButton>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        <PageButton
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          ariaLabel='Önceki sayfa'
        >
          <ChevronLeft className={currentSize.icon} />
        </PageButton>
      )}

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn(
                'inline-flex items-center justify-center',
                currentSize.button,
                'text-gray-500'
              )}
            >
              <MoreHorizontal className={currentSize.icon} />
            </span>
          );
        }

        return (
          <PageButton
            key={page}
            page={page}
            isActive={page === currentPage}
            onClick={() => onPageChange(page)}
            ariaLabel={`Sayfa ${page}`}
          >
            {page}
          </PageButton>
        );
      })}

      {/* Next Page */}
      {showPrevNext && (
        <PageButton
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          ariaLabel='Sonraki sayfa'
        >
          <ChevronRight className={currentSize.icon} />
        </PageButton>
      )}

      {/* Last Page */}
      {showFirstLast && (
        <PageButton
          onClick={() => onPageChange(totalPages)}
          isDisabled={currentPage === totalPages}
          ariaLabel='Son sayfa'
        >
          <ChevronsRight className={currentSize.icon} />
        </PageButton>
      )}
    </nav>
  );
}
