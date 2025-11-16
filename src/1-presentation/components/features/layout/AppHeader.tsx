/**
 * App Header Component
 * Main header with logo, breadcrumbs, notifications, theme toggle, and user menu
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, Bell, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { useSidebar } from '@/5-shared/contexts/SidebarContext';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';
import { NotificationCenter } from '@/1-presentation/components/features/notifications/NotificationCenter';

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
export function AppHeader({ showBreadcrumbs = true, showNotifications = true }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { toggleMobileSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="md:hidden h-9 w-9 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Menüyü Aç"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold group transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <span className="text-lg font-bold">AP</span>
          </div>
          <span className="hidden sm:inline-block text-gray-900 dark:text-white font-bold">
            AKADEMİ PORT
          </span>
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
            className="hidden md:flex h-9 w-9 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Notifications */}
          {showNotifications && <NotificationCenter />}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
          >
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 text-gray-600 dark:text-gray-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
