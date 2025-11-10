/**
 * E2E Test: Randevu Yönetimi Akışı
 *
 * Senaryo 1: Randevu Oluşturma → Danışman Onaylama → Randevu Tamamlama
 * Senaryo 2: Randevu Oluşturma → Danışman Reddetme
 * Senaryo 3: Randevu Revize Etme
 * Senaryo 4: Müsaitlik Kontrolü
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { AppointmentPage } from '../helpers/page-objects';

test.describe('Randevu Yönetimi Akışı', () => {
  let appointmentPage: AppointmentPage;
  const testAppointmentTitle = `Test Randevu ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    appointmentPage = new AppointmentPage(page);
  });

  test('Randevu oluşturma → Danışman onaylama → Randevu tamamlama', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');
    await appointmentPage.goto();

    // 2. Randevu talep et
    await appointmentPage.createAppointment({
      title: testAppointmentTitle,
      consultantName: 'Test Consultant', // Consultant tam adı
      startTime: '2025-02-01T10:00',
      endTime: '2025-02-01T11:00',
      notes: 'Test randevu notu',
    });

    // 3. Randevu oluşturulduğunu doğrula
    await appointmentPage.expectAppointmentVisible(testAppointmentTitle);
    await appointmentPage.expectAppointmentStatus(testAppointmentTitle, 'pending');

    // 4. Consultant olarak login
    // Önce logout yap
    await page.goto('/logout');
    await page.waitForTimeout(1000);
    await loginAs(page, 'consultant');
    await appointmentPage.gotoConsultant();

    // 5. Randevuyu görüntüle ve onayla
    await appointmentPage.expectAppointmentVisible(testAppointmentTitle);
    await appointmentPage.approveAppointment(testAppointmentTitle);

    // 6. Randevu onaylandığını doğrula
    await appointmentPage.expectAppointmentStatus(testAppointmentTitle, 'approved');

    // 7. Zoom link'inin oluştuğunu kontrol et
    await page.locator(`text=${testAppointmentTitle}`).click();
    await expect(page.locator('text=Zoom, a[href*="zoom.us"]')).toBeVisible({ timeout: 5000 });

    // 8. Company user olarak tekrar login
    await page.goto('/logout');
    await page.waitForTimeout(1000);
    await loginAs(page, 'company');
    await appointmentPage.goto();

    // 9. Onaylanmış randevuyu görüntüle
    await appointmentPage.expectAppointmentVisible(testAppointmentTitle);
    await appointmentPage.expectAppointmentStatus(testAppointmentTitle, 'approved');
  });

  test('Randevu oluşturma → Danışman reddetme', async ({ page }) => {
    const rejectionTitle = `Red Randevu ${Date.now()}`;

    // 1. Company user olarak login ve randevu oluştur
    await loginAs(page, 'company');
    await appointmentPage.goto();
    await appointmentPage.createAppointment({
      title: rejectionTitle,
      consultantName: 'Test Consultant',
      startTime: '2025-02-02T10:00',
      endTime: '2025-02-02T11:00',
    });

    // 2. Consultant olarak login ve randevuyu reddet
    await loginAs(page, 'consultant');
    await appointmentPage.gotoConsultant();
    await appointmentPage.rejectAppointment(rejectionTitle, 'Test red nedeni');

    // 3. Randevu reddedildiğini doğrula
    await appointmentPage.expectAppointmentStatus(rejectionTitle, 'rejected');

    // 4. Company user olarak tekrar login ve reddedilmiş randevuyu görüntüle
    await loginAs(page, 'company');
    await appointmentPage.goto();
    await appointmentPage.expectAppointmentStatus(rejectionTitle, 'rejected');
  });

  test('Randevu revize etme', async ({ page }) => {
    const rescheduleTitle = `Revize Randevu ${Date.now()}`;

    // 1. Company user olarak login ve randevu oluştur
    await loginAs(page, 'company');
    await appointmentPage.goto();
    await appointmentPage.createAppointment({
      title: rescheduleTitle,
      consultantName: 'Test Consultant',
      startTime: '2025-02-03T10:00',
      endTime: '2025-02-03T11:00',
    });

    // 2. Consultant olarak login ve randevuyu revize et
    await loginAs(page, 'consultant');
    await appointmentPage.gotoConsultant();
    await page.locator(`text=${rescheduleTitle}`).click();

    // Revize butonuna tıkla
    const rescheduleButton = page.locator(
      'button:has-text("Revize"), button:has-text("Yeniden Planla")'
    );
    await rescheduleButton.click();

    // Yeni tarih/saat gir
    const newStartTimeInput = page
      .locator('input[name="newStartTime"], input[type="datetime-local"]')
      .first();
    const newEndTimeInput = page
      .locator('input[name="newEndTime"], input[type="datetime-local"]')
      .last();
    await newStartTimeInput.fill('2025-02-04T14:00');
    await newEndTimeInput.fill('2025-02-04T15:00');

    // Revize onayla
    const confirmButton = page.locator('button:has-text("Revize Et"), button:has-text("Onayla")');
    await confirmButton.click();

    // Revize mesajını bekle
    await expect(page.locator('text=Revize, text=Başarılı')).toBeVisible({ timeout: 5000 });

    // 3. Eski randevunun cancelled olduğunu kontrol et
    await appointmentPage.expectAppointmentStatus(rescheduleTitle, 'cancelled');
  });

  test('Müsaitlik kontrolü - Çakışan randevu', async ({ page }) => {
    const conflictTitle = `Çakışma Randevu ${Date.now()}`;

    // 1. Company user olarak login ve randevu oluştur
    await loginAs(page, 'company');
    await appointmentPage.goto();
    await appointmentPage.createAppointment({
      title: conflictTitle,
      consultantName: 'Test Consultant',
      startTime: '2025-02-05T10:00',
      endTime: '2025-02-05T11:00',
    });

    // 2. Consultant olarak onayla
    await loginAs(page, 'consultant');
    await appointmentPage.gotoConsultant();
    await appointmentPage.approveAppointment(conflictTitle);

    // 3. Aynı saatte başka bir randevu oluşturmaya çalış
    await loginAs(page, 'company');
    await appointmentPage.goto();
    await appointmentPage.newAppointmentButton.click();

    await appointmentPage.titleInput.fill(`Çakışma Test ${Date.now()}`);

    // Consultant select için Radix UI Select
    const consultantSelectTrigger = page
      .locator('#consultant, [id="consultant"]')
      .locator('..')
      .locator('[role="combobox"]')
      .first();
    await consultantSelectTrigger.click();
    await page.waitForTimeout(300);
    const consultantOption = page
      .locator('[role="option"]')
      .filter({ hasText: /test consultant/i })
      .first();
    if ((await consultantOption.count()) > 0) {
      await consultantOption.click();
    } else {
      await page.locator('[role="option"]').first().click();
    }

    await appointmentPage.startTimeInput.fill('2025-02-05T10:30'); // Çakışan saat
    await appointmentPage.endTimeInput.fill('2025-02-05T11:30');
    await appointmentPage.submitButton.click();

    // 4. Çakışma hatası mesajını kontrol et
    await expect(page.locator('text=Çakışma, text=Müsait değil, text=Uygun değil')).toBeVisible({
      timeout: 5000,
    });
  });
});
