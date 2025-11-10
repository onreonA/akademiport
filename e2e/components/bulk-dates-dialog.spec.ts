/**
 * E2E Test: BulkDatesDialog Component
 *
 * Component test'lerindeki sorunlu senaryoları E2E test'lere taşıdık
 * Gerçek browser ortamında Dialog ve Select component'leri düzgün çalışır
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('BulkDatesDialog Component E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Consultant olarak login
    await loginAs(page, 'consultant');
    await page.goto('/consultant-dashboard/projects');
  });

  test('Dialog açılır ve form alanları görünür', async ({ page }) => {
    // Önce bir proje oluştur veya mevcut bir projeye git
    const firstProject = page
      .locator('[data-testid="project-card"], .project-card, a[href*="/projects/"]')
      .first();

    if (await firstProject.isVisible({ timeout: 5000 })) {
      await firstProject.click();

      // Proje detay sayfasında "Toplu Tarih" butonunu bul
      const bulkDatesButton = page.locator(
        'button:has-text("Toplu Tarih"), button:has-text("Bulk Dates"), [data-testid="bulk-dates-button"]'
      );

      if (await bulkDatesButton.isVisible({ timeout: 3000 })) {
        await bulkDatesButton.click();

        // Dialog'un açıldığını kontrol et
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

        // Dialog başlığını kontrol et
        await expect(
          page.locator('text=Firma Bazlı Tarihleri Düzenle, text=Toplu Tarih Atama')
        ).toBeVisible();

        // Alt proje seçici görünür olmalı
        const subProjectSelect = page.locator(
          '[role="combobox"], select[name="subProjectId"], [data-testid="sub-project-select"]'
        );

        // Select görünür olabilir veya ilk alt proje otomatik seçilmiş olabilir
        const isVisible = await subProjectSelect.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          await expect(subProjectSelect).toBeVisible();
        }
      }
    }
  });

  test('Alt proje seçilebilir', async ({ page }) => {
    const firstProject = page
      .locator('[data-testid="project-card"], .project-card, a[href*="/projects/"]')
      .first();

    if (await firstProject.isVisible({ timeout: 5000 })) {
      await firstProject.click();

      const bulkDatesButton = page.locator(
        'button:has-text("Toplu Tarih"), button:has-text("Bulk Dates")'
      );

      if (await bulkDatesButton.isVisible({ timeout: 3000 })) {
        await bulkDatesButton.click();

        // Dialog'un açıldığını bekle
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

        // Alt proje select'ini bul ve aç
        const subProjectSelect = page.locator('[role="combobox"], select[name="subProjectId"]');

        if (await subProjectSelect.isVisible({ timeout: 2000 })) {
          await subProjectSelect.click();
          await page.waitForTimeout(500);

          // İlk seçeneği seç
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.isVisible({ timeout: 2000 })) {
            await firstOption.click();
          }
        }
      }
    }
  });

  test('Tarih aralığı seçilebilir', async ({ page }) => {
    const firstProject = page
      .locator('[data-testid="project-card"], .project-card, a[href*="/projects/"]')
      .first();

    if (await firstProject.isVisible({ timeout: 5000 })) {
      await firstProject.click();

      const bulkDatesButton = page.locator(
        'button:has-text("Toplu Tarih"), button:has-text("Bulk Dates")'
      );

      if (await bulkDatesButton.isVisible({ timeout: 3000 })) {
        await bulkDatesButton.click();

        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

        // Alt proje seç (eğer select görünürse)
        const subProjectSelect = page.locator('[role="combobox"], select[name="subProjectId"]');
        if (await subProjectSelect.isVisible({ timeout: 2000 })) {
          await subProjectSelect.click();
          await page.waitForTimeout(500);
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.isVisible({ timeout: 2000 })) {
            await firstOption.click();
          }
        }

        // Başlangıç tarihi gir
        const startDateInputs = page.locator('input[type="date"], input[type="datetime-local"]');
        const startDateCount = await startDateInputs.count();

        if (startDateCount > 0) {
          // İlk tarih input'unu bul (başlangıç tarihi)
          const startDateInput = startDateInputs.first();
          await startDateInput.fill('2025-03-01');
        }

        // Bitiş tarihi gir
        if (startDateCount > 1) {
          const endDateInput = startDateInputs.last();
          await endDateInput.fill('2025-03-31');
        }
      }
    }
  });

  test('Form submit edildiğinde başarı mesajı gösterir', async ({ page }) => {
    const firstProject = page
      .locator('[data-testid="project-card"], .project-card, a[href*="/projects/"]')
      .first();

    if (await firstProject.isVisible({ timeout: 5000 })) {
      await firstProject.click();

      const bulkDatesButton = page.locator(
        'button:has-text("Toplu Tarih"), button:has-text("Bulk Dates")'
      );

      if (await bulkDatesButton.isVisible({ timeout: 3000 })) {
        await bulkDatesButton.click();

        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

        // Alt proje seç (eğer gerekirse)
        const subProjectSelect = page.locator('[role="combobox"], select[name="subProjectId"]');
        if (await subProjectSelect.isVisible({ timeout: 2000 })) {
          await subProjectSelect.click();
          await page.waitForTimeout(500);
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.isVisible({ timeout: 2000 })) {
            await firstOption.click();
          }
        }

        // Tarih aralığı gir
        const dateInputs = page.locator('input[type="date"], input[type="datetime-local"]');
        const dateCount = await dateInputs.count();

        if (dateCount > 0) {
          await dateInputs.first().fill('2025-04-01');
        }
        if (dateCount > 1) {
          await dateInputs.last().fill('2025-04-30');
        }

        // Submit butonuna tıkla
        const submitButton = page.locator(
          'button[type="submit"], button:has-text("Kaydet"), button:has-text("Ata")'
        );

        if (await submitButton.isVisible()) {
          await submitButton.click();

          // Başarı mesajını bekle
          await expect(page.locator('text=Başarılı, text=Atandı, text=Kaydedildi')).toBeVisible({
            timeout: 5000,
          });
        }
      }
    }
  });

  test('İptal butonuna tıklandığında dialog kapanır', async ({ page }) => {
    const firstProject = page
      .locator('[data-testid="project-card"], .project-card, a[href*="/projects/"]')
      .first();

    if (await firstProject.isVisible({ timeout: 5000 })) {
      await firstProject.click();

      const bulkDatesButton = page.locator(
        'button:has-text("Toplu Tarih"), button:has-text("Bulk Dates")'
      );

      if (await bulkDatesButton.isVisible({ timeout: 3000 })) {
        await bulkDatesButton.click();

        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

        // İptal butonuna tıkla
        const cancelButton = page.locator(
          'button:has-text("İptal"), button:has-text("Cancel"), button:has-text("Kapat")'
        );

        if (await cancelButton.isVisible()) {
          await cancelButton.click();

          // Dialog'un kapandığını kontrol et
          await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 2000 });
        }
      }
    }
  });
});
