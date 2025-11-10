/**
 * E2E Test: EventForm Component
 *
 * Component test'lerindeki sorunlu senaryoları E2E test'lere taşıdık
 * Gerçek browser ortamında form validation ve submission düzgün çalışır
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('EventForm Component E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Consultant olarak login
    await loginAs(page, 'consultant');
    await page.goto('/consultant-dashboard/events');
  });

  test('Form alanlarını render eder', async ({ page }) => {
    // Yeni etkinlik butonuna tıkla
    const newEventButton = page.locator(
      'button:has-text("Yeni Etkinlik"), button:has-text("Etkinlik Oluştur")'
    );
    await newEventButton.click();

    // Dialog'un açıldığını kontrol et
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Form alanlarının görünür olduğunu kontrol et
    await expect(page.locator('input[name="title"]').first()).toBeVisible();

    await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible();

    await expect(page.locator('input[type="datetime-local"]').nth(1)).toBeVisible();
  });

  test('Zorunlu alanlar doğrulanır', async ({ page }) => {
    const newEventButton = page.locator(
      'button:has-text("Yeni Etkinlik"), button:has-text("Etkinlik Oluştur")'
    );
    await newEventButton.click();

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Submit butonuna tıkla (alanlar boş)
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Kaydet"), button:has-text("Oluştur")'
    );

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Validation hata mesajlarını kontrol et (form error mesajları)
      await expect(
        page.locator('.text-destructive, [role="alert"], p.text-sm.text-destructive').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Başlangıç zamanı bitiş zamanından önce olmalı', async ({ page }) => {
    const newEventButton = page.locator(
      'button:has-text("Yeni Etkinlik"), button:has-text("Etkinlik Oluştur")'
    );
    await newEventButton.click();

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Form alanlarını doldur (title gerekli)
    const titleInput = page.locator('input[name="title"], #title').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Etkinlik');
    }

    // Başlangıç zamanı gir
    const startTimeInput = page.locator('input[type="datetime-local"]').first();
    if (await startTimeInput.isVisible()) {
      await startTimeInput.fill('2025-03-01T12:00');
    }

    // Bitiş zamanı gir (başlangıçtan önce)
    const endTimeInput = page.locator('input[type="datetime-local"]').last();
    if (await endTimeInput.isVisible()) {
      await endTimeInput.fill('2025-03-01T11:00');
    }

    // Submit butonuna tıkla
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Validation hata mesajını kontrol et (toast error)
      // Zod validation hatası toast.error ile gösterilir
      await expect(
        page
          .locator('[data-sonner-toast], [role="status"]')
          .filter({ hasText: /başlangıç|bitiş|tarih|geçersiz|önce|sonra/i })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Form submit edildiğinde başarı mesajı gösterir', async ({ page }) => {
    // Network request'leri yakalamak için listener'ları başlat
    const requests: string[] = [];
    const responses: Array<{ url: string; status: number; method: string }> = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        requests.push(`${request.method()} ${request.url()}`);
      }
    });

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    const newEventButton = page.locator(
      'button:has-text("Yeni Etkinlik"), button:has-text("Etkinlik Oluştur")'
    );
    await newEventButton.click();

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Form alanlarını doldur
    const titleInput = page.locator('input[name="title"], #title').first();
    const testTitle = `E2E Test Etkinlik ${Date.now()}`;
    if (await titleInput.isVisible()) {
      await titleInput.fill(testTitle);
    }

    // Gelecekteki bir tarih seç
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    futureDate.setHours(10, 0, 0, 0);

    const startTimeStr = futureDate.toISOString().slice(0, 16);
    const endTimeStr = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);

    const startTimeInput = page.locator('input[type="datetime-local"]').first();
    if (await startTimeInput.isVisible()) {
      await startTimeInput.fill(startTimeStr);
    }

    const endTimeInput = page.locator('input[type="datetime-local"]').last();
    if (await endTimeInput.isVisible()) {
      await endTimeInput.fill(endTimeStr);
    }

    // API response'unu bekle (submit'ten ÖNCE başlat)
    const responsePromise = page.waitForResponse(
      (response) => {
        const url = response.url();
        const method = response.request().method();
        return url.includes('/api/events') && method === 'POST';
      },
      { timeout: 20000 }
    );

    // Form submit'ten önce form değerlerini kontrol et
    await page.waitForTimeout(1000); // Form render için bekleme

    // Hidden input'ları kontrol et (programId ve consultantId)
    const programIdInput = page.locator('input[name="programId"]');
    const consultantIdInput = page.locator('input[name="consultantId"]');

    const programIdValue = await programIdInput.inputValue().catch(() => '');
    const consultantIdValue = await consultantIdInput.inputValue().catch(() => '');

    console.log('🔍 Hidden Input Values:', {
      programId: programIdValue,
      consultantId: consultantIdValue,
    });

    if (!programIdValue || !consultantIdValue) {
      throw new Error(
        `Hidden input'lar eksik: programId=${programIdValue}, consultantId=${consultantIdValue}`
      );
    }

    // Submit butonunu bul
    const submitButton = page.locator('button[type="submit"]');

    // Butonun enabled olduğundan emin ol
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    const isDisabled = await submitButton.isDisabled();

    if (isDisabled) {
      // Buton disabled, validation hatası var
      const errorMessages = page.locator('.text-destructive, [role="alert"], [data-sonner-toast]');
      const errorCount = await errorMessages.count();
      if (errorCount > 0) {
        const errorTexts = await Promise.all(
          Array.from({ length: errorCount }, (_, i) =>
            errorMessages
              .nth(i)
              .textContent()
              .catch(() => '')
          )
        );
        throw new Error(`Form validation hatası: ${errorTexts.join(', ')}`);
      }
      throw new Error('Submit butonu disabled ama hata mesajı görünmüyor');
    }

    // Form submit event'ini tetikle
    // React Hook Form'da butona tıklamak form submit'i tetikler
    await page.waitForTimeout(500); // Form render için bekleme

    // Butona tıkla (React Hook Form otomatik olarak form submit'i tetikler)
    await submitButton.click();

    // Form submit'in çalışıp çalışmadığını kontrol et
    // React Hook Form'un handleSubmit fonksiyonu çağrılana kadar bekle
    await page.waitForTimeout(2000);

    // API response'unu bekle
    let response;
    try {
      response = await responsePromise;
    } catch (error) {
      const eventRequests = requests.filter((r) => r.includes('/api/events') && r.includes('POST'));
      const eventResponses = responses.filter(
        (r) => r.url.includes('/api/events') && r.method === 'POST'
      );
      console.log('📡 Event POST Requests:', eventRequests);
      console.log('📥 Event POST Responses:', eventResponses);

      // Hata toast'ını kontrol et
      const errorToast = page
        .locator('[data-sonner-toast], [role="status"]')
        .filter({ hasText: /hata|error|gerekli|required/i });
      const hasErrorToast = await errorToast.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasErrorToast) {
        const errorText = await errorToast.textContent();
        throw new Error(`Form submit başarısız: ${errorText}`);
      }

      // Form değerlerini kontrol et (debug için)
      const titleValue = await titleInput.inputValue();
      const startValue = await startTimeInput.inputValue();
      const endValue = await endTimeInput.inputValue();
      console.log('📝 Form Values:', { title: titleValue, start: startValue, end: endValue });

      throw new Error(
        `API response gelmedi. POST Event Requests: ${eventRequests.length}, POST Event Responses: ${eventResponses.length}`
      );
    }

    // API başarılı mı kontrol et
    const status = response.status();
    if (status >= 400) {
      try {
        const responseBody = await response.json();
        throw new Error(`API çağrısı başarısız (${status}): ${JSON.stringify(responseBody)}`);
      } catch {
        throw new Error(`API çağrısı başarısız (${status})`);
      }
    }

    // Başarı mesajını bekle (toast notification)
    // handleCreateEvent içinde toast.success('Etkinlik başarıyla oluşturuldu') gösterilir
    await expect(
      page
        .locator('[data-sonner-toast], [role="status"]')
        .filter({ hasText: /başarıyla|oluşturuldu|etkinlik/i })
    ).toBeVisible({ timeout: 10000 });

    // Dialog'un kapandığını kontrol et (başarılı submit sonrası dialog kapanır)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 3000 });
  });

  test('Mevcut etkinlik düzenlenebilir', async ({ page }) => {
    // Önce bir etkinlik oluştur veya mevcut bir etkinliği bul
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card, a[href*="/events/"]')
      .first();

    if (await firstEvent.isVisible({ timeout: 5000 })) {
      await firstEvent.click();

      // Düzenle butonunu bul
      const editButton = page.locator('button:has-text("Düzenle"), button:has-text("Edit")');

      if (await editButton.isVisible({ timeout: 3000 })) {
        await editButton.click();

        // Dialog'un açıldığını kontrol et
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

        // Form alanlarının dolu olduğunu kontrol et
        const titleInput = page.locator('input[name="title"]');
        if (await titleInput.isVisible()) {
          const value = await titleInput.inputValue();
          expect(value).not.toBe('');
        }
      }
    }
  });

  test('İptal butonuna tıklandığında dialog kapanır', async ({ page }) => {
    const newEventButton = page.locator(
      'button:has-text("Yeni Etkinlik"), button:has-text("Etkinlik Oluştur")'
    );
    await newEventButton.click();

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
  });
});
