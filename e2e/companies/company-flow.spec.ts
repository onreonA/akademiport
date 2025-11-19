/**
 * E2E Test: Company Management Flow
 *
 * Senaryo 1: Company Listesi Görüntüleme
 * Senaryo 2: Company Oluşturma
 * Senaryo 3: Company Detay Görüntüleme
 * Senaryo 4: Company Düzenleme
 * Senaryo 5: Company Silme
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Company Management Flow', () => {
  const testCompanyName = `Test Company ${Date.now()}`;

  test('Company listesi görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Companies sayfasına git
    await page.goto('/dashboard/companies');
    await page.waitForLoadState('networkidle');

    // 3. Sayfa başlığını kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /firma|company/i })).toBeVisible();

    // 4. Company listesinin görünür olduğunu kontrol et
    const companyList = page.locator(
      '[data-testid="company-list"], .company-card, [class*="company"]'
    );
    await expect(companyList.first()).toBeVisible({ timeout: 10000 });
  });

  test('Company oluşturma', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Companies sayfasına git
    await page.goto('/dashboard/companies');
    await page.waitForLoadState('networkidle');

    // 3. "Yeni Firma" butonuna tıkla
    const newCompanyButton = page.locator(
      'button:has-text("Yeni Firma"), a:has-text("Yeni Firma"), button:has-text("Yeni"), [href*="/companies/new"]'
    );
    await newCompanyButton.first().click();
    await page.waitForLoadState('networkidle');

    // 4. Form alanlarını doldur
    await page.waitForSelector('input[name="name"], #name', { timeout: 10000 });
    await page.fill('input[name="name"], #name', testCompanyName);

    // Program seçimi varsa seç (opsiyonel)
    const programSelect = page.locator('select[name="programId"], [name="programId"]');
    if ((await programSelect.count()) > 0) {
      await programSelect
        .first()
        .selectOption({ index: 1 })
        .catch(() => {});
    }

    // 5. Formu submit et
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Kaydet"), button:has-text("Oluştur")'
    );
    await Promise.all([
      page
        .waitForResponse(
          (response) => response.url().includes('/api/companies') && response.status() === 201,
          { timeout: 15000 }
        )
        .catch(() => null),
      submitButton.first().click(),
    ]);

    // 6. Başarı mesajını veya redirect'i kontrol et
    await page.waitForLoadState('networkidle');

    // 7. Company listesinde yeni company'nin göründüğünü kontrol et
    await page.goto('/dashboard/companies');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${testCompanyName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('Company detay görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Companies sayfasına git
    await page.goto('/dashboard/companies');
    await page.waitForLoadState('networkidle');

    // 3. İlk company'ye tıkla
    const firstCompany = page
      .locator('[data-testid="company-card"], .company-card, [class*="company"]')
      .first();
    await firstCompany.click();
    await page.waitForLoadState('networkidle');

    // 4. Detay sayfasında company bilgilerinin göründüğünü kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /firma|company/i })).toBeVisible();

    // Company name veya details görünür olmalı
    const companyDetails = page.locator(
      '[data-testid="company-details"], .company-profile, [class*="company"]'
    );
    await expect(companyDetails.first()).toBeVisible({ timeout: 10000 });
  });

  test('Company düzenleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Companies sayfasına git
    await page.goto('/dashboard/companies');
    await page.waitForLoadState('networkidle');

    // 3. İlk company'ye tıkla
    const firstCompany = page
      .locator('[data-testid="company-card"], .company-card, [class*="company"]')
      .first();
    await firstCompany.click();
    await page.waitForLoadState('networkidle');

    // 4. "Düzenle" butonuna tıkla
    const editButton = page.locator(
      'button:has-text("Düzenle"), a:has-text("Düzenle"), [href*="/edit"]'
    );
    await editButton.first().click();
    await page.waitForLoadState('networkidle');

    // 5. Form alanını güncelle
    await page.waitForSelector('input[name="name"], #name', { timeout: 10000 });
    const nameInput = page.locator('input[name="name"], #name').first();
    const currentValue = await nameInput.inputValue();
    const updatedName = `${currentValue} - Updated`;
    await nameInput.fill(updatedName);

    // 6. Formu submit et
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Kaydet"), button:has-text("Güncelle")'
    );
    await Promise.all([
      page
        .waitForResponse(
          (response) =>
            response.url().includes('/api/companies') &&
            (response.status() === 200 || response.status() === 201),
          { timeout: 15000 }
        )
        .catch(() => null),
      submitButton.first().click(),
    ]);

    // 7. Güncellemenin başarılı olduğunu kontrol et
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${updatedName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('Company silme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Companies sayfasına git
    await page.goto('/dashboard/companies');
    await page.waitForLoadState('networkidle');

    // 3. İlk company'ye tıkla
    const firstCompany = page
      .locator('[data-testid="company-card"], .company-card, [class*="company"]')
      .first();
    await firstCompany.click();
    await page.waitForLoadState('networkidle');

    // 4. "Sil" butonuna tıkla
    const deleteButton = page.locator(
      'button:has-text("Sil"), button:has-text("Delete"), [data-testid="delete"]'
    );
    await deleteButton.first().click();

    // 5. Onay dialog'unu kabul et
    await page.waitForTimeout(500);
    const confirmButton = page.locator(
      'button:has-text("Evet"), button:has-text("Sil"), button:has-text("Confirm")'
    );
    if ((await confirmButton.count()) > 0) {
      await Promise.all([
        page
          .waitForResponse(
            (response) => response.url().includes('/api/companies') && response.status() === 200,
            { timeout: 15000 }
          )
          .catch(() => null),
        confirmButton.first().click(),
      ]);
    }

    // 6. Company listesine geri dönüldüğünü kontrol et
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/companies/, { timeout: 10000 });
  });
});
