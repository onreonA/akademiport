import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Authentication Flow
 * Tests the complete authentication flow including login, logout, and protected routes
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the login page
    await page.goto('/giris');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Giriş/i);

    // Check for email input
    await expect(page.getByPlaceholder(/e-posta/i)).toBeVisible();

    // Check for password input
    await expect(page.getByPlaceholder(/şifre/i)).toBeVisible();

    // Check for login button
    await expect(
      page.getByRole('button', { name: /giriş yap/i })
    ).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click login button without filling fields
    await page.getByRole('button', { name: /giriş yap/i }).click();

    // Wait for validation messages
    await page.waitForTimeout(500);

    // Check if we're still on login page (didn't navigate)
    await expect(page).toHaveURL(/giris/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByPlaceholder(/e-posta/i).fill('invalid@example.com');
    await page.getByPlaceholder(/şifre/i).fill('wrongpassword');

    // Click login
    await page.getByRole('button', { name: /giriş yap/i }).click();

    // Wait for response
    await page.waitForTimeout(1000);

    // Should still be on login page or show error
    const currentUrl = page.url();
    expect(currentUrl).toContain('giris');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in valid company user credentials
    await page.getByPlaceholder(/e-posta/i).fill('info@mundo.com');
    await page.getByPlaceholder(/şifre/i).fill('123456');

    // Click login
    await page.getByRole('button', { name: /giriş yap/i }).click();

    // Wait for navigation
    await page.waitForURL('**/firma', { timeout: 10000 });

    // Should be redirected to dashboard
    await expect(page).toHaveURL(/firma/);

    // Should see dashboard content
    await expect(page.getByText(/dashboard|panel/i)).toBeVisible();
  });

  test('should protect routes when not authenticated', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/firma/proje-yonetimi');

    // Should be redirected to login
    await page.waitForURL('**/giris', { timeout: 5000 });
    await expect(page).toHaveURL(/giris/);
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.getByPlaceholder(/e-posta/i).fill('info@mundo.com');
    await page.getByPlaceholder(/şifre/i).fill('123456');
    await page.getByRole('button', { name: /giriş yap/i }).click();

    // Wait for dashboard
    await page.waitForURL('**/firma', { timeout: 10000 });

    // Find and click logout button (might be in a menu)
    const logoutButton = page.getByRole('button', { name: /çıkış|logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }

    // Should be redirected to login
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('giris');
  });

  test('should handle admin login separately', async ({ page }) => {
    // Fill in admin credentials
    await page.getByPlaceholder(/e-posta/i).fill('admin@ihracatakademi.com');
    await page.getByPlaceholder(/şifre/i).fill('123456');

    // Click login
    await page.getByRole('button', { name: /giriş yap/i }).click();

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Should be redirected to admin dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin');
  });

  test('should remember user session after page reload', async ({ page }) => {
    // Login
    await page.getByPlaceholder(/e-posta/i).fill('info@mundo.com');
    await page.getByPlaceholder(/şifre/i).fill('123456');
    await page.getByRole('button', { name: /giriş yap/i }).click();

    // Wait for dashboard
    await page.waitForURL('**/firma', { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be on dashboard (not redirected to login)
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('firma');
  });
});
