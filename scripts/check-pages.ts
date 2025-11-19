/**
 * Page Checker Script
 *
 * Bu script tüm navigation linklerini kontrol eder ve:
 * - 404 hatalarını bulur
 * - Sidebar ve Header'ın render edildiğini kontrol eder
 * - "Yeni" sayfalarının varlığını kontrol eder
 * - Sonuçları HTML rapor olarak çıkarır
 *
 * Kullanım:
 *   npx tsx scripts/check-pages.ts
 *   veya
 *   npm run check:pages
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Import navigation configs - tsx handles path aliases automatically
import {
  MASTER_ADMIN_NAVIGATION,
  CONSULTANT_NAVIGATION,
  COMPANY_ADMIN_NAVIGATION,
  COMPANY_USER_NAVIGATION,
  type NavigationConfig,
  type NavigationItem,
} from '../src/5-shared/constants/navigation';

// Test user credentials (from e2e/helpers/auth.ts)
const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'Test123!',
    role: 'admin' as const,
  },
  consultant: {
    email: 'consultant@test.com',
    password: 'Test123!',
    role: 'consultant' as const,
  },
  company: {
    email: 'company@test.com',
    password: 'Test123!',
    role: 'company' as const,
  },
};

// =====================================================
// TYPES
// =====================================================
interface PageCheckResult {
  url: string;
  label: string;
  role: string;
  status: 'success' | 'error' | 'redirect' | 'timeout';
  statusCode: number;
  hasSidebar: boolean;
  hasHeader: boolean;
  hasNewButton: boolean;
  hasEditButton: boolean;
  hasDeleteButton: boolean;
  error?: string;
  redirectUrl?: string;
}

interface CheckSummary {
  total: number;
  success: number;
  errors: number;
  redirects: number;
  timeouts: number;
  missingSidebar: number;
  missingHeader: number;
  missingNewButton: number;
  missingEditButton: number;
  missingDeleteButton: number;
}

// =====================================================
// CONFIGURATION
// =====================================================
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 30000;
const OUTPUT_DIR = path.join(process.cwd(), 'page-check-results');
const OUTPUT_FILE = path.join(OUTPUT_DIR, `page-check-${Date.now()}.html`);

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Login helper function (adapted from e2e/helpers/auth.ts)
 */
async function loginAs(page: Page, role: 'admin' | 'consultant' | 'company'): Promise<boolean> {
  const user = TEST_USERS[role];

  try {
    // Go to login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 10000 });

    // Wait for form to be ready
    await page.waitForLoadState('networkidle');

    // Fill email
    const emailInput = page.locator('#email, input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(user.email);

    // Fill password
    const passwordInput = page.locator('#password, input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(user.password);

    // Click login button
    const loginButton = page
      .locator('button[type="submit"]:has-text("Giriş Yap"), button[type="submit"]')
      .first();
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });

    // Submit form and wait for response
    await Promise.all([
      page
        .waitForResponse(
          (response) => response.url().includes('/api/auth/signin') && response.status() === 200,
          { timeout: 15000 }
        )
        .catch(() => null),
      loginButton.click(),
    ]);

    // Wait for navigation
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Check if login was successful (redirected to dashboard)
    const expectedUrls = {
      admin: /\/admin-dashboard|\/dashboard/,
      consultant: /\/consultant-dashboard/,
      company: /\/company-dashboard/,
    };

    try {
      await page.waitForURL(expectedUrls[role] || /\/dashboard/, { timeout: 15000 });
      return true;
    } catch {
      // Check current URL
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        return false; // Still on login page
      }
      return true; // Redirected somewhere (might be successful)
    }
  } catch (error: any) {
    console.warn(`⚠️  Login failed for ${role}: ${error.message}`);
    return false;
  }
}

/**
 * Map navigation role to test user role
 */
function getTestUserRole(navRole: string): 'admin' | 'consultant' | 'company' | null {
  if (navRole.includes('Master Admin') || navRole.includes('master_admin')) {
    return 'admin';
  }
  if (navRole.includes('Consultant') || navRole.includes('consultant')) {
    return 'consultant';
  }
  if (navRole.includes('Company') || navRole.includes('company')) {
    return 'company';
  }
  return null;
}

function extractAllLinks(
  config: NavigationConfig,
  role: string
): Array<{ url: string; label: string; role: string }> {
  const links: Array<{ url: string; label: string; role: string }> = [];

  // Main navigation items
  config.main.forEach((item) => {
    links.push({ url: item.href, label: item.label, role });

    // Children items
    if (item.children) {
      item.children.forEach((child) => {
        links.push({ url: child.href, label: `${item.label} > ${child.label}`, role });
      });
    }
  });

  // Bottom navigation items
  config.bottom.forEach((item) => {
    links.push({ url: item.href, label: item.label, role });
  });

  return links;
}

async function checkPage(
  page: Page,
  url: string,
  label: string,
  role: string
): Promise<PageCheckResult> {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const result: PageCheckResult = {
    url,
    label,
    role,
    status: 'success',
    statusCode: 200,
    hasSidebar: false,
    hasHeader: false,
    hasNewButton: false,
    hasEditButton: false,
    hasDeleteButton: false,
  };

  try {
    // Navigate to page
    const response = await page
      .goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUT,
      })
      .catch(() => null);

    if (!response) {
      result.status = 'timeout';
      result.statusCode = 0;
      result.error = 'Page load timeout';
      return result;
    }

    result.statusCode = response.status();

    // Check for redirects
    if (response.status() >= 300 && response.status() < 400) {
      result.status = 'redirect';
      result.redirectUrl = response.url();
      return result;
    }

    // Check for errors
    if (response.status() >= 400) {
      result.status = 'error';
      result.error = `HTTP ${response.status()}`;
      return result;
    }

    // Wait for page to be ready
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Skip sidebar/header check for login/auth pages
    const isAuthPage =
      url.includes('/login') ||
      url.includes('/register') ||
      url.includes('/forgot-password') ||
      url.includes('/reset-password') ||
      url.includes('/verify-email');

    if (!isAuthPage) {
      // Check for Sidebar - Look for fixed sidebar on the left
      const sidebarSelectors = [
        'aside[class*="fixed"][class*="left-0"]', // Fixed left sidebar
        'aside[class*="z-40"]', // Sidebar with z-40
        'aside[class*="h-[calc(100vh"]', // Full height sidebar
        'aside',
      ];

      for (const selector of sidebarSelectors) {
        try {
          const sidebar = page.locator(selector).first();
          const count = await sidebar.count();
          if (count > 0) {
            const isVisible = await sidebar.isVisible().catch(() => false);
            const boundingBox = await sidebar.boundingBox().catch(() => null);
            // Check if sidebar is actually visible and positioned on the left
            if (isVisible && boundingBox && boundingBox.x < 300) {
              result.hasSidebar = true;
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      // Check for Header - Look for sticky header at top
      const headerSelectors = [
        'header[class*="sticky"]', // Sticky header
        'header[class*="top-0"]', // Header at top
        'header[class*="z-50"]', // Header with z-50
        'header',
      ];

      for (const selector of headerSelectors) {
        try {
          const header = page.locator(selector).first();
          const count = await header.count();
          if (count > 0) {
            const isVisible = await header.isVisible().catch(() => false);
            const boundingBox = await header.boundingBox().catch(() => null);
            // Check if header is actually visible and positioned at top
            if (isVisible && boundingBox && boundingBox.y < 100) {
              result.hasHeader = true;
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }

    // Check for common error pages
    const errorIndicators = [
      page.locator('text=404'),
      page.locator('text=Not Found'),
      page.locator('text=Sayfa Bulunamadı'),
      page.locator('text=Page Not Found'),
      page.locator('h1:has-text("404")'),
      page.locator('h1:has-text("Not Found")'),
    ];

    for (const indicator of errorIndicators) {
      try {
        const count = await indicator.count();
        if (count > 0) {
          const isVisible = await indicator.isVisible().catch(() => false);
          if (isVisible) {
            result.status = 'error';
            result.error = '404 page detected';
            result.statusCode = 404;
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // Check for login redirect (if page redirects to login, it's likely protected)
    const currentUrl = page.url();
    if (currentUrl.includes('/login') && !url.includes('/login')) {
      result.status = 'redirect';
      result.redirectUrl = currentUrl;
      result.error = 'Redirected to login (authentication required)';
      return result;
    }

    // Only check buttons if page loaded successfully
    if (result.status === 'success' && !isAuthPage) {
      // Wait a bit more for dynamic content to load
      await page.waitForTimeout(1000);

      // Check for "Yeni" (New) buttons
      // Common patterns: "Yeni Program", "Yeni Firma", "Yeni Kullanıcı", "Yeni Eğitim", "Yeni Etkinlik", "Yeni Haber", "Yeni Şablon", "Yeni Rapor", "Yeni Proje", "Görev Ekle"
      const newButtonSelectors = [
        // Text-based selectors (more flexible)
        'button:has-text("Yeni")',
        'a:has-text("Yeni")',
        'button:has-text("Ekle")',
        'a:has-text("Ekle")',
        'button:has-text("Oluştur")',
        'a:has-text("Oluştur")',
        // Link-based (Button with asChild wrapping Link)
        'a[href*="/new"]',
        'a[href*="/create"]',
        // Data attributes
        '[data-testid*="new"]',
        '[data-testid*="create"]',
        '[data-testid*="add"]',
        // Icon + text combinations (Plus icon with "Yeni" text nearby)
        'button:has(svg):has-text("Yeni")',
        'a:has(svg):has-text("Yeni")',
        'button:has(svg):has-text("Ekle")',
        'a:has(svg):has-text("Ekle")',
      ];

      for (const selector of newButtonSelectors) {
        try {
          const button = page.locator(selector).first();
          const count = await button.count();
          if (count > 0) {
            const isVisible = await button.isVisible().catch(() => false);
            if (isVisible) {
              // Check if it's enabled (for buttons) or just visible (for links)
              const tagName = await button
                .evaluate((el) => el.tagName.toLowerCase())
                .catch(() => '');
              if (tagName === 'a') {
                // Links are always "enabled"
                result.hasNewButton = true;
                break;
              } else {
                const isEnabled = await button.isEnabled().catch(() => false);
                if (isEnabled) {
                  result.hasNewButton = true;
                  break;
                }
              }
            }
          }
        } catch (e) {
          // Continue
        }
      }

      // Also check for Plus icon buttons (common pattern)
      if (!result.hasNewButton) {
        try {
          const plusButtons = page.locator('button:has(svg), a:has(svg)');
          const count = await plusButtons.count();
          for (let i = 0; i < Math.min(count, 10); i++) {
            const btn = plusButtons.nth(i);
            const text = await btn.textContent().catch(() => '');
            const href = await btn.getAttribute('href').catch(() => '');
            if (
              (text &&
                (text.includes('Yeni') || text.includes('Ekle') || text.includes('Oluştur'))) ||
              (href && (href.includes('/new') || href.includes('/create')))
            ) {
              const isVisible = await btn.isVisible().catch(() => false);
              if (isVisible) {
                result.hasNewButton = true;
                break;
              }
            }
          }
        } catch (e) {
          // Continue
        }
      }

      // Check for Edit buttons (only on list/detail pages, not on "new" pages)
      if (!url.includes('/new') && !url.includes('/create')) {
        const editButtonSelectors = [
          'button:has-text("Düzenle")',
          'button:has-text("Güncelle")',
          'button:has-text("Detaylar")',
          'a:has-text("Düzenle")',
          'a:has-text("Güncelle")',
          'a:has-text("Detaylar")',
          'a[href*="/edit"]',
          'button[aria-label*="düzenle" i]',
          'button[aria-label*="edit" i]',
          '[data-testid*="edit"]',
          '[data-testid*="update"]',
          // Icon buttons with Edit icon
          'button:has(svg[class*="Edit"])',
          'button:has(svg[class*="edit"])',
          'a:has(svg[class*="Edit"])',
        ];

        for (const selector of editButtonSelectors) {
          try {
            const button = page.locator(selector).first();
            const count = await button.count();
            if (count > 0) {
              const isVisible = await button.isVisible().catch(() => false);
              if (isVisible) {
                const tagName = await button
                  .evaluate((el) => el.tagName.toLowerCase())
                  .catch(() => '');
                if (tagName === 'a') {
                  result.hasEditButton = true;
                  break;
                } else {
                  const isEnabled = await button.isEnabled().catch(() => false);
                  if (isEnabled) {
                    result.hasEditButton = true;
                    break;
                  }
                }
              }
            }
          } catch (e) {
            // Continue
          }
        }
      }

      // Check for Delete buttons (only on list/detail pages, not on "new" pages)
      if (!url.includes('/new') && !url.includes('/create')) {
        const deleteButtonSelectors = [
          'button:has-text("Sil")',
          'a:has-text("Sil")',
          'button[aria-label*="sil" i]',
          'button[aria-label*="delete" i]',
          '[data-testid*="delete"]',
          '[data-testid*="remove"]',
          // Icon buttons with Trash icon
          'button:has(svg[class*="Trash"])',
          'button:has(svg[class*="trash"])',
          'a:has(svg[class*="Trash"])',
        ];

        for (const selector of deleteButtonSelectors) {
          try {
            const button = page.locator(selector).first();
            const count = await button.count();
            if (count > 0) {
              const isVisible = await button.isVisible().catch(() => false);
              if (isVisible) {
                const tagName = await button
                  .evaluate((el) => el.tagName.toLowerCase())
                  .catch(() => '');
                if (tagName === 'a') {
                  result.hasDeleteButton = true;
                  break;
                } else {
                  const isEnabled = await button.isEnabled().catch(() => false);
                  if (isEnabled) {
                    result.hasDeleteButton = true;
                    break;
                  }
                }
              }
            }
          } catch (e) {
            // Continue
          }
        }
      }
    }
  } catch (error: any) {
    result.status = 'error';
    result.error = error.message || 'Unknown error';
  }

  return result;
}

function generateHTMLReport(results: PageCheckResult[], summary: CheckSummary): string {
  const errors = results.filter((r) => r.status === 'error');
  const redirects = results.filter((r) => r.status === 'redirect');
  const missingSidebar = results.filter((r) => r.status === 'success' && !r.hasSidebar);
  const missingHeader = results.filter((r) => r.status === 'success' && !r.hasHeader);
  const newPages = results.filter((r) => r.label.toLowerCase().includes('yeni'));
  const listPages = results.filter(
    (r) =>
      r.status === 'success' &&
      !r.url.includes('/new') &&
      !r.url.includes('/create') &&
      !r.url.includes('/edit')
  );
  const missingNewButton = listPages.filter((r) => !r.hasNewButton);
  const missingEditButton = listPages.filter((r) => !r.hasEditButton);
  const missingDeleteButton = listPages.filter((r) => !r.hasDeleteButton);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Check Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 10px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
    .summary-card .number { font-size: 32px; font-weight: bold; }
    .summary-card.success .number { color: #10b981; }
    .summary-card.error .number { color: #ef4444; }
    .summary-card.warning .number { color: #f59e0b; }
    .section { margin: 30px 0; }
    .section h2 {
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    table {
      width: 100%;
      background: white;
      border-collapse: collapse;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:hover { background: #f9fafb; }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-success { background: #d1fae5; color: #065f46; }
    .status-error { background: #fee2e2; color: #991b1b; }
    .status-redirect { background: #fef3c7; color: #92400e; }
    .status-timeout { background: #e0e7ff; color: #3730a3; }
    .check-icon { color: #10b981; }
    .x-icon { color: #ef4444; }
    .url { color: #3b82f6; text-decoration: none; }
    .url:hover { text-decoration: underline; }
    .role-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Page Check Report</h1>
    <p style="color: #666; margin-bottom: 20px;">
      Generated: ${new Date().toLocaleString('tr-TR')}<br>
      Base URL: ${BASE_URL}
    </p>

    <div class="summary">
      <div class="summary-card success">
        <h3>✅ Success</h3>
        <div class="number">${summary.success}</div>
      </div>
      <div class="summary-card error">
        <h3>❌ Errors</h3>
        <div class="number">${summary.errors}</div>
      </div>
      <div class="summary-card warning">
        <h3>↪️ Redirects</h3>
        <div class="number">${summary.redirects}</div>
      </div>
      <div class="summary-card warning">
        <h3>⏱️ Timeouts</h3>
        <div class="number">${summary.timeouts}</div>
      </div>
      <div class="summary-card warning">
        <h3>📱 Missing Sidebar</h3>
        <div class="number">${summary.missingSidebar}</div>
      </div>
      <div class="summary-card warning">
        <h3>🔝 Missing Header</h3>
        <div class="number">${summary.missingHeader}</div>
      </div>
      <div class="summary-card warning">
        <h3>✨ Missing "Yeni" Button</h3>
        <div class="number">${summary.missingNewButton}</div>
      </div>
      <div class="summary-card warning">
        <h3>✏️ Missing Edit Button</h3>
        <div class="number">${summary.missingEditButton}</div>
      </div>
      <div class="summary-card warning">
        <h3>🗑️ Missing Delete Button</h3>
        <div class="number">${summary.missingDeleteButton}</div>
      </div>
    </div>

    ${
      errors.length > 0
        ? `
    <div class="section">
      <h2>❌ Errors (${errors.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>URL</th>
            <th>Status</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          ${errors
            .map(
              (r) => `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><span class="status-badge status-${r.status}">${r.statusCode}</span></td>
              <td>${r.error || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      redirects.length > 0
        ? `
    <div class="section">
      <h2>↪️ Redirects (${redirects.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>From</th>
            <th>To</th>
          </tr>
        </thead>
        <tbody>
          ${redirects
            .map(
              (r) => `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><a href="${r.redirectUrl}" target="_blank" class="url">${r.redirectUrl}</a></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      missingSidebar.length > 0
        ? `
    <div class="section">
      <h2>📱 Missing Sidebar (${missingSidebar.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>URL</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${missingSidebar
            .map(
              (r) => `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><span class="status-badge status-success">${r.statusCode}</span></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      missingHeader.length > 0
        ? `
    <div class="section">
      <h2>🔝 Missing Header (${missingHeader.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>URL</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${missingHeader
            .map(
              (r) => `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><span class="status-badge status-success">${r.statusCode}</span></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      missingNewButton.length > 0
        ? `
    <div class="section">
      <h2>✨ Missing "Yeni" Button (${missingNewButton.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>URL</th>
            <th>Status</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${missingNewButton
            .map(
              (r) => `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><span class="status-badge status-success">${r.statusCode}</span></td>
              <td>List sayfasında "Yeni" butonu bulunamadı</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      missingEditButton.length > 0
        ? `
    <div class="section">
      <h2>✏️ Missing Edit Button (${missingEditButton.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>URL</th>
            <th>Status</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${missingEditButton
            .map(
              (r) => `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><span class="status-badge status-success">${r.statusCode}</span></td>
              <td>List/Detail sayfasında "Düzenle" butonu bulunamadı</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      missingDeleteButton.length > 0
        ? `
    <div class="section">
      <h2>🗑️ Missing Delete Button (${missingDeleteButton.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>URL</th>
            <th>Status</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${missingDeleteButton
            .map(
              (r) => `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><span class="status-badge status-success">${r.statusCode}</span></td>
              <td>List/Detail sayfasında "Sil" butonu bulunamadı</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    <div class="section">
      <h2>✨ "Yeni" Pages Check (${newPages.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>URL</th>
            <th>Status</th>
            <th>Sidebar</th>
            <th>Header</th>
          </tr>
        </thead>
        <tbody>
          ${newPages
            .map(
              (r) => `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><span class="status-badge status-${r.status}">${r.statusCode}</span></td>
              <td>${r.hasSidebar ? '<span class="check-icon">✅</span>' : '<span class="x-icon">❌</span>'}</td>
              <td>${r.hasHeader ? '<span class="check-icon">✅</span>' : '<span class="x-icon">❌</span>'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>📋 All Results (${results.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Label</th>
            <th>URL</th>
            <th>Status</th>
            <th>Sidebar</th>
            <th>Header</th>
            <th>Yeni</th>
            <th>Edit</th>
            <th>Delete</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          ${results
            .map((r) => {
              const isListPage =
                r.status === 'success' &&
                !r.url.includes('/new') &&
                !r.url.includes('/create') &&
                !r.url.includes('/edit');
              return `
            <tr>
              <td><span class="role-badge">${r.role}</span></td>
              <td>${r.label}</td>
              <td><a href="${BASE_URL}${r.url}" target="_blank" class="url">${r.url}</a></td>
              <td><span class="status-badge status-${r.status}">${r.statusCode || '-'}</span></td>
              <td>${r.hasSidebar ? '<span class="check-icon">✅</span>' : '<span class="x-icon">❌</span>'}</td>
              <td>${r.hasHeader ? '<span class="check-icon">✅</span>' : '<span class="x-icon">❌</span>'}</td>
              <td>${isListPage ? (r.hasNewButton ? '<span class="check-icon">✅</span>' : '<span class="x-icon">❌</span>') : '-'}</td>
              <td>${isListPage ? (r.hasEditButton ? '<span class="check-icon">✅</span>' : '<span class="x-icon">❌</span>') : '-'}</td>
              <td>${isListPage ? (r.hasDeleteButton ? '<span class="check-icon">✅</span>' : '<span class="x-icon">❌</span>') : '-'}</td>
              <td>${r.error || '-'}</td>
            </tr>
          `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
}

// =====================================================
// MAIN FUNCTION
// =====================================================
async function main() {
  console.log('🚀 Starting page check with authentication...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT}ms\n`);

  // Extract all links from navigation
  const allLinks = [
    ...extractAllLinks(MASTER_ADMIN_NAVIGATION, 'Master Admin'),
    ...extractAllLinks(CONSULTANT_NAVIGATION, 'Consultant'),
    ...extractAllLinks(COMPANY_ADMIN_NAVIGATION, 'Company Admin'),
    ...extractAllLinks(COMPANY_USER_NAVIGATION, 'Company User'),
  ];

  // Group links by role for authentication
  const linksByRole = new Map<string, Array<{ url: string; label: string; role: string }>>();
  allLinks.forEach((link) => {
    const testRole = getTestUserRole(link.role);
    const roleKey = testRole || 'public';
    if (!linksByRole.has(roleKey)) {
      linksByRole.set(roleKey, []);
    }
    linksByRole.get(roleKey)!.push(link);
  });

  console.log(`Found ${allLinks.length} total links`);
  console.log(`  Master Admin: ${linksByRole.get('admin')?.length || 0}`);
  console.log(`  Consultant: ${linksByRole.get('consultant')?.length || 0}`);
  console.log(`  Company: ${linksByRole.get('company')?.length || 0}`);
  console.log(`  Public: ${linksByRole.get('public')?.length || 0}\n`);

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const results: PageCheckResult[] = [];

  // Check pages for each role
  const rolesToCheck = ['admin', 'consultant', 'company'] as const;

  for (const role of rolesToCheck) {
    const roleLinks = linksByRole.get(role) || [];
    if (roleLinks.length === 0) continue;

    console.log(`\n🔐 Checking ${role} pages (${roleLinks.length} links)...`);

    // Create a new context for this role
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login for this role
    console.log(`   Logging in as ${role}...`);
    const loginSuccess = await loginAs(page, role);

    if (!loginSuccess) {
      console.warn(`   ⚠️  Login failed for ${role} - checking pages without authentication`);
      // Continue without authentication - pages will redirect to login
    } else {
      console.log(`   ✅ Logged in successfully`);
    }

    // Check pages for this role
    let processed = 0;
    for (const link of roleLinks) {
      processed++;
      const progress = `   [${processed}/${roleLinks.length}]`;
      process.stdout.write(`\r${progress} Checking: ${link.url.padEnd(50)}`);

      const result = await checkPage(page, link.url, link.label, link.role);
      results.push(result);

      // Small delay to avoid overwhelming the server
      await page.waitForTimeout(300);
    }

    process.stdout.write('\r' + ' '.repeat(80) + '\r'); // Clear progress line
    await context.close();
  }

  // Check public pages (no authentication needed)
  const publicLinks = linksByRole.get('public') || [];
  if (publicLinks.length > 0) {
    console.log(`\n🌐 Checking public pages (${publicLinks.length} links)...`);

    const context = await browser.newContext();
    const page = await context.newPage();

    let processed = 0;
    for (const link of publicLinks) {
      processed++;
      const progress = `   [${processed}/${publicLinks.length}]`;
      process.stdout.write(`\r${progress} Checking: ${link.url.padEnd(50)}`);

      const result = await checkPage(page, link.url, link.label, link.role);
      results.push(result);

      await page.waitForTimeout(300);
    }

    process.stdout.write('\r' + ' '.repeat(80) + '\r');
    await context.close();
  }

  console.log('\n');

  console.log('\n\n✅ Check completed!\n');

  // Calculate summary
  const successResults = results.filter((r) => r.status === 'success');
  const listPages = successResults.filter(
    (r) => !r.url.includes('/new') && !r.url.includes('/create') && !r.url.includes('/edit')
  );
  const newPages = successResults.filter(
    (r) =>
      r.label.toLowerCase().includes('yeni') || r.url.includes('/new') || r.url.includes('/create')
  );

  const summary: CheckSummary = {
    total: results.length,
    success: successResults.length,
    errors: results.filter((r) => r.status === 'error').length,
    redirects: results.filter((r) => r.status === 'redirect').length,
    timeouts: results.filter((r) => r.status === 'timeout').length,
    missingSidebar: successResults.filter((r) => !r.hasSidebar).length,
    missingHeader: successResults.filter((r) => !r.hasHeader).length,
    missingNewButton: listPages.filter((r) => !r.hasNewButton).length,
    missingEditButton: listPages.filter((r) => !r.hasEditButton).length,
    missingDeleteButton: listPages.filter((r) => !r.hasDeleteButton).length,
  };

  // Print summary
  console.log('📊 Summary:');
  console.log(`  Total: ${summary.total}`);
  console.log(`  ✅ Success: ${summary.success}`);
  console.log(`  ❌ Errors: ${summary.errors}`);
  console.log(`  ↪️  Redirects: ${summary.redirects}`);
  console.log(`  ⏱️  Timeouts: ${summary.timeouts}`);
  console.log(`  📱 Missing Sidebar: ${summary.missingSidebar}`);
  console.log(`  🔝 Missing Header: ${summary.missingHeader}`);
  console.log(
    `  ✨ Missing "Yeni" Button: ${summary.missingNewButton} (on ${listPages.length} list pages)`
  );
  console.log(
    `  ✏️  Missing Edit Button: ${summary.missingEditButton} (on ${listPages.length} list pages)`
  );
  console.log(
    `  🗑️  Missing Delete Button: ${summary.missingDeleteButton} (on ${listPages.length} list pages)\n`
  );

  // Generate HTML report
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const htmlReport = generateHTMLReport(results, summary);
  fs.writeFileSync(OUTPUT_FILE, htmlReport, 'utf-8');

  console.log(`📄 HTML report saved to: ${OUTPUT_FILE}\n`);

  // Print errors
  const errors = results.filter((r) => r.status === 'error');
  if (errors.length > 0) {
    console.log('❌ Errors found:');
    errors.forEach((error) => {
      console.log(`  - [${error.role}] ${error.label}: ${error.url} (${error.error})`);
    });
    console.log('');
  }

  // Print missing sidebar/header
  const missingSidebar = results.filter((r) => r.status === 'success' && !r.hasSidebar);
  if (missingSidebar.length > 0) {
    console.log('📱 Pages without Sidebar:');
    missingSidebar.forEach((page) => {
      console.log(`  - [${page.role}] ${page.label}: ${page.url}`);
    });
    console.log('');
  }

  const missingHeader = results.filter((r) => r.status === 'success' && !r.hasHeader);
  if (missingHeader.length > 0) {
    console.log('🔝 Pages without Header:');
    missingHeader.forEach((page) => {
      console.log(`  - [${page.role}] ${page.label}: ${page.url}`);
    });
    console.log('');
  }

  // Print missing buttons
  const listPagesForButtons = results.filter(
    (r) =>
      r.status === 'success' &&
      !r.url.includes('/new') &&
      !r.url.includes('/create') &&
      !r.url.includes('/edit')
  );
  const missingNewBtn = listPagesForButtons.filter((r) => !r.hasNewButton);
  if (missingNewBtn.length > 0) {
    console.log('✨ Pages without "Yeni" Button:');
    missingNewBtn.forEach((page) => {
      console.log(`  - [${page.role}] ${page.label}: ${page.url}`);
    });
    console.log('');
  }

  const missingEditBtn = listPagesForButtons.filter((r) => !r.hasEditButton);
  if (missingEditBtn.length > 0) {
    console.log('✏️  Pages without Edit Button:');
    missingEditBtn.forEach((page) => {
      console.log(`  - [${page.role}] ${page.label}: ${page.url}`);
    });
    console.log('');
  }

  const missingDeleteBtn = listPagesForButtons.filter((r) => !r.hasDeleteButton);
  if (missingDeleteBtn.length > 0) {
    console.log('🗑️  Pages without Delete Button:');
    missingDeleteBtn.forEach((page) => {
      console.log(`  - [${page.role}] ${page.label}: ${page.url}`);
    });
    console.log('');
  }

  await browser.close();

  // Print authentication status
  const authenticatedResults = results.filter((r) => r.status === 'success');
  const unauthenticatedResults = results.filter(
    (r) => r.status === 'redirect' && r.error?.includes('authentication')
  );

  if (unauthenticatedResults.length > 0) {
    console.log('💡 Authentication Note:');
    console.log(
      `   ${unauthenticatedResults.length} pages redirected to login (authentication required)`
    );
    console.log(`   ${authenticatedResults.length} pages accessed successfully`);
    console.log(
      `   Make sure test users exist: admin@test.com, consultant@test.com, company@test.com`
    );
    console.log('');
  }

  // Exit with error code if there are errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
