/**
 * E2E Test: User Management Flow
 *
 * Senaryo 1: User Listesi Görüntüleme
 * Senaryo 2: User Oluşturma
 * Senaryo 3: User Detay Görüntüleme
 * Senaryo 4: User Düzenleme
 * Senaryo 5: User Silme
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('User Management Flow', () => {
  const testUserEmail = `testuser${Date.now()}@example.com`;
  const testUserName = `Test User ${Date.now()}`;

  test('User listesi görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Users sayfasına git
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');

    // 3. Sayfa başlığını kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /kullanıcı|user/i })).toBeVisible();

    // 4. User listesinin görünür olduğunu kontrol et
    const userList = page.locator('[data-testid="user-list"], .user-card, [class*="user"]');
    await expect(userList.first()).toBeVisible({ timeout: 10000 });
  });

  test('User oluşturma', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Users sayfasına git
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');

    // 3. "Yeni Kullanıcı" butonuna tıkla
    const newUserButton = page.locator(
      'button:has-text("Yeni Kullanıcı"), a:has-text("Yeni Kullanıcı"), button:has-text("Yeni"), [href*="/users/new"]'
    );
    await newUserButton.first().click();
    await page.waitForLoadState('networkidle');

    // 4. Form alanlarını doldur
    await page.waitForSelector('input[name="email"], #email', { timeout: 10000 });
    await page.fill('input[name="email"], #email', testUserEmail);

    await page.waitForSelector('input[name="fullName"], #fullName', { timeout: 5000 });
    await page.fill('input[name="fullName"], #fullName', testUserName);

    // Password alanını doldur
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if ((await passwordInput.count()) > 0) {
      await passwordInput.fill('Test123!');
    }

    // Role seçimi varsa seç (opsiyonel)
    const roleSelect = page.locator('select[name="role"], [name="role"]');
    if ((await roleSelect.count()) > 0) {
      await roleSelect
        .first()
        .selectOption({ index: 1 })
        .catch(() => {});
    }

    // 5. Formu submit et
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Kaydet"), button:has-text("Oluştur")'
    );
    await Promise.all([
      page
        .waitForResponse(
          (response) => response.url().includes('/api/users') && response.status() === 201,
          { timeout: 15000 }
        )
        .catch(() => null),
      submitButton.first().click(),
    ]);

    // 6. Başarı mesajını veya redirect'i kontrol et
    await page.waitForLoadState('networkidle');

    // 7. User listesinde yeni user'ın göründüğünü kontrol et
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${testUserEmail}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('User detay görüntüleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Users sayfasına git
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');

    // 3. İlk user'a tıkla
    const firstUser = page
      .locator('[data-testid="user-card"], .user-card, [class*="user"]')
      .first();
    await firstUser.click();
    await page.waitForLoadState('networkidle');

    // 4. Detay sayfasında user bilgilerinin göründüğünü kontrol et
    await expect(page.locator('h1, h2').filter({ hasText: /kullanıcı|user/i })).toBeVisible();

    // User details görünür olmalı
    const userDetails = page.locator(
      '[data-testid="user-details"], .user-profile, [class*="user"]'
    );
    await expect(userDetails.first()).toBeVisible({ timeout: 10000 });
  });

  test('User düzenleme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Users sayfasına git
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');

    // 3. İlk user'a tıkla
    const firstUser = page
      .locator('[data-testid="user-card"], .user-card, [class*="user"]')
      .first();
    await firstUser.click();
    await page.waitForLoadState('networkidle');

    // 4. "Düzenle" butonuna tıkla
    const editButton = page.locator(
      'button:has-text("Düzenle"), a:has-text("Düzenle"), [href*="/edit"]'
    );
    await editButton.first().click();
    await page.waitForLoadState('networkidle');

    // 5. Form alanını güncelle
    await page.waitForSelector('input[name="fullName"], #fullName', { timeout: 10000 });
    const nameInput = page.locator('input[name="fullName"], #fullName').first();
    const currentValue = await nameInput.inputValue();
    const updatedName = `${currentValue} - Updated`;
    await nameInput.fill(updatedName);

    // 6. Formu submit et
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Kaydet"), button:has-text("Güncelle")'
    );
    await Promise.all([
      page
        .waitForResponse(
          (response) =>
            response.url().includes('/api/users') &&
            (response.status() === 200 || response.status() === 201),
          { timeout: 15000 }
        )
        .catch(() => null),
      submitButton.first().click(),
    ]);

    // 7. Güncellemenin başarılı olduğunu kontrol et
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${updatedName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('User silme', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Users sayfasına git
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');

    // 3. İlk user'a tıkla
    const firstUser = page
      .locator('[data-testid="user-card"], .user-card, [class*="user"]')
      .first();
    await firstUser.click();
    await page.waitForLoadState('networkidle');

    // 4. "Sil" butonuna tıkla
    const deleteButton = page.locator(
      'button:has-text("Sil"), button:has-text("Delete"), [data-testid="delete"]'
    );
    await deleteButton.first().click();

    // 5. Onay dialog'unu kabul et
    await page.waitForTimeout(500);
    const confirmButton = page.locator(
      'button:has-text("Evet"), button:has-text("Sil"), button:has-text("Confirm")'
    );
    if ((await confirmButton.count()) > 0) {
      await Promise.all([
        page
          .waitForResponse(
            (response) => response.url().includes('/api/users') && response.status() === 200,
            { timeout: 15000 }
          )
          .catch(() => null),
        confirmButton.first().click(),
      ]);
    }

    // 6. User listesine geri dönüldüğünü kontrol et
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/users/, { timeout: 10000 });
  });
});
