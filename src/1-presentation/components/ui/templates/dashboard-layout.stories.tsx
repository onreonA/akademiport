import type { Meta, StoryObj } from '@storybook/react';
import { DashboardLayout } from './dashboard-layout';
import { SidebarNavItem } from '../organisms/sidebar';
import { Home, Users, Building2, BookOpen, Calendar, Settings, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../atoms/card';

const sidebarItems: SidebarNavItem[] = [
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

const meta: Meta<typeof DashboardLayout> = {
  title: 'Templates/DashboardLayout',
  component: DashboardLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardLayout>;

export const Default: Story = {
  args: {
    sidebarItems,
    user: {
      name: 'Ömer Ünsal',
      email: 'omer@akademiport.com',
    },
    title: 'Dashboard',
    onSidebarItemClick: (item) => console.log('Clicked:', item.title),
    onProfileClick: () => console.log('Profile clicked'),
    onSettingsClick: () => console.log('Settings clicked'),
    onLogoutClick: () => console.log('Logout clicked'),
    children: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your programs.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">+18 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">+32 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Next event in 2 days</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your programs</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Recent activity content goes here...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Quick actions content goes here...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    ...Default.args,
    sidebarFooter: (
      <div className="text-xs text-muted-foreground">
        <p>© 2025 Akademi Port</p>
        <p>Version 1.0.0</p>
      </div>
    ),
  },
};
