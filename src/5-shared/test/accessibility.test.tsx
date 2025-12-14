/**
 * Accessibility Test Suite
 *
 * WCAG compliance testleri için temel test suite'i
 * 
 * NOTE: Accessibility tests are done in E2E tests using @axe-core/playwright
 * This file is kept for reference but tests are skipped in unit tests
 * because jest-axe is not compatible with Vitest
 */

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoViolations, WCAG_AA_RULES } from './accessibility-helpers';

describe.skip('Accessibility Tests', () => {
  describe('WCAG 2.1 Level AA Compliance', () => {
    it('should have no accessibility violations for basic HTML structure', async () => {
      const { container } = render(
        <div>
          <header>
            <h1>Page Title</h1>
            <nav>
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/about">About</a>
                </li>
              </ul>
            </nav>
          </header>
          <main>
            <section>
              <h2>Section Title</h2>
              <p>Content goes here.</p>
            </section>
          </main>
          <footer>
            <p>Footer content</p>
          </footer>
        </div>
      );

      await expectNoViolations(container, {
        rules: WCAG_AA_RULES,
      });
    });

    it('should have proper form labels', async () => {
      const { container } = render(
        <form>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" />
          <button type="submit">Submit</button>
        </form>
      );

      await expectNoViolations(container, {
        rules: WCAG_AA_RULES,
      });
    });

    it('should have proper image alt text', async () => {
      const { container } = render(
        <div>
          <img src="/test.jpg" alt="Test image description" />
          <img src="/decorative.jpg" alt="" role="presentation" />
        </div>
      );

      await expectNoViolations(container, {
        rules: WCAG_AA_RULES,
      });
    });

    it('should have proper heading hierarchy', async () => {
      const { container } = render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
          <h2>Another Section</h2>
        </div>
      );

      await expectNoViolations(container, {
        rules: WCAG_AA_RULES,
      });
    });

    it('should have proper ARIA attributes', async () => {
      const { container } = render(
        <div>
          <button aria-label="Close dialog">×</button>
          <div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
            <h2 id="dialog-title">Dialog Title</h2>
            <p>Dialog content</p>
          </div>
          <div role="alert" aria-live="polite">
            Alert message
          </div>
        </div>
      );

      await expectNoViolations(container, {
        rules: WCAG_AA_RULES,
      });
    });

    it('should have keyboard accessible interactive elements', async () => {
      const { container } = render(
        <div>
          <button onClick={() => {}}>Click me</button>
          <a href="/link">Link</a>
          <input type="text" />
          <select>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      );

      await expectNoViolations(container, {
        rules: WCAG_AA_RULES,
      });
    });
  });
});

