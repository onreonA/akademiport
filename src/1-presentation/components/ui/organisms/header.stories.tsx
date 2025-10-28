import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './header';

const meta: Meta<typeof Header> = {
  title: 'Organisms/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    title: 'Akademi Port',
    user: {
      name: 'Ömer Ünsal',
      email: 'omer@akademiport.com',
    },
    onMenuClick: () => console.log('Menu clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSettingsClick: () => console.log('Settings clicked'),
    onLogoutClick: () => console.log('Logout clicked'),
  },
};

export const WithAvatar: Story = {
  args: {
    title: 'Dashboard',
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://github.com/shadcn.png',
    },
    onMenuClick: () => console.log('Menu clicked'),
  },
};

export const WithoutMenuButton: Story = {
  args: {
    title: 'Akademi Port',
    showMenuButton: false,
    user: {
      name: 'Ömer Ünsal',
      email: 'omer@akademiport.com',
    },
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Akademi Port - E-İhracat Dönüşüm Platformu',
    user: {
      name: 'Ömer Ünsal',
      email: 'omer@akademiport.com',
    },
  },
};
