/**
 * Authentication Helpers for E2E Tests
 *
 * Test kullanıcıları ile login/logout işlemleri için helper fonksiyonlar
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'consultant' | 'company';
}

/**
 * Test kullanıcıları (test database'de olmalı)
 */
export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    email: 'admin@test.com',
    password: 'Test123!',
    role: 'admin',
  },
  consultant: {
    email: 'consultant@test.com',
    password: 'Test123!',
    role: 'consultant',
  },
  company: {
    email: 'company@test.com',
    password: 'Test123!',
    role: 'company',
  },
};

/**
 * Belirtilen role ile login yap
 */
export async function loginAs(page: Page, role: 'admin' | 'consultant' | 'company'): Promise<void> {
  const user = TEST_USERS[role];

  // Eğer zaten farklı bir kullanıcı olarak login olunmuşsa önce logout yap
  const currentUrl = page.url();
  const isCurrentlyLoggedIn = /\/admin-dashboard|\/consultant-dashboard|\/company-dashboard/.test(
    currentUrl
  );
  const currentRole = currentUrl.includes('/admin-dashboard')
    ? 'admin'
    : currentUrl.includes('/consultant-dashboard')
      ? 'consultant'
      : currentUrl.includes('/company-dashboard')
        ? 'company'
        : null;

  if (isCurrentlyLoggedIn && currentRole !== role) {
    // Farklı bir kullanıcı olarak login olunmuş, önce logout yap
    try {
      await page.goto('/logout');
      await page.waitForTimeout(1000);
    } catch {
      // Logout sayfası yoksa direkt login sayfasına git
      await page.goto('/login');
    }
  } else if (!isCurrentlyLoggedIn) {
    // Login sayfasına git
    await page.goto('/login');
  } else {
    // Zaten doğru kullanıcı olarak login olunmuş, devam et
    return;
  }

  // Sayfanın yüklendiğini bekle
  await page.waitForLoadState('networkidle');

  // Email input'unu bul ve doldur (id="email" kullan)
  const emailInput = page.locator('#email, input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(user.email);

  // Password input'unu bul ve doldur (id="password" kullan)
  const passwordInput = page.locator('#password, input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(user.password);

  // Login butonuna tıkla
  const loginButton = page
    .locator('button[type="submit"]:has-text("Giriş Yap"), button[type="submit"]')
    .first();
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });

  // Form submit'i bekle
  await Promise.all([
    page
      .waitForResponse(
        (response) => response.url().includes('/api/auth/signin') && response.status() === 200,
        { timeout: 15000 }
      )
      .catch(() => null), // Response bekle ama hata olursa devam et
    loginButton.click(),
  ]);

  // Sayfanın yüklenmesini bekle
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

  // Login başarılı olana kadar bekle (dashboard'a yönlendirme)
  // Role'e göre farklı dashboard'lara yönlendirilebilir
  const expectedUrls = {
    admin: /\/admin-dashboard|\/dashboard/,
    consultant: /\/consultant-dashboard|\/dashboard/,
    company: /\/company-dashboard|\/dashboard/,
  };

  try {
    await page.waitForURL(expectedUrls[role] || /\/dashboard/, {
      timeout: 20000,
    });
  } catch (error) {
    // Login başarısız olabilir - test kullanıcıları yoksa skip et
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn(`⚠️  Login başarısız: ${user.email} - Test kullanıcısı database'de olmayabilir`);
      console.warn('💡 Test kullanıcılarını oluşturmak için: npm run test:setup');
      // Test'i skip etmek yerine devam et - bazı test'ler login olmadan da çalışabilir
    } else {
      // Başka bir sayfaya yönlendirilmiş olabilir, URL'yi logla
      console.warn(`⚠️  Beklenmeyen URL: ${currentUrl}`);
      throw error;
    }
  }
}

/**
 * Logout yap
 */
export async function logout(page: Page): Promise<void> {
  // Logout butonunu bul ve tıkla
  await page.click('button:has-text("Çıkış"), button:has-text("Logout"), [data-testid="logout"]');

  // Login sayfasına yönlendirme bekle
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Kullanıcının login olup olmadığını kontrol et
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Dashboard URL'lerinden birinde miyiz?
    const url = page.url();
    return /\/admin-dashboard|\/consultant-dashboard|\/company-dashboard/.test(url);
  } catch {
    return false;
  }
}

/**
 * Belirtilen role'e sahip kullanıcı olarak login olup olmadığını kontrol et
 */
export async function isLoggedInAs(
  page: Page,
  role: 'admin' | 'consultant' | 'company'
): Promise<boolean> {
  const url = page.url();
  const roleMap = {
    admin: '/admin-dashboard',
    consultant: '/consultant-dashboard',
    company: '/company-dashboard',
  };

  return url.includes(roleMap[role]);
}
