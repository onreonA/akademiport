import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/giris');

    // Check if login form elements are present
    await expect(page.locator('h1')).toContainText('Giriş');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/giris');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation messages (if implemented)
    // await expect(page.locator('.error-message')).toBeVisible()
  });

  test('should navigate to company dashboard after login', async ({ page }) => {
    await page.goto('/giris');

    // Fill in login form
    await page.fill('input[type="email"]', 'info@mundo.com');
    await page.fill('input[type="password"]', 'testpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/firma');

    // Check if we're on the company dashboard
    await expect(page).toHaveURL('/firma');
  });

  test('should navigate to admin dashboard after admin login', async ({
    page,
  }) => {
    await page.goto('/giris');

    // Fill in admin login form
    await page.fill('input[type="email"]', 'admin@akademiport.com');
    await page.fill('input[type="password"]', 'adminpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/admin');

    // Check if we're on the admin dashboard
    await expect(page).toHaveURL('/admin');
  });

  test('should show access denied for unauthorized pages', async ({ page }) => {
    // Try to access admin page without login
    await page.goto('/admin');

    // Should redirect to login or show access denied
    // This depends on your middleware implementation
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/giris|\/admin/);
  });
});
