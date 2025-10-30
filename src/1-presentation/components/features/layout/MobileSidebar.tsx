/**
 * Mobile Sidebar Component
 * Overlay sidebar for mobile devices using Sheet
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/presentation/components/ui/atoms/sheet';
import { ScrollArea } from '@/presentation/components/ui/atoms/scroll-area';
import { Separator } from '@/presentation/components/ui/atoms/separator';
import { Button } from '@/presentation/components/ui/atoms/button';
import { useSidebar } from '@/shared/contexts/SidebarContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRecentPages } from '@/shared/hooks/useRecentPages';
import { getNavigationByRole } from '@/shared/constants/navigation';
import { SidebarMenuItem } from './SidebarMenuItem';
import { UserRole } from '@/domain/enums/UserRole';

// =====================================================
// COMPONENT
// =====================================================
export function MobileSidebar() {
  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const recentPages = useRecentPages();

  if (!user) return null;

  const navigation = getNavigationByRole(user.role as UserRole);

  return (
    <Sheet open={isMobileOpen} onOpenChange={closeMobileSidebar}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle>Menü</SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeMobileSidebar} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {navigation.main.map((item) => (
              <div key={item.id} onClick={closeMobileSidebar}>
                <SidebarMenuItem item={item} />
              </div>
            ))}
          </nav>

          {/* Recent Pages */}
          {recentPages.length > 0 && (
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
                    onClick={closeMobileSidebar}
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
                  <div key={item.id} onClick={closeMobileSidebar}>
                    <SidebarMenuItem item={item} />
                  </div>
                ))}
              </nav>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
