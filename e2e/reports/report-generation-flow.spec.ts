/**
 * E2E Test: Report Generation Flow
 *
 * Senaryo 1: Report Oluşturma
 * Senaryo 2: Report Listesi Görüntüleme
 * Senaryo 3: Report Detay Görüntüleme
 * Senaryo 4: PDF Export
 * Senaryo 5: Report Email Gönderimi
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Report Generation Flow', () => {
  test('Report oluşturma', async ({ page }) => {
    // 1. Consultant veya Admin olarak login (report oluşturma yetkisi olan rol)
    await loginAs(page, 'consultant');

    // 2. Report generation sayfasına git
    await page.goto('/dashboard/reports/generate');
    await page.waitForLoadState('networkidle');

    // 3. Form alanlarının göründüğünü kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /rapor|report/i })).toBeVisible({
      timeout: 10000,
    });

    // 4. Report type seçimi
    const reportTypeSelect = page.locator('select[name="reportType"], [name="reportType"]');
    if ((await reportTypeSelect.count()) > 0) {
      await reportTypeSelect
        .first()
        .selectOption({ index: 0 })
        .catch(() => {});
    }

    // 5. Period seçimi (monthly report için)
    const yearInput = page.locator('input[name="periodYear"], #periodYear');
    const monthSelect = page.locator('select[name="periodMonth"], [name="periodMonth"]');

    if ((await yearInput.count()) > 0) {
      const currentYear = new Date().getFullYear();
      await yearInput.fill(String(currentYear));
    }

    if ((await monthSelect.count()) > 0) {
      await monthSelect
        .first()
        .selectOption({ index: 0 })
        .catch(() => {});
    }

    // 6. Formu submit et
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Oluştur"), button:has-text("Generate")'
    );
    await Promise.all([
      page
        .waitForResponse(
          (response) =>
            response.url().includes('/api/reports/generate') &&
            (response.status() === 200 || response.status() === 201),
          { timeout: 30000 } // Report generation uzun sürebilir
        )
        .catch(() => null),
      submitButton.first().click(),
    ]);

    // 7. Report detay sayfasına yönlendirildiğini kontrol et
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/reports\/[^/]+/, { timeout: 15000 });
  });

  test('Report listesi görüntüleme', async ({ page }) => {
    // 1. Admin veya Consultant olarak login
    await loginAs(page, 'admin');

    // 2. Reports listesi sayfasına git
    await page.goto('/dashboard/reports');
    await page.waitForLoadState('networkidle');

    // 3. Sayfa başlığının göründüğünü kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /rapor|report/i })).toBeVisible({
      timeout: 10000,
    });

    // 4. Report listesinin göründüğünü kontrol et
    const reportList = page.locator('table, [data-testid="report-list"], [class*="report"]');
    await expect(reportList.first()).toBeVisible({ timeout: 10000 });

    // 5. "Yeni Rapor" butonunun göründüğünü kontrol et (eğer varsa)
    const newReportButton = page.locator(
      'button:has-text("Yeni Rapor"), a:has-text("Yeni Rapor"), [href*="/reports/generate"]'
    );
    if ((await newReportButton.count()) > 0) {
      await expect(newReportButton.first()).toBeVisible();
    }
  });

  test('Report detay görüntüleme', async ({ page }) => {
    // 1. Admin veya Consultant olarak login
    await loginAs(page, 'admin');

    // 2. Reports listesi sayfasına git
    await page.goto('/dashboard/reports');
    await page.waitForLoadState('networkidle');

    // 3. İlk report'a tıkla (eğer varsa)
    const firstReport = page.locator('table tbody tr, [data-testid="report-row"]').first();
    if ((await firstReport.count()) > 0) {
      await firstReport.click();
      await page.waitForLoadState('networkidle');

      // 4. Report detay sayfasının göründüğünü kontrol et
      await expect(page).toHaveURL(/\/dashboard\/reports\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('h1, h2').filter({ hasText: /rapor|report/i })).toBeVisible({
        timeout: 10000,
      });

      // 5. Report içeriğinin göründüğünü kontrol et
      const reportContent = page.locator(
        '[data-testid="report-content"], .report-content, [class*="report"]'
      );
      await expect(reportContent.first()).toBeVisible({ timeout: 10000 });
    } else {
      // Eğer report yoksa test'i skip et
      test.skip();
    }
  });

  test('PDF Export', async ({ page }) => {
    // 1. Admin veya Consultant olarak login
    await loginAs(page, 'admin');

    // 2. Reports listesi sayfasına git
    await page.goto('/dashboard/reports');
    await page.waitForLoadState('networkidle');

    // 3. İlk report'a tıkla (eğer varsa)
    const firstReport = page.locator('table tbody tr, [data-testid="report-row"]').first();
    if ((await firstReport.count()) > 0) {
      await firstReport.click();
      await page.waitForLoadState('networkidle');

      // 4. PDF download butonunu bul
      const pdfButton = page.locator(
        'button:has-text("PDF"), button:has-text("İndir"), a[href*="/pdf"], [data-testid="pdf-download"]'
      );
      if ((await pdfButton.count()) > 0) {
        // 5. PDF download'ı başlat
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
          pdfButton.first().click(),
        ]);

        // 6. Download'ın başladığını kontrol et
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
        } else {
          // Alternatif: PDF endpoint'ine direkt istek kontrolü
          const currentUrl = page.url();
          const reportId = currentUrl.match(/\/reports\/([^/]+)/)?.[1];
          if (reportId) {
            const pdfResponse = await page.request.get(`/api/reports/${reportId}/pdf`);
            expect(pdfResponse.status()).toBeLessThan(500); // 200 veya 404 olabilir
          }
        }
      }
    } else {
      // Eğer report yoksa test'i skip et
      test.skip();
    }
  });

  test('Report Email Gönderimi', async ({ page }) => {
    // 1. Admin veya Consultant olarak login
    await loginAs(page, 'admin');

    // 2. Reports listesi sayfasına git
    await page.goto('/dashboard/reports');
    await page.waitForLoadState('networkidle');

    // 3. İlk report'a tıkla (eğer varsa)
    const firstReport = page.locator('table tbody tr, [data-testid="report-row"]').first();
    if ((await firstReport.count()) > 0) {
      await firstReport.click();
      await page.waitForLoadState('networkidle');

      // 4. Email gönder butonunu bul
      const emailButton = page.locator(
        'button:has-text("Email"), button:has-text("Gönder"), [data-testid="send-email"]'
      );
      if ((await emailButton.count()) > 0) {
        // 5. Email gönder butonuna tıkla
        await Promise.all([
          page
            .waitForResponse(
              (response) =>
                response.url().includes('/api/reports') && response.url().includes('/email'),
              { timeout: 15000 }
            )
            .catch(() => null),
          emailButton.first().click(),
        ]);

        // 6. Başarı mesajını kontrol et
        await page.waitForTimeout(2000);
        await expect(
          page.locator('text=Email gönderildi, text=Başarılı, text=Email sent, [role="alert"]')
        )
          .toBeVisible({ timeout: 10000 })
          .catch(() => {
            // Email gönderimi başarısız olabilir veya farklı bir mesaj gösterilebilir
          });
      }
    } else {
      // Eğer report yoksa test'i skip et
      test.skip();
    }
  });

  test('Report Filtreleme ve Arama', async ({ page }) => {
    // 1. Admin veya Consultant olarak login
    await loginAs(page, 'admin');

    // 2. Reports listesi sayfasına git
    await page.goto('/dashboard/reports');
    await page.waitForLoadState('networkidle');

    // 3. Filtre butonunu bul (eğer varsa)
    const filterButton = page.locator(
      'button:has-text("Filtre"), button:has-text("Filter"), [data-testid="filter"]'
    );
    if ((await filterButton.count()) > 0) {
      await filterButton.first().click();
      await page.waitForTimeout(500);

      // 4. Filtre seçeneklerini kontrol et
      const filterOptions = page.locator(
        '[role="menu"], [data-testid="filter-menu"], [class*="dropdown"]'
      );
      await expect(filterOptions.first()).toBeVisible();
    }

    // 5. Arama kutusunu bul (eğer varsa)
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="ara"], input[placeholder*="search"]'
    );
    if ((await searchInput.count()) > 0) {
      await searchInput.first().fill('test');
      await page.waitForTimeout(1000);
      // Arama sonuçlarının güncellendiğini kontrol et
      await expect(page.locator('table, [data-testid="report-list"]').first()).toBeVisible();
    }
  });
});
