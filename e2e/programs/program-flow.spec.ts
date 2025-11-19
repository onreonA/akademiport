/**
 * E2E Test: Program Management Flow
 *
 * Senaryo 1: Program Listesi Görüntüleme
 * Senaryo 2: Program Oluşturma
 * Senaryo 3: Program Detay Görüntüleme
 * Senaryo 4: Program Düzenleme
 * Senaryo 5: Program Silme
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Program Management Flow', () => {
  const testProgramName = `Test Program ${Date.now()}`;

  test('Program listesi görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Programs sayfasına git
    await page.goto('/dashboard/programs');
    await page.waitForLoadState('networkidle');

    // 3. Sayfa başlığını kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /program/i })).toBeVisible();

    // 4. Program listesinin görünür olduğunu kontrol et
    const programList = page.locator(
      '[data-testid="program-list"], .program-card, [class*="program"]'
    );
    await expect(programList.first()).toBeVisible({ timeout: 10000 });
  });

  test('Program oluşturma', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Programs sayfasına git
    await page.goto('/dashboard/programs');
    await page.waitForLoadState('networkidle');

    // 3. "Yeni Program" butonuna tıkla
    const newProgramButton = page.locator(
      'button:has-text("Yeni Program"), a:has-text("Yeni Program"), button:has-text("Yeni"), [href*="/programs/new"]'
    );
    await newProgramButton.first().click();
    await page.waitForLoadState('networkidle');

    // 4. Form alanlarını doldur
    await page.waitForSelector('input[name="name"], #name', { timeout: 10000 });
    await page.fill('input[name="name"], #name', testProgramName);

    // Start date ve end date doldur
    const startDate = '2025-06-01';
    const endDate = '2025-12-31';

    const startDateInput = page.locator('input[name="startDate"], input[type="date"]').first();
    if ((await startDateInput.count()) > 0) {
      await startDateInput.fill(startDate);
    }

    const endDateInput = page.locator('input[name="endDate"], input[type="date"]').nth(1);
    if ((await endDateInput.count()) > 0) {
      await endDateInput.fill(endDate);
    }

    // 5. Formu submit et
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Kaydet"), button:has-text("Oluştur")'
    );
    await Promise.all([
      page
        .waitForResponse(
          (response) => response.url().includes('/api/programs') && response.status() === 201,
          { timeout: 15000 }
        )
        .catch(() => null),
      submitButton.first().click(),
    ]);

    // 6. Başarı mesajını veya redirect'i kontrol et
    await page.waitForLoadState('networkidle');

    // 7. Program listesinde yeni program'ın göründüğünü kontrol et
    await page.goto('/dashboard/programs');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${testProgramName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('Program detay görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Programs sayfasına git
    await page.goto('/dashboard/programs');
    await page.waitForLoadState('networkidle');

    // 3. İlk program'a tıkla
    const firstProgram = page
      .locator('[data-testid="program-card"], .program-card, [class*="program"]')
      .first();
    await firstProgram.click();
    await page.waitForLoadState('networkidle');

    // 4. Detay sayfasında program bilgilerinin göründüğünü kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /program/i })).toBeVisible();

    // Program details görünür olmalı
    const programDetails = page.locator(
      '[data-testid="program-details"], .program-profile, [class*="program"]'
    );
    await expect(programDetails.first()).toBeVisible({ timeout: 10000 });
  });

  test('Program düzenleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Programs sayfasına git
    await page.goto('/dashboard/programs');
    await page.waitForLoadState('networkidle');

    // 3. İlk program'a tıkla
    const firstProgram = page
      .locator('[data-testid="program-card"], .program-card, [class*="program"]')
      .first();
    await firstProgram.click();
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
            response.url().includes('/api/programs') &&
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

  test('Program silme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Programs sayfasına git
    await page.goto('/dashboard/programs');
    await page.waitForLoadState('networkidle');

    // 3. İlk program'a tıkla
    const firstProgram = page
      .locator('[data-testid="program-card"], .program-card, [class*="program"]')
      .first();
    await firstProgram.click();
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
            (response) => response.url().includes('/api/programs') && response.status() === 200,
            { timeout: 15000 }
          )
          .catch(() => null),
        confirmButton.first().click(),
      ]);
    }

    // 6. Program listesine geri dönüldüğünü kontrol et
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/programs/, { timeout: 10000 });
  });
});
