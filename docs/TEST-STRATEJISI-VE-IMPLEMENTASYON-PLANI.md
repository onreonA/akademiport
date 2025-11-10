# 🧪 Test Stratejisi ve Implementasyon Planı

**Tarih:** 2025-01-XX  
**Durum:** Aktif Geliştirme  
**Hedef:** %80+ Test Coverage + E2E Senaryolar

---

## 📊 MEVCUT TEST DURUMU ANALİZİ

### ✅ Mevcut Test Altyapısı

**Test Framework'ler:**

- ✅ Vitest 4.0.6 (Unit & Integration)
- ✅ @testing-library/react 16.3.0 (Component)
- ✅ @testing-library/jest-dom 6.9.1 (Matchers)
- ✅ @testing-library/user-event 14.6.1 (User interactions)
- ✅ @vitest/coverage-v8 (Coverage)
- ✅ @vitest/ui (Test UI)

**Test Setup:**

- ✅ `vitest.config.ts` yapılandırılmış
- ✅ `src/5-shared/test/setup.ts` hazır
- ✅ `src/5-shared/test/utils.tsx` (custom render)
- ✅ `src/5-shared/test/api-helpers.ts` (API test helpers)
- ✅ Mock'lar hazır (Next.js router, Image, matchMedia)

**Test Scripts:**

```json
"test": "vitest",                    // Watch mode
"test:ui": "vitest --ui",           // UI mode
"test:run": "vitest run",           // CI mode
"test:coverage": "vitest run --coverage" // Coverage
```

### 📈 Mevcut Test Dosyaları

**Unit Tests (11 dosya):**

- ✅ `CreateProjectUseCase.test.ts`
- ✅ `GetAssignmentMatrixUseCase.test.ts`
- ✅ `BulkAssignSubProjectsToCompaniesUseCase.test.ts`
- ✅ `BulkAssignDatesToCompanySubProjectsUseCase.test.ts`
- ✅ `CompleteTaskUseCase.test.ts`
- ✅ `ApproveTaskUseCase.test.ts`
- ✅ `TaskComment.test.ts`
- ✅ `Task.test.ts`
- ✅ `Project.test.ts`
- ✅ `SubProject.test.ts`
- ✅ `route.test.ts` (API route)

**Component Tests (5 dosya):**

- ✅ `button.test.tsx`
- ✅ `input.test.tsx`
- ✅ `card.test.tsx`
- ✅ `badge.test.tsx`
- ✅ `ErrorBoundary.test.tsx`

**Toplam:** ~16 test dosyası

### ❌ Eksikler

1. **E2E Test Framework:** Playwright yok
2. **Integration Test Coverage:** Çok düşük (%5-10 tahmini)
3. **Feature Testleri:** Frontend feature testleri yok
4. **End-to-End Senaryolar:** Kullanıcı akışları test edilmiyor
5. **API Integration Tests:** Çoğu API route test edilmiş
6. **Use Case Coverage:** Çoğu use case test edilmemiş
7. **Component Coverage:** Çoğu component test edilmemiş

---

## 🎯 TEST STRATEJİSİ

### Test Piramidi

```
        /\
       /  \     E2E Tests (10%)
      /____\    - Critical user flows
     /      \   - End-to-end senaryolar
    /________\  Integration Tests (30%)
   /          \ - API routes
  /____________\ Unit Tests (60%)
                 - Use cases
                 - Components
                 - Utilities
```

### Test Kategorileri

#### 1. Unit Tests (60%)

- **Use Cases:** Business logic testleri
- **Domain Entities:** Entity validation ve business rules
- **Utilities:** Helper fonksiyonlar
- **Components:** UI component testleri

#### 2. Integration Tests (30%)

- **API Routes:** Endpoint testleri (authentication, authorization, validation)
- **Repository:** Database operations (mock database ile)
- **External Services:** Zoom, Email, WhatsApp mock'ları ile

#### 3. E2E Tests (10%)

- **Critical User Flows:** Tam kullanıcı senaryoları
- **Cross-Feature:** Birden fazla feature'ın birlikte çalışması

---

## 🚀 IMPLEMENTASYON PLANI

### Faz 1: E2E Test Altyapısı (1-2 gün) ⭐ BAŞLANGIÇ

#### 1.1 Playwright Kurulumu

```bash
npm install -D @playwright/test
npx playwright install
```

#### 1.2 Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 1.3 Test Helpers

```typescript
// e2e/helpers/auth.ts
export async function loginAs(page: Page, role: 'admin' | 'consultant' | 'company') {
  // Login helper
}

export async function createTestUser(page: Page, role: UserRole) {
  // Test user creation helper
}
```

### Faz 2: Critical User Flow Testleri (3-5 gün)

#### 2.1 Randevu Yönetimi Senaryosu

```typescript
// e2e/appointments/appointment-flow.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Randevu Yönetimi Akışı', () => {
  test('Randevu oluşturma → Danışman onaylama → Randevu tamamlama', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Randevu talep et
    await page.goto('/company-dashboard/appointments');
    await page.click('text=Yeni Randevu Talep Et');
    await page.fill('[name="title"]', 'Test Randevu');
    await page.selectOption('[name="consultantId"]', 'consultant-1');
    await page.fill('[name="startTime"]', '2025-02-01T10:00');
    await page.fill('[name="endTime"]', '2025-02-01T11:00');
    await page.click('text=Gönder');

    // 3. Randevu oluşturulduğunu doğrula
    await expect(page.locator('text=Test Randevu')).toBeVisible();
    await expect(page.locator('text=pending')).toBeVisible();

    // 4. Consultant olarak login
    await loginAs(page, 'consultant');

    // 5. Randevuyu görüntüle ve onayla
    await page.goto('/consultant-dashboard/appointments');
    await expect(page.locator('text=Test Randevu')).toBeVisible();
    await page.click('text=Onayla');

    // 6. Randevu onaylandığını doğrula
    await expect(page.locator('text=approved')).toBeVisible();
    await expect(page.locator('text=Zoom')).toBeVisible(); // Zoom link oluştu mu?

    // 7. Company user olarak tekrar login
    await loginAs(page, 'company');

    // 8. Onaylanmış randevuyu görüntüle
    await page.goto('/company-dashboard/appointments');
    await expect(page.locator('text=approved')).toBeVisible();
  });

  test('Randevu oluşturma → Danışman reddetme', async ({ page }) => {
    // Benzer senaryo ama reddetme akışı
  });

  test('Randevu revize etme', async ({ page }) => {
    // Revize senaryosu
  });
});
```

### Faz 3: API Integration Testleri (5-7 gün)

#### 3.1 API Route Testleri

```typescript
// src/app/api/appointments/route.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

describe('POST /api/appointments', () => {
  it('creates appointment successfully', async () => {
    // Test implementation
  });

  it('validates required fields', async () => {
    // Validation test
  });

  it('checks consultant availability', async () => {
    // Availability check test
  });
});

describe('GET /api/appointments', () => {
  it('returns appointments for consultant', async () => {
    // Consultant appointments test
  });

  it('returns appointments for company', async () => {
    // Company appointments test
  });
});
```

### Faz 4: Component Testleri (5-7 gün)

#### 4.1 Feature Component Testleri

```typescript
// src/1-presentation/components/features/appointments/AppointmentRequestForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { AppointmentRequestForm } from './AppointmentRequestForm';

describe('AppointmentRequestForm', () => {
  it('renders form fields', () => {
    render(<AppointmentRequestForm />);
    expect(screen.getByLabelText(/başlık/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/danışman/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<AppointmentRequestForm />);

    const submitButton = screen.getByRole('button', { name: /gönder/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/başlık gereklidir/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<AppointmentRequestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/başlık/i), 'Test Randevu');
    await user.selectOptions(screen.getByLabelText(/danışman/i), 'consultant-1');
    await user.type(screen.getByLabelText(/başlangıç/i), '2025-02-01T10:00');

    await user.click(screen.getByRole('button', { name: /gönder/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Test Randevu',
        consultantId: 'consultant-1',
        startTime: expect.any(Date),
      });
    });
  });
});
```

### Faz 5: Test Automation & CI/CD (2-3 gün)

#### 5.1 Pre-commit Hooks

```json
// package.json
{
  "scripts": {
    "test:changed": "vitest run --changed",
    "test:staged": "vitest run --staged"
  }
}

// .husky/pre-commit
#!/bin/sh
npm run test:changed
npm run lint:fix
```

#### 5.2 GitHub Actions CI

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - run: npx playwright test
```

---

## 📋 TEST SENARYOLARI KATALOĞU

### Randevu Yönetimi Senaryoları

1. ✅ **Randevu Oluşturma → Onaylama**
   - Company user randevu talep eder
   - Consultant randevuyu görüntüler
   - Consultant randevuyu onaylar
   - Zoom meeting otomatik oluşur
   - Her iki tarafa bildirim gider

2. ✅ **Randevu Oluşturma → Reddetme**
   - Company user randevu talep eder
   - Consultant randevuyu reddeder
   - Red nedeni kaydedilir
   - Company user'a bildirim gider

3. ✅ **Randevu Revize Etme**
   - Consultant randevuyu revize eder
   - Yeni tarih/saat önerilir
   - Company user onaylar/reddeder
   - Eski randevu cancelled olur

4. ✅ **Müsaitlik Kontrolü**
   - Randevu oluşturulurken müsaitlik kontrol edilir
   - Çakışma varsa hata verilir
   - Müsait olmayan tarihler kontrol edilir

### Etkinlik Yönetimi Senaryoları

1. ✅ **Etkinlik Oluşturma → Katılım → Hatırlatma**
   - Consultant etkinlik oluşturur
   - Zoom meeting otomatik oluşur
   - Company user katılım kaydı yapar
   - Cron job hatırlatma gönderir

2. ✅ **Etkinlik Güncelleme → Zoom Güncelleme**
   - Etkinlik güncellenir
   - Zoom meeting otomatik güncellenir
   - Katılımcılara bildirim gider

### Proje Yönetimi Senaryoları

1. ✅ **Proje Oluşturma → Görev Atama → Tamamlama**
   - Consultant proje oluşturur
   - Alt projeler oluşturulur
   - Görevler atanır
   - Company user görevleri tamamlar
   - Consultant görevleri onaylar

2. ✅ **Toplu İşlemler**
   - Toplu firma atama
   - Toplu tarih atama
   - Matris görünümü

---

## 🛠️ TEST TOOLS & HELPERS

### Mevcut Test Helpers

```typescript
// src/5-shared/test/utils.tsx
export function render(ui: ReactElement, options?: RenderOptions) {
  // Custom render with providers
}

// src/5-shared/test/api-helpers.ts
export function createMockRequest(url: string, options?: {...}): NextRequest
export function createMockUser(overrides?: {...})
export function mockAuthenticatedUser(user: {...})
```

### Yeni Test Helpers (Eklenecek)

```typescript
// src/5-shared/test/database-helpers.ts
export async function setupTestDatabase() {
  // Test database setup
}

export async function cleanupTestDatabase() {
  // Test database cleanup
}

export async function seedTestData() {
  // Seed test data
}

// src/5-shared/test/component-helpers.ts
export async function fillForm(formData: Record<string, string>) {
  // Form filling helper
}

export async function waitForApiCall(mockFn: Mock) {
  // Wait for API call helper
}

// e2e/helpers/page-objects.ts
export class AppointmentPage {
  constructor(private page: Page) {}

  async createAppointment(data: AppointmentData) {
    // Page object pattern
  }

  async approveAppointment(appointmentId: string) {
    // Page object pattern
  }
}
```

---

## 📊 TEST COVERAGE HEDEFLERİ

### Mevcut Coverage (Tahmini)

- **Unit Tests:** ~15% (16 test dosyası)
- **Integration Tests:** ~5% (1 API route test)
- **Component Tests:** ~10% (5 component test)
- **E2E Tests:** 0%
- **Genel Coverage:** ~10%

### Hedef Coverage

- **Unit Tests:** %80+
- **Integration Tests:** %70+
- **Component Tests:** %70+
- **E2E Tests:** %100 (Critical flows)
- **Genel Coverage:** %80+

---

## 🎯 ÖNCELİKLENDİRME

### Yüksek Öncelik (Hemen Başla)

1. **E2E Test Altyapısı** (Playwright)
   - Kurulum ve config
   - Test helpers
   - Page objects

2. **Critical User Flows**
   - Randevu akışı (oluşturma → onaylama → tamamlama)
   - Etkinlik akışı (oluşturma → katılım → hatırlatma)
   - Proje akışı (oluşturma → görev → tamamlama)

3. **API Integration Tests**
   - Appointment API routes
   - Event API routes
   - Project API routes

### Orta Öncelik

4. **Use Case Testleri**
   - Tüm use case'ler için unit testler
   - Business logic testleri

5. **Component Testleri**
   - Feature component testleri
   - Form validation testleri

### Düşük Öncelik

6. **Utility Testleri**
   - Helper fonksiyon testleri
   - Domain entity testleri

---

## 🚀 HIZLI BAŞLANGIÇ PLANI

### Adım 1: E2E Test Altyapısı (Bugün)

```bash
# 1. Playwright kurulumu
npm install -D @playwright/test
npx playwright install

# 2. Config dosyası oluştur
# playwright.config.ts

# 3. İlk E2E test yaz
# e2e/appointments/appointment-flow.spec.ts
```

### Adım 2: İlk Critical Flow Testi (Yarın)

- Randevu oluşturma → Onaylama senaryosu
- Tam akış testi
- Screenshot ve video kaydı

### Adım 3: Test Automation (Bu Hafta)

- Pre-commit hooks
- CI/CD entegrasyonu
- Test coverage raporu

---

## 📝 TEST YAZMA STANDARTLARI

### Test Dosya İsimlendirme

- Unit tests: `*.test.ts`
- Component tests: `*.test.tsx`
- E2E tests: `*.spec.ts`

### Test Yapısı

```typescript
describe('FeatureName', () => {
  describe('Component/UseCase', () => {
    beforeEach(() => {
      // Setup
    });

    it('should do something when condition', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Best Practices

1. **AAA Pattern:** Arrange, Act, Assert
2. **Test Isolation:** Her test bağımsız olmalı
3. **Descriptive Names:** Test isimleri açıklayıcı olmalı
4. **Mock External Dependencies:** Dış bağımlılıklar mock'lanmalı
5. **Test Data:** Test data gerçekçi olmalı
6. **Cleanup:** Test sonrası temizlik yapılmalı

---

## 🔄 SÜREKLİ İYİLEŞTİRME

### Test Review Süreci

1. **Kod Review:** Her PR'da test review
2. **Coverage Monitoring:** Coverage düşerse uyarı
3. **Flaky Test Detection:** Flaky testler tespit edilmeli
4. **Performance:** Test süreleri optimize edilmeli

### Test Maintenance

- Haftalık test review
- Aylık coverage raporu
- Quarterly test strategy review

---

## 📚 KAYNAKLAR

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Son Güncelleme:** 2025-01-XX  
**Sonraki Review:** Test implementasyonu sonrası
