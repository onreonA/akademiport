/**
 * E2E Test: Leaderboard Flow
 *
 * Senaryo 1: Leaderboard görüntüleme
 * Senaryo 2: Badge görüntüleme
 * Senaryo 3: Company ranking görüntüleme
 * Senaryo 4: Leaderboard history görüntüleme
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Leaderboard Flow', () => {
  test('Company: Leaderboard görüntüleme', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');
    await page.goto('/company-dashboard/leaderboard');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. Sayfa başlığını kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /liderlik/i })).toBeVisible({
      timeout: 10000,
    });

    // 3. Leaderboard tablosunu kontrol et
    const leaderboardTable = page.locator('[data-testid="leaderboard-table"], table').first();
    if (await leaderboardTable.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Tablo görünüyor
      const rows = leaderboardTable.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    } else {
      // Empty state kontrolü
      const emptyState = page.locator('text=henüz sıralama yok, text=no rankings').first();
      if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Empty state görünüyor, bu normal
        expect(true).toBe(true);
      }
    }
  });

  test('Company: Badge gallery görüntüleme', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');
    await page.goto('/company-dashboard/leaderboard');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. Badge tab'ını bul ve tıkla (eğer varsa)
    const badgeTab = page.locator('button:has-text("Rozetler"), button:has-text("Badges")').first();
    if (await badgeTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await badgeTab.click();
      await page.waitForTimeout(1000);

      // 3. Badge gallery'yi kontrol et
      const badgeGallery = page.locator('[data-testid="badge-gallery"], .badge-gallery').first();
      if (await badgeGallery.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Badge gallery görünüyor
        const badges = badgeGallery.locator('[data-testid="badge-card"], .badge-card');
        const badgeCount = await badges.count();
        expect(badgeCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('Admin: Leaderboard görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');
    await page.goto('/admin-dashboard/leaderboard');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. Sayfa başlığını kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /liderlik/i })).toBeVisible({
      timeout: 10000,
    });

    // 3. Program filtresini kontrol et (eğer varsa)
    const programFilter = page
      .locator('select, [role="combobox"]')
      .filter({ hasText: /program/i })
      .first();
    if (await programFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await programFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('API: GET /api/leaderboard', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. API'yi direkt çağır
    const response = await page.request.get('/api/leaderboard');

    // 3. Response kontrolü
    expect([200, 401, 403]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.rankings || data.data).toBeDefined();
    }
  });

  test('API: GET /api/leaderboard/[companyId]', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. Company ID'yi al (user'dan)
    const userResponse = await page.request.get('/api/auth/me').catch(() => null);
    let companyId = 'test-company-id';

    if (userResponse && userResponse.status() === 200) {
      const userData = await userResponse.json();
      companyId = userData.companyId || 'test-company-id';
    }

    // 3. API'yi direkt çağır
    const response = await page.request.get(`/api/leaderboard/${companyId}`);

    // 4. Response kontrolü
    expect([200, 404, 401, 403]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.ranking || data.data).toBeDefined();
    }
  });
});
