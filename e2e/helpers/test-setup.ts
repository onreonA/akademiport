/**
 * Test Setup Helpers
 *
 * E2E test'ler için test kullanıcıları ve test verilerini setup eder
 */

import { Page } from '@playwright/test';

/**
 * Test kullanıcılarını database'e ekle
 * Bu fonksiyon test başlangıcında bir kez çalıştırılmalı
 */
export async function setupTestUsers(page: Page): Promise<void> {
  // Admin panel üzerinden test kullanıcıları oluştur
  // Veya direkt API endpoint'i kullan
  // Şimdilik skip ediyoruz - test kullanıcıları manuel olarak oluşturulmalı
  // TODO: Test kullanıcıları için seed script oluştur
}

/**
 * Test kullanıcılarının var olup olmadığını kontrol et
 */
export async function checkTestUsersExist(page: Page): Promise<boolean> {
  try {
    // Login sayfasına git
    await page.goto('/login');

    // Sayfa yüklendi mi kontrol et
    const loginForm = page.locator('form, input[type="email"], input[name="email"]');
    return await loginForm.isVisible({ timeout: 5000 });
  } catch {
    return false;
  }
}

/**
 * Test verilerini temizle (her test sonrası)
 */
export async function cleanupTestData(page: Page): Promise<void> {
  // TODO: Test verilerini temizleme logic'i
  // Şimdilik skip ediyoruz
}
