import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from './search-input';
import { useState } from 'react';

const meta: Meta<typeof SearchInput> = {
  title: 'Molecules/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Search...',
    value: 'Search query',
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <SearchInput
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue('')}
      />
    );
  },
};

export const WithoutClearButton: Story = {
  args: {
    placeholder: 'Search...',
    value: 'Search query',
    showClearButton: false,
  },
};
