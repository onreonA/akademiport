/**
 * Dashboard Layout Component
 * Main layout wrapper with header, sidebar, and content area
 */

'use client';

import React from 'react';
import { cn } from '@/presentation/lib/utils';
import { SidebarProvider, useSidebar } from '@/shared/contexts/SidebarContext';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { MobileSidebar } from './MobileSidebar';
import { BottomNavigation } from './BottomNavigation';
import { CommandPalette } from './CommandPalette';
import { QuickActionsFAB } from './QuickActionsFAB';

// =====================================================
// TYPES
// =====================================================
interface DashboardLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  showNotifications?: boolean;
}

// =====================================================
// INNER COMPONENT (has access to SidebarContext)
// =====================================================
function DashboardLayoutInner({
  children,
  showBreadcrumbs = true,
  showNotifications = true,
}: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        showBreadcrumbs={showBreadcrumbs}
        showNotifications={showNotifications}
      />

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
          isCollapsed ? 'md:pl-16' : 'md:pl-64'
        )}
      >
        <div className="container mx-auto p-6">{children}</div>
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

