/**
 * E2E Test: Task Dependencies (Görev Bağımlılıkları) Akışı
 *
 * Senaryo 1: Görev Bağımlılığı Oluşturma → Bağımlılık Kontrolü → Sıralı Tamamlama
 * Senaryo 2: Döngüsel Bağımlılık Kontrolü → Bağımlılık Silme
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { ProjectPage } from '../helpers/page-objects';

test.describe('Task Dependencies Akışı', () => {
  let projectPage: ProjectPage;
  const testProjectName = `Task Dependencies Test Proje ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
  });

  test('Görev bağımlılığı oluşturma → Bağımlılık kontrolü → Sıralı tamamlama', async ({ page }) => {
    // 1. Consultant olarak login ve proje oluştur
    await loginAs(page, 'consultant');
    await projectPage.goto();

    await projectPage.createProject({
      name: testProjectName,
      description: 'Task dependencies test projesi',
    });

    // 2. Proje detay sayfasına git
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${testProjectName}`)).toBeVisible({ timeout: 10000 });
    await page.locator(`text=${testProjectName}`).click();
    await page.waitForLoadState('networkidle');

    // 3. Alt proje oluştur
    const newSubProjectButton = page.locator(
      'button:has-text("Yeni Alt Proje"), button:has-text("Alt Proje Ekle")'
    );
    if (await newSubProjectButton.isVisible()) {
      await newSubProjectButton.click();
      await page.waitForTimeout(500);

      const subProjectNameInput = page.locator('input[name="name"]');
      await subProjectNameInput.fill(`Alt Proje ${Date.now()}`);

      const saveButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
      await saveButton.click();
      await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);
    }

    // 4. İki görev oluştur
    const taskNames: string[] = [];
    for (let i = 1; i <= 2; i++) {
      const newTaskButton = page
        .locator('button:has-text("Yeni Görev"), button:has-text("Görev Ekle")')
        .first();
      if (await newTaskButton.isVisible()) {
        await newTaskButton.click();
        await page.waitForTimeout(500);

        const taskName = `Görev ${i} - ${Date.now()}`;
        taskNames.push(taskName);

        const taskTitleInput = page.locator('input[name="title"], input[name="name"]');
        await taskTitleInput.fill(taskName);

        const saveTaskButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
        await saveTaskButton.click();

        await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({
          timeout: 5000,
        });
        await page.waitForTimeout(1000);
      }
    }

    // 5. Görev bağımlılığı oluştur
    if (taskNames.length >= 2) {
      // İkinci görevi bul ve bağımlılık ekle
      const secondTask = page.locator(`text=${taskNames[1]}`).locator('..');
      const addDependencyButton = secondTask.locator(
        'button:has-text("Bağımlılık"), button[aria-label*="dependency"], button:has-text("+")'
      );

      if (await addDependencyButton.isVisible()) {
        await addDependencyButton.click();
        await page.waitForTimeout(500);

        // İlk görevi bağımlılık olarak seç
        const dependencySelect = page.locator('[role="combobox"], select[name="dependencyId"]');
        if (await dependencySelect.isVisible()) {
          await dependencySelect.click();
          await page.waitForTimeout(500);
          const firstTaskOption = page.locator(`[role="option"]:has-text("${taskNames[0]}")`);
          if (await firstTaskOption.isVisible()) {
            await firstTaskOption.click();
          }
        }

        // Bağımlılığı kaydet
        const saveDependencyButton = page.locator(
          'button[type="submit"], button:has-text("Kaydet")'
        );
        await saveDependencyButton.click();

        await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({
          timeout: 5000,
        });
      }

      // 6. Bağımlılık kontrolü - İkinci görev tamamlanamaz çünkü ilk görev tamamlanmadı
      const secondTaskCompleteButton = page
        .locator(`text=${taskNames[1]}`)
        .locator('..')
        .locator('button:has-text("Tamamla"), button[aria-label*="complete"]');

      if (await secondTaskCompleteButton.isVisible()) {
        // Buton disabled olmalı veya uyarı mesajı göstermeli
        const isDisabled = await secondTaskCompleteButton.isDisabled();
        if (!isDisabled) {
          await secondTaskCompleteButton.click();
          // Uyarı mesajı beklenmeli
          await expect(page.locator('text=Bağımlılık, text=önce tamamlanmalı')).toBeVisible({
            timeout: 5000,
          });
        }
      }

      // 7. İlk görevi tamamla
      const firstTaskCompleteButton = page
        .locator(`text=${taskNames[0]}`)
        .locator('..')
        .locator('button:has-text("Tamamla"), button[aria-label*="complete"]');

      if (await firstTaskCompleteButton.isVisible()) {
        await firstTaskCompleteButton.click();
        await expect(page.locator('text=Tamamlandı, text=Başarılı')).toBeVisible({ timeout: 5000 });
      }

      // 8. Şimdi ikinci görev tamamlanabilir olmalı
      if (await secondTaskCompleteButton.isVisible()) {
        const isEnabled = !(await secondTaskCompleteButton.isDisabled());
        expect(isEnabled).toBe(true);
      }
    }
  });

  test('Döngüsel bağımlılık kontrolü → Bağımlılık silme', async ({ page }) => {
    const circularProjectName = `Döngüsel Test Proje ${Date.now()}`;

    // 1. Consultant olarak login ve proje oluştur
    await loginAs(page, 'consultant');
    await projectPage.goto();

    await projectPage.createProject({
      name: circularProjectName,
    });

    // 2. Proje detay sayfasına git
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${circularProjectName}`)).toBeVisible({ timeout: 10000 });
    await page.locator(`text=${circularProjectName}`).click();
    await page.waitForLoadState('networkidle');

    // 3. Alt proje ve görevler oluştur
    const newSubProjectButton = page.locator(
      'button:has-text("Yeni Alt Proje"), button:has-text("Alt Proje Ekle")'
    );
    if (await newSubProjectButton.isVisible()) {
      await newSubProjectButton.click();
      await page.waitForTimeout(500);

      const subProjectNameInput = page.locator('input[name="name"]');
      await subProjectNameInput.fill(`Alt Proje ${Date.now()}`);

      const saveButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
      await saveButton.click();
      await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);
    }

    // 4. İki görev oluştur
    const taskNames: string[] = [];
    for (let i = 1; i <= 2; i++) {
      const newTaskButton = page
        .locator('button:has-text("Yeni Görev"), button:has-text("Görev Ekle")')
        .first();
      if (await newTaskButton.isVisible()) {
        await newTaskButton.click();
        await page.waitForTimeout(500);

        const taskName = `Görev ${i} - ${Date.now()}`;
        taskNames.push(taskName);

        const taskTitleInput = page.locator('input[name="title"], input[name="name"]');
        await taskTitleInput.fill(taskName);

        const saveTaskButton = page.locator('button[type="submit"], button:has-text("Kaydet")');
        await saveTaskButton.click();
        await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({
          timeout: 5000,
        });
        await page.waitForTimeout(1000);
      }
    }

    // 5. Döngüsel bağımlılık oluşturma denemesi (başarısız olmalı)
    if (taskNames.length >= 2) {
      // İlk görev → İkinci görev bağımlılığı
      const firstTask = page.locator(`text=${taskNames[0]}`).locator('..');
      const addDependencyButton1 = firstTask.locator(
        'button:has-text("Bağımlılık"), button[aria-label*="dependency"]'
      );

      if (await addDependencyButton1.isVisible()) {
        await addDependencyButton1.click();
        await page.waitForTimeout(500);

        const dependencySelect1 = page.locator('[role="combobox"], select[name="dependencyId"]');
        if (await dependencySelect1.isVisible()) {
          await dependencySelect1.click();
          await page.waitForTimeout(500);
          const secondTaskOption = page.locator(`[role="option"]:has-text("${taskNames[1]}")`);
          if (await secondTaskOption.isVisible()) {
            await secondTaskOption.click();
          }
        }

        const saveDependencyButton1 = page.locator(
          'button[type="submit"], button:has-text("Kaydet")'
        );
        await saveDependencyButton1.click();
        await expect(page.locator('text=Oluşturuldu, text=Başarılı')).toBeVisible({
          timeout: 5000,
        });
        await page.waitForTimeout(1000);
      }

      // İkinci görev → İlk görev bağımlılığı (döngüsel - başarısız olmalı)
      const secondTask = page.locator(`text=${taskNames[1]}`).locator('..');
      const addDependencyButton2 = secondTask.locator(
        'button:has-text("Bağımlılık"), button[aria-label*="dependency"]'
      );

      if (await addDependencyButton2.isVisible()) {
        await addDependencyButton2.click();
        await page.waitForTimeout(500);

        const dependencySelect2 = page.locator('[role="combobox"], select[name="dependencyId"]');
        if (await dependencySelect2.isVisible()) {
          await dependencySelect2.click();
          await page.waitForTimeout(500);
          const firstTaskOption = page.locator(`[role="option"]:has-text("${taskNames[0]}")`);
          if (await firstTaskOption.isVisible()) {
            await firstTaskOption.click();
          }
        }

        const saveDependencyButton2 = page.locator(
          'button[type="submit"], button:has-text("Kaydet")'
        );
        await saveDependencyButton2.click();

        // Döngüsel bağımlılık hatası beklenmeli
        await expect(page.locator('text=Döngüsel, text=bağımlılık, text=Hata')).toBeVisible({
          timeout: 5000,
        });
      }

      // 6. Bağımlılık silme
      const dependencyList = page.locator('[data-testid="dependency-list"], .dependency-item');
      if (await dependencyList.first().isVisible()) {
        const deleteButton = dependencyList
          .first()
          .locator('button:has-text("Sil"), button[aria-label*="delete"]');
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          await expect(page.locator('text=Silindi, text=Başarılı')).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});
