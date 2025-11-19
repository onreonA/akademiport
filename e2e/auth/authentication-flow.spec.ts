/**
 * E2E Test: Authentication Flow
 *
 * Senaryo 1: Login → Logout
 * Senaryo 2: Role-based Access Control
 * Senaryo 3: Session Management
 * Senaryo 4: Protected Route Access
 * Senaryo 5: Invalid Credentials
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Authentication Flow', () => {
  test('Login → Logout', async ({ page }) => {
    // 1. Login sayfasına git
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 2. Login form'unun görünür olduğunu kontrol et
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();

    // 3. Admin olarak login
    await loginAs(page, 'admin');

    // 4. Dashboard'a yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 5. Logout butonunu bul ve tıkla
    const logoutButton = page.locator(
      'button:has-text("Çıkış"), button:has-text("Logout"), [data-testid="logout"]'
    );
    if ((await logoutButton.count()) > 0) {
      await logoutButton.first().click();
    } else {
      // Alternatif: Logout endpoint'ine direkt istek
      await page.goto('/api/auth/signout');
      await page.waitForTimeout(1000);
    }

    // 6. Login sayfasına yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('Role-based Access Control - Master Admin', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Master Admin dashboard'una erişebildiğini kontrol et
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|panel/i })).toBeVisible({
      timeout: 10000,
    });

    // 3. Admin-only sayfalara erişebildiğini kontrol et
    await page.goto('/dashboard/users');
    await expect(page).toHaveURL(/\/dashboard\/users/, { timeout: 10000 });

    await page.goto('/dashboard/companies');
    await expect(page).toHaveURL(/\/dashboard\/companies/, { timeout: 10000 });

    await page.goto('/dashboard/programs');
    await expect(page).toHaveURL(/\/dashboard\/programs/, { timeout: 10000 });
  });

  test('Role-based Access Control - Consultant', async ({ page }) => {
    // 1. Consultant olarak login
    await loginAs(page, 'consultant');

    // 2. Consultant dashboard'una yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/\/consultant-dashboard/, { timeout: 10000 });

    // 3. Consultant dashboard'unun görünür olduğunu kontrol et
    await expect(
      page.locator('h1, h2').filter({ hasText: /dashboard|panel|consultant/i })
    ).toBeVisible({ timeout: 10000 });

    // 4. Admin-only sayfalara erişemediğini kontrol et
    await page.goto('/dashboard/users');
    // Ya unauthorized mesajı görmeli ya da consultant dashboard'a yönlendirilmeli
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/dashboard/users');
  });

  test('Role-based Access Control - Company User', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Company dashboard'una yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/\/company-dashboard/, { timeout: 10000 });

    // 3. Company dashboard'unun görünür olduğunu kontrol et
    await expect(
      page.locator('h1, h2').filter({ hasText: /dashboard|panel|company|firma/i })
    ).toBeVisible({ timeout: 10000 });

    // 4. Admin-only sayfalara erişemediğini kontrol et
    await page.goto('/dashboard/users');
    // Ya unauthorized mesajı görmeli ya da company dashboard'a yönlendirilmeli
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/dashboard/users');
  });

  test('Session Management - Protected Route Access', async ({ page }) => {
    // 1. Login olmadan protected route'a erişmeyi dene
    await page.goto('/dashboard');

    // 2. Login sayfasına yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // 3. Login yap
    await loginAs(page, 'admin');

    // 4. Protected route'a erişebildiğini kontrol et
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('Invalid Credentials', async ({ page }) => {
    // 1. Login sayfasına git
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 2. Geçersiz credentials ile login dene
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Giriş"), button:has-text("Login")'
    );

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');

    await Promise.all([
      page
        .waitForResponse(
          (response) => response.url().includes('/api/auth/signin') && response.status() === 401,
          { timeout: 10000 }
        )
        .catch(() => null),
      submitButton.first().click(),
    ]);

    // 3. Hata mesajının göründüğünü kontrol et
    await expect(
      page.locator(
        'text=Email veya şifre hatalı, text=Giriş başarısız, text=Invalid, [role="alert"]'
      )
    ).toBeVisible({ timeout: 10000 });

    // 4. Hala login sayfasında olduğunu kontrol et
    await expect(page).toHaveURL(/\/login/);
  });

  test('Redirect After Login', async ({ page }) => {
    // 1. Protected route'a git (login olmadan)
    await page.goto('/dashboard/appointments');

    // 2. Login sayfasına yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // 3. Login yap
    await loginAs(page, 'admin');

    // 4. Orijinal route'a yönlendirildiğini kontrol et (veya dashboard'a)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    // Ya appointments sayfasına ya da dashboard'a yönlendirilmiş olmalı
    expect(currentUrl).toMatch(/\/dashboard/);
  });
});
