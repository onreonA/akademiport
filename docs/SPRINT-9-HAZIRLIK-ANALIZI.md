# 📋 Sprint 9: Eğitim Yönetimi - HAZIRLIK ANALİZİ

**Tarih:** Ocak 2025  
**Durum:** ✅ **SPRINT 9'A HAZIR**  
**Hazırlayan:** AI Assistant

---

## 🎯 SPRINT 9 HEDEFİ

**Hedef:** Video + Döküman eğitim sistemi çalışıyor

**Ana Özellikler:**

- Training entity + repository
- TrainingVideo entity + repository
- TrainingDocument entity + repository
- Use cases (CRUD, assignment, tracking)
- API routes (trainings, videos, documents)
- Admin: Eğitim CRUD
- Admin: Video yükleme (YouTube unlisted)
- Admin: Döküman yükleme (Supabase Storage)
- Admin: Global vs Program eğitimleri
- Consultant: Firmaya eğitim atama
- Company: Eğitim listesi
- Company: Video izleme + tracking
- Company: Döküman okuma + tracking
- Sıralı eğitim sistemi (video 1 bitince video 2 açılır)
- Kilitli içerik
- İzleme yüzdesi hesaplama

---

## ✅ BAĞIMLILIK KONTROLÜ

### Gerekli Sistemler

| Sistem                    | Durum         | Notlar                      |
| ------------------------- | ------------- | --------------------------- |
| Sprint 6: Firma Yönetimi  | ✅ Tamamlandı | Firma entity çalışıyor      |
| Sprint 7: Danışman Paneli | ✅ Tamamlandı | Consultant paneli çalışıyor |
| Sprint 8: Proje Yönetimi  | ✅ Tamamlandı | Proje yönetimi çalışıyor    |

**Sonuç:** ✅ **Tüm bağımlılıklar tamamlandı**

---

## 📊 MEVCUT SİSTEM ANALİZİ

### Hazır Olan Altyapı

#### 1. ✅ Database & Auth

- ✅ Supabase connection çalışıyor
- ✅ Authentication çalışıyor
- ✅ RLS policies çalışıyor
- ✅ Migration sistemi çalışıyor
- ✅ Soft delete pattern hazır

#### 2. ✅ Repository Pattern

- ✅ Repository interface pattern hazır
- ✅ Supabase repository implementation pattern hazır
- ✅ Error handling pattern hazır
- ✅ Result pattern hazır

#### 3. ✅ Use Case Pattern

- ✅ Use case structure hazır
- ✅ Result pattern kullanılıyor
- ✅ Error handling pattern hazır
- ✅ Authorization pattern hazır

#### 4. ✅ API Routes

- ✅ API route structure hazır
- ✅ Authentication middleware hazır
- ✅ Authorization pattern hazır
- ✅ Error handling pattern hazır

#### 5. ✅ Frontend Components

- ✅ UI components hazır (Button, Input, Card, Modal, Tabs, etc.)
- ✅ Layout templates hazır
- ✅ Form patterns hazır
- ✅ Modal patterns hazır
- ✅ List/Grid patterns hazır

#### 6. ✅ Company & Consultant Systems

- ✅ Company entity çalışıyor
- ✅ Consultant paneli çalışıyor
- ✅ Firma-Consultant ilişkisi çalışıyor
- ✅ Program atama sistemi çalışıyor

---

## 🎯 SPRINT 9 GEREKSİNİMLERİ

### 1. Database Schema

#### Yeni Tablolar Gerekli

- `trainings` - Eğitim ana tablosu
  - id, name, description
  - program_id (nullable - global eğitim için)
  - consultant_id (nullable - global eğitim için)
  - status, priority
  - is_global, is_locked
  - created_at, updated_at

- `training_videos` - Video tablosu
  - id, training_id
  - title, description
  - youtube_url, youtube_id
  - order_index
  - duration (optional)
  - is_locked
  - created_at, updated_at

- `training_documents` - Döküman tablosu
  - id, training_id
  - title, description
  - file_url, file_name, file_size
  - file_type
  - order_index
  - is_locked
  - created_at, updated_at

- `company_trainings` - Firma-Eğitim atama
  - id, company_id, training_id
  - assigned_by (consultant_id)
  - assigned_at
  - status (assigned, in_progress, completed)

- `training_progress` - İzleme takibi
  - id, company_id, training_id
  - video_id (nullable)
  - document_id (nullable)
  - progress_percentage (0-100)
  - watched_at (for videos)
  - read_at (for documents)
  - completed_at

#### İlişkiler

- `trainings.program_id` → `programs.id` (nullable)
- `trainings.consultant_id` → `users.id` (nullable)
- `training_videos.training_id` → `trainings.id`
- `training_documents.training_id` → `trainings.id`
- `company_trainings.company_id` → `companies.id`
- `company_trainings.training_id` → `trainings.id`
- `training_progress.company_id` → `companies.id`
- `training_progress.training_id` → `trainings.id`

#### Indexes Gerekli

- `trainings(program_id)`
- `trainings(consultant_id)`
- `training_videos(training_id, order_index)`
- `training_documents(training_id, order_index)`
- `company_trainings(company_id, training_id)`
- `training_progress(company_id, training_id)`

#### RLS Policies Gerekli

- Admin: Full access to all trainings
- Consultant: Can view/manage assigned trainings
- Company: Can view assigned trainings
- Company: Can update progress (own company only)

---

### 2. Domain Layer

#### Entities Gerekli

- ✅ `Training.ts` - Eğitim entity
- ✅ `TrainingVideo.ts` - Video entity
- ✅ `TrainingDocument.ts` - Döküman entity
- ✅ `CompanyTraining.ts` - Firma-Eğitim atama entity
- ✅ `TrainingProgress.ts` - İzleme takibi entity

#### Repository Interfaces Gerekli

- ✅ `ITrainingRepository.ts`
- ✅ `ITrainingVideoRepository.ts`
- ✅ `ITrainingDocumentRepository.ts`
- ✅ `ICompanyTrainingRepository.ts`
- ✅ `ITrainingProgressRepository.ts`

---

### 3. Application Layer

#### Use Cases Gerekli

**Training Use Cases:**

- ✅ `CreateTrainingUseCase.ts`
- ✅ `UpdateTrainingUseCase.ts`
- ✅ `DeleteTrainingUseCase.ts`
- ✅ `GetTrainingUseCase.ts`
- ✅ `ListTrainingsUseCase.ts` (with filters: global, program, consultant)

**Training Video Use Cases:**

- ✅ `CreateTrainingVideoUseCase.ts`
- ✅ `UpdateTrainingVideoUseCase.ts`
- ✅ `DeleteTrainingVideoUseCase.ts`
- ✅ `ListTrainingVideosUseCase.ts`

**Training Document Use Cases:**

- ✅ `CreateTrainingDocumentUseCase.ts`
- ✅ `UpdateTrainingDocumentUseCase.ts`
- ✅ `DeleteTrainingDocumentUseCase.ts`
- ✅ `ListTrainingDocumentsUseCase.ts`

**Company Training Use Cases:**

- ✅ `AssignTrainingToCompanyUseCase.ts`
- ✅ `RemoveTrainingFromCompanyUseCase.ts`
- ✅ `ListCompanyTrainingsUseCase.ts`

**Training Progress Use Cases:**

- ✅ `UpdateTrainingProgressUseCase.ts`
- ✅ `GetTrainingProgressUseCase.ts`
- ✅ `ListTrainingProgressUseCase.ts`
- ✅ `CalculateTrainingProgressUseCase.ts` - İzleme yüzdesi hesaplama

**Business Logic Use Cases:**

- ✅ `CheckTrainingLockUseCase.ts` - Sıralı eğitim kontrolü (video 1 bitince video 2 açılır)
- ✅ `UnlockNextContentUseCase.ts` - Sonraki içeriği aç

---

### 4. Infrastructure Layer

#### Repositories Gerekli

- ✅ `TrainingRepository.ts`
- ✅ `TrainingVideoRepository.ts`
- ✅ `TrainingDocumentRepository.ts`
- ✅ `CompanyTrainingRepository.ts`
- ✅ `TrainingProgressRepository.ts`

#### External Services Gerekli

- ✅ **Supabase Storage** - Döküman yükleme için
  - Bucket: `training-documents`
  - File upload API
  - File download API
  - File delete API

- ✅ **YouTube API** (opsiyonel - sadece metadata için)
  - Video metadata fetch (duration, title, thumbnail)
  - YouTube unlisted video validation

---

### 5. API Routes Gerekli

#### Trainings

- ✅ `GET /api/trainings` - Liste (filtreleme ile)
- ✅ `POST /api/trainings` - Oluştur
- ✅ `GET /api/trainings/[id]` - Detay
- ✅ `PUT /api/trainings/[id]` - Güncelle
- ✅ `DELETE /api/trainings/[id]` - Sil

#### Training Videos

- ✅ `GET /api/trainings/[id]/videos` - Video listesi
- ✅ `POST /api/trainings/[id]/videos` - Video ekle
- ✅ `PUT /api/trainings/[id]/videos/[videoId]` - Video güncelle
- ✅ `DELETE /api/trainings/[id]/videos/[videoId]` - Video sil

#### Training Documents

- ✅ `GET /api/trainings/[id]/documents` - Döküman listesi
- ✅ `POST /api/trainings/[id]/documents` - Döküman ekle (file upload)
- ✅ `PUT /api/trainings/[id]/documents/[docId]` - Döküman güncelle
- ✅ `DELETE /api/trainings/[id]/documents/[docId]` - Döküman sil

#### Company Trainings

- ✅ `GET /api/companies/[id]/trainings` - Firma eğitimleri
- ✅ `POST /api/companies/[id]/trainings` - Eğitim ata
- ✅ `DELETE /api/companies/[id]/trainings/[trainingId]` - Eğitim kaldır

#### Training Progress

- ✅ `GET /api/companies/[id]/trainings/[trainingId]/progress` - İlerleme
- ✅ `POST /api/companies/[id]/trainings/[trainingId]/progress` - İlerleme güncelle
- ✅ `POST /api/trainings/[id]/videos/[videoId]/watch` - Video izlendi
- ✅ `POST /api/trainings/[id]/documents/[docId]/read` - Döküman okundu

#### Consultant APIs

- ✅ `GET /api/consultant/trainings` - Consultant eğitimleri
- ✅ `POST /api/consultant/trainings/[id]/assign` - Firmaya ata

---

### 6. Frontend UI Gerekli

#### Admin Panel

- ✅ `/dashboard/trainings` - Eğitim listesi
- ✅ `/dashboard/trainings/new` - Eğitim oluştur
- ✅ `/dashboard/trainings/[id]/edit` - Eğitim düzenle
  - Tabs: Genel Bilgiler, Videolar, Dökümanlar

#### Consultant Panel

- ✅ `/consultant-dashboard/trainings` - Eğitim listesi
- ✅ `/consultant-dashboard/trainings/[id]` - Eğitim detay
- ✅ `/consultant-dashboard/companies/[id]/trainings` - Firmaya eğitim atama

#### Company Panel

- ✅ `/company-dashboard/trainings` - Eğitim listesi
- ✅ `/company-dashboard/trainings/[id]` - Eğitim detay
  - Video player
  - Document viewer
  - Progress tracking

#### Components Gerekli

- ✅ `TrainingCard.tsx` - Eğitim kartı
- ✅ `TrainingVideoPlayer.tsx` - Video player (YouTube embed)
- ✅ `TrainingDocumentViewer.tsx` - Döküman görüntüleyici
- ✅ `TrainingProgressBar.tsx` - İlerleme çubuğu
- ✅ `TrainingList.tsx` - Eğitim listesi
- ✅ `AssignTrainingModal.tsx` - Eğitim atama modal'ı
- ✅ `FileUpload.tsx` - Döküman yükleme komponenti

---

## 📝 SPRINT 9 BREAKDOWN

### Faz A: Database & Domain (2-3 saat)

1. Migration dosyası oluştur (trainings, training_videos, training_documents, company_trainings, training_progress)
2. Entity'ler oluştur
3. Repository interface'leri oluştur
4. RLS policies ekle

### Faz B: Infrastructure (3-4 saat)

1. Repository implementasyonları
2. Supabase Storage setup (bucket oluştur, policies ekle)
3. File upload service oluştur
4. File download service oluştur

### Faz C: Application Layer (4-5 saat)

1. Training use cases
2. TrainingVideo use cases
3. TrainingDocument use cases
4. CompanyTraining use cases
5. TrainingProgress use cases
6. Business logic use cases (lock/unlock)

### Faz D: API Routes (3-4 saat)

1. Training routes
2. Training video routes
3. Training document routes (file upload)
4. Company training routes
5. Training progress routes

### Faz E: Frontend UI (6-8 saat)

1. Admin eğitim sayfaları
2. Consultant eğitim sayfaları
3. Company eğitim sayfaları
4. Video player component
5. Document viewer component
6. Progress tracking UI

**Toplam Süre:** 18-24 saat (~2.5-3 gün)

---

## ✅ HAZIRLIK KONTROL LİSTESİ

### Backend Hazırlığı

- ✅ Repository pattern hazır
- ✅ Use case pattern hazır
- ✅ API route pattern hazır
- ✅ Error handling pattern hazır
- ✅ Authorization pattern hazır
- ✅ Migration sistemi hazır
- ✅ Soft delete pattern hazır

### Frontend Hazırlığı

- ✅ UI components hazır
- ✅ Layout templates hazır
- ✅ Modal patterns hazır
- ✅ Form patterns hazır
- ✅ List/Grid patterns hazır

### Sistem Hazırlığı

- ✅ Supabase connection hazır
- ✅ Authentication hazır
- ✅ RLS policies pattern hazır
- ✅ File storage pattern hazır (henüz kullanılmadı ama Supabase Storage hazır)

---

## 🚀 SPRINT 9'A HAZIR!

### Tamamlanan Hazırlıklar

- ✅ Tüm bağımlılıklar tamamlandı
- ✅ Altyapı hazır
- ✅ Pattern'ler hazır
- ✅ Component'ler hazır

### Başlamaya Hazır

Sprint 9'a başlamak için **tüm hazırlıklar tamamlandı**. Eğitim yönetimi sistemi için gerekli tüm altyapı mevcut.

---

## 📊 SPRINT 9 TAHMİNİ

### Zorluk Seviyesi

- **Orta-Yüksek** - File upload ve video tracking biraz karmaşık

### Riskler

- ⚠️ Supabase Storage setup gerekli
- ⚠️ YouTube embed player setup
- ⚠️ Video tracking (progress calculation)
- ⚠️ Sıralı eğitim sistemi (lock/unlock logic)

### Bağımlılıklar

- ✅ Firma yönetimi çalışıyor
- ✅ Danışman paneli çalışıyor
- ✅ Program yönetimi çalışıyor

---

**Hazırlayan:** AI Assistant  
**Durum:** ✅ **SPRINT 9'A HAZIR**  
**Tarih:** Ocak 2025
