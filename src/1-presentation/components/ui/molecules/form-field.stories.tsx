import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './form-field';

const meta: Meta<typeof FormField> = {
  title: 'Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    required: {
      control: 'boolean',
    },
    multiline: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'email@example.com',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your name',
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Password must be at least 8 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'email@example.com',
    error: 'Please enter a valid email address',
  },
};

export const Multiline: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter description...',
    multiline: true,
    rows: 5,
  },
};

export const CompleteForm: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <FormField label="Full Name" placeholder="John Doe" required />
      <FormField label="Email" type="email" placeholder="email@example.com" required />
      <FormField
        label="Phone"
        type="tel"
        placeholder="+90 555 123 4567"
        helperText="We'll never share your phone number"
      />
      <FormField label="Message" placeholder="Your message..." multiline rows={5} />
    </div>
  ),
};
