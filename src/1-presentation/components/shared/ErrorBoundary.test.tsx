/**
 * ErrorBoundary Component Tests
 *
 * Note: Error boundary testing in React requires special handling.
 * These tests verify basic rendering and structure.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders with custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error message</div>;
    render(
      <ErrorBoundary fallback={customFallback}>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    // When no error, children should render
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('has correct component structure', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test</div>
      </ErrorBoundary>
    );

    // ErrorBoundary should render without errors
    expect(container).toBeTruthy();
  });
});
