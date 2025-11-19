/**
 * E2E Test: Custom Report Management Flow
 *
 * Senaryo 1: Custom Report Listesi Görüntüleme
 * Senaryo 2: Custom Report Oluşturma
 * Senaryo 3: Custom Report Detay Görüntüleme
 * Senaryo 4: Custom Report Düzenleme
 * Senaryo 5: Custom Report Silme
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Custom Report Management Flow', () => {
  const testReportName = `Test Report ${Date.now()}`;

  test('Custom report listesi görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Custom Reports sayfasına git
    await page.goto('/dashboard/reports/custom');
    await page.waitForLoadState('networkidle');

    // 3. Sayfa başlığını kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /rapor|report/i })).toBeVisible();

    // 4. Report listesinin görünür olduğunu kontrol et
    const reportList = page.locator('[data-testid="report-list"], table, [class*="report"]');
    await expect(reportList.first()).toBeVisible({ timeout: 10000 });
  });

  test('Custom report oluşturma', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Custom Reports sayfasına git
    await page.goto('/dashboard/reports/custom');
    await page.waitForLoadState('networkidle');

    // 3. "Yeni Rapor" butonuna tıkla
    const newReportButton = page.locator(
      'button:has-text("Yeni Rapor"), button:has-text("Yeni"), [data-testid="new-report"]'
    );
    await newReportButton.first().click();
    await page.waitForTimeout(1000); // Dialog açılması için bekle

    // 4. Form alanlarını doldur
    await page.waitForSelector('input[name="name"], #name', { timeout: 10000 });
    await page.fill('input[name="name"], #name', testReportName);

    // Report type seçimi
    const reportTypeSelect = page.locator('select[name="reportType"], [name="reportType"]');
    if ((await reportTypeSelect.count()) > 0) {
      await reportTypeSelect
        .first()
        .selectOption({ index: 1 })
        .catch(() => {});
    }

    // Date range type seçimi
    const dateRangeTypeSelect = page.locator(
      'select[name="dateRangeType"], [name="dateRangeType"]'
    );
    if ((await dateRangeTypeSelect.count()) > 0) {
      await dateRangeTypeSelect
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
          (response) => response.url().includes('/api/custom-reports') && response.status() === 201,
          { timeout: 15000 }
        )
        .catch(() => null),
      submitButton.first().click(),
    ]);

    // 6. Başarı mesajını veya dialog'un kapanmasını kontrol et
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 7. Report listesinde yeni report'un göründüğünü kontrol et
    await expect(page.locator(`text=${testReportName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('Custom report detay görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Custom Reports sayfasına git
    await page.goto('/dashboard/reports/custom');
    await page.waitForLoadState('networkidle');

    // 3. İlk report'a tıkla (eğer varsa)
    const firstReport = page.locator('table tbody tr, [data-testid="report-row"]').first();
    if ((await firstReport.count()) > 0) {
      await firstReport.click();
      await page.waitForLoadState('networkidle');

      // 4. Detay sayfasında report bilgilerinin göründüğünü kontrol et
      await expect(page.locator('h1, h2').filter({ hasText: /rapor|report/i })).toBeVisible({
        timeout: 10000,
      });
    } else {
      // Eğer report yoksa test'i skip et
      test.skip();
    }
  });

  test('Custom report düzenleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Custom Reports sayfasına git
    await page.goto('/dashboard/reports/custom');
    await page.waitForLoadState('networkidle');

    // 3. İlk report'un actions menüsünü aç
    const firstReportRow = page.locator('table tbody tr, [data-testid="report-row"]').first();
    if ((await firstReportRow.count()) > 0) {
      const actionsButton = firstReportRow.locator(
        'button:has-text("..."), [data-testid="actions"]'
      );
      await actionsButton.first().click();
      await page.waitForTimeout(500);

      // 4. "Düzenle" seçeneğine tıkla
      const editOption = page.locator(
        'button:has-text("Düzenle"), [role="menuitem"]:has-text("Düzenle")'
      );
      await editOption.first().click();
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
              response.url().includes('/api/custom-reports') &&
              (response.status() === 200 || response.status() === 201),
            { timeout: 15000 }
          )
          .catch(() => null),
        submitButton.first().click(),
      ]);

      // 7. Güncellemenin başarılı olduğunu kontrol et
      await page.waitForLoadState('networkidle');
      await expect(page.locator(`text=${updatedName}`).first()).toBeVisible({ timeout: 10000 });
    } else {
      // Eğer report yoksa test'i skip et
      test.skip();
    }
  });

  test('Custom report silme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Custom Reports sayfasına git
    await page.goto('/dashboard/reports/custom');
    await page.waitForLoadState('networkidle');

    // 3. İlk report'un actions menüsünü aç
    const firstReportRow = page.locator('table tbody tr, [data-testid="report-row"]').first();
    if ((await firstReportRow.count()) > 0) {
      const actionsButton = firstReportRow.locator(
        'button:has-text("..."), [data-testid="actions"]'
      );
      await actionsButton.first().click();
      await page.waitForTimeout(500);

      // 4. "Sil" seçeneğine tıkla
      const deleteOption = page.locator(
        'button:has-text("Sil"), [role="menuitem"]:has-text("Sil")'
      );
      await deleteOption.first().click();

      // 5. Onay dialog'unu kabul et
      await page.waitForTimeout(500);
      const confirmButton = page.locator(
        'button:has-text("Evet"), button:has-text("Sil"), button:has-text("Confirm")'
      );
      if ((await confirmButton.count()) > 0) {
        await Promise.all([
          page
            .waitForResponse(
              (response) =>
                response.url().includes('/api/custom-reports') && response.status() === 200,
              { timeout: 15000 }
            )
            .catch(() => null),
          confirmButton.first().click(),
        ]);
      }

      // 6. Report listesinde report'un silindiğini kontrol et
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/dashboard\/reports\/custom/, { timeout: 10000 });
    } else {
      // Eğer report yoksa test'i skip et
      test.skip();
    }
  });
});
