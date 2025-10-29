/**
 * Sidebar Menu Item Component
 * Individual menu item with icon, label, badge, and sub-menu support
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
          isActive && 'bg-accent text-accent-foreground',
          isCollapsed && 'justify-center px-2'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
            
            {hasChildren && (
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </>
        )}
      </Link>

      {/* Sub-menu */}
      {hasChildren && !isCollapsed && isExpanded && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children!.map((child) => {
            const isChildActive = pathname === child.href;
            return (
              <Link
                key={child.id}
                href={child.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-all hover:bg-accent',
                  isChildActive && 'bg-accent font-medium text-accent-foreground'
                )}
              >
                {child.label}
                {child.badge && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {child.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

