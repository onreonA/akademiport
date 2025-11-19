/**
 * E2E Test: Dashboard Flow
 *
 * Senaryo 1: Master Admin Dashboard
 * Senaryo 2: Consultant Dashboard
 * Senaryo 3: Company Dashboard
 * Senaryo 4: Dashboard Navigation
 * Senaryo 5: Dashboard Statistics
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Dashboard Flow', () => {
  test('Master Admin Dashboard', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Dashboard sayfasına git
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Dashboard başlığının göründüğünü kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|panel/i })).toBeVisible({
      timeout: 10000,
    });

    // 4. Dashboard istatistiklerinin göründüğünü kontrol et
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });

    // 5. Quick actions'ın göründüğünü kontrol et
    const quickActions = page.locator(
      'button:has-text("Yeni"), a:has-text("Yeni"), [class*="quick-action"]'
    );
    if ((await quickActions.count()) > 0) {
      await expect(quickActions.first()).toBeVisible();
    }

    // 6. Navigation menüsünün göründüğünü kontrol et
    const navMenu = page.locator('nav, [role="navigation"], [class*="nav"]');
    await expect(navMenu.first()).toBeVisible({ timeout: 10000 });
  });

  test('Consultant Dashboard', async ({ page }) => {
    // 1. Consultant olarak login
    await loginAs(page, 'consultant');

    // 2. Consultant dashboard'una git
    await page.goto('/consultant-dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Consultant dashboard başlığının göründüğünü kontrol et
    await expect(
      page.locator('h1, h2').filter({ hasText: /dashboard|panel|consultant/i })
    ).toBeVisible({ timeout: 10000 });

    // 4. Program selector'ün göründüğünü kontrol et (eğer varsa)
    const programSelector = page.locator(
      '[data-testid="program-selector"], select[name="program"], [class*="program-selector"]'
    );
    if ((await programSelector.count()) > 0) {
      await expect(programSelector.first()).toBeVisible();
    }

    // 5. Consultant istatistiklerinin göründüğünü kontrol et
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });

    // 6. Consultant-specific navigation'ın göründüğünü kontrol et
    const navMenu = page.locator('nav, [role="navigation"], [class*="nav"]');
    await expect(navMenu.first()).toBeVisible({ timeout: 10000 });
  });

  test('Company Dashboard', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Company dashboard'una git
    await page.goto('/company-dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Company dashboard başlığının göründüğünü kontrol et
    await expect(
      page.locator('h1, h2').filter({ hasText: /dashboard|panel|company|firma/i })
    ).toBeVisible({ timeout: 10000 });

    // 4. Company istatistiklerinin göründüğünü kontrol et
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });

    // 5. Company-specific navigation'ın göründüğünü kontrol et
    const navMenu = page.locator('nav, [role="navigation"], [class*="nav"]');
    await expect(navMenu.first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard Navigation', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Dashboard'a git
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Navigation linklerini kontrol et
    const navLinks = [
      { text: /kullanıcı|user/i, url: /\/dashboard\/users/ },
      { text: /firma|company/i, url: /\/dashboard\/companies/ },
      { text: /program/i, url: /\/dashboard\/programs/ },
      { text: /randevu|appointment/i, url: /\/dashboard\/appointments/ },
      { text: /etkinlik|event/i, url: /\/dashboard\/events/ },
      { text: /proje|project/i, url: /\/dashboard\/projects/ },
    ];

    for (const link of navLinks) {
      const navLink = page.locator(
        `a:has-text("${link.text.source}"), button:has-text("${link.text.source}")`
      );
      if ((await navLink.count()) > 0) {
        await navLink.first().click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(link.url, { timeout: 10000 });
        // Geri dön
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('Dashboard Statistics Loading', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Dashboard'a git
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Loading state'in göründüğünü kontrol et (eğer varsa)
    const loadingIndicator = page.locator(
      '[data-testid="loading"], .loading, [class*="spinner"], [class*="loader"]'
    );
    if ((await loadingIndicator.count()) > 0) {
      await expect(loadingIndicator.first()).toBeVisible({ timeout: 2000 });
    }

    // 4. Statistics'lerin yüklendiğini kontrol et
    await page.waitForTimeout(3000); // Statistics yüklenmesi için bekle
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });

    // 5. Charts'ın göründüğünü kontrol et (eğer varsa)
    const charts = page.locator('canvas, [data-testid="chart"], [class*="chart"]');
    if ((await charts.count()) > 0) {
      await expect(charts.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Dashboard Export Functionality', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Dashboard'a git
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Export butonunu bul (eğer varsa)
    const exportButton = page.locator(
      'button:has-text("Export"), button:has-text("Dışa Aktar"), [data-testid="export"]'
    );
    if ((await exportButton.count()) > 0) {
      await exportButton.first().click();
      await page.waitForTimeout(1000);

      // 4. Export menüsünün açıldığını kontrol et
      const exportMenu = page.locator(
        '[role="menu"], [data-testid="export-menu"], [class*="dropdown"]'
      );
      if ((await exportMenu.count()) > 0) {
        await expect(exportMenu.first()).toBeVisible();
      }
    }
  });
});
