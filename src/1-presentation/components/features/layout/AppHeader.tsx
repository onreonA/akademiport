/**
 * App Header Component
 * Main header with logo, breadcrumbs, notifications, theme toggle, and user menu
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, Bell, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { useSidebar } from '@/shared/contexts/SidebarContext';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';
import { cn } from '@/presentation/lib/utils';

// =====================================================
// TYPES
// =====================================================
interface AppHeaderProps {
  showBreadcrumbs?: boolean;
  showNotifications?: boolean;
}

// =====================================================
// COMPONENT
// =====================================================
export function AppHeader({
  showBreadcrumbs = true,
  showNotifications = true,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { toggleMobileSidebar } = useSidebar();
  const [notificationCount] = React.useState(3); // TODO: Connect to real notification system

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="md:hidden"
          title="Menüyü Aç"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">AP</span>
          </div>
          <span className="hidden sm:inline-block">Akademi Port</span>
        </Link>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="hidden lg:flex flex-1 items-center">
            <Breadcrumbs />
          </div>
        )}

        {/* Spacer */}
        {!showBreadcrumbs && <div className="flex-1" />}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button (Command Palette Trigger) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            title="Ara (Cmd+K)"
            onClick={() => {
              // Will be connected to Command Palette
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                ctrlKey: true,
              });
              document.dispatchEvent(event);
            }}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              title="Bildirimler"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

