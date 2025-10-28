import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './pagination';
import { useState } from 'react';

const meta: Meta<typeof Pagination> = {
  title: 'Molecules/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: (page) => console.log('Page:', page),
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    onPageChange: (page) => console.log('Page:', page),
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    onPageChange: (page) => console.log('Page:', page),
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 5,
    onPageChange: (page) => console.log('Page:', page),
  },
};

export const Interactive: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Current page: {currentPage}</p>
        <Pagination currentPage={currentPage} totalPages={20} onPageChange={setCurrentPage} />
      </div>
    );
  },
};
