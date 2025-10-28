import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'muted', 'white'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'default',
    variant: 'default',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'default',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'default',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    size: 'default',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    size: 'default',
    variant: 'destructive',
  },
};

export const WithLabel: Story = {
  args: {
    size: 'default',
    variant: 'default',
    label: 'Yükleniyor...',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="default" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner variant="default" />
      <Spinner variant="secondary" />
      <Spinner variant="destructive" />
      <Spinner variant="muted" />
    </div>
  ),
};
