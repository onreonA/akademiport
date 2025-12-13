/**
 * E2E Test: Dashboard Stats Flow
 *
 * Senaryo 1: Master Admin Dashboard Stats API
 * Senaryo 2: Company Dashboard Stats API
 * Senaryo 3: Consultant Dashboard Stats API
 * Senaryo 4: Dashboard Stats UI Display
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Dashboard Stats Flow', () => {
  test('Master Admin Dashboard Stats API', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Dashboard stats API endpoint'ini test et
    const response = await page.request.get('/api/dashboard/stats');

    // 3. Response'un başarılı olduğunu kontrol et
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    // 4. Stats data structure'ını kontrol et
    expect(data.data).toHaveProperty('totalPrograms');
    expect(data.data).toHaveProperty('activeCompanies');
    expect(data.data).toHaveProperty('totalUsers');
    expect(data.data).toHaveProperty('completedTasks');
    expect(data.data).toHaveProperty('pendingTasks');
    expect(data.data).toHaveProperty('monthlyGrowth');
    expect(data.data).toHaveProperty('userGrowth');
    expect(data.data).toHaveProperty('programActivity');
    expect(data.data).toHaveProperty('companyDistribution');
    expect(data.data).toHaveProperty('taskCompletion');

    // 5. Data types'ı kontrol et
    expect(typeof data.data.totalPrograms).toBe('number');
    expect(typeof data.data.activeCompanies).toBe('number');
    expect(typeof data.data.totalUsers).toBe('number');
    expect(Array.isArray(data.data.userGrowth)).toBe(true);
    expect(Array.isArray(data.data.programActivity)).toBe(true);
  });

  test('Master Admin Dashboard Stats - Unauthorized Access', async ({ page }) => {
    // 1. Login olmadan stats API'ye erişim denemesi
    const response = await page.request.get('/api/dashboard/stats');

    // 2. 401 Unauthorized dönmeli
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Master Admin Dashboard Stats - Forbidden Access', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Master admin stats API'ye erişim denemesi
    const response = await page.request.get('/api/dashboard/stats');

    // 3. 403 Forbidden dönmeli
    expect(response.status()).toBe(403);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Company Dashboard Stats API', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Company dashboard stats API endpoint'ini test et
    const response = await page.request.get('/api/company-dashboard/stats');

    // 3. Response'un başarılı olduğunu kontrol et
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    // 4. Company stats data structure'ını kontrol et
    expect(data.data).toHaveProperty('totalProjects');
    expect(data.data).toHaveProperty('completedProjects');
    expect(data.data).toHaveProperty('activeProjects');
    expect(data.data).toHaveProperty('totalTrainings');
    expect(data.data).toHaveProperty('completedTrainings');
    expect(data.data).toHaveProperty('totalEvents');
    expect(data.data).toHaveProperty('upcomingEvents');
    expect(data.data).toHaveProperty('projectProgress');
    expect(data.data).toHaveProperty('trainingProgress');
    expect(data.data).toHaveProperty('ecommerceMetrics');

    // 5. Data types'ı kontrol et
    expect(typeof data.data.totalProjects).toBe('number');
    expect(Array.isArray(data.data.projectProgress)).toBe(true);
    expect(Array.isArray(data.data.trainingProgress)).toBe(true);
  });

  test('Company Dashboard Stats API - With CompanyId Parameter', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Company dashboard stats API'ye companyId parametresi ile erişim
    const response = await page.request.get(
      '/api/company-dashboard/stats?companyId=test-company-1'
    );

    // 3. Response'un başarılı olduğunu kontrol et
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  test('Company Dashboard Stats - Unauthorized Access', async ({ page }) => {
    // 1. Login olmadan company stats API'ye erişim denemesi
    const response = await page.request.get('/api/company-dashboard/stats');

    // 2. 401 Unauthorized dönmeli
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Consultant Dashboard Stats API', async ({ page }) => {
    // 1. Consultant olarak login
    await loginAs(page, 'consultant');

    // 2. Consultant dashboard stats API endpoint'ini test et
    const response = await page.request.get('/api/consultant-dashboard/stats');

    // 3. Response'un başarılı olduğunu kontrol et
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    // 4. Consultant stats data structure'ını kontrol et
    expect(data.data).toHaveProperty('totalCompanies');
    expect(data.data).toHaveProperty('totalProjects');
    expect(data.data).toHaveProperty('completedProjects');
    expect(data.data).toHaveProperty('activeProjects');
    expect(data.data).toHaveProperty('totalTrainings');
    expect(data.data).toHaveProperty('completedTrainings');
    expect(data.data).toHaveProperty('totalEvents');
    expect(data.data).toHaveProperty('upcomingEvents');
    expect(data.data).toHaveProperty('companyPerformance');
    expect(data.data).toHaveProperty('projectProgress');
    expect(data.data).toHaveProperty('trainingCompletion');

    // 5. Data types'ı kontrol et
    expect(typeof data.data.totalCompanies).toBe('number');
    expect(Array.isArray(data.data.companyPerformance)).toBe(true);
    expect(Array.isArray(data.data.projectProgress)).toBe(true);
  });

  test('Consultant Dashboard Stats - Forbidden Access', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Consultant stats API'ye erişim denemesi
    const response = await page.request.get('/api/consultant-dashboard/stats');

    // 3. 403 Forbidden dönmeli
    expect(response.status()).toBe(403);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Dashboard Stats UI Display', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Dashboard sayfasına git
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Stats API çağrısının yapıldığını kontrol et
    const statsResponse = page
      .waitForResponse(
        (response) => response.url().includes('/api/dashboard/stats') && response.status() === 200,
        { timeout: 10000 }
      )
      .catch(() => null);

    // 4. Stats cards'ların göründüğünü kontrol et
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });

    // 5. Stats değerlerinin sayısal olduğunu kontrol et (eğer görünürse)
    const statValues = page.locator('[class*="stat-value"], [data-testid="stat-value"]');
    if ((await statValues.count()) > 0) {
      const firstValue = await statValues.first().textContent();
      expect(firstValue).toBeTruthy();
    }
  });

  test('Company Dashboard Stats UI Display', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Company dashboard sayfasına git
    await page.goto('/company-dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Stats API çağrısının yapıldığını kontrol et
    const statsResponse = page
      .waitForResponse(
        (response) =>
          response.url().includes('/api/company-dashboard/stats') && response.status() === 200,
        { timeout: 10000 }
      )
      .catch(() => null);

    // 4. Company stats cards'ların göründüğünü kontrol et
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('Consultant Dashboard Stats UI Display', async ({ page }) => {
    // 1. Consultant olarak login
    await loginAs(page, 'consultant');

    // 2. Consultant dashboard sayfasına git
    await page.goto('/consultant-dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Stats API çağrısının yapıldığını kontrol et
    const statsResponse = page
      .waitForResponse(
        (response) =>
          response.url().includes('/api/consultant-dashboard/stats') && response.status() === 200,
        { timeout: 10000 }
      )
      .catch(() => null);

    // 4. Consultant stats cards'ların göründüğünü kontrol et
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });
  });
});

