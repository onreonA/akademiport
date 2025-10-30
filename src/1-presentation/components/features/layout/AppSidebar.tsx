/**
 * App Sidebar Component
 * Collapsible sidebar with role-based navigation
 */

'use client';

import React from 'react';
import Link from 'next/link';
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
    <aside
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          {!isCollapsed && <span className="text-sm font-semibold">Menü</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
            title={isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {navigation.main.map((item) => (
              <SidebarMenuItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Recent Pages */}
          {!isCollapsed && recentPages.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Son Ziyaretler</span>
                </div>
                {recentPages.slice(0, 3).map((page) => (
                  <Link
                    key={page.path}
                    href={page.path}
                    className="block rounded-md px-3 py-2 text-sm transition-all hover:bg-accent"
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Bottom Navigation */}
          {navigation.bottom.length > 0 && (
            <>
              <Separator className="my-4" />
              <nav className="space-y-1">
                {navigation.bottom.map((item) => (
                  <SidebarMenuItem key={item.id} item={item} />
                ))}
              </nav>
            </>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
}
