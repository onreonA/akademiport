/**
 * Command Palette Component
 * Spotlight-style quick navigation (Cmd+K)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/presentation/components/ui/atoms/command';
import { Clock, Search } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRecentPages } from '@/shared/hooks/useRecentPages';
import { getNavigationByRole } from '@/shared/constants/navigation';
import { UserRole } from '@/domain/enums/UserRole';

// =====================================================
// COMPONENT
// =====================================================
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const recentPages = useRecentPages();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!user) return null;

  const navigation = getNavigationByRole(user.role as UserRole);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Sayfa ara veya komut çalıştır..." />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>

        {/* Recent Pages */}
        {recentPages.length > 0 && (
          <>
            <CommandGroup heading="Son Ziyaretler">
              {recentPages.slice(0, 5).map((page) => (
                <CommandItem
                  key={page.path}
                  onSelect={() => handleSelect(page.path)}
                  className="cursor-pointer"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{page.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Main Navigation */}
        <CommandGroup heading="Ana Menü">
          {navigation.main.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.href)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs text-muted-foreground">{item.badge}</span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Sub-menu Items */}
        {navigation.main
          .filter((item) => item.children && item.children.length > 0)
          .map((item) => (
            <React.Fragment key={`group-${item.id}`}>
              <CommandSeparator />
              <CommandGroup heading={item.label}>
                {item.children!.map((child) => (
                  <CommandItem
                    key={child.id}
                    onSelect={() => handleSelect(child.href)}
                    className="cursor-pointer"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>{child.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}

        {/* Bottom Navigation */}
        {navigation.bottom.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Diğer">
              {navigation.bottom.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.href)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
