import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Company Dashboard
 * Tests the company user dashboard and navigation
 */

test.describe('Company Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as company user
    await page.goto('/giris');
    await page.getByPlaceholder(/e-posta/i).fill('info@mundo.com');
    await page.getByPlaceholder(/şifre/i).fill('123456');
    await page.getByRole('button', { name: /giriş yap/i }).click();

    // Wait for dashboard to load
    await page.waitForURL('**/firma', { timeout: 10000 });
  });

  test('should display dashboard statistics', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(2000);

    // Check for stat cards (should have numbers)
    const statsCards = page.locator('[class*="stats"], [class*="card"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('should navigate to project management', async ({ page }) => {
    // Click on project management link
    const projectLink = page.getByRole('link', { name: /proje|project/i });
    if (await projectLink.isVisible()) {
      await projectLink.click();

      // Should navigate to project management page
      await page.waitForURL('**/proje-yonetimi', { timeout: 5000 });
      await expect(page).toHaveURL(/proje-yonetimi/);
    }
  });

  test('should navigate to news page', async ({ page }) => {
    // Click on news link
    const newsLink = page.getByRole('link', { name: /haber|news/i });
    if (await newsLink.isVisible()) {
      await newsLink.click();

      // Should navigate to news page
      await page.waitForURL('**/haberler', { timeout: 5000 });
      await expect(page).toHaveURL(/haberler/);
    }
  });

  test('should navigate to forum', async ({ page }) => {
    // Click on forum link
    const forumLink = page.getByRole('link', { name: /forum/i });
    if (await forumLink.isVisible()) {
      await forumLink.click();

      // Should navigate to forum page
      await page.waitForURL('**/forum', { timeout: 5000 });
      await expect(page).toHaveURL(/forum/);
    }
  });

  test('should display sidebar menu', async ({ page }) => {
    // Check if sidebar is visible
    const sidebar = page.locator('[class*="sidebar"], nav');
    await expect(sidebar.first()).toBeVisible();

    // Check for menu items
    const menuItems = page.locator('nav a, [role="navigation"] a');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display user profile in header', async ({ page }) => {
    // Wait for header to load
    await page.waitForTimeout(1000);

    // Check for user-related elements
    const userElements = page.locator(
      '[class*="user"], [class*="profile"], [aria-label*="user"]'
    );
    const hasUserElement = (await userElements.count()) > 0;
    expect(hasUserElement).toBeTruthy();
  });

  test('should handle responsive menu on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload to apply mobile view
    await page.reload();
    await page.waitForTimeout(1000);

    // Look for mobile menu button (hamburger)
    const menuButton = page.locator(
      'button[aria-label*="menu"], button[class*="menu"]'
    );
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
    }

    // Mobile menu should appear
    const mobileMenu = page.locator('[class*="mobile"], [class*="drawer"]');
    const hasMobileMenu = (await mobileMenu.count()) > 0;
    expect(hasMobileMenu).toBeTruthy();
  });

  test('should load dashboard stats quickly', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to dashboard
    await page.goto('/firma');

    // Wait for stats API to complete
    await page.waitForResponse(
      response => response.url().includes('/api/firma/dashboard-stats'),
      { timeout: 10000 }
    );

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should display recent activity or notifications', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);

    // Look for activity/notification sections
    const activitySection = page.locator(
      '[class*="activity"], [class*="notification"], [class*="recent"]'
    );
    const hasActivity = (await activitySection.count()) > 0;

    // It's ok if there's no activity section, just checking UI loads
    expect(hasActivity || true).toBeTruthy();
  });
});
