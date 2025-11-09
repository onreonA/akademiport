/**
 * Badge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Badge variant="destructive">Error</Badge>);
    let badge = screen.getByText('Error');
    expect(badge).toHaveClass('bg-red-600');

    rerender(<Badge variant="outline">Outline</Badge>);
    badge = screen.getByText('Outline');
    expect(badge).toHaveClass('border');

    rerender(<Badge variant="secondary">Secondary</Badge>);
    badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-gray-100');
  });

  it('applies default variant when not specified', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-primary');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-badge-class">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-badge-class');
  });

  it('has correct data-slot attribute', () => {
    render(<Badge data-testid="badge">Test</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    );
    const link = screen.getByRole('link', { name: /link badge/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});
