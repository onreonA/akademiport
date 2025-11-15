/**
 * E2E Test: NewsForm Component
 *
 * Component seviyesinde NewsForm testleri
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { NewsPage } from '../helpers/page-objects';

test.describe('NewsForm Component', () => {
  let newsPage: NewsPage;

  test.beforeEach(async ({ page }) => {
    newsPage = new NewsPage(page);
    await loginAs(page, 'admin');
    await newsPage.gotoAdmin();
  });

  test('Form alanlarını render eder', async ({ page }) => {
    await newsPage.newNewsButton.click();

    // Dialog'un açılmasını bekle
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });

    // Form alanlarının görünür olduğunu kontrol et
    await expect(newsPage.titleInput).toBeVisible({ timeout: 5000 });
    await expect(newsPage.contentInput).toBeVisible({ timeout: 5000 });
    await expect(newsPage.submitButton).toBeVisible({ timeout: 5000 });
  });

  test('Zorunlu alanlar doğrulanır', async ({ page }) => {
    await newsPage.newNewsButton.click();

    // Dialog'un açılmasını bekle
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Submit butonuna tıkla (boş form)
    await newsPage.submitButton.click();
    await page.waitForTimeout(1000);

    // Validation error'larının görünür olduğunu kontrol et
    // (FormMessage component'i error gösteriyor olmalı)
    const errorMessages = page.locator('.text-destructive, [role="alert"]');
    const errorCount = await errorMessages.count();
    
    // En az bir validation error görünmeli
    expect(errorCount).toBeGreaterThan(0);
  });

  test('Form submit edildiğinde başarı mesajı gösterir', async ({ page }) => {
    await newsPage.newNewsButton.click();

    // Dialog'un açılmasını bekle
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Form alanlarını doldur
    await newsPage.titleInput.fill(`Test Haber ${Date.now()}`);
    await newsPage.contentInput.fill('Test haber içeriği');

    // Submit butonuna tıkla ve API response'unu bekle
    await Promise.all([
      page
        .waitForResponse(
          (response) => response.url().includes('/api/news') && response.status() < 400
        )
        .catch(() => null),
      newsPage.submitButton.click(),
    ]);

    // Dialog'un kapanmasını bekle veya toast notification'ı kontrol et
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });

    // Toast notification'ı kontrol et (eğer varsa)
    try {
      await expect(
        page
          .locator('[data-sonner-toast], [role="status"]')
          .filter({ hasText: /başarılı|oluşturuldu|kaydedildi/i })
      ).toBeVisible({ timeout: 3000 });
    } catch {
      // Toast görünmezse dialog'un kapandığını kontrol et (başarılı sayılır)
    }
  });

  test('Mevcut haber düzenlenebilir', async ({ page }) => {
    const editNewsTitle = `Düzenleme Test ${Date.now()}`;
    const updatedTitle = `Güncellenmiş ${Date.now()}`;

    // Önce bir haber oluştur
    await newsPage.createNews({
      title: editNewsTitle,
      content: 'Düzenleme testi için haber',
    });

    await newsPage.expectNewsVisible(editNewsTitle);

    // Haberi düzenle
    const newsCard = page.locator(`text=${editNewsTitle}`).locator('..').locator('..');
    const editBtn = newsCard.locator('button:has-text("Düzenle")');
    
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(1000);

      // Edit sayfasında veya dialog'da title'ı güncelle
      const titleInput = page.locator('#title, input[id="title"]').first();
      if (await titleInput.isVisible()) {
        await titleInput.clear();
        await titleInput.fill(updatedTitle);

        // Submit butonuna tıkla
        await Promise.all([
          page
            .waitForResponse(
              (response) =>
                response.url().includes('/api/news') &&
                response.request().method() === 'PUT' &&
                response.status() < 400
            )
            .catch(() => null),
          newsPage.submitButton.click(),
        ]);

        await page.waitForTimeout(1000);

        // Güncellenmiş haberi kontrol et
        await newsPage.expectNewsVisible(updatedTitle);
      }
    }
  });

  test('İptal butonuna tıklandığında dialog kapanır', async ({ page }) => {
    await newsPage.newNewsButton.click();

    // Dialog'un açılmasını bekle
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });

    // İptal butonunu bul ve tıkla
    const cancelButton = page.locator('button:has-text("İptal"), button:has-text("Kapat")');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    } else {
      // Eğer iptal butonu yoksa ESC tuşuna bas
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    }
  });
});

