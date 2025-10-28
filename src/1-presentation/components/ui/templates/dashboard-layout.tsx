import * as React from 'react';
import { cn } from '@/presentation/lib/utils';
import { Header } from '../organisms/header';
import { Sidebar, SidebarNavItem } from '../organisms/sidebar';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarNavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  title?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onSidebarItemClick?: (item: SidebarNavItem) => void;
  sidebarLogo?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  className?: string;
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  (
    {
      children,
      sidebarItems,
      user,
      title,
      onProfileClick,
      onSettingsClick,
      onLogoutClick,
      onSidebarItemClick,
      sidebarLogo,
      sidebarFooter,
      className,
    },
    ref
  ) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
      <div ref={ref} className={cn('min-h-screen bg-background', className)}>
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onItemClick={onSidebarItemClick}
          logo={sidebarLogo}
          footer={sidebarFooter}
        />

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Header */}
          <Header
            title={title}
            user={user}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onProfileClick={onProfileClick}
            onSettingsClick={onSettingsClick}
            onLogoutClick={onLogoutClick}
          />

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    );
  }
);
DashboardLayout.displayName = 'DashboardLayout';

export { DashboardLayout };
