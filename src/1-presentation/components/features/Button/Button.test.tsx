/**
 * Button Component Accessibility Test
 *
 * Örnek component accessibility testi
 */

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoViolations, WCAG_AA_RULES } from '@/shared/test/accessibility-helpers';

// Mock Button component - replace with actual import
const Button = ({ children, onClick, ...props }: any) => (
  <button onClick={onClick} {...props}>
    {children}
  </button>
);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);

    await expectNoViolations(container, {
      rules: WCAG_AA_RULES,
    });
  });

  it('should have accessible name', async () => {
    const { container } = render(
      <>
        <Button aria-label="Close dialog">×</Button>
        <Button>Submit Form</Button>
      </>
    );

    await expectNoViolations(container, {
      rules: WCAG_AA_RULES,
    });
  });

  it('should be keyboard accessible', async () => {
    const { container } = render(<Button tabIndex={0}>Keyboard accessible</Button>);

    await expectNoViolations(container, {
      rules: WCAG_AA_RULES,
    });
  });
});
