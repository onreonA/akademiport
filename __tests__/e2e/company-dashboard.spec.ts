import { test, expect } from '@playwright/test';

test.describe('Company Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as company user before each test
    await page.goto('/giris');
    await page.fill('input[type="email"]', 'info@mundo.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/firma');
  });

  test('should display company dashboard', async ({ page }) => {
    await page.goto('/firma');

    // Check if dashboard elements are present
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check for stats cards
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4); // Assuming 4 stats cards

    // Check for navigation menu
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/firma');

    // Click on projects menu item
    await page.click('a[href="/firma/proje-yonetimi"]');

    // Wait for navigation
    await page.waitForURL('/firma/proje-yonetimi');

    // Check if we're on the projects page
    await expect(page).toHaveURL('/firma/proje-yonetimi');
    await expect(page.locator('h1')).toContainText('Proje Yönetimi');
  });

  test('should navigate to tasks page', async ({ page }) => {
    await page.goto('/firma');

    // Click on tasks menu item
    await page.click('a[href="/firma/gorevlerim"]');

    // Wait for navigation
    await page.waitForURL('/firma/gorevlerim');

    // Check if we're on the tasks page
    await expect(page).toHaveURL('/firma/gorevlerim');
    await expect(page.locator('h1')).toContainText('Görevlerim');
  });

  test('should display project cards', async ({ page }) => {
    await page.goto('/firma/proje-yonetimi');

    // Check if project cards are displayed
    const projectCards = page.locator('[data-testid="project-card"]');
    await expect(projectCards.first()).toBeVisible();

    // Check project card content
    await expect(projectCards.first().locator('h3')).toBeVisible();
    await expect(projectCards.first().locator('.progress-bar')).toBeVisible();
  });

  test('should filter projects by status', async ({ page }) => {
    await page.goto('/firma/proje-yonetimi');

    // Click on status filter
    await page.click('[data-testid="status-filter"]');
    await page.click('[data-testid="active-filter"]');

    // Check if only active projects are shown
    const projectCards = page.locator('[data-testid="project-card"]');
    const activeProjects = projectCards.locator('[data-status="active"]');
    await expect(activeProjects).toHaveCount(projectCards.count());
  });

  test('should search projects', async ({ page }) => {
    await page.goto('/firma/proje-yonetimi');

    // Type in search box
    await page.fill('[data-testid="search-input"]', 'test project');

    // Check if search results are filtered
    const projectCards = page.locator('[data-testid="project-card"]');
    await expect(projectCards.first()).toBeVisible();
  });
});
