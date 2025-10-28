import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, SidebarNavItem } from './sidebar';
import { Home, Users, Building2, BookOpen, Calendar, Settings, BarChart } from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const navItems: SidebarNavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    active: true,
  },
  {
    title: 'Programs',
    href: '/programs',
    icon: BookOpen,
    badge: '3',
  },
  {
    title: 'Companies',
    href: '/companies',
    icon: Building2,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Events',
    href: '/events',
    icon: Calendar,
    badge: '5',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Default: Story = {
  args: {
    items: navItems,
    isOpen: true,
    onItemClick: (item) => console.log('Clicked:', item.title),
  },
};

export const WithFooter: Story = {
  args: {
    items: navItems,
    isOpen: true,
    footer: (
      <div className="text-xs text-muted-foreground">
        <p>© 2025 Akademi Port</p>
        <p>Version 1.0.0</p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [items, setItems] = useState(navItems);

    const handleItemClick = (clickedItem: SidebarNavItem) => {
      setItems(
        items.map((item) => ({
          ...item,
          active: item.href === clickedItem.href,
        }))
      );
    };

    return (
      <div className="relative h-screen">
        <Sidebar
          items={items}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onItemClick={handleItemClick}
        />
        <div className="lg:ml-64 p-8">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden mb-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Toggle Sidebar
          </button>
          <h1 className="text-2xl font-bold">Main Content</h1>
          <p className="mt-4">Click on sidebar items to see the active state change.</p>
        </div>
      </div>
    );
  },
};
