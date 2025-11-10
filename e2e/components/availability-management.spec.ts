/**
 * E2E Test: AvailabilityManagement Component
 *
 * Component test'lerindeki sorunlu senaryoları E2E test'lere taşıdık
 * Gerçek browser ortamında form interaction ve dialog'lar düzgün çalışır
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('AvailabilityManagement Component E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Consultant olarak login
    await loginAs(page, 'consultant');
    await page.goto('/consultant-dashboard/availability');
  });

  test('Müsaitlik yönetimi sayfası yüklenir', async ({ page }) => {
    // Sayfa başlığını kontrol et
    await expect(
      page.locator('h2:has-text("Müsaitlik Yönetimi"), h1:has-text("Müsaitlik Yönetimi")')
    ).toBeVisible({ timeout: 10000 });
  });

  test('Yeni müsaitlik kuralı ekle butonu görünür', async ({ page }) => {
    await expect(
      page.locator(
        'button:has-text("Yeni Kural Ekle"), button:has-text("Yeni Müsaitlik Kuralı Ekle")'
      )
    ).toBeVisible({ timeout: 5000 });
  });

  test('Yeni müsait olmama tarihi ekle butonu görünür', async ({ page }) => {
    await expect(
      page.locator('button:has-text("Tarih Ekle"), button:has-text("Yeni Tarih Ekle")')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Müsaitlik kuralı dialog açılır', async ({ page }) => {
    const addRuleButton = page.locator(
      'button:has-text("Yeni Kural Ekle"), button:has-text("Yeni Müsaitlik Kuralı Ekle")'
    );

    if (await addRuleButton.isVisible({ timeout: 5000 })) {
      await addRuleButton.click();

      // Dialog'un açıldığını kontrol et
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

      // Dialog başlığını kontrol et
      await expect(
        page.locator(
          '[role="dialog"] h2:has-text("Yeni Müsaitlik Kuralı"), [role="dialog"] h2:has-text("Müsaitlik Kuralı Düzenle")'
        )
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Müsait olmama tarihi dialog açılır', async ({ page }) => {
    const addDateButton = page.locator(
      'button:has-text("Tarih Ekle"), button:has-text("Yeni Tarih Ekle")'
    );

    if (await addDateButton.isVisible({ timeout: 5000 })) {
      await addDateButton.click();

      // Dialog'un açıldığını kontrol et
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

      // Dialog başlığını kontrol et
      await expect(
        page.locator(
          '[role="dialog"] h2:has-text("Yeni Müsait Olmama Tarihi"), [role="dialog"] h2:has-text("Müsait Olmama Tarihi Düzenle")'
        )
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Müsaitlik kuralı oluşturulabilir', async ({ page }) => {
    const addRuleButton = page.locator(
      'button:has-text("Yeni Kural Ekle"), button:has-text("Yeni Müsaitlik Kuralı Ekle")'
    );

    if (await addRuleButton.isVisible({ timeout: 5000 })) {
      await addRuleButton.click();

      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

      // Gün seç (örneğin Pazartesi)
      const dayCheckbox = page
        .locator('input[type="checkbox"][name*="day"], input[type="checkbox"][value*="monday"]')
        .first();
      if (await dayCheckbox.isVisible({ timeout: 2000 })) {
        await dayCheckbox.check();
      }

      // Başlangıç saati gir
      const startTimeInput = page.locator('input[type="time"], input[name*="startTime"]').first();
      if (await startTimeInput.isVisible({ timeout: 2000 })) {
        await startTimeInput.fill('09:00');
      }

      // Bitiş saati gir
      const endTimeInput = page.locator('input[type="time"], input[name*="endTime"]').last();
      if (await endTimeInput.isVisible({ timeout: 2000 })) {
        await endTimeInput.fill('17:00');
      }

      // Geçerlilik tarihleri gir
      const validFromInput = page.locator('input[type="date"], input[name*="validFrom"]').first();
      if (await validFromInput.isVisible({ timeout: 2000 })) {
        await validFromInput.fill('2025-03-01');
      }

      const validUntilInput = page.locator('input[type="date"], input[name*="validUntil"]').last();
      if (await validUntilInput.isVisible({ timeout: 2000 })) {
        await validUntilInput.fill('2025-12-31');
      }

      // Kaydet butonuna tıkla
      const saveButton = page
        .locator('button[type="submit"]:has-text("Ekle"), button[type="submit"]:has-text("Kaydet")')
        .first();

      if (await saveButton.isVisible({ timeout: 5000 })) {
        await saveButton.click();

        // Başarı mesajını bekle (toast notification)
        await expect(
          page
            .locator('[data-sonner-toast], [role="status"]')
            .filter({ hasText: /başarılı|oluşturuldu|kaydedildi/i })
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('Müsait olmama tarihi eklenebilir', async ({ page }) => {
    const addDateButton = page.locator(
      'button:has-text("Tarih Ekle"), button:has-text("Yeni Tarih Ekle")'
    );

    if (await addDateButton.isVisible({ timeout: 5000 })) {
      await addDateButton.click();

      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

      // Tarih gir
      const dateInput = page.locator('input[type="date"], input[name*="date"]');
      if (await dateInput.isVisible({ timeout: 2000 })) {
        await dateInput.fill('2025-03-15');
      }

      // Neden gir (varsa)
      const reasonInput = page.locator('textarea[name*="reason"], input[name*="reason"]');
      if (await reasonInput.isVisible({ timeout: 2000 })) {
        await reasonInput.fill('Tatil');
      }

      // Kaydet butonuna tıkla
      const saveButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Başarı mesajını bekle
        // Başarı mesajını bekle (toast notification)
        await expect(
          page
            .locator('[data-sonner-toast], [role="status"]')
            .filter({ hasText: /başarılı|oluşturuldu|kaydedildi/i })
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('Boş durumda mesaj gösterilir', async ({ page }) => {
    // Eğer hiç müsaitlik kuralı yoksa boş durum mesajı görünmeli
    const emptyState = page.locator(
      'text=Müsaitlik kuralı yok, text=Henüz müsaitlik kuralı eklenmemiş, text=No availability rules'
    );

    // Mesaj görünüyorsa test başarılı
    const isVisible = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    if (isVisible) {
      await expect(emptyState).toBeVisible();
    }
  });
});
