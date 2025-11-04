/**
 * App Sidebar Component
 * Modern glassmorphism sidebar with role-based navigation
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, Clock } from 'lucide-react';
import { cn } from '@/presentation/lib/utils';
import { Button } from '@/presentation/components/ui/atoms/button';
import { ScrollArea } from '@/presentation/components/ui/atoms/scroll-area';
import { Separator } from '@/presentation/components/ui/atoms/separator';
import { useSidebar } from '@/shared/contexts/SidebarContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRecentPages } from '@/shared/hooks/useRecentPages';
import { getNavigationByRole } from '@/shared/constants/navigation';
import { SidebarMenuItem } from './SidebarMenuItem';
import { UserRole } from '@/domain/enums/UserRole';

// =====================================================
// COMPONENT
// =====================================================
export function AppSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const recentPages = useRecentPages();

  if (!user) return null;

  const navigation = getNavigationByRole(user.role as UserRole);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 256,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)]',
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-800',
        'shadow-sm',
        'transition-all duration-300'
      )}
    >
      <div className="relative flex h-full flex-col">
        {/* Toggle Button Header */}
        <motion.div
          initial={false}
          animate={{
            paddingLeft: isCollapsed ? 12 : 16,
            paddingRight: isCollapsed ? 12 : 16,
          }}
          className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
        >
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-bold tracking-wide text-gray-900 dark:text-white"
            >
              Menü
            </motion.span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              'h-9 w-9 rounded-lg transition-all duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              isCollapsed && 'mx-auto'
            )}
            title={isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </motion.div>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {navigation.main.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SidebarMenuItem item={item} />
              </motion.div>
            ))}
          </nav>

          {/* Recent Pages */}
          {!isCollapsed && recentPages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Separator className="my-4 bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                    Son Ziyaretler
                  </span>
                </div>
                {recentPages.slice(0, 3).map((page, index) => (
                  <motion.div
                    key={page.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                  >
                    <Link
                      href={page.path}
                      className="group block rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {page.title}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom Navigation */}
          {navigation.bottom.length > 0 && (
            <>
              <Separator className="my-4 bg-gray-200 dark:bg-gray-800" />
              <nav className="space-y-1">
                {navigation.bottom.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navigation.main.length + index) * 0.05 }}
                  >
                    <SidebarMenuItem item={item} />
                  </motion.div>
                ))}
              </nav>
            </>
          )}
        </ScrollArea>
      </div>
    </motion.aside>
  );
}
