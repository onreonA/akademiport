# 📋 PROJE YÖNETİMİ - TAMAMLANMAYAN/YAPILACAK İŞLER LİSTESİ

**Tarih:** Ocak 2025  
**Sprint:** Sprint 8 - Sprint 9 Geçiş Öncesi Değerlendirme  
**Hazırlayan:** AI Assistant

---

## 🎯 GENEL DURUM

**Tamamlanma Oranı:** %82  
**Durum:** ⚠️ İyi Seviye - Core özellikler çalışıyor, bazı eksikler var

---

## 📊 ÖNCELİK SIRASI

| Öncelik       | Özellik Sayısı | Toplam Süre | Durum     |
| ------------- | -------------- | ----------- | --------- |
| 🔴 **YÜKSEK** | 2 özellik      | 9-12 saat   | Eksik     |
| 🟡 **ORTA**   | 2 özellik      | 7-9 saat    | Eksik     |
| 🟢 **DÜŞÜK**  | 2 özellik      | 7-10 saat   | Opsiyonel |

**Toplam:** 6 ana özellik, ~23-31 saat

---

## 🔴 YÜKSEK ÖNCELİKLİ EKSİKLER (Sprint 9 Öncesi Zorunlu)

### 1. Görev Bağımlılıkları Sistemi

**Durum:** ❌ Tamamen Eksik  
**Sprint Planında:** Sprint 8 detay planında belirtilmiş  
**Öncelik:** 🔴 YÜKSEK

#### Eksikler:

**Backend:**

- ❌ `task_dependencies` database tablosu yok
- ❌ `TaskDependency` entity yok
- ❌ `TaskDependencyRepository` yok
- ❌ Görev bağımlılıkları use case'leri yok:
  - ❌ `CreateTaskDependencyUseCase`
  - ❌ `DeleteTaskDependencyUseCase`
  - ❌ `GetTaskDependenciesUseCase`
  - ❌ `ValidateTaskDependencyUseCase` (circular dependency kontrolü)
  - ❌ `CheckTaskDependenciesCompleteUseCase`

**API:**

- ❌ `POST /api/tasks/[id]/dependencies` - Bağımlılık ekle
- ❌ `DELETE /api/tasks/[id]/dependencies/[dependencyId]` - Bağımlılık sil
- ❌ `GET /api/tasks/[id]/dependencies` - Bağımlılıkları getir
- ❌ `POST /api/tasks/[id]/dependencies/validate` - Bağımlılık doğrula

**Frontend:**

- ❌ Görev detay sayfasında "Bağımlılıklar" sekmesi
- ❌ Bağımlılık ekleme modal/form
- ❌ Bağımlılık listesi görüntüleme
- ❌ Bağımlılık grafiği (basit görselleştirme)
- ❌ Görev durumu değiştirirken bağımlılık uyarısı
- ❌ Bağımlı görevleri badge/tooltip ile gösterme

**Business Logic:**

- ❌ Görev durumunu `in_progress` yapmadan önce bağımlılıkları kontrol etme
- ❌ Bağımlı görevler tamamlanmamışsa uyarı gösterme
- ❌ Circular dependency (döngüsel bağımlılık) kontrolü

**Tahmini Süre:** 6-8 saat

- Database migration: 1.5 saat
- Domain & Repository: 1.5 saat
- Use Cases: 1.5 saat
- API Routes: 1 saat
- Frontend UI: 1.5 saat

**Not:** Sprint 8 planında açıkça belirtilmiş, görev yönetimi için önemli bir özellik.

---

### 2. Soft Delete Sistemi

**Durum:** ❌ Tamamen Eksik  
**Sprint Planında:** Açıkça belirtilmemiş ama Program yönetiminde var  
**Öncelik:** 🔴 YÜKSEK

#### Eksikler:

**Database:**

- ❌ `projects.deleted_at` kolonu yok
- ❌ `sub_projects.deleted_at` kolonu yok
- ❌ `tasks.deleted_at` kolonu yok
- ❌ Soft delete için index'ler yok

**Backend:**

- ❌ Repository'lerde soft delete filter yok (`deleted_at IS NULL`)
- ❌ `ProjectRepository.restore()` yok
- ❌ `SubProjectRepository.restore()` yok
- ❌ `TaskRepository.restore()` yok
- ❌ `DeleteProjectUseCase` hard delete yapıyor (soft delete olmalı)
- ❌ `RestoreProjectUseCase` yok
- ❌ `ListDeletedProjectsUseCase` yok

**API:**

- ❌ `DELETE /api/projects/[id]` hard delete yapıyor (soft delete olmalı)
- ❌ `POST /api/projects/[id]/restore` yok
- ❌ `GET /api/projects/deleted` yok
- ❌ Sub-project ve Task için aynı endpoint'ler yok

**Frontend:**

- ❌ Silinen projeleri görüntüleme sayfası (`/dashboard/projects/deleted`)
- ❌ Geri yükleme butonu
- ❌ Silinen projeleri filtreleme
- ❌ Kalıcı silme (hard delete) butonu (opsiyonel, sadece admin için)

**Tahmini Süre:** 3-4 saat

- Migration: 1 saat
- Repository güncellemeleri: 1 saat
- Use Case'ler: 1 saat
- API Routes: 0.5 saat
- Frontend UI: 0.5 saat

**Not:** Program yönetiminde soft delete var, proje yönetiminde de olmalı. Veri kaybını önlemek için kritik.

---

## 🟡 ORTA ÖNCELİKLİ EKSİKLER

### 3. Şablon Gelişmiş Özellikleri

**Durum:** ⚠️ Kısmi (Backend hazır, Frontend eksik)  
**Sprint Planında:** Sprint 8 detay planında belirtilmiş  
**Öncelik:** 🟡 ORTA

#### Eksikler:

**Backend:**

- ✅ Şablon listeleme var
- ✅ Şablon oluşturma var
- ✅ Şablon düzenleme var
- ✅ Şablondan proje oluşturma var
- ❌ Şablon detay getirme (alt projeler ve görevler ile) eksik veya kısmi

**Frontend:**

- ✅ Şablon listesi sayfası var (`/dashboard/project-templates`)
- ✅ Şablon oluşturma sayfası var (`/dashboard/project-templates/new`)
- ✅ Şablon düzenleme sayfası var (`/dashboard/project-templates/[id]/edit`)
- ❌ Şablon önizleme modal/sayfası yok (şablon içeriğini görüntüleme)
- ❌ Şablon kopyalama butonu ve fonksiyonu yok
- ❌ Şablona alt proje/görev ekleme UI yok (şablon oluştururken direkt alt proje ve görev ekleme)

**Tahmini Süre:** 4-6 saat

- Backend: Şablon detay getirme (alt projeler/görevler ile) - 1 saat
- Frontend: Şablon önizleme - 1.5 saat
- Frontend: Şablon kopyalama - 1.5 saat
- Frontend: Şablona alt proje/görev ekleme UI - 2 saat

**Not:** Sprint 8 planında belirtilmiş ama nice-to-have özellikler. Şablon oluşturma çalışıyor, bunlar UX iyileştirmeleri.

---

### 4. Proje Detayında Inline Alt Proje CRUD

**Durum:** ⚠️ Kısmi (Ayrı sayfalar var, inline yok)  
**Sprint Planında:** Sprint 8 detay planında belirtilmiş  
**Öncelik:** 🟡 ORTA

#### Mevcut Durum:

- ✅ Alt proje oluşturma sayfası var (`/consultant-dashboard/projects/[id]/sub-projects/new`)
- ✅ Alt proje düzenleme sayfası var (`/consultant-dashboard/projects/[id]/sub-projects/[subId]/edit`)
- ✅ Alt proje silme butonu var (proje detay sayfasında)

#### Eksikler:

- ❌ Proje detay sayfasından direkt alt proje oluşturma (modal veya inline form)
- ❌ Proje detay sayfasından direkt alt proje düzenleme (modal veya inline form)
- ❌ Hızlı düzenleme için "Düzenle" butonu

**Tahmini Süre:** 3-4 saat

- Modal component oluşturma: 1 saat
- Proje detay sayfası güncelleme: 1.5 saat
- API integration: 0.5 saat

**Not:** Şu anda tüm işlemler ayrı sayfalarda yapılıyor. Inline editing daha hızlı bir UX sağlar ama zorunlu değil.

---

## 🟢 DÜŞÜK ÖNCELİKLİ EKSİKLER (Opsiyonel)

### 5. Admin Panel - Proje Yönetimi Sayfaları

**Durum:** ❌ Tamamen Eksik  
**Sprint Planında:** Belirtilmemiş ama mantıklı  
**Öncelik:** 🟢 DÜŞÜK

#### Eksikler:

**Frontend:**

- ❌ `/dashboard/projects` - Tüm projeleri görüntüleme (admin için)
- ❌ `/dashboard/projects/[id]` - Proje detay (admin için)
- ❌ Admin için gelişmiş filtreleme (role, company, consultant, status, date range)
- ❌ Admin için gelişmiş arama (full-text search)
- ❌ Admin için bulk operations (toplu işlemler)

**RLS Policies:**

- ⚠️ Admin'in tüm projeleri görebilmesi için RLS policy kontrolü gerekebilir

**Not:** Consultant ve Company panelleri var, Admin paneli eksik. Master Admin program yönetiminden projelere erişebilir ama özel sayfalar daha iyi olur.

**Tahmini Süre:** 4-5 saat

- Proje listesi sayfası: 1.5 saat
- Proje detay sayfası: 1 saat
- Navigation & Menu: 0.5 saat
- RLS Policies: 1 saat

---

### 6. Proje Kopyalama ve Diğer Gelişmiş Özellikler

**Durum:** ❌ Tamamen Eksik  
**Sprint Planında:** Belirtilmemiş  
**Öncelik:** 🟢 DÜŞÜK

#### Eksikler:

**Backend:**

- ❌ `DuplicateProjectUseCase` yok (proje kopyalama)

**API:**

- ❌ `POST /api/projects/[id]/duplicate` yok

**Frontend:**

- ❌ Proje kopyalama butonu ve fonksiyonu yok
- ❌ Proje export (PDF, Excel) yok
- ❌ Proje arşivleme yok
- ❌ Geciken görevler listesi yok (`/consultant-dashboard/tasks/overdue`)
- ❌ Yaklaşan deadline'lar listesi yok (`/consultant-dashboard/tasks/upcoming`)
- ❌ Drag & drop ile sıralama yok (alt projeler, görevler)
- ❌ Gantt chart görünümü yok
- ❌ Kanban board görünümü yok
- ❌ Proje timeline görünümü yok

**Tahmini Süre:** 7-10 saat (tüm özellikler için)

- Proje kopyalama: 2 saat
- Proje export: 2 saat
- Diğer gelişmiş özellikler: 3-6 saat

**Not:** Bu özellikler nice-to-have, Sprint 9 ve sonrasında düşünülebilir.

---

## 🔧 TEKNİK BORÇLAR VE İYİLEŞTİRMELER

### 1. Testing

**Durum:** ❌ Hiç test yazılmadı  
**Öncelik:** 🔴 YÜKSEK  
**Tahmini Süre:** 20-30 saat (tüm modül için)

#### Eksikler:

- ❌ Unit tests (Use Cases, Repositories)
- ❌ Integration tests (API Routes)
- ❌ E2E tests (Critical user flows)
- ❌ Component tests (React Testing Library)

---

### 2. Performance Optimizasyonu

**Durum:** ⚠️ İyileştirilebilir  
**Öncelik:** 🟡 ORTA  
**Tahmini Süre:** 6-8 saat

#### Mevcut Sorunlar:

- ⚠️ Sayfa yüklendiğinde çok fazla API call (N+1 problem potansiyeli)
- ⚠️ Alt projeler ve görevler ayrı ayrı fetch ediliyor (batching yok)
- ⚠️ Pagination sadece proje listesinde var, görev listesinde yok
- ⚠️ Caching stratejisi yok (React Query veya SWR yok)

#### Öneriler:

- ✅ React Query veya SWR entegrasyonu
- ✅ API response caching
- ✅ Optimistic updates
- ✅ Infinite scroll veya pagination (görev listeleri için)

---

### 3. Error Handling İyileştirmesi

**Durum:** ⚠️ Kısmi  
**Öncelik:** 🟡 ORTA  
**Tahmini Süre:** 4-6 saat

#### Mevcut Durum:

- ✅ Try-catch blokları var
- ✅ Error messages gösteriliyor
- ⚠️ Error logging yok (Sentry entegrasyonu yok)
- ⚠️ Error recovery mekanizması yok (retry, fallback)

#### Öneriler:

- ✅ Sentry entegrasyonu
- ✅ Error boundary component'leri
- ✅ Retry logic (failed API calls için)
- ✅ Fallback UI (network errors için)

---

### 4. API Documentation

**Durum:** ❌ Eksik  
**Öncelik:** 🟢 DÜŞÜK  
**Tahmini Süre:** 2-3 saat

#### Eksikler:

- ❌ OpenAPI/Swagger documentation yok
- ❌ API endpoint'lerinin dokümantasyonu yok
- ❌ Request/Response örnekleri yok

---

## 📊 ÖZET TABLO

| #          | Özellik                       | Öncelik   | Durum    | Tahmini Süre   | Sprint          |
| ---------- | ----------------------------- | --------- | -------- | -------------- | --------------- |
| 1          | Görev Bağımlılıkları          | 🔴 YÜKSEK | ❌ Eksik | 6-8 saat       | 8.5 veya 9      |
| 2          | Soft Delete                   | 🔴 YÜKSEK | ❌ Eksik | 3-4 saat       | 8.5 veya 9      |
| 3          | Şablon Gelişmiş Özellikleri   | 🟡 ORTA   | ⚠️ Kısmi | 4-6 saat       | 9 veya 9.5      |
| 4          | Inline Alt Proje CRUD         | 🟡 ORTA   | ⚠️ Kısmi | 3-4 saat       | 9 veya 9.5      |
| 5          | Admin Panel - Proje Sayfaları | 🟢 DÜŞÜK  | ❌ Eksik | 4-5 saat       | 9 veya sonrası  |
| 6          | Proje Kopyalama ve Diğerleri  | 🟢 DÜŞÜK  | ❌ Eksik | 7-10 saat      | 9+ veya sonrası |
| **TOPLAM** | **6 özellik**                 |           |          | **27-37 saat** |                 |

---

## 🎯 ÖNERİLEN YAKLAŞIM

### Sprint 8.5 (Sprint 9 Öncesi - Önerilen)

**Süre:** 1 hafta (20-25 saat)  
**Hedef:** Yüksek öncelikli eksikleri tamamla

**Yapılacaklar:**

1. ✅ Soft Delete (3-4 saat) - Veri kaybını önlemek için kritik
2. ✅ Görev Bağımlılıkları - Database & Backend (3-4 saat)
3. ✅ Görev Bağımlılıkları - Frontend (3-4 saat)

**Çıktı:** Core özellikler tamamlanmış, Sprint 9'a hazır

---

### Sprint 9 (Eğitim Yönetimi + Kalan Eksikler)

**Süre:** 2 hafta  
**Hedef:** Eğitim yönetimi + Orta öncelikli eksikler

**Yapılacaklar:**

1. Eğitim Yönetimi (ana sprint hedefi)
2. Şablon Gelişmiş Özellikleri (4-6 saat) - İkinci öncelik
3. Inline Alt Proje CRUD (3-4 saat) - Zaman kalırsa

---

### Sprint 9.5 veya Sonrası

**Hedef:** Düşük öncelikli eksikler ve iyileştirmeler

**Yapılacaklar:**

1. Admin Panel - Proje Sayfaları (4-5 saat)
2. Proje Kopyalama ve Diğerleri (7-10 saat)
3. Teknik borçlar (Testing, Performance, Error Handling)

---

## 📝 NOTLAR

### Önemli Kararlar

1. **Soft Delete:**
   - Tüm tablolarda `deleted_at` kullanılacak
   - Hard delete sadece master_admin için opsiyonel olabilir
   - Silinen kayıtlar varsayılan olarak listelenmeyecek

2. **Görev Bağımlılıkları:**
   - Circular dependency kontrolü zorunlu
   - Bağımlılık tipleri: `blocks` (zorunlu), `related` (opsiyonel)
   - Görev durumu `in_progress` yapılırken bağımlılıklar kontrol edilecek

3. **Şablon Özellikleri:**
   - Şablon kopyalama recursive olarak alt projeleri ve görevleri de kopyalayacak
   - Şablon önizleme sadece görüntüleme, düzenleme yok

---

## 🔗 İLGİLİ DOSYALAR

### Mevcut Dosyalar

- `docs/SPRINT-8-EKSIKLER-PLAN.md` - Sprint 8 eksikleri planı
- `docs/PROJE-YONETIMI-KAPSAMLI-ANALIZ.md` - Kapsamlı analiz
- `sprint-detaylari/sprint-08-proje-yonetimi.md` - Sprint 8 detay planı

### Yeni Oluşturulacak Dosyalar

**Backend:**

- `src/4-infrastructure/database/migrations/012_add_soft_delete_to_projects.sql`
- `src/4-infrastructure/database/migrations/013_add_task_dependencies.sql`
- `src/3-domain/entities/TaskDependency.ts`
- `src/4-infrastructure/database/repositories/TaskDependencyRepository.ts`
- `src/2-application/use-cases/task/CreateTaskDependencyUseCase.ts`
- `src/2-application/use-cases/task/DeleteTaskDependencyUseCase.ts`
- `src/2-application/use-cases/task/GetTaskDependenciesUseCase.ts`
- `src/2-application/use-cases/task/ValidateTaskDependencyUseCase.ts`
- `src/2-application/use-cases/project/RestoreProjectUseCase.ts`
- `src/2-application/use-cases/project/ListDeletedProjectsUseCase.ts`

**Frontend:**

- `src/app/dashboard/projects/deleted/page.tsx`
- `src/1-presentation/components/features/tasks/TaskDependencies.tsx`
- `src/1-presentation/components/features/project-templates/TemplatePreview.tsx`
- `src/1-presentation/components/features/sub-projects/SubProjectModal.tsx`

---

**Hazırlayan:** AI Assistant  
**Gözden Geçiren:** Ömer Ünsal  
**Durum:** 📋 Değerlendirme Tamamlandı  
**Güncelleme:** Ocak 2025
