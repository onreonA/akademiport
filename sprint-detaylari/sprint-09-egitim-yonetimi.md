# Sprint 9 - Eğitim Yönetimi Sistemi

**Tarih:** Ocak 2025  
**Durum:** ✅ %98 Tamamlandı  
**Süre:** ~20 saat (~2.5 gün)  
**Hazırlayan:** AI Assistant

---

## 📋 Sprint Hedefi

Akademi Port platformuna kapsamlı bir eğitim yönetim sistemi eklemek:

- Video + Döküman eğitim sistemi
- Admin: Eğitim CRUD (Global vs Program eğitimleri)
- Admin: Video yükleme (YouTube unlisted)
- Admin: Döküman yükleme (Supabase Storage)
- Consultant: Firmaya eğitim atama
- Company: Eğitim listesi, video izleme, döküman okuma
- İzleme takibi ve ilerleme hesaplama
- Sıralı eğitim sistemi (video 1 bitince video 2 açılır)
- Kilitli içerik yönetimi

---

## 🎯 Kabul Kriterleri

### Fonksiyonel Gereksinimler

- ✅ Eğitim oluşturulabiliyor (Admin)
- ✅ Video eklenebiliyor (YouTube URL)
- ✅ Döküman yüklenebiliyor (Supabase Storage)
- ✅ Firmaya eğitim atanabiliyor (Consultant)
- ✅ Video izlenebiliyor (Company)
- ✅ Döküman okunabiliyor (Company)
- ✅ İzleme kaydediliyor
- ✅ Sıralı sistem çalışıyor (video 1 bitince video 2 açılır)
- ✅ Global vs Program eğitimleri ayrımı çalışıyor

### Teknik Gereksinimler

- ✅ Clean Architecture'e uygun
- ✅ TypeScript tip güvenli
- ✅ Result pattern kullanılıyor
- ✅ Error handling yapılıyor
- ✅ Loading states var
- ✅ Responsive design
- ✅ Dark mode destekli

### Güvenlik Gereksinimleri

- ✅ Authentication kontrol ediliyor
- ✅ Authorization doğru çalışıyor
- ✅ RLS policies tanımlı
- ✅ File upload güvenli

---

## 📊 İş Kırılımı (Work Breakdown)

### Faz A: Database & Domain Layer (2-3 saat)

#### 1. Database Migration

- ✅ `trainings` tablosu
- ✅ `training_videos` tablosu
- ✅ `training_documents` tablosu
- ✅ `company_trainings` tablosu (atama)
- ✅ `training_progress` tablosu (izleme takibi)
- ✅ Foreign key constraints
- ✅ Indexes
- ✅ RLS policies

#### 2. Domain Entities

- ✅ `Training.ts` - Eğitim entity
- ✅ `TrainingVideo.ts` - Video entity
- ✅ `TrainingDocument.ts` - Döküman entity
- ✅ `CompanyTraining.ts` - Firma-Eğitim atama entity
- ✅ `TrainingProgress.ts` - İzleme takibi entity

#### 3. Repository Interfaces

- ✅ `ITrainingRepository.ts`
- ✅ `ITrainingVideoRepository.ts`
- ✅ `ITrainingDocumentRepository.ts`
- ✅ `ICompanyTrainingRepository.ts`
- ✅ `ITrainingProgressRepository.ts`

**Süre:** 2-3 saat  
**Öncelik:** 🔴 Yüksek (Tüm diğer işler buna bağlı)

---

### Faz B: Infrastructure Layer (3-4 saat)

#### 1. Repository Implementations

- ✅ `TrainingRepository.ts`
- ✅ `TrainingVideoRepository.ts`
- ✅ `TrainingDocumentRepository.ts`
- ✅ `CompanyTrainingRepository.ts`
- ✅ `TrainingProgressRepository.ts`

#### 2. Supabase Storage Setup

- ✅ Bucket oluştur: `training-documents`
- ✅ Bucket policy (RLS)
- ✅ File upload service
- ✅ File download URL generation

**Süre:** 3-4 saat  
**Öncelik:** 🔴 Yüksek

---

### Faz C: Application Layer (4-5 saat)

#### 1. Training Use Cases

- ✅ `CreateTrainingUseCase.ts`
- ✅ `UpdateTrainingUseCase.ts`
- ✅ `DeleteTrainingUseCase.ts`
- ✅ `GetTrainingUseCase.ts`
- ✅ `ListTrainingsUseCase.ts` (with filters: global, program, consultant)

#### 2. Training Video Use Cases

- ✅ `CreateTrainingVideoUseCase.ts`
- ✅ `UpdateTrainingVideoUseCase.ts`
- ✅ `DeleteTrainingVideoUseCase.ts`
- ✅ `ListTrainingVideosUseCase.ts`

#### 3. Training Document Use Cases

- ✅ `CreateTrainingDocumentUseCase.ts`
- ✅ `UpdateTrainingDocumentUseCase.ts`
- ✅ `DeleteTrainingDocumentUseCase.ts`
- ✅ `ListTrainingDocumentsUseCase.ts`

#### 4. Company Training Use Cases

- ✅ `AssignTrainingToCompanyUseCase.ts`
- ✅ `RemoveTrainingFromCompanyUseCase.ts`
- ✅ `ListCompanyTrainingsUseCase.ts`

#### 5. Training Progress Use Cases

- ✅ `UpdateTrainingProgressUseCase.ts`
- ✅ `GetTrainingProgressUseCase.ts`
- ✅ `ListTrainingProgressUseCase.ts`
- ✅ `CalculateTrainingProgressUseCase.ts` - İzleme yüzdesi hesaplama

#### 6. Business Logic Use Cases

- ✅ `CheckTrainingLockUseCase.ts` - Sıralı eğitim kontrolü
- ✅ `UnlockNextContentUseCase.ts` - Sonraki içeriği aç

**Süre:** 4-5 saat  
**Öncelik:** 🟡 Orta

---

### Faz D: API Routes (3-4 saat)

#### 1. Training Routes

- ✅ `GET /api/trainings` - Liste (filtreleme ile)
- ✅ `POST /api/trainings` - Oluştur
- ✅ `GET /api/trainings/[id]` - Detay
- ✅ `PUT /api/trainings/[id]` - Güncelle
- ✅ `DELETE /api/trainings/[id]` - Sil

#### 2. Training Video Routes

- ✅ `GET /api/trainings/[id]/videos` - Video listesi
- ✅ `POST /api/trainings/[id]/videos` - Video ekle
- ✅ `PUT /api/trainings/[id]/videos/[videoId]` - Video güncelle
- ✅ `DELETE /api/trainings/[id]/videos/[videoId]` - Video sil

#### 3. Training Document Routes

- ✅ `GET /api/trainings/[id]/documents` - Döküman listesi
- ✅ `POST /api/trainings/[id]/documents` - Döküman ekle (file upload)
- ✅ `PUT /api/trainings/[id]/documents/[docId]` - Döküman güncelle
- ✅ `DELETE /api/trainings/[id]/documents/[docId]` - Döküman sil

#### 4. Company Training Routes

- ✅ `GET /api/companies/[id]/trainings` - Firma eğitimleri
- ✅ `POST /api/companies/[id]/trainings` - Eğitim ata
- ✅ `DELETE /api/companies/[id]/trainings/[trainingId]` - Eğitim kaldır

#### 5. Training Progress Routes

- ✅ `GET /api/companies/[id]/trainings/[trainingId]/progress` - İlerleme
- ✅ `POST /api/companies/[id]/trainings/[trainingId]/progress` - İlerleme güncelle
- ✅ `POST /api/trainings/[id]/videos/[videoId]/watch` - Video izlendi
- ✅ `POST /api/trainings/[id]/documents/[docId]/read` - Döküman okundu

#### 6. Consultant APIs

- ✅ `GET /api/consultant/trainings` - Consultant eğitimleri
- ✅ `POST /api/consultant/trainings/[id]/assign` - Firmaya ata

**Süre:** 3-4 saat  
**Öncelik:** 🟡 Orta

---

### Faz E: Frontend UI (6-8 saat)

#### 1. Admin Panel

- ✅ `/dashboard/trainings` - Eğitim listesi
  - Grid/List view
  - Filtreleme (Global, Program, Consultant)
  - Arama
  - Oluştur butonu
- ✅ `/dashboard/trainings/new` - Eğitim oluştur
  - Form (name, description, program, consultant)
  - Global vs Program seçimi
- ✅ `/dashboard/trainings/[id]/edit` - Eğitim düzenle
  - Tabs: Genel Bilgiler, Videolar, Dökümanlar
  - Video ekleme/düzenleme/silme
  - Döküman yükleme/düzenleme/silme

#### 2. Consultant Panel

- ✅ `/consultant-dashboard/trainings` - Eğitim listesi
  - Atandığı eğitimler
  - Filtreleme
- ✅ `/consultant-dashboard/trainings/[id]` - Eğitim detay
  - Video listesi
  - Döküman listesi
- ✅ `/consultant-dashboard/companies/[id]/trainings` - Firmaya eğitim atama
  - Eğitim seçme modal
  - Atama işlemi

#### 3. Company Panel

- ✅ `/company-dashboard/trainings` - Eğitim listesi
  - Atanan eğitimler
  - İlerleme durumu
  - Filtreleme
- ✅ `/company-dashboard/trainings/[id]` - Eğitim detay
  - Video player (YouTube embed)
  - Document viewer
  - Progress bar
  - Sıralı erişim kontrolü (lock/unlock)

#### 4. Components

- ✅ `TrainingCard.tsx` - Eğitim kartı
- ✅ `TrainingVideoPlayer.tsx` - Video player (YouTube embed)
- ✅ `TrainingDocumentViewer.tsx` - Döküman görüntüleyici
- ✅ `TrainingProgressBar.tsx` - İlerleme çubuğu
- ✅ `TrainingList.tsx` - Eğitim listesi
- ✅ `AssignTrainingModal.tsx` - Eğitim atama modal'ı
- ✅ `FileUpload.tsx` - Döküman yükleme komponenti

**Süre:** 6-8 saat  
**Öncelik:** 🟢 Normal

---

## 📋 Günlük Görev Planı

### Gün 1 (4-5 saat): Database & Domain + Infrastructure Başlangıç

1. Database migration oluştur (1-1.5 saat)
2. Domain entities oluştur (0.5 saat)
3. Repository interfaces oluştur (0.5 saat)
4. Repository implementations başlangıç (1-1.5 saat)
5. Supabase Storage setup (1 saat)

### Gün 2 (5-6 saat): Infrastructure + Application Layer

1. Repository implementations tamamla (1 saat)
2. Training use cases (1-1.5 saat)
3. TrainingVideo use cases (1 saat)
4. TrainingDocument use cases (1 saat)
5. CompanyTraining use cases (0.5 saat)
6. TrainingProgress use cases (1 saat)

### Gün 3 (5-6 saat): API Routes + Frontend Başlangıç

1. API routes oluştur (3-4 saat)
2. Admin panel eğitim sayfaları başlangıç (2 saat)

### Gün 4 (4-5 saat): Frontend UI Tamamlama

1. Admin panel tamamla (1 saat)
2. Consultant panel (1-1.5 saat)
3. Company panel (2-2.5 saat)

### Gün 5 (2-3 saat): Test & İyileştirmeler

1. Test (1 saat)
2. Bug fixes (1 saat)
3. İyileştirmeler (0.5 saat)

---

## 🔗 İlgili Dosyalar

### Database Schema

```
src/4-infrastructure/database/migrations/
└── 016_trainings_system.sql
```

### Domain Layer

```
src/3-domain/entities/
├── Training.ts
├── TrainingVideo.ts
├── TrainingDocument.ts
├── CompanyTraining.ts
└── TrainingProgress.ts

src/3-domain/interfaces/repositories/
├── ITrainingRepository.ts
├── ITrainingVideoRepository.ts
├── ITrainingDocumentRepository.ts
├── ICompanyTrainingRepository.ts
└── ITrainingProgressRepository.ts
```

### Infrastructure Layer

```
src/4-infrastructure/database/repositories/
├── TrainingRepository.ts
├── TrainingVideoRepository.ts
├── TrainingDocumentRepository.ts
├── CompanyTrainingRepository.ts
└── TrainingProgressRepository.ts

src/4-infrastructure/storage/
└── SupabaseStorageService.ts
```

### Application Layer

```
src/2-application/use-cases/training/
├── CreateTrainingUseCase.ts
├── UpdateTrainingUseCase.ts
├── DeleteTrainingUseCase.ts
├── GetTrainingUseCase.ts
└── ListTrainingsUseCase.ts

src/2-application/use-cases/training-video/
├── CreateTrainingVideoUseCase.ts
├── UpdateTrainingVideoUseCase.ts
├── DeleteTrainingVideoUseCase.ts
└── ListTrainingVideosUseCase.ts

src/2-application/use-cases/training-document/
├── CreateTrainingDocumentUseCase.ts
├── UpdateTrainingDocumentUseCase.ts
├── DeleteTrainingDocumentUseCase.ts
└── ListTrainingDocumentsUseCase.ts

src/2-application/use-cases/company-training/
├── AssignTrainingToCompanyUseCase.ts
├── RemoveTrainingFromCompanyUseCase.ts
└── ListCompanyTrainingsUseCase.ts

src/2-application/use-cases/training-progress/
├── UpdateTrainingProgressUseCase.ts
├── GetTrainingProgressUseCase.ts
├── ListTrainingProgressUseCase.ts
├── CalculateTrainingProgressUseCase.ts
├── CheckTrainingLockUseCase.ts
└── UnlockNextContentUseCase.ts
```

### API Routes

```
src/app/api/trainings/
├── route.ts
├── [id]/route.ts
├── [id]/videos/
│   ├── route.ts
│   └── [videoId]/route.ts
└── [id]/documents/
    ├── route.ts
    └── [docId]/route.ts

src/app/api/companies/[id]/trainings/
├── route.ts
└── [trainingId]/route.ts

src/app/api/companies/[id]/trainings/[trainingId]/progress/
└── route.ts
```

### Frontend

```
src/app/dashboard/trainings/
├── page.tsx
├── new/page.tsx
└── [id]/edit/page.tsx

src/app/consultant-dashboard/trainings/
├── page.tsx
├── [id]/page.tsx
└── companies/[id]/trainings/page.tsx

src/app/company-dashboard/trainings/
├── page.tsx
└── [id]/page.tsx

src/1-presentation/components/features/trainings/
├── TrainingCard.tsx
├── TrainingVideoPlayer.tsx
├── TrainingDocumentViewer.tsx
├── TrainingProgressBar.tsx
├── TrainingList.tsx
├── AssignTrainingModal.tsx
└── FileUpload.tsx
```

---

## 🚨 Riskler & Çözümler

### Risk 1: Supabase Storage Setup

**Risk:** File upload için bucket ve policy setup karmaşık olabilir  
**Çözüm:** Supabase Storage dokümantasyonunu takip ederek adım adım setup yapacağız

### Risk 2: YouTube Embed Player

**Risk:** YouTube embed player'ın progress tracking'i zor olabilir  
**Çözüm:** Manuel progress tracking (kullanıcı "tamamladım" der)

### Risk 3: Sıralı Eğitim Sistemi

**Risk:** Lock/unlock logic karmaşık olabilir  
**Çözüm:** Basit bir flag sistemi (is_locked) ile yöneteceğiz

### Risk 4: Progress Calculation

**Risk:** İzleme yüzdesi hesaplama karmaşık olabilir  
**Çözüm:** Her video/document için ayrı progress tracking yapacağız, sonra genel eğitim progress'ini hesaplayacağız

---

## 📝 Notlar

### Önemli Kararlar

1. **Video Progress Tracking:**
   - Manuel tracking (kullanıcı "tamamladım" der)
   - YouTube API kullanmayacağız (karmaşık + API key gerekli)
   - Basit: video izlendi → progress güncellenir

2. **Document Progress Tracking:**
   - Manuel tracking (kullanıcı "okudum" der)
   - PDF viewer kullanılabilir (react-pdf)

3. **Sequential Learning:**
   - `is_locked` flag kullanılacak
   - Önceki video/document tamamlanmadan sonraki açılmaz
   - `CheckTrainingLockUseCase` ile kontrol edilecek

4. **Global vs Program Trainings:**
   - `is_global` flag
   - `program_id` nullable (null = global)
   - Global trainings: Tüm firmalar görebilir
   - Program trainings: Sadece o programa atanmış firmalar görebilir

5. **File Upload:**
   - Supabase Storage kullanılacak
   - Bucket: `training-documents`
   - Max file size: 50MB (configurable)
   - Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX

---

## ✅ Checklist

### Database & Domain

- [x] Migration dosyası oluşturuldu (016_trainings_system.sql, 017_training_storage_setup.sql)
- [x] RLS policy düzeltmeleri (024, 025, 026, 027)
- [x] Entity'ler oluşturuldu (5 entity)
- [x] Repository interfaces oluşturuldu (5 interface)
- [x] RLS policies eklendi (25+ policy)

### Infrastructure

- [x] Repository implementations tamamlandı (5 repository)
- [x] Supabase Storage setup yapıldı (training-documents bucket)
- [x] File upload service oluşturuldu (/api/trainings/upload)

### Application

- [x] Training use cases tamamlandı (5 use case)
- [x] TrainingVideo use cases tamamlandı (4 use case)
- [x] TrainingDocument use cases tamamlandı (4 use case)
- [x] CompanyTraining use cases tamamlandı (3 use case)
- [x] TrainingProgress use cases tamamlandı (3 use case)

### API

- [x] Training routes tamamlandı (5 route)
- [x] Video routes tamamlandı (4 route)
- [x] Document routes tamamlandı (4 route)
- [x] File upload route tamamlandı (1 route)
- [x] Company training routes tamamlandı (3 route)
- [x] Progress routes tamamlandı (2 route)
- [x] Consultant APIs tamamlandı (2 route)

### Frontend

- [x] Admin panel tamamlandı (3 sayfa)
- [x] Consultant panel tamamlandı (4 sayfa)
- [x] Company panel tamamlandı (2 sayfa)
- [x] Components oluşturuldu (9 component)
  - [x] TrainingCard.tsx
  - [x] TrainingVideoPlayer.tsx
  - [x] TrainingDocumentViewer.tsx
  - [x] TrainingProgressBar.tsx
  - [x] TrainingForm.tsx
  - [x] TrainingVideoManager.tsx
  - [x] TrainingDocumentManager.tsx
  - [x] FileUpload.tsx
  - [x] AssignTrainingModal.tsx

### Bug Fixes

- [x] Training videos RLS INSERT policy düzeltildi (024)
- [x] Training documents RLS INSERT policy düzeltildi (025)
- [x] Storage bucket RLS INSERT policy düzeltildi (026)
- [x] Company video/döküman erişimi düzeltildi (027)
- [x] CalculateTrainingProgressUseCase "Cannot read properties of undefined" hatası düzeltildi
- [x] Frontend progress API error handling iyileştirildi
- [x] TrainingCard tıklanabilir hale getirildi
- [x] Company training list video/document sayıları gösterildi

### Test

- [x] Backend API'ler test edildi
- [x] Frontend sayfalar test edildi
- [x] File upload test edildi
- [x] Progress tracking test edildi

---

## 🎉 Sprint 9 Hedef

**Hedef:** Video + Döküman eğitim sistemi çalışıyor

**Sonuç:** ✅ %98 Tamamlandı

**Başarılar:**

- ✅ Eğitim oluşturulabiliyor (Admin, Consultant)
- ✅ Video eklenebiliyor ve izlenebiliyor (YouTube URL)
- ✅ Döküman yüklenebiliyor ve okunabiliyor (Supabase Storage)
- ✅ Firmaya eğitim atanabiliyor (Consultant)
- ✅ İzleme takibi çalışıyor (progress tracking)
- ✅ Sıralı sistem çalışıyor (video 1 bitince video 2 açılır)
- ✅ Tüm roller için erişim kontrolü çalışıyor (RLS policies)

**Kalan İşler:**

- ⚠️ Video metadata (duration, title) opsiyonel iyileştirme
- ⚠️ Document viewer iyileştirmeleri (tüm dosya tipleri için)

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Son Güncelleme:** Ocak 2025
