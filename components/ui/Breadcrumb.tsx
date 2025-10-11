'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, type LucideIcon } from 'lucide-react';

import { cn, typography } from '@/lib/design-tokens';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: 'chevron' | 'slash' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

/**
 * Breadcrumb Component - Page navigation trail
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Projeler', href: '/firma/projeler' },
 *     { label: 'Proje Detay', current: true }
 *   ]}
 * />
 *
 * @example
 * <Breadcrumb
 *   items={breadcrumbs}
 *   separator="slash"
 *   showHome
 * />
 */
export default function Breadcrumb({
  items,
  separator = 'chevron',
  size = 'md',
  showHome = true,
  homeHref = '/',
  className,
}: BreadcrumbProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      text: 'text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
      padding: 'px-2 py-1',
    },
    md: {
      text: 'text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
      padding: 'px-2.5 py-1.5',
    },
    lg: {
      text: 'text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
      padding: 'px-3 py-2',
    },
  };

  const currentSize = sizeConfig[size];

  // Separator component
  const Separator = () => {
    if (separator === 'chevron') {
      return <ChevronRight className={cn(currentSize.icon, 'text-gray-400')} />;
    }
    if (separator === 'slash') {
      return <span className='text-gray-400'>/</span>;
    }
    if (separator === 'dot') {
      return <span className='text-gray-400'>•</span>;
    }
    return null;
  };

  // All items (home + provided items)
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Ana Sayfa', href: homeHref, icon: Home }, ...items]
    : items;

  return (
    <nav aria-label='Breadcrumb' className={cn('flex items-center flex-wrap', currentSize.gap, className)}>
      <ol className={cn('flex items-center flex-wrap', currentSize.gap)}>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isCurrent = item.current || isLast;
          const ItemIcon = item.icon;

          return (
            <li key={index} className={cn('flex items-center', currentSize.gap)}>
              {/* Item */}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className={cn(
                    'inline-flex items-center',
                    currentSize.gap,
                    currentSize.text,
                    currentSize.padding,
                    'text-gray-600',
                    'hover:text-blue-600',
                    'hover:bg-blue-50',
                    'rounded-md',
                    'transition-colors',
                    'font-medium'
                  )}
                >
                  {ItemIcon && <ItemIcon className={currentSize.icon} />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center',
                    currentSize.gap,
                    currentSize.text,
                    currentSize.padding,
                    isCurrent ? 'text-gray-900 font-semibold' : 'text-gray-600',
                    'rounded-md'
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {ItemIcon && <ItemIcon className={currentSize.icon} />}
                  <span>{item.label}</span>
                </span>
              )}

              {/* Separator */}
              {!isLast && <Separator />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
