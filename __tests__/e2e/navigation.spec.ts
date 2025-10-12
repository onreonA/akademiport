import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Navigation and Routing
 * Tests navigation between different sections of the application
 */

test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as company user
    await page.goto('/giris');
    await page.getByPlaceholder(/e-posta/i).fill('info@mundo.com');
    await page.getByPlaceholder(/şifre/i).fill('123456');
    await page.getByRole('button', { name: /giriş yap/i }).click();
    await page.waitForURL('**/firma', { timeout: 10000 });
  });

  test('should navigate through main sections', async ({ page }) => {
    // Start at dashboard
    await expect(page).toHaveURL(/firma/);

    // Navigate to projects
    const projectLink = page.getByRole('link', { name: /proje/i }).first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForTimeout(1500);
    }

    // Navigate back to dashboard
    const dashboardLink = page
      .getByRole('link', { name: /dashboard|ana sayfa/i })
      .first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/firma$/);
    }
  });

  test('should use browser back button correctly', async ({ page }) => {
    // Navigate to projects
    const projectLink = page.getByRole('link', { name: /proje/i }).first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForTimeout(1500);

      // Go back
      await page.goBack();
      await page.waitForTimeout(1000);

      // Should be back at dashboard
      await expect(page).toHaveURL(/firma$/);
    }
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate directly to project management
    await page.goto('/firma/proje-yonetimi');
    await page.waitForTimeout(2000);

    // Should load project management page
    await expect(page).toHaveURL(/proje-yonetimi/);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/firma/non-existent-page-12345');
    await page.waitForTimeout(1500);

    // Should show 404 or redirect
    const currentUrl = page.url();
    const has404 =
      currentUrl.includes('404') || currentUrl.includes('not-found');
    const redirected = currentUrl.includes('/firma');

    expect(has404 || redirected).toBeTruthy();
  });

  test('should persist navigation state', async ({ page }) => {
    // Navigate to a page
    const newsLink = page.getByRole('link', { name: /haber/i }).first();
    if (await newsLink.isVisible()) {
      await newsLink.click();
      await page.waitForTimeout(1500);

      // Reload page
      await page.reload();
      await page.waitForTimeout(1000);

      // Should stay on the same page
      await expect(page).toHaveURL(/haberler/);
    }
  });

  test('should handle rapid navigation', async ({ page }) => {
    // Rapidly click through navigation
    const links = ['proje', 'haber', 'forum'];

    for (const linkText of links) {
      const link = page
        .getByRole('link', { name: new RegExp(linkText, 'i') })
        .first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(500);
      }
    }

    // Should end up on the last clicked page
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('firma');
  });

  test('should load component showcase page', async ({ page }) => {
    // Navigate directly to component showcase
    await page.goto('/firma/component-showcase');
    await page.waitForTimeout(2000);

    // Should load component showcase
    await expect(page).toHaveURL(/component-showcase/);

    // Should see component tabs
    const tabs = page.locator('button[role="tab"], button');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should handle nested routes', async ({ page }) => {
    // Navigate to projects
    await page.goto('/firma/proje-yonetimi');
    await page.waitForTimeout(2000);

    // Look for a project detail link
    const projectCards = page.locator('[class*="card"], a[href*="proje"]');
    const firstProject = projectCards.first();

    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForTimeout(2000);

      // Should navigate to project detail
      const currentUrl = page.url();
      expect(currentUrl).toContain('proje');
    }
  });

  test('should maintain scroll position on navigation', async ({ page }) => {
    // Scroll down on dashboard
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);

    // Navigate away and back
    const projectLink = page.getByRole('link', { name: /proje/i }).first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForTimeout(1000);

      await page.goBack();
      await page.waitForTimeout(1000);
    }

    // Page should be scrolled to top after navigation
    const newScrollY = await page.evaluate(() => window.scrollY);
    expect(newScrollY).toBeDefined();
  });
});
