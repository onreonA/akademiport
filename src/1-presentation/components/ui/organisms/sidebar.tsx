import * as React from 'react';
import { cn } from '@/presentation/lib/utils';
import { Button } from '../atoms/button';
import { ScrollArea } from '../atoms/scroll-area';
import { Separator } from '../atoms/separator';
import { ChevronLeft, LucideIcon } from 'lucide-react';

export interface SidebarNavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
}

export interface SidebarProps {
  items: SidebarNavItem[];
  isOpen?: boolean;
  onClose?: () => void;
  onItemClick?: (item: SidebarNavItem) => void;
  className?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ items, isOpen = true, onClose, onItemClick, className, logo, footer }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform duration-300 lg:static lg:translate-x-0',
          !isOpen && '-translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {logo || <h2 className="text-lg font-semibold">Akademi Port</h2>}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant={item.active ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !item.disabled && onItemClick?.(item)}
                  disabled={item.disabled}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        {footer && (
          <>
            <Separator />
            <div className="p-4">{footer}</div>
          </>
        )}
      </aside>
    );
  }
);
Sidebar.displayName = 'Sidebar';

export { Sidebar };
