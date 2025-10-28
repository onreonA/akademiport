import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './switch';
import { Label } from './label';

const meta: Meta<typeof Switch> = {
  title: 'Atoms/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    checked: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Notifications</Label>
        <Switch id="notifications" checked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="marketing">Marketing Emails</Label>
        <Switch id="marketing" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="updates">Product Updates</Label>
        <Switch id="updates" disabled />
      </div>
    </div>
  ),
};
