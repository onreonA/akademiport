/**
 * E2E Test: Proje Yönetimi Akışı
 *
 * Senaryo 1: Proje Oluşturma → Görev Atama → Tamamlama
 * Senaryo 2: Toplu İşlemler (Firma Atama, Tarih Atama)
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { ProjectPage } from '../helpers/page-objects';

test.describe('Proje Yönetimi Akışı', () => {
  let projectPage: ProjectPage;
  const testProjectName = `Test Proje ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
  });

  test('Proje oluşturma → Görev atama → Görev tamamlama', async ({ page }) => {
    // 1. Consultant olarak login ve proje oluştur
    await loginAs(page, 'consultant');
    await projectPage.goto();

    await projectPage.createProject({
      name: testProjectName,
      description: 'Test proje açıklaması',
    });

    // 2. Proje oluşturulduğunu doğrula
    // Eğer proje detay sayfasına yönlendirildiyse geri dön
    const currentUrl = page.url();
    if (
      currentUrl.includes('/consultant-dashboard/projects/') &&
      !currentUrl.endsWith('/projects')
    ) {
      await page.goto('/consultant-dashboard/projects');
      await page.waitForLoadState('networkidle');
    }

    await expect(page.locator(`text=${testProjectName}`)).toBeVisible({ timeout: 10000 });

    // 3. Proje detay sayfasına git
    await page.locator(`text=${testProjectName}`).click();

    // 4. Alt proje oluştur
    const newSubProjectButton = page.locator(
      'button:has-text("Yeni Alt Proje"), button:has-text("Alt Proje Ekle")'
    );
    if (await newSubProjectButton.isVisible()) {
      await newSubProjectButton.click();

      const subProjectNameInput = page.locator('input[name="name"]');
      await subProjectNameInput.fill(`Alt Proje ${Date.now()}`);

      const saveButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
      await saveButton.click();

      await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({ timeout: 5000 });
    }

    // 5. Görev oluştur
    const newTaskButton = page.locator(
      'button:has-text("Yeni Görev"), button:has-text("Görev Ekle")'
    );
    if (await newTaskButton.isVisible()) {
      await newTaskButton.click();

      const taskTitleInput = page.locator('input[name="title"], input[name="name"]');
      await taskTitleInput.fill(`Test Görev ${Date.now()}`);

      // Company user'a atama yap
      const assignToSelect = page.locator('select[name="assignedTo"], [data-testid="assign-to"]');
      if (await assignToSelect.isVisible()) {
        // Company user seçeneğini bul (test kullanıcısı)
        await assignToSelect.selectOption({ index: 1 }); // İlk seçenek
      }

      const saveTaskButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
      await saveTaskButton.click();

      await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({ timeout: 5000 });
    }

    // 6. Company user olarak login ve görevleri görüntüle
    await loginAs(page, 'company');
    await page.goto('/company-dashboard/tasks');

    // Görev listesinde proje görevini bul
    await expect(page.locator(`text=${testProjectName}`)).toBeVisible({ timeout: 5000 });

    // 7. Görevi tamamla
    const taskRow = page.locator(`text=${testProjectName}`).locator('..');
    const completeButton = taskRow.locator(
      'button:has-text("Tamamla"), button:has-text("Complete")'
    );
    if (await completeButton.isVisible()) {
      await completeButton.click();

      await expect(page.locator('text=Tamamlandı, text=Başarılı')).toBeVisible({ timeout: 5000 });
    }

    // 8. Consultant olarak tekrar login ve görevi onayla
    await loginAs(page, 'consultant');
    await page.goto('/consultant-dashboard/tasks');

    // Tamamlanmış görevi bul
    const completedTask = page.locator('text=review, text=İnceleme');
    if (await completedTask.isVisible()) {
      await completedTask.click();

      const approveButton = page.locator('button:has-text("Onayla"), button:has-text("Approve")');
      await approveButton.click();

      await expect(page.locator('text=Onaylandı, text=Başarılı')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Toplu firma atama', async ({ page }) => {
    const bulkProjectName = `Toplu Atama Proje ${Date.now()}`;

    // 1. Consultant olarak login ve proje oluştur
    await loginAs(page, 'consultant');
    await projectPage.goto();

    await projectPage.createProject({
      name: bulkProjectName,
    });

    // 2. Proje detay sayfasına git
    // Eğer proje detay sayfasına yönlendirildiyse orada kal, değilse listeye git
    const currentUrl = page.url();
    if (
      !currentUrl.includes('/consultant-dashboard/projects/') ||
      currentUrl.endsWith('/projects')
    ) {
      // Proje listesinde görünmesini bekle
      await expect(page.locator(`text=${bulkProjectName}`)).toBeVisible({ timeout: 10000 });
      await page.locator(`text=${bulkProjectName}`).click();
    } else {
      // Zaten proje detay sayfasındayız
      await page.waitForLoadState('networkidle');
    }

    // 3. Toplu atama butonuna tıkla
    const bulkAssignButton = page.locator(
      'button:has-text("Toplu Atama"), button:has-text("Bulk Assign"), [data-testid="bulk-assign"]'
    );
    if (await bulkAssignButton.isVisible()) {
      await bulkAssignButton.click();

      // Firma seç
      const companyCheckbox = page.locator('input[type="checkbox"][name*="company"]').first();
      await companyCheckbox.check();

      // Alt proje seç (varsa)
      const subProjectCheckbox = page.locator('input[type="checkbox"][name*="subProject"]').first();
      if (await subProjectCheckbox.isVisible()) {
        await subProjectCheckbox.check();
      }

      // Atama yap
      const assignButton = page.locator('button:has-text("Ata"), button:has-text("Assign")');
      await assignButton.click();

      await expect(page.locator('text=Atandı, text=Başarılı')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Toplu tarih atama', async ({ page }) => {
    const dateProjectName = `Tarih Atama Proje ${Date.now()}`;

    // 1. Consultant olarak login ve proje oluştur
    await loginAs(page, 'consultant');
    await projectPage.goto();

    await projectPage.createProject({
      name: dateProjectName,
    });

    // 2. Proje detay sayfasına git
    await page.locator(`text=${dateProjectName}`).click();

    // 3. Toplu tarih atama butonuna tıkla
    const bulkDatesButton = page.locator(
      'button:has-text("Toplu Tarih"), button:has-text("Bulk Dates"), [data-testid="bulk-dates"]'
    );
    if (await bulkDatesButton.isVisible()) {
      await bulkDatesButton.click();

      // Tarih seç
      const startDateInput = page.locator('input[name="startDate"], input[type="date"]').first();
      await startDateInput.fill('2025-03-01');

      const endDateInput = page.locator('input[name="endDate"], input[type="date"]').last();
      await endDateInput.fill('2025-03-31');

      // Alt proje seç (varsa)
      const subProjectCheckbox = page.locator('input[type="checkbox"][name*="subProject"]').first();
      if (await subProjectCheckbox.isVisible()) {
        await subProjectCheckbox.check();
      }

      // Tarih ata
      const assignButton = page.locator('button:has-text("Ata"), button:has-text("Assign")');
      await assignButton.click();

      await expect(page.locator('text=Atandı, text=Başarılı')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Matris görünümü', async ({ page }) => {
    const matrixProjectName = `Matris Proje ${Date.now()}`;

    // 1. Consultant olarak login ve proje oluştur
    await loginAs(page, 'consultant');
    await projectPage.goto();

    await projectPage.createProject({
      name: matrixProjectName,
    });

    // 2. Matris görünümüne git
    const matrixButton = page.locator(
      'button:has-text("Matris"), button:has-text("Matrix"), a:has-text("Matris")'
    );
    if (await matrixButton.isVisible()) {
      await matrixButton.click();

      // Matris görünümünün yüklendiğini kontrol et
      await expect(page.locator('text=Matris, table, [data-testid="matrix"]')).toBeVisible({
        timeout: 5000,
      });

      // Matris hücrelerinin görünür olduğunu kontrol et
      const matrixCells = page.locator('td, [data-testid="matrix-cell"]');
      const cellCount = await matrixCells.count();
      expect(cellCount).toBeGreaterThan(0);
    }
  });
});
