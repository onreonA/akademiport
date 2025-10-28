import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'Atoms/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>This is an informational alert message.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert className="border-green-500 text-green-900 dark:text-green-100">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert className="border-yellow-500 text-yellow-900 dark:text-yellow-100">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>Please review your information before proceeding.</AlertDescription>
    </Alert>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>This alert only has a description without a title.</AlertDescription>
    </Alert>
  ),
};
