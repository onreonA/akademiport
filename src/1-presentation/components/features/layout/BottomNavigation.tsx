/**
 * Bottom Navigation Component
 * Mobile bottom navigation bar for quick access
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/presentation/lib/utils';
import { useAuth } from '@/shared/hooks/useAuth';
import { getNavigationByRole } from '@/shared/constants/navigation';
import { UserRole } from '@/domain/enums/UserRole';

// =====================================================
// COMPONENT
// =====================================================
export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const navigation = getNavigationByRole(user.role as UserRole);
  
  // Show only first 4 main items in bottom nav
  const bottomNavItems = navigation.main.slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-[10px]">{item.label}</span>
              {item.badge && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

