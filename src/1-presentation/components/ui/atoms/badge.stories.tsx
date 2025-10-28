import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Badge varyantı',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Default Badge
export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
};

// Secondary Badge
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

// Destructive Badge
export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

// Outline Badge
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

// With Icon
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Completed
      </>
    ),
    variant: 'default',
  },
};

// Status Badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">✅ Tamamlandı</Badge>
      <Badge variant="secondary">🏃 Devam Ediyor</Badge>
      <Badge variant="outline">📋 Planlandı</Badge>
      <Badge variant="destructive">⚠️ Bloke</Badge>
    </div>
  ),
};

// Sprint Badges
export const SprintBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-primary">Sprint 1</Badge>
      <Badge className="bg-secondary">Sprint 2</Badge>
      <Badge className="bg-accent">Sprint 3</Badge>
      <Badge className="bg-gradient-to-r from-primary to-secondary">Premium</Badge>
    </div>
  ),
};

