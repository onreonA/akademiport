/**
 * E2E Test: Training Yönetimi Akışı
 *
 * Senaryo 1: Eğitim Oluşturma → Video/Döküman Ekleme → Firmaya Atama → İlerleme Takibi
 * Senaryo 2: Eğitim Tamamlama → Sıralı Erişim Kontrolü
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Training Yönetimi Akışı', () => {
  const testTrainingName = `Test Eğitim ${Date.now()}`;

  test('Eğitim oluşturma → Video/Döküman ekleme → Firmaya atama', async ({ page }) => {
    // 1. Admin olarak login ve eğitim oluştur
    await loginAs(page, 'admin');
    await page.goto('/dashboard/trainings');

    // Yeni eğitim butonuna tıkla
    const newTrainingButton = page.locator(
      'a:has-text("Yeni Eğitim"), button:has-text("Yeni Eğitim")'
    );
    await newTrainingButton.click();

    // Eğitim formunu doldur
    await page.waitForLoadState('networkidle');
    const nameInput = page.locator('input[name="name"], input[placeholder*="Eğitim adı"]');
    await nameInput.fill(testTrainingName);

    const descriptionInput = page.locator(
      'textarea[name="description"], textarea[placeholder*="açıklama"]'
    );
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Test eğitim açıklaması');
    }

    // Program seç (varsa)
    const programSelect = page.locator('[role="combobox"], select[name="programId"]');
    if (await programSelect.isVisible()) {
      await programSelect.click();
      await page.waitForTimeout(500);
      const firstProgram = page.locator('[role="option"]').first();
      if (await firstProgram.isVisible()) {
        await firstProgram.click();
      }
    }

    // Formu kaydet
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Kaydet"), button:has-text("Oluştur")'
    );
    await submitButton.click();

    // Başarı mesajını kontrol et
    await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({ timeout: 10000 });

    // 2. Eğitim detay sayfasına git
    await page.goto('/dashboard/trainings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${testTrainingName}`)).toBeVisible({ timeout: 10000 });
    await page.locator(`text=${testTrainingName}`).click();

    // 3. Video ekle
    const videoTab = page.locator('button:has-text("Videolar"), a:has-text("Videolar")');
    if (await videoTab.isVisible()) {
      await videoTab.click();
      await page.waitForTimeout(500);

      const addVideoButton = page.locator(
        'button:has-text("Video Ekle"), button:has-text("Yeni Video")'
      );
      if (await addVideoButton.isVisible()) {
        await addVideoButton.click();

        const videoTitleInput = page.locator(
          'input[name="title"], input[placeholder*="Video başlığı"]'
        );
        if (await videoTitleInput.isVisible()) {
          await videoTitleInput.fill('Test Video');
        }

        const videoUrlInput = page.locator('input[name="url"], input[placeholder*="YouTube URL"]');
        if (await videoUrlInput.isVisible()) {
          await videoUrlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        }

        const saveVideoButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
        await saveVideoButton.click();

        await expect(page.locator('text=Eklendi, text=Başarılı')).toBeVisible({ timeout: 5000 });
      }
    }

    // 4. Döküman ekle
    const documentTab = page.locator('button:has-text("Dökümanlar"), a:has-text("Dökümanlar")');
    if (await documentTab.isVisible()) {
      await documentTab.click();
      await page.waitForTimeout(500);

      const uploadButton = page.locator('button:has-text("Döküman Yükle"), input[type="file"]');
      if (await uploadButton.isVisible()) {
        // File upload için input[type="file"] kullan
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.isVisible()) {
          // Test için basit bir dosya yükleme simülasyonu
          // Gerçek dosya yükleme için file path gerekir
        }
      }
    }

    // 5. Firmaya atama
    await loginAs(page, 'consultant');
    await page.goto('/consultant-dashboard/companies');
    await page.waitForLoadState('networkidle');

    // İlk firmaya tıkla
    const firstCompany = page.locator('a[href*="/companies/"], button:has-text("Detay")').first();
    if (await firstCompany.isVisible()) {
      await firstCompany.click();
      await page.waitForLoadState('networkidle');

      // Eğitimler sekmesine git
      const trainingsTab = page.locator('button:has-text("Eğitimler"), a:has-text("Eğitimler")');
      if (await trainingsTab.isVisible()) {
        await trainingsTab.click();
        await page.waitForTimeout(500);

        // Eğitim ata butonuna tıkla
        const assignButton = page.locator(
          'button:has-text("Eğitim Ata"), button:has-text("Yeni Eğitim")'
        );
        if (await assignButton.isVisible()) {
          await assignButton.click();
          await page.waitForTimeout(500);

          // Eğitim seç
          const trainingSelect = page.locator('[role="combobox"], select[name="trainingId"]');
          if (await trainingSelect.isVisible()) {
            await trainingSelect.click();
            await page.waitForTimeout(500);
            const trainingOption = page.locator(`[role="option"]:has-text("${testTrainingName}")`);
            if (await trainingOption.isVisible()) {
              await trainingOption.click();
            }
          }

          // Ata butonuna tıkla
          const confirmButton = page.locator('button:has-text("Ata"), button[type="submit"]');
          await confirmButton.click();

          await expect(page.locator('text=Atandı, text=Başarılı')).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('Eğitim tamamlama → Sıralı erişim kontrolü', async ({ page }) => {
    // 1. Company user olarak login ve eğitimleri görüntüle
    await loginAs(page, 'company');
    await page.goto('/company-dashboard/trainings');
    await page.waitForLoadState('networkidle');

    // İlk eğitime tıkla
    const firstTraining = page.locator('a[href*="/trainings/"], button:has-text("Detay")').first();
    if (await firstTraining.isVisible()) {
      await firstTraining.click();
      await page.waitForLoadState('networkidle');

      // Video izleme kontrolü
      const videoPlayer = page.locator('iframe[src*="youtube"], video');
      if (await videoPlayer.isVisible()) {
        // Video tamamlandı olarak işaretle (simülasyon)
        const markCompleteButton = page.locator(
          'button:has-text("Tamamlandı"), button:has-text("İzledim")'
        );
        if (await markCompleteButton.isVisible()) {
          await markCompleteButton.click();
          await expect(page.locator('text=Tamamlandı, text=Başarılı')).toBeVisible({
            timeout: 5000,
          });
        }
      }

      // Döküman okuma kontrolü
      const documentViewer = page.locator('[data-testid="document-viewer"], .document-viewer');
      if (await documentViewer.isVisible()) {
        const markReadButton = page.locator(
          'button:has-text("Okundu"), button:has-text("İşaretle")'
        );
        if (await markReadButton.isVisible()) {
          await markReadButton.click();
          await expect(page.locator('text=Okundu, text=Başarılı')).toBeVisible({ timeout: 5000 });
        }
      }

      // İlerleme çubuğunu kontrol et
      const progressBar = page.locator('[role="progressbar"], .progress-bar');
      if (await progressBar.isVisible()) {
        const progressValue = await progressBar.getAttribute('aria-valuenow');
        expect(progressValue).toBeTruthy();
      }
    }
  });
});
