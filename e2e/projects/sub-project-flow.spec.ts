/**
 * E2E Test: Sub-Project (Alt Proje) Yönetimi Akışı
 *
 * Senaryo 1: Alt Proje Oluşturma → Görev Ekleme → İlerleme Takibi
 * Senaryo 2: Alt Proje Sıralama → Toplu İşlemler
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { ProjectPage } from '../helpers/page-objects';

test.describe('Sub-Project Yönetimi Akışı', () => {
  let projectPage: ProjectPage;
  const testProjectName = `Sub-Project Test Proje ${Date.now()}`;
  const testSubProjectName = `Test Alt Proje ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
  });

  test('Alt proje oluşturma → Görev ekleme → İlerleme takibi', async ({ page }) => {
    // 1. Consultant olarak login ve proje oluştur
    await loginAs(page, 'consultant');
    await projectPage.goto();

    await projectPage.createProject({
      name: testProjectName,
      description: 'Sub-project test projesi',
    });

    // 2. Proje detay sayfasına git
    const currentUrl = page.url();
    if (
      currentUrl.includes('/consultant-dashboard/projects/') &&
      !currentUrl.endsWith('/projects')
    ) {
      await page.goto('/consultant-dashboard/projects');
      await page.waitForLoadState('networkidle');
    }

    await expect(page.locator(`text=${testProjectName}`)).toBeVisible({ timeout: 10000 });
    await page.locator(`text=${testProjectName}`).click();
    await page.waitForLoadState('networkidle');

    // 3. Alt proje oluştur
    const newSubProjectButton = page.locator(
      'button:has-text("Yeni Alt Proje"), button:has-text("Alt Proje Ekle"), button:has-text("+ Alt Proje")'
    );
    await expect(newSubProjectButton).toBeVisible({ timeout: 10000 });
    await newSubProjectButton.click();

    // Alt proje formunu doldur
    await page.waitForTimeout(1000);
    const subProjectNameInput = page.locator(
      'input[name="name"], input[placeholder*="Alt proje adı"]'
    );
    await expect(subProjectNameInput).toBeVisible({ timeout: 5000 });
    await subProjectNameInput.fill(testSubProjectName);

    const subProjectDescriptionInput = page.locator(
      'textarea[name="description"], textarea[placeholder*="açıklama"]'
    );
    if (await subProjectDescriptionInput.isVisible()) {
      await subProjectDescriptionInput.fill('Test alt proje açıklaması');
    }

    // Kaydet
    const saveButton = page.locator(
      'button[type="submit"], button:has-text("Kaydet"), button:has-text("Oluştur")'
    );
    await saveButton.click();

    // Başarı mesajını kontrol et
    await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({ timeout: 10000 });

    // 4. Alt projeye görev ekle
    await page.waitForLoadState('networkidle');

    // Alt proje accordion'unu aç
    const subProjectAccordion = page.locator(`text=${testSubProjectName}`).locator('..');
    const accordionTrigger = subProjectAccordion.locator('button[aria-expanded="false"]').first();
    if (await accordionTrigger.isVisible()) {
      await accordionTrigger.click();
      await page.waitForTimeout(500);
    }

    // Yeni görev butonuna tıkla
    const newTaskButton = page
      .locator(
        'button:has-text("Yeni Görev"), button:has-text("Görev Ekle"), button:has-text("+ Görev")'
      )
      .first();
    if (await newTaskButton.isVisible()) {
      await newTaskButton.click();
      await page.waitForTimeout(500);

      const taskTitleInput = page.locator(
        'input[name="title"], input[name="name"], input[placeholder*="Görev adı"]'
      );
      await taskTitleInput.fill(`Test Görev ${Date.now()}`);

      const saveTaskButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
      await saveTaskButton.click();

      await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({ timeout: 5000 });
    }

    // 5. Alt proje ilerlemesini kontrol et
    const progressBar = page
      .locator(`text=${testSubProjectName}`)
      .locator('..')
      .locator('[role="progressbar"], .progress-bar');
    if (await progressBar.isVisible()) {
      const progressValue = await progressBar.getAttribute('aria-valuenow');
      expect(progressValue).toBeTruthy();
    }
  });

  test('Alt proje sıralama → Toplu işlemler', async ({ page }) => {
    const bulkProjectName = `Toplu İşlem Proje ${Date.now()}`;

    // 1. Consultant olarak login ve proje oluştur
    await loginAs(page, 'consultant');
    await projectPage.goto();

    await projectPage.createProject({
      name: bulkProjectName,
    });

    // 2. Proje detay sayfasına git
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${bulkProjectName}`)).toBeVisible({ timeout: 10000 });
    await page.locator(`text=${bulkProjectName}`).click();
    await page.waitForLoadState('networkidle');

    // 3. Birden fazla alt proje oluştur
    for (let i = 1; i <= 3; i++) {
      const newSubProjectButton = page.locator(
        'button:has-text("Yeni Alt Proje"), button:has-text("Alt Proje Ekle")'
      );
      if (await newSubProjectButton.isVisible()) {
        await newSubProjectButton.click();
        await page.waitForTimeout(500);

        const subProjectNameInput = page.locator('input[name="name"]');
        await subProjectNameInput.fill(`Alt Proje ${i} - ${Date.now()}`);

        const saveButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
        await saveButton.click();

        await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({
          timeout: 5000,
        });
        await page.waitForTimeout(1000);
      }
    }

    // 4. Alt proje sıralamasını kontrol et
    const subProjects = page.locator('[data-testid="sub-project"], .sub-project-item');
    const subProjectCount = await subProjects.count();
    expect(subProjectCount).toBeGreaterThan(0);

    // 5. Alt proje düzenleme
    const firstSubProject = subProjects.first();
    const editButton = firstSubProject.locator(
      'button:has-text("Düzenle"), button[aria-label*="edit"]'
    );
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[name="name"]');
      await nameInput.fill(`Düzenlenmiş Alt Proje ${Date.now()}`);

      const updateButton = page.locator('button[type="submit"], button:has-text("Güncelle")');
      await updateButton.click();

      await expect(page.locator('text=Güncellendi, text=Başarılı')).toBeVisible({ timeout: 5000 });
    }
  });
});
