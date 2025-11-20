import type { Meta, StoryObj } from '@storybook/react';
import { AuthLayout } from './auth-layout';
import { FormField } from '../molecules/form-field';
import { Button } from '../atoms/button';
import { Separator } from '../atoms/separator';

const meta: Meta<typeof AuthLayout> = {
  title: 'Templates/AuthLayout',
  component: AuthLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Login: Story = {
  args: {
    title: 'Akademi Port',
    description: 'Sign in to your account',
    children: (
      <div className="space-y-4">
        <FormField label="Email" type="email" placeholder="email@example.com" />
        <FormField label="Password" type="password" placeholder="••••••••" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            Remember me
          </label>
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <Button className="w-full">Sign In</Button>
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a href="#" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    ),
    footer: <p>© 2025 Akademi Port. All rights reserved.</p>,
  },
};

export const SignUp: Story = {
  args: {
    title: 'Create Account',
    description: 'Get started with Akademi Port',
    children: (
      <div className="space-y-4">
        <FormField label="Full Name" placeholder="John Doe" required />
        <FormField label="Email" type="email" placeholder="email@example.com" required />
        <FormField
          label="Password"
          type="password"
          placeholder="••••••••"
          helperText="Must be at least 8 characters"
          required
        />
        <FormField label="Confirm Password" type="password" placeholder="••••••••" required />
        <Button className="w-full">Create Account</Button>
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="#" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    ),
  },
};

export const ForgotPassword: Story = {
  args: {
    title: 'Reset Password',
    description: 'Enter your email to receive a reset link',
    children: (
      <div className="space-y-4">
        <FormField
          label="Email"
          type="email"
          placeholder="email@example.com"
          helperText="We'll send you a password reset link"
        />
        <Button className="w-full">Send Reset Link</Button>
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <a href="#" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    ),
  },
};

export const WithBackground: Story = {
  args: {
    ...Login.args,
    backgroundImage: 'https://images.unsplash.com/photo-1557683316-973673baf926',
  },
};
