/**
 * Card Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
  it('renders card with children', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <button>Footer Button</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /footer button/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-card-class" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card-class');
  });

  it('has correct data-slot attributes', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Title</CardTitle>
          <CardDescription data-testid="description">Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card');
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'card-header');
    expect(screen.getByTestId('title')).toHaveAttribute('data-slot', 'card-title');
    expect(screen.getByTestId('description')).toHaveAttribute('data-slot', 'card-description');
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'card-content');
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'card-footer');
  });
});
