import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './theme-toggle';
import { ThemeProvider } from '@/shared/providers/theme-provider';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Molecules/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {};

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-xl font-semibold">Akademi Port</h1>
      <ThemeToggle />
    </div>
  ),
};

export const WithContent: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Theme Toggle Demo</h1>
        <ThemeToggle />
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-card border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Card Component</h2>
          <p className="text-muted-foreground">
            This card will change colors based on the selected theme.
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p>Muted background content</p>
        </div>
        <div className="p-4 bg-primary text-primary-foreground rounded-lg">
          <p>Primary colored content</p>
        </div>
      </div>
    </div>
  ),
};
