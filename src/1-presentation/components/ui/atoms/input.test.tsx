/**
 * Input Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { Input } from './input';
import userEvent from '@testing-library/user-event';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('handles text input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;

    await user.type(input, 'Hello World');

    expect(input.value).toBe('Hello World');
  });

  it('handles onChange events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={handleChange} placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');

    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    let input = screen.getByPlaceholderText('Email') as HTMLInputElement;
    expect(input.type).toBe('email');

    rerender(<Input type="password" placeholder="Password" />);
    input = screen.getByPlaceholderText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-input-class');
  });

  it('has correct data-slot attribute', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('supports aria-invalid attribute', () => {
    render(<Input aria-invalid="true" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('aria-invalid:border-red-500');
  });
});
