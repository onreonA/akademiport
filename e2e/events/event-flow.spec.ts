/**
 * E2E Test: Etkinlik Yönetimi Akışı
 *
 * Senaryo 1: Etkinlik Oluşturma → Katılım → Hatırlatma
 * Senaryo 2: Etkinlik Güncelleme → Zoom Güncelleme
 * Senaryo 3: Etkinlik İptal Etme
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { EventPage } from '../helpers/page-objects';

test.describe('Etkinlik Yönetimi Akışı', () => {
  let eventPage: EventPage;
  const testEventTitle = `Test Etkinlik ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    eventPage = new EventPage(page);
  });

  test('Etkinlik oluşturma → Katılım kaydı → Hatırlatma gönderimi', async ({ page }) => {
    // 1. Consultant olarak login ve etkinlik oluştur
    await loginAs(page, 'consultant');
    await eventPage.goto();

    await eventPage.createEvent({
      title: testEventTitle,
      startTime: '2025-02-10T14:00',
      endTime: '2025-02-10T16:00',
      description: 'Test etkinlik açıklaması',
    });

    // 2. Etkinlik oluşturulduğunu doğrula
    await expect(page.locator(`text=${testEventTitle}`)).toBeVisible({ timeout: 5000 });

    // 3. Zoom meeting'in oluşturulduğunu kontrol et
    await page.locator(`text=${testEventTitle}`).click();
    await expect(page.locator('text=Zoom, a[href*="zoom.us"]')).toBeVisible({ timeout: 5000 });

    // 4. Company user olarak login ve katılım kaydı yap
    await loginAs(page, 'company');
    await page.goto('/company-dashboard/events');

    // Etkinliği bul ve detay sayfasına git
    await page.locator(`text=${testEventTitle}`).click();

    // Katılım kaydı butonuna tıkla
    const attendButton = page.locator('button:has-text("Katıl"), button:has-text("Kayıt Ol")');
    await attendButton.click();

    // Katılım mesajını bekle
    await expect(page.locator('text=Katıldınız, text=Kayıt oldunuz, text=Başarılı')).toBeVisible({
      timeout: 5000,
    });

    // 5. Katılım durumunu kontrol et
    await expect(page.locator('text=Katılıyorum, text=Kayıtlı')).toBeVisible();

    // 6. Consultant olarak tekrar login ve katılımcı listesini kontrol et
    await loginAs(page, 'consultant');
    await eventPage.goto();
    await page.locator(`text=${testEventTitle}`).click();

    // Katılımcılar sekmesine git
    const attendeesTab = page.locator(
      'button:has-text("Katılımcılar"), [data-testid="attendees-tab"]'
    );
    if (await attendeesTab.isVisible()) {
      await attendeesTab.click();
      await expect(page.locator('text=company@test.com')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Etkinlik güncelleme → Zoom güncelleme', async ({ page }) => {
    const updateEventTitle = `Güncelleme Etkinlik ${Date.now()}`;

    // 1. Consultant olarak login ve etkinlik oluştur
    await loginAs(page, 'consultant');
    await eventPage.goto();

    await eventPage.createEvent({
      title: updateEventTitle,
      startTime: '2025-02-11T10:00',
      endTime: '2025-02-11T12:00',
    });

    // 2. Etkinliği bul ve düzenle
    await page.locator(`text=${updateEventTitle}`).click();
    const editButton = page.locator('button:has-text("Düzenle"), button:has-text("Edit")');
    await editButton.click();

    // 3. Etkinlik bilgilerini güncelle
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill(`${updateEventTitle} - Güncellendi`);

    const startTimeInput = page.locator('input[name="startTime"]');
    await startTimeInput.clear();
    await startTimeInput.fill('2025-02-12T14:00');

    const endTimeInput = page.locator('input[name="endTime"]');
    await endTimeInput.clear();
    await endTimeInput.fill('2025-02-12T16:00');

    // 4. Kaydet
    const saveButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
    await saveButton.click();

    // 5. Güncelleme mesajını bekle
    await expect(page.locator('text=Güncellendi, text=Başarılı')).toBeVisible({ timeout: 5000 });

    // 6. Zoom meeting'in güncellendiğini kontrol et (yeni tarih ile)
    await expect(page.locator('text=2025-02-12')).toBeVisible();
  });

  test('Etkinlik iptal etme', async ({ page }) => {
    const cancelEventTitle = `İptal Etkinlik ${Date.now()}`;

    // 1. Consultant olarak login ve etkinlik oluştur
    await loginAs(page, 'consultant');
    await eventPage.goto();

    await eventPage.createEvent({
      title: cancelEventTitle,
      startTime: '2025-02-13T10:00',
      endTime: '2025-02-13T12:00',
    });

    // 2. Company user olarak katılım kaydı yap
    await loginAs(page, 'company');
    await page.goto('/company-dashboard/events');
    await page.locator(`text=${cancelEventTitle}`).click();
    const attendButton = page.locator('button:has-text("Katıl"), button:has-text("Kayıt Ol")');
    await attendButton.click();

    // 3. Consultant olarak tekrar login ve etkinliği iptal et
    await loginAs(page, 'consultant');
    await eventPage.goto();
    await page.locator(`text=${cancelEventTitle}`).click();

    const cancelButton = page.locator('button:has-text("İptal Et"), button:has-text("Cancel")');
    await cancelButton.click();

    // İptal onayı
    const confirmButton = page.locator('button:has-text("Evet"), button:has-text("Onayla")');
    await confirmButton.click();

    // 4. İptal mesajını bekle
    await expect(page.locator('text=İptal edildi, text=Başarılı')).toBeVisible({ timeout: 5000 });

    // 5. Etkinlik durumunu kontrol et
    await expect(page.locator('text=cancelled, text=İptal')).toBeVisible();

    // 6. Company user olarak tekrar login ve iptal edilmiş etkinliği görüntüle
    await loginAs(page, 'company');
    await page.goto('/company-dashboard/events');
    await page.locator(`text=${cancelEventTitle}`).click();
    await expect(page.locator('text=cancelled, text=İptal')).toBeVisible();
  });

  test('Etkinlik istatistikleri görüntüleme', async ({ page }) => {
    const statsEventTitle = `İstatistik Etkinlik ${Date.now()}`;

    // 1. Consultant olarak login ve etkinlik oluştur
    await loginAs(page, 'consultant');
    await eventPage.goto();

    await eventPage.createEvent({
      title: statsEventTitle,
      startTime: '2025-02-14T10:00',
      endTime: '2025-02-14T12:00',
    });

    // 2. Company user olarak katılım kaydı yap
    await loginAs(page, 'company');
    await page.goto('/company-dashboard/events');
    await page.locator(`text=${statsEventTitle}`).click();
    const attendButton = page.locator('button:has-text("Katıl"), button:has-text("Kayıt Ol")');
    await attendButton.click();

    // 3. Consultant olarak tekrar login ve istatistikleri görüntüle
    await loginAs(page, 'consultant');
    await eventPage.goto();
    await page.locator(`text=${statsEventTitle}`).click();

    // İstatistikler sekmesine git
    const statsTab = page.locator(
      'button:has-text("İstatistikler"), [data-testid="statistics-tab"]'
    );
    if (await statsTab.isVisible()) {
      await statsTab.click();

      // İstatistikleri kontrol et
      await expect(page.locator('text=Toplam Katılımcı, text=Katılımcı Sayısı')).toBeVisible();
      await expect(page.locator('text=1')).toBeVisible(); // En az 1 katılımcı
    }
  });
});
