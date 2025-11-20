import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, DataTableColumn } from './data-table';
import { Badge } from '../atoms/badge';
import { Button } from '../atoms/button';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const sampleData: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'inactive' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User', status: 'active' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'active' },
];

const columns: DataTableColumn<User>[] = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
  },
  {
    key: 'role',
    title: 'Role',
    sortable: true,
    render: (value) => <Badge variant={value === 'Admin' ? 'default' : 'secondary'}>{value}</Badge>,
  },
  {
    key: 'status',
    title: 'Status',
    render: (value) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'}>{value}</Badge>
    ),
  },
  {
    key: 'actions',
    title: 'Actions',
    render: (_, row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          Edit
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    ),
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Organisms/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable<User>>;

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
};

export const WithSearch: Story = {
  args: {
    columns,
    data: sampleData,
    searchable: true,
    searchPlaceholder: 'Search users...',
    onSearch: (query) => console.log('Search:', query),
  },
};

export const WithSorting: Story = {
  args: {
    columns,
    data: sampleData,
    sortable: true,
    onSort: (key, direction) => console.log('Sort:', key, direction),
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    data: sampleData.slice(0, 3),
    pagination: {
      currentPage: 1,
      totalPages: 5,
      onPageChange: (page) => console.log('Page:', page),
    },
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'No users found',
  },
};

export const Complete: Story = {
  args: {
    columns,
    data: sampleData,
    searchable: true,
    sortable: true,
    pagination: {
      currentPage: 1,
      totalPages: 3,
      onPageChange: (page) => console.log('Page:', page),
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveDataTable() {
    const [data] = useState(sampleData);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
      <DataTable
        columns={columns}
        data={paginatedData}
        searchable
        sortable
        pagination={{
          currentPage,
          totalPages: Math.ceil(data.length / itemsPerPage),
          onPageChange: setCurrentPage,
        }}
      />
    );
  },
};
