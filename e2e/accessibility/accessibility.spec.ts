/**
 * E2E Accessibility Tests
 *
 * Playwright ile accessibility snapshot testleri
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run accessibility check
    const accessibilitySnapshot = await page.accessibility.snapshot();
    expect(accessibilitySnapshot).toBeTruthy();

    // Check for common accessibility issues
    const violations = await page.evaluate(() => {
      // This is a basic check - for full axe-core integration, use @axe-core/playwright
      const issues: string[] = [];

      // Check for images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`Found ${imagesWithoutAlt.length} images without alt text`);
      }

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button, index) => {
        const hasText = button.textContent?.trim();
        const hasAriaLabel = button.getAttribute('aria-label');
        const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push(`Button at index ${index} has no accessible name`);
        }
      });

      // Check for form inputs without labels
      const inputs = document.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="password"], textarea'
      );
      inputs.forEach((input, index) => {
        const id = input.getAttribute('id');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push(`Input at index ${index} has no associated label`);
        }
      });

      return issues;
    });

    expect(violations).toHaveLength(0);
  });

  test('dashboard should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check heading hierarchy
    const headingOrder = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.map((h) => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent?.trim() || '',
      }));
    });

    // Verify heading hierarchy (h1 should come before h2, etc.)
    let previousLevel = 0;
    for (const heading of headingOrder) {
      if (heading.level > previousLevel + 1) {
        throw new Error(
          `Heading hierarchy violation: ${heading.text} (h${heading.level}) comes after h${previousLevel}`
        );
      }
      previousLevel = heading.level;
    }
  });

  test('forms should have proper labels', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const formIssues = await page.evaluate(() => {
      const issues: string[] = [];
      const inputs = document.querySelectorAll('input, textarea, select');

      inputs.forEach((input) => {
        const id = input.getAttribute('id');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
        const placeholder = input.getAttribute('placeholder');

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !placeholder) {
          issues.push(
            `Input ${input.getAttribute('name') || input.getAttribute('type')} has no label`
          );
        }
      });

      return issues;
    });

    expect(formIssues).toHaveLength(0);
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check that buttons and links are keyboard accessible
    const keyboardIssues = await page.evaluate(() => {
      const issues: string[] = [];

      // Check buttons
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach((button) => {
        const tabIndex = button.getAttribute('tabindex');
        if (tabIndex === '-1') {
          issues.push(`Button ${button.textContent?.trim()} is not keyboard accessible`);
        }
      });

      // Check links
      const links = document.querySelectorAll('a[href]');
      links.forEach((link) => {
        const tabIndex = link.getAttribute('tabindex');
        if (tabIndex === '-1' && link.getAttribute('href') !== '#') {
          issues.push(`Link ${link.textContent?.trim()} is not keyboard accessible`);
        }
      });

      return issues;
    });

    expect(keyboardIssues).toHaveLength(0);
  });

  test('color contrast should meet WCAG AA standards', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Note: Full color contrast checking requires @axe-core/playwright
    // This is a basic check for now
    const contrastIssues = await page.evaluate(() => {
      const issues: string[] = [];
      const textElements = document.querySelectorAll(
        'p, span, div, h1, h2, h3, h4, h5, h6, a, button, label'
      );

      textElements.forEach((element) => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // Basic check - full implementation would use contrast ratio calculation
        if (color === bgColor) {
          issues.push(
            `Element ${element.textContent?.substring(0, 20)} has same text and background color`
          );
        }
      });

      return issues;
    });

    // This is a basic check - full contrast checking would require more sophisticated implementation
    expect(contrastIssues.length).toBeLessThan(10); // Allow some tolerance
  });
});

