/**
 * Dashboard Layout Component
 * Main layout wrapper with header, sidebar, and content area
 */

'use client';

import React from 'react';
import { cn } from '@/5-shared/utils/cn';
import { SidebarProvider, useSidebar } from '@/5-shared/contexts/SidebarContext';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { MobileSidebar } from './MobileSidebar';
import { BottomNavigation } from './BottomNavigation';
import { CommandPalette } from './CommandPalette';
import { QuickActionsFAB } from './QuickActionsFAB';
import { PageErrorBoundary } from '@/1-presentation/components/shared/PageErrorBoundary';

// =====================================================
// TYPES
// =====================================================
interface DashboardLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  showNotifications?: boolean;
  variant?: 'default' | 'company-dashboard';
}

// =====================================================
// INNER COMPONENT (has access to SidebarContext)
// =====================================================
function DashboardLayoutInner({
  children,
  showBreadcrumbs = true,
  showNotifications = true,
  variant = 'default',
}: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();

  const mainBackgroundClass =
    variant === 'company-dashboard'
      ? 'bg-linear-to-br from-background via-background to-primary/5 dark:from-gray-950 dark:via-gray-950 dark:to-primary/20'
      : 'bg-gray-50 dark:bg-gray-900';

  return (
    <div className={cn('min-h-screen', mainBackgroundClass)}>
      {/* Header */}
      <AppHeader showBreadcrumbs={showBreadcrumbs} showNotifications={showNotifications} />

      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Sidebar - Mobile */}
      <MobileSidebar />

      {/* Main Content */}
      <main
        className={cn(
          'min-h-[calc(100vh-3.5rem)] transition-all duration-300',
          'md:pt-0 pt-0 pb-20 md:pb-6',
          isCollapsed ? 'md:pl-16' : 'md:pl-64',
          variant === 'company-dashboard' && mainBackgroundClass
        )}
      >
        <div
          className={cn(
            variant === 'company-dashboard' ? 'w-full' : 'container mx-auto',
            variant === 'company-dashboard' ? 'p-0' : 'p-6'
          )}
        >
          <PageErrorBoundary>{children}</PageErrorBoundary>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />

      {/* Command Palette - Global */}
      <CommandPalette />

      {/* Quick Actions FAB */}
      <QuickActionsFAB />
    </div>
  );
}

// =====================================================
// OUTER COMPONENT (provides SidebarContext)
// =====================================================
export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner {...props} />
    </SidebarProvider>
  );
}
