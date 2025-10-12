import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user before each test
    await page.goto('/giris');
    await page.fill('input[type="email"]', 'admin@akademiport.com');
    await page.fill('input[type="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');

    // Check if dashboard elements are present
    await expect(page.locator('h1')).toContainText('Admin Dashboard');

    // Check for stats cards
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4); // Assuming 4 stats cards

    // Check for admin navigation menu
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to company management', async ({ page }) => {
    await page.goto('/admin');

    // Click on company management menu item
    await page.click('a[href="/admin/firma-yonetimi"]');

    // Wait for navigation
    await page.waitForURL('/admin/firma-yonetimi');

    // Check if we're on the company management page
    await expect(page).toHaveURL('/admin/firma-yonetimi');
    await expect(page.locator('h1')).toContainText('Firma Yönetimi');
  });

  test('should navigate to project management', async ({ page }) => {
    await page.goto('/admin');

    // Click on project management menu item
    await page.click('a[href="/admin/proje-yonetimi"]');

    // Wait for navigation
    await page.waitForURL('/admin/proje-yonetimi');

    // Check if we're on the project management page
    await expect(page).toHaveURL('/admin/proje-yonetimi');
    await expect(page.locator('h1')).toContainText('Proje Yönetimi');
  });

  test('should display company list', async ({ page }) => {
    await page.goto('/admin/firma-yonetimi');

    // Check if company cards are displayed
    const companyCards = page.locator('[data-testid="company-card"]');
    await expect(companyCards.first()).toBeVisible();

    // Check company card content
    await expect(companyCards.first().locator('h3')).toBeVisible();
    await expect(companyCards.first().locator('.status-badge')).toBeVisible();
  });

  test('should filter companies by status', async ({ page }) => {
    await page.goto('/admin/firma-yonetimi');

    // Click on status filter
    await page.click('[data-testid="status-filter"]');
    await page.click('[data-testid="active-filter"]');

    // Check if only active companies are shown
    const companyCards = page.locator('[data-testid="company-card"]');
    const activeCompanies = companyCards.locator('[data-status="active"]');
    await expect(activeCompanies).toHaveCount(companyCards.count());
  });

  test('should create new company', async ({ page }) => {
    await page.goto('/admin/firma-yonetimi');

    // Click on create company button
    await page.click('[data-testid="create-company-btn"]');

    // Fill in company form
    await page.fill('[data-testid="company-name"]', 'Test Company');
    await page.fill('[data-testid="company-email"]', 'test@company.com');
    await page.fill('[data-testid="company-contact"]', 'Test Contact');

    // Submit form
    await page.click('[data-testid="submit-btn"]');

    // Check if company was created
    await expect(
      page.locator('[data-testid="company-card"]').last()
    ).toContainText('Test Company');
  });

  test('should edit company details', async ({ page }) => {
    await page.goto('/admin/firma-yonetimi');

    // Click on edit button for first company
    await page.click('[data-testid="edit-company-btn"]');

    // Update company name
    await page.fill('[data-testid="company-name"]', 'Updated Company Name');

    // Submit form
    await page.click('[data-testid="submit-btn"]');

    // Check if company was updated
    await expect(
      page.locator('[data-testid="company-card"]').first()
    ).toContainText('Updated Company Name');
  });
});
