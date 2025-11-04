/**
 * Sidebar Menu Item Component
 * Modern menu item with glassmorphism, gradients, and smooth animations
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/presentation/lib/utils';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { useSidebar } from '@/shared/contexts/SidebarContext';
import type { NavigationItem } from '@/shared/constants/navigation';

// =====================================================
// TYPES
// =====================================================
interface SidebarMenuItemProps {
  item: NavigationItem;
}

// =====================================================
// COMPONENT
// =====================================================
export function SidebarMenuItem({ item }: SidebarMenuItemProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren && !isCollapsed) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      {/* Main Item */}
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium',
          'transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary dark:bg-primary/20'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
          isCollapsed && 'justify-center px-3'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          />
        )}

        {/* Icon */}
        <div>
          <Icon
            className={cn(
              'h-5 w-5 shrink-0 transition-colors duration-200',
              isActive
                ? 'text-primary'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
            )}
          />
        </div>

        {!isCollapsed && (
          <>
            <span
              className={cn(
                'flex-1 transition-colors duration-200',
                isActive ? 'font-semibold tracking-wide' : 'font-medium'
              )}
            >
              {item.label}
            </span>

            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}

            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors" />
              </motion.div>
            )}
          </>
        )}
      </Link>

      {/* Sub-menu */}
      <AnimatePresence>
        {hasChildren && !isCollapsed && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="ml-8 mt-1 space-y-1 overflow-hidden"
          >
            {item.children!.map((child, index) => {
              const isChildActive = pathname === child.href;
              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={child.href}
                    className={cn(
                      'group/sub flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                      'transition-all duration-200',
                      isChildActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <span
                      className={cn(
                        'transition-colors',
                        isChildActive
                          ? 'text-primary font-medium'
                          : 'group-hover/sub:text-gray-900 dark:group-hover/sub:text-white'
                      )}
                    >
                      {child.label}
                    </span>
                    {child.badge && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {child.badge}
                      </Badge>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
