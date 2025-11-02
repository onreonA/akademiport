# 📋 SPRINT 8 EKSİKLİKLERİ TAMAMLAMA PLANI

**Oluşturulma Tarihi:** Ocak 2025  
**Hedef:** Sprint 1-8 arası planlanmış ama yapılmamış özellikleri tamamlamak  
**Toplam Süre:** ~20-30 saat  
**Öncelik Sırası:** Yüksek → Orta → Düşük

---

## 🎯 GENEL BAKIŞ

### Eksik Özellikler Özeti

1. 🔴 **Görev Bağımlılıkları** (6-8 saat) - YÜKSEK ÖNCELİK
2. 🔴 **Soft Delete** (3-4 saat) - YÜKSEK ÖNCELİK
3. 🟡 **Şablon Özellikleri** (4-6 saat) - ORTA ÖNCELİK
4. 🟡 **Proje Detayında Inline Alt Proje CRUD** (3-4 saat) - ORTA ÖNCELİK
5. 🟡 **Admin Panel - Proje Yönetimi Sayfaları** (4-5 saat) - ORTA ÖNCELİK

**Toplam Süre:** ~20-27 saat

---

## 📅 UYGULAMA SIRASI

### Faz 1: Yüksek Öncelikli (Sprint 9 Öncesi Zorunlu)

#### 1. Soft Delete (3-4 saat) ⚠️

**Gerekçe:** Veri kaybını önlemek için kritik. Program yönetiminde var, proje yönetiminde de olmalı.

**Adımlar:**

1. **Database Migration** (1 saat)
   - `projects.deleted_at` kolonu ekle
   - `sub_projects.deleted_at` kolonu ekle
   - `tasks.deleted_at` kolonu ekle
   - Index'ler ekle (`deleted_at IS NULL` için)
   - Migration dosyası: `012_add_soft_delete_to_projects.sql`

2. **Repository Güncellemeleri** (1 saat)
   - `ProjectRepository.findAll()` - `deleted_at IS NULL` filter ekle
   - `ProjectRepository.findById()` - soft delete check
   - `ProjectRepository.delete()` - `deleted_at` set et (hard delete yok)
   - `ProjectRepository.restore()` - `deleted_at = NULL` yap
   - `SubProjectRepository` - aynı güncellemeler
   - `TaskRepository` - aynı güncellemeler

3. **Use Case Güncellemeleri** (1 saat)
   - `DeleteProjectUseCase` - soft delete yap
   - `RestoreProjectUseCase` - yeni use case ekle
   - `ListDeletedProjectsUseCase` - yeni use case ekle
   - SubProject ve Task için aynı use case'ler

4. **API Routes** (0.5 saat)
   - `DELETE /api/projects/[id]` - soft delete yap
   - `POST /api/projects/[id]/restore` - restore endpoint
   - `GET /api/projects/deleted` - silinen projeleri listele
   - SubProject ve Task için aynı endpoint'ler

5. **Frontend UI** (0.5 saat)
   - Silinen projeleri görüntüleme sayfası (`/dashboard/projects/deleted`)
   - Geri yükleme butonu
   - Silinen projeleri filtreleme

**Bağımlılıklar:** Yok  
**Süre:** 3-4 saat

---

#### 2. Görev Bağımlılıkları (6-8 saat) ⚠️

**Gerekçe:** Sprint 8 planında açıkça belirtilmiş. Görev yönetimi için önemli özellik.

**Adımlar:**

1. **Database Schema** (1.5 saat)
   - `task_dependencies` tablosu oluştur

   ```sql
   CREATE TABLE task_dependencies (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
     depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
     dependency_type VARCHAR(20) DEFAULT 'blocks', -- 'blocks', 'related'
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(task_id, depends_on_task_id),
     CHECK (task_id != depends_on_task_id) -- Self-dependency önle
   );
   ```

   - Circular dependency önleme: Trigger veya application logic
   - Index'ler ekle
   - Migration: `013_add_task_dependencies.sql`

2. **Domain Entity** (0.5 saat)
   - `TaskDependency.ts` entity oluştur
   - `Task.ts` - `dependencies` ve `dependents` ilişkileri ekle

3. **Repository** (1 saat)
   - `TaskDependencyRepository.ts` oluştur
   - `findByTaskId()` - bir görevin bağımlılıklarını getir
   - `create()` - bağımlılık ekle
   - `delete()` - bağımlılık sil
   - `checkCircularDependency()` - döngüsel bağımlılık kontrolü

4. **Use Cases** (1.5 saat)
   - `CreateTaskDependencyUseCase` - bağımlılık ekle
   - `DeleteTaskDependencyUseCase` - bağımlılık sil
   - `GetTaskDependenciesUseCase` - bağımlılıkları getir
   - `ValidateTaskDependencyUseCase` - circular dependency kontrolü
   - `CheckTaskDependenciesCompleteUseCase` - bağımlı görevler tamamlanmış mı?

5. **Business Logic - Validation** (1 saat)
   - Görev durumunu `in_progress` yapmadan önce bağımlılıkları kontrol et
   - Bağımlı görevler `done` değilse uyarı göster
   - `TaskStatusChangeUseCase` içine entegre et

6. **API Routes** (1 saat)
   - `POST /api/tasks/[id]/dependencies` - bağımlılık ekle
   - `DELETE /api/tasks/[id]/dependencies/[dependencyId]` - bağımlılık sil
   - `GET /api/tasks/[id]/dependencies` - bağımlılıkları getir

7. **Frontend UI** (1.5 saat)
   - Görev detay sayfasında "Bağımlılıklar" sekmesi
   - Bağımlılık ekleme modal/form
   - Bağımlılık grafiği (basit liste veya görselleştirme)
   - Görev durumu değiştirirken bağımlılık uyarısı
   - Bağımlı görevleri göster (tooltip veya badge)

**Bağımlılıklar:** Yok  
**Süre:** 6-8 saat

---

### Faz 2: Orta Öncelikli (Sprint 9 Sonrası)

#### 3. Şablon Özellikleri (4-6 saat) 🟡

**Gerekçe:** Sprint 8 planında belirtilmiş ama nice-to-have özellikler.

**Adımlar:**

1. **Şablon Önizleme** (1.5 saat)
   - `GET /api/projects/templates/[id]` - şablon detayını getir (alt projeler ve görevler ile)
   - Frontend: Şablon listesinde "Önizle" butonu
   - Modal veya yeni sayfa: Şablon içeriğini göster
   - Alt projeler ve görevler ağaç yapısında göster

2. **Şablon Kopyalama** (1.5 saat)
   - `POST /api/projects/templates/[id]/duplicate` - şablonu kopyala
   - Backend: Şablonu ve tüm alt projelerini/görevlerini kopyala
   - Frontend: Şablon listesinde "Kopyala" butonu
   - Yeni şablon adı input ile modal

3. **Şablona Alt Proje/Görev Ekleme UI** (2 saat)
   - Şablon düzenleme sayfası (`/dashboard/project-templates/[id]/edit`)
   - Alt proje ekleme formu (şablon içinde)
   - Görev ekleme formu (alt proje içinde)
   - Şablon oluştururken direkt alt proje ve görev ekleme
   - Drag & drop ile sıralama (opsiyonel)

**Bağımlılıklar:** Yok  
**Süre:** 4-6 saat

---

#### 4. Proje Detayında Inline Alt Proje CRUD (3-4 saat) 🟡

**Gerekçe:** Opsiyonel UX iyileştirmesi. Mevcut çözüm çalışıyor ama inline editing daha hızlı.

**Adımlar:**

1. **Modal Component** (1 saat)
   - `SubProjectModal.tsx` component oluştur
   - Create ve Edit modları
   - Form validation

2. **Proje Detay Sayfası Güncelleme** (1.5 saat)
   - `src/app/consultant-dashboard/projects/[id]/page.tsx`
   - Alt proje listesinde "Hızlı Düzenle" butonu
   - Modal açma/kapama state
   - Inline form ile hızlı düzenleme
   - `src/app/company-dashboard/projects/[id]/page.tsx` için aynı

3. **API Integration** (0.5 saat)
   - Mevcut API endpoint'leri kullan
   - Optimistic updates

**Bağımlılıklar:** Mevcut API'ler yeterli  
**Süre:** 3-4 saat

---

#### 5. Admin Panel - Proje Yönetimi Sayfaları (4-5 saat) 🟡

**Gerekçe:** Master Admin için özel sayfalar. Zorunlu değil ama mantıklı.

**Adımlar:**

1. **Proje Listesi Sayfası** (1.5 saat)
   - `/dashboard/projects/page.tsx`
   - Tüm projeleri görüntüleme (tüm roller)
   - Gelişmiş filtreleme (role, company, consultant, status, date range)
   - Gelişmiş arama (full-text search)

2. **Proje Detay Sayfası** (1 saat)
   - `/dashboard/projects/[id]/page.tsx`
   - Consultant ve Company dashboard'daki gibi
   - Admin için ek bilgiler (created_by, updated_by, etc.)

3. **Navigation & Menu** (0.5 saat)
   - Dashboard menüsüne "Projeler" ekle
   - Admin için özel navigation

4. **RLS Policies** (1 saat)
   - Admin'in tüm projeleri görebilmesi için RLS policy
   - Migration: `014_add_admin_projects_policy.sql`

**Bağımlılıklar:** Yok  
**Süre:** 4-5 saat

---

## 📊 ZAMAN ÇİZELGESİ

### Haftalık Plan

**Hafta 1 (Öncelikli):**

- ✅ Soft Delete (3-4 saat)
- ✅ Görev Bağımlılıkları - Database & Backend (4 saat)

**Hafta 2:**

- ✅ Görev Bağımlılıkları - Frontend (2-4 saat)
- ✅ Şablon Özellikleri (4-6 saat)

**Hafta 3:**

- ✅ Proje Detayında Inline Alt Proje CRUD (3-4 saat)
- ✅ Admin Panel - Proje Yönetimi Sayfaları (4-5 saat)

---

## ✅ KABUL KRİTERLERİ

### Soft Delete

- ✅ `deleted_at` kolonları tüm tablolarda var
- ✅ Repository'ler soft delete kullanıyor
- ✅ Silinen projeleri görüntüleme sayfası çalışıyor
- ✅ Geri yükleme özelliği çalışıyor
- ✅ Hard delete yok (master_admin hariç, opsiyonel)

### Görev Bağımlılıkları

- ✅ `task_dependencies` tablosu var
- ✅ Bağımlılık ekleme/silme çalışıyor
- ✅ Circular dependency kontrolü çalışıyor
- ✅ Görev durumu değiştirirken bağımlılık kontrolü yapılıyor
- ✅ Frontend'de bağımlılık görüntüleme çalışıyor

### Şablon Özellikleri

- ✅ Şablon önizleme çalışıyor
- ✅ Şablon kopyalama çalışıyor
- ✅ Şablona alt proje/görev ekleme UI çalışıyor

### Inline Alt Proje CRUD

- ✅ Modal ile alt proje oluşturma çalışıyor
- ✅ Modal ile alt proje düzenleme çalışıyor
- ✅ Ayrı sayfalara gitmeden işlemler yapılabiliyor

### Admin Panel

- ✅ Admin proje listesi sayfası çalışıyor
- ✅ Admin proje detay sayfası çalışıyor
- ✅ Gelişmiş filtreleme ve arama çalışıyor

---

## 🔗 İLGİLİ DOSYALAR

### Mevcut Dosyalar

- `src/3-domain/entities/Project.ts`
- `src/3-domain/entities/SubProject.ts`
- `src/3-domain/entities/Task.ts`
- `src/4-infrastructure/database/repositories/ProjectRepository.ts`
- `src/4-infrastructure/database/repositories/SubProjectRepository.ts`
- `src/4-infrastructure/database/repositories/TaskRepository.ts`

### Yeni Oluşturulacak Dosyalar

#### Backend

- `src/4-infrastructure/database/migrations/012_add_soft_delete_to_projects.sql`
- `src/4-infrastructure/database/migrations/013_add_task_dependencies.sql`
- `src/4-infrastructure/database/migrations/014_add_admin_projects_policy.sql`
- `src/3-domain/entities/TaskDependency.ts`
- `src/4-infrastructure/database/repositories/TaskDependencyRepository.ts`
- `src/2-application/use-cases/project/RestoreProjectUseCase.ts`
- `src/2-application/use-cases/project/ListDeletedProjectsUseCase.ts`
- `src/2-application/use-cases/task/CreateTaskDependencyUseCase.ts`
- `src/2-application/use-cases/task/DeleteTaskDependencyUseCase.ts`
- `src/2-application/use-cases/task/GetTaskDependenciesUseCase.ts`
- `src/2-application/use-cases/task/ValidateTaskDependencyUseCase.ts`
- `src/app/api/projects/[id]/restore/route.ts`
- `src/app/api/projects/deleted/route.ts`
- `src/app/api/tasks/[id]/dependencies/route.ts`

#### Frontend

- `src/app/dashboard/projects/page.tsx` (Admin proje listesi)
- `src/app/dashboard/projects/[id]/page.tsx` (Admin proje detay)
- `src/app/dashboard/projects/deleted/page.tsx` (Silinen projeler)
- `src/1-presentation/components/features/sub-projects/SubProjectModal.tsx`
- `src/1-presentation/components/features/tasks/TaskDependencies.tsx`
- `src/1-presentation/components/features/project-templates/TemplatePreview.tsx`

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

4. **Inline CRUD:**
   - Modal kullanılacak (ayrı sayfa yerine)
   - Mevcut API endpoint'leri kullanılacak
   - Optimistic updates yapılabilir

5. **Admin Panel:**
   - Master Admin tüm projeleri görebilecek
   - RLS policy ile güvenlik sağlanacak
   - Consultant ve Company panellerindeki özellikler admin panelinde de olacak

---

**Plan Sahibi:** AI Assistant  
**Gözden Geçiren:** Ömer Ünsal  
**Durum:** 📋 Plan Hazır - Onay Bekleniyor  
**Güncelleme:** Ocak 2025
