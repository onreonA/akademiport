# 🧪 Sprint 20-21: Testing & QA - Detaylı Plan

**Tarih:** Ocak 2025  
**Durum:** 🔄 Başlangıç  
**Sprint:** 20-21 - Testing & QA  
**Hedef:** Test Coverage > 80% + Critical Path E2E Tests

---

## 📊 MEVCUT TEST DURUMU ANALİZİ

### ✅ Mevcut Test Altyapısı

**Test Framework'ler:**

- ✅ Vitest 4.0.6 (Unit & Integration)
- ✅ @testing-library/react 16.3.0 (Component)
- ✅ Playwright 1.56.1 (E2E)
- ✅ @vitest/coverage-v8 (Coverage)

**Test Dosyaları:**

- ✅ **Unit Tests:** ~128 test dosyası
- ✅ **Component Tests:** ~16 test dosyası
- ✅ **E2E Tests:** ~10 test dosyası
- ✅ **API Route Tests:** ~50+ test dosyası

### ⚠️ Mevcut Sorunlar

1. **Test Başarısızlıkları:**
   - `cookies` was called outside a request scope (Next.js context sorunu)
   - Mock implementation sorunları
   - Test isolation sorunları

2. **Test Coverage:**
   - Unit Tests: ~60% (tahmini)
   - Integration Tests: ~40% (tahmini)
   - E2E Tests: ~20% (tahmini)
   - **Genel Coverage:** ~40% (hedef: %80+)

3. **Eksik Testler:**
   - Critical user flows eksik
   - Performance testleri yok
   - Load testleri yok
   - Accessibility testleri eksik

---

## 🎯 SPRINT HEDEFLERİ

### Faz 1: Test Sorunlarını Düzeltme (1-2 gün)

**Öncelik:** 🔴 Yüksek

**Görevler:**

1. Next.js context sorunlarını düzelt
2. Mock implementation sorunlarını düzelt
3. Test isolation sorunlarını düzelt
4. Flaky testleri düzelt

**Hedef:** Tüm mevcut testler geçmeli (%100 pass rate)

---

### Faz 2: Unit Test Coverage Artırma (2-3 gün)

**Öncelik:** 🔴 Yüksek

**Hedef:** %60 → %80+

**Görevler:**

1. Eksik use case testleri ekle
2. Repository testleri ekle
3. Service testleri ekle
4. Utility testleri ekle

**Kapsam:**

- Use Cases: %70 → %90+
- Repositories: %50 → %80+
- Services: %60 → %85+
- Utilities: %40 → %75+

---

### Faz 3: Integration Test Coverage Artırma (2-3 gün)

**Öncelik:** 🟡 Orta

**Hedef:** %40 → %70+

**Görevler:**

1. API route testleri artır
2. Database integration testleri ekle
3. External service integration testleri ekle
4. End-to-end API testleri ekle

**Kapsam:**

- API Routes: %60 → %85+
- Database Integration: %30 → %70+
- External Services: %20 → %60+

---

### Faz 4: E2E Test Coverage Artırma (3-4 gün)

**Öncelik:** 🔴 Yüksek

**Hedef:** %20 → %50+

**Görevler:**

1. Critical user flows testleri ekle
2. Authentication flows testleri ekle
3. Dashboard flows testleri ekle
4. Form validation testleri ekle

**Critical Flows:**

- ✅ Appointment flow (mevcut)
- ✅ Event flow (mevcut)
- ✅ Project flow (mevcut)
- ⏳ Authentication flow (eksik)
- ⏳ Dashboard flow (eksik)
- ⏳ CMS flow (eksik)
- ⏳ Report generation flow (eksik)
- ⏳ Chatbot flow (eksik)

---

### Faz 5: Performance & Load Testing (1-2 gün)

**Öncelik:** 🟡 Orta

**Görevler:**

1. Performance testleri ekle
2. Load testleri ekle
3. Memory leak testleri ekle
4. API response time testleri ekle

**Araçlar:**

- Lighthouse CI
- k6 veya Artillery
- Playwright performance API

---

### Faz 6: Accessibility Testing (1 gün)

**Öncelik:** 🟢 Düşük

**Görevler:**

1. Accessibility testleri ekle
2. WCAG compliance kontrolü
3. Screen reader testleri
4. Keyboard navigation testleri

**Araçlar:**

- @axe-core/playwright
- Lighthouse accessibility audit

---

### Faz 7: Test Automation & CI/CD (1 gün)

**Öncelik:** 🟡 Orta

**Görevler:**

1. Pre-commit hooks (Husky)
2. GitHub Actions workflows
3. Test coverage reporting
4. Test result notifications

---

## 📋 DETAYLI GÖREV LİSTESİ

### Faz 1: Test Sorunlarını Düzeltme

#### 1.1 Next.js Context Sorunları

**Sorun:** `cookies` was called outside a request scope

**Dosyalar:**

- `src/app/api/appointments/[id]/approve/route.test.ts`
- `src/app/api/events/route.test.ts`
- Diğer API route testleri

**Çözüm:**

- Request context mock'ları düzelt
- `NextRequest` mock'ları iyileştir
- Test helpers güncelle

**Tahmini Süre:** 4-6 saat

#### 1.2 Mock Implementation Sorunları

**Sorun:** Mock constructor sorunları

**Dosyalar:**

- `src/app/api/events/route.test.ts`
- Diğer API route testleri

**Çözüm:**

- Mock implementation'ları düzelt
- Class mock'ları yerine function mock'ları kullan
- Mock factory pattern uygula

**Tahmini Süre:** 3-4 saat

#### 1.3 Test Isolation Sorunları

**Sorun:** Testler birbirini etkiliyor

**Çözüm:**

- `beforeEach` ve `afterEach` hooks ekle
- Test data cleanup
- Mock reset mekanizması

**Tahmini Süre:** 2-3 saat

---

### Faz 2: Unit Test Coverage Artırma

#### 2.1 Use Case Testleri

**Eksik Use Cases:**

- Project use cases (CreateProject, UpdateProject, DeleteProject, vb.)
- Training use cases
- Program use cases
- Company use cases
- User use cases

**Hedef:** Her use case için en az 3-5 test

**Tahmini Süre:** 2-3 gün

#### 2.2 Repository Testleri

**Eksik Repositories:**

- ProjectRepository
- TrainingRepository
- ProgramRepository
- CompanyRepository
- UserRepository

**Hedef:** Her repository için CRUD testleri

**Tahmini Süre:** 1-2 gün

#### 2.3 Service Testleri

**Eksik Services:**

- EmailService
- NotificationService
- AnalyticsService
- ExportService

**Hedef:** Her service için core functionality testleri

**Tahmini Süre:** 1-2 gün

---

### Faz 3: Integration Test Coverage Artırma

#### 3.1 API Route Testleri

**Eksik API Routes:**

- `/api/projects/*`
- `/api/trainings/*`
- `/api/programs/*`
- `/api/companies/*`
- `/api/users/*`

**Hedef:** Her API route için authentication, validation, business logic testleri

**Tahmini Süre:** 2-3 gün

#### 3.2 Database Integration Testleri

**Görevler:**

- Database transaction testleri
- RLS policy testleri
- Migration testleri
- Query performance testleri

**Tahmini Süre:** 1-2 gün

---

### Faz 4: E2E Test Coverage Artırma

#### 4.1 Critical User Flows

**Eksik Flows:**

1. **Authentication Flow**
   - Login → Logout
   - Role-based access
   - Session management

2. **Dashboard Flow**
   - Master Admin dashboard
   - Consultant dashboard
   - Company dashboard

3. **CMS Flow**
   - Page creation
   - Media upload
   - Settings management

4. **Report Generation Flow**
   - Report creation
   - PDF export
   - Email sending

5. **Chatbot Flow**
   - Chat interaction
   - Context management
   - Training content search

**Tahmini Süre:** 3-4 gün

---

## 📊 TEST COVERAGE HEDEFLERİ

### Mevcut Coverage (Tahmini)

| Kategori           | Mevcut  | Hedef    | Fark     |
| ------------------ | ------- | -------- | -------- |
| Unit Tests         | %60     | %80+     | +20%     |
| Integration Tests  | %40     | %70+     | +30%     |
| Component Tests    | %50     | %70+     | +20%     |
| E2E Tests          | %20     | %50+     | +30%     |
| **Genel Coverage** | **%40** | **%80+** | **+40%** |

---

## ✅ KABUL KRİTERLERİ

### Fonksiyonel Gereksinimler

- [ ] Tüm mevcut testler geçiyor (%100 pass rate)
- [ ] Critical user flows test edildi
- [ ] API routes test edildi (%85+)
- [ ] Use cases test edildi (%90+)
- [ ] Components test edildi (%70+)

### Teknik Gereksinimler

- [ ] Test coverage > 80%
- [ ] Pre-commit hooks çalışıyor
- [ ] CI/CD entegrasyonu aktif
- [ ] Test documentation hazır
- [ ] Performance testleri eklendi

### Kalite Gereksinimleri

- [ ] Flaky test yok
- [ ] Test süreleri optimize (< 5 dakika)
- [ ] Test maintenance planı hazır
- [ ] Test best practices uygulanıyor

---

## 📦 ÇIKTILAR

### Deliverables

1. ✅ Tüm test sorunları düzeltildi
2. ✅ Unit test coverage %80+
3. ✅ Integration test coverage %70+
4. ✅ E2E test coverage %50+
5. ✅ Critical user flows test edildi
6. ✅ Performance testleri eklendi
7. ✅ Test automation (pre-commit, CI/CD)
8. ✅ Test documentation

### Test Dosyaları

**Yeni Test Dosyaları:**

- `src/2-application/use-cases/project/*.test.ts` (10+ dosya)
- `src/2-application/use-cases/training/*.test.ts` (8+ dosya)
- `src/4-infrastructure/database/repositories/*.test.ts` (10+ dosya)
- `e2e/auth/*.spec.ts` (3+ dosya)
- `e2e/dashboard/*.spec.ts` (5+ dosya)
- `e2e/cms/*.spec.ts` (4+ dosya)
- `e2e/reports/*.spec.ts` (3+ dosya)
- `e2e/chatbot/*.spec.ts` (2+ dosya)

---

## 🎯 ÖNCELİKLENDİRME

### Yüksek Öncelik (Hemen Başla)

1. **Test Sorunlarını Düzeltme** (Faz 1)
2. **Unit Test Coverage Artırma** (Faz 2)
3. **Critical User Flows E2E Tests** (Faz 4.1)

### Orta Öncelik

4. **Integration Test Coverage Artırma** (Faz 3)
5. **Test Automation & CI/CD** (Faz 7)

### Düşük Öncelik

6. **Performance & Load Testing** (Faz 5)
7. **Accessibility Testing** (Faz 6)

---

## 📝 NOTLAR

- **Test Süresi:** Toplam ~12-15 gün
- **Test Coverage:** Hedef %80+ genel coverage
- **Critical Flows:** En az 10 critical user flow test edilmeli
- **CI/CD:** GitHub Actions workflows otomatik test çalıştırmalı
- **Documentation:** Test documentation güncel tutulmalı

---

**Hazırlayan:** AI Assistant  
**Tarih:** Ocak 2025  
**Durum:** 🔄 Planlama Aşaması
