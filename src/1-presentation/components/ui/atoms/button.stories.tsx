import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Button varyantı',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button boyutu',
    },
    disabled: {
      control: 'boolean',
      description: 'Button disabled durumu',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Primary (Default) Button
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'default',
  },
};

// Secondary Button
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

// Outline Button
export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

// Destructive Button
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

// Ghost Button
export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

// Link Button
export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

// Small Button
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

// Large Button
export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// Disabled Button
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

// With Icon (Left)
export const WithIconLeft: Story = {
  args: {
    children: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Add Item
      </>
    ),
  },
};

// With Icon (Right)
export const WithIconRight: Story = {
  args: {
    children: (
      <>
        Next
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </>
    ),
  },
};

// Full Width Button
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    className: 'w-full',
  },
};
