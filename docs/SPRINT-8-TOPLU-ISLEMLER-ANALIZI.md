# 📊 SPRINT 8 - TOPLU İŞLEMLER VE MATRİS TABANLI PROJE YÖNETİMİ ANALİZİ

**Analiz Tarihi:** Ocak 2025  
**Hazırlayan:** AI Assistant  
**Durum:** 📋 Analiz Tamamlandı - Uygulama Beklemede

---

## 🎯 ANALİZ ÖZETİ

### Mevcut Durum

Sprint 8'de proje yönetimi sistemi **%82 tamamlanma** oranına ulaştı. Temel özellikler çalışıyor:

- ✅ Ana Proje → Alt Proje → Görev hiyerarşisi
- ✅ Tek tek proje oluşturma
- ✅ Şablondan tek proje oluşturma
- ✅ Tek proje için tarih atama
- ✅ Tek görev için atama

### Eksik Kalan Özellikler

**Kritik Eksikler:**

- ❌ Toplu proje atama (birden fazla firmaya aynı anda)
- ❌ Toplu tarih atama (birden fazla projeye aynı anda)
- ❌ Program bazlı toplu işlemler
- ❌ Firma bazlı tarih yönetimi (her firma için ayrı tarih)
- ❌ Otomatik görev inherit (alt projeye atanan firmalar otomatik görevleri görür)

### Kasım 2025 Durumu

- Repository'de `company_project_assignments` tablosu henüz migration olarak eklenmedi (`src/4-infrastructure/database/migrations` dizininde 028 numaralı dosya yok).
- Domain katmanında `CompanyProjectAssignment` entity’si ve ilgili repository arayüzleri oluşturulmamış durumda.
- `BulkAssignSubProjectsToCompaniesUseCase`, `BulkAssignDatesToCompanySubProjectsUseCase`, `GetAssignmentMatrixUseCase`, `GetCompanyTasksWithInheritedDatesUseCase` implementasyonları mevcut değil (yalnızca dokümantasyon taslaklarında yer alıyor).
- Şu anda kullanılan hiyerarşi API’si ( `/api/projects/[id]/hierarchy` ) sadece alt projeler ve görevleri döndürüyor; firma atamalarıyla entegre değil.
- UI tarafında admin/danışman/şirket panelleri yeni akordeon yapısına geçmiş durumda; matris tabanlı sayfalar için yeni bir rota ve component seti henüz oluşturulmadı.

---

## 🏗️ ÖNERİLEN SİSTEM MİMARİSİ

### 1. Veri Modeli

#### Yeni Tablo: `company_project_assignments`

```sql
CREATE TABLE company_project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sub_project_id UUID REFERENCES sub_projects(id) ON DELETE CASCADE,

  -- Tarih atamaları (firma bazlı)
  start_date TIMESTAMP,
  end_date TIMESTAMP,

  -- Durum
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Bir firmaya aynı proje/alt proje bir kez atanabilir
  UNIQUE(company_id, project_id, sub_project_id)
);

-- İndeksler
CREATE INDEX idx_company_project_assignments_company ON company_project_assignments(company_id);
CREATE INDEX idx_company_project_assignments_project ON company_project_assignments(project_id);
CREATE INDEX idx_company_project_assignments_sub_project ON company_project_assignments(sub_project_id);
```

#### İlişki Mantığı

```
Ana Proje (Şablon) → Firmalara Atanmaz (is_template = true)
  └── Alt Proje 1 → Firma A ✓, Firma B ✓, Firma C ✗
       ├── Görev 1.1 → Otomatik olarak Firma A ve B'de görünür
       ├── Görev 1.2 → Otomatik olarak Firma A ve B'de görünür

  └── Alt Proje 2 → Firma A ✓, Firma B ✗, Firma C ✓
       ├── Görev 2.1 → Otomatik olarak Firma A ve C'de görünür
```

**Kurallar:**

- Ana proje şablon olarak kalır (`is_template = true`)
- Alt projeler firmalara atanır (`company_project_assignments`)
- Görevler alt projeye bağlıdır, firma ataması otomatik inherit edilir
- Bir firma bir alt projeye atandığında, o alt projenin tüm görevleri otomatik olarak o firmada görünür

---

### 2. Tarih Ataması (Firma Bazlı)

#### Senaryo

```
Alt Proje 1: "Web Sitesi Geliştirme"
  Firma A → 01.01.2025 - 31.03.2025
  Firma B → 15.01.2025 - 15.04.2025

Alt Proje 2: "Mobil Uygulama"
  Firma A → 01.02.2025 - 30.04.2025
  Firma C → 01.03.2025 - 31.05.2025
```

**Kurallar:**

- Her firma için ayrı tarih atanabilir
- Görevlerin tarihleri alt projenin tarihlerine göre otomatik hesaplanabilir (offset mantığı)
- Örnek: Alt Proje başlangıcından 7 gün sonra Görev 1 başlar

---

### 3. Matris Tabanlı UI (En Önemli Kısım!)

#### Sayfa 1: Firma-Alt Proje Atama Matrisi

**URL:** `/dashboard/projects/[projectId]/assignments`

**Özellikler:**

- Checkbox'lar ile hızlı seçim
- Satır bazlı toplu seçim (Firma A → Tüm alt projeler)
- Sütun bazlı toplu seçim (Alt Proje 1 → Tüm firmalar)
- Filtreleme: Program, Şehir, Sektör
- Görsel matris tablo

**Örnek Görünüm:**

```
┌─────────────────────────────────────────────────────────────┐
│  Ana Proje: "Dijital Dönüşüm 2025"                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│         │ Alt Proje 1  │ Alt Proje 2  │ Alt Proje 3       │
│         │ (Web Sitesi) │ (Mobil App)  │ (Entegrasyon)     │
├─────────┼──────────────┼──────────────┼───────────────────┤
│ Firma A │      ✓       │      ✓       │       ✓           │
│ Firma B │      ✓       │      ✗       │       ✓           │
│ Firma C │      ✗       │      ✓       │       ✗           │
│ Firma D │      ✓       │      ✓       │       ✓           │
└─────────┴──────────────┴──────────────┴───────────────────┘

[Seçilenleri Kaydet] [Tümünü Seç] [Tümünü Kaldır]
```

#### Sayfa 2: Firma-Alt Proje Tarih Atama Matrisi

**URL:** `/dashboard/projects/[projectId]/sub-projects/[subProjectId]/dates`

**Özellikler:**

- Inline date picker (her hücrede)
- Toplu tarih atama (seçili firmalara)
- Tarih kaydırma (tüm tarihleri +30 gün öne al)
- Şablon tarih aralıkları (Q1, Q2, vb.)
- Çakışma uyarıları

**Örnek Görünüm:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Ana Proje: "Dijital Dönüşüm 2025"                                          │
│  Alt Proje: "Web Sitesi Geliştirme"                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│         │ Başlangıç Tarihi    │ Bitiş Tarihi        │ Süre  │ Durum        │
├─────────┼─────────────────────┼─────────────────────┼───────┼──────────────┤
│ Firma A │ [01.01.2025] 📅     │ [31.03.2025] 📅     │ 90 gün│ ● Aktif      │
│ Firma B │ [15.01.2025] 📅     │ [15.04.2025] 📅     │ 91 gün│ ● Aktif      │
│ Firma C │ [-] Atanmadı        │ [-] Atanmadı        │   -   │ ○ Pasif      │
│ Firma D │ [01.02.2025] 📅     │ [30.04.2025] 📅     │ 89 gün│ ● Aktif      │
└─────────┴─────────────────────┴─────────────────────┴───────┴──────────────┘

Toplu İşlemler:
[Seçili Firmalara Tarih Ata] [Tüm Firmalara Aynı Tarih] [Tarihleri Kaydır (+/- gün)]

Hızlı Şablonlar:
[Q1 2025] [Q2 2025] [Q3 2025] [Q4 2025] [Özel Tarih Aralığı]
```

#### Sayfa 3: Görev Görünümü (Firma Bazlı)

**URL:** `/company-dashboard/projects/[projectId]/sub-projects/[subProjectId]/tasks`

**Özellikler:**

- Firma bazlı görev listesi
- Otomatik tarih hesaplama (alt proje tarihi + offset)
- Görev durumu takibi
- Görev atama

**Görev Tarihleri Otomatik Hesaplama:**

- Alt projenin başlangıç tarihi + görevin offset'i
- Örnek: Alt Proje 01.01.2025 başlıyor, Görev 2'nin offset'i +15 gün → 16.01.2025

---

### 4. API Endpoints

#### Firma-Alt Proje Atama

```typescript
// Toplu Atama
POST   /api/projects/[projectId]/assignments/bulk
Body: {
  assignments: [
    { companyId: "uuid1", subProjectIds: ["sub1", "sub2"] },
    { companyId: "uuid2", subProjectIds: ["sub1"] }
  ]
}

// Atama Matrisi Getir
GET    /api/projects/[projectId]/assignment-matrix
Response: {
  project: {...},
  subProjects: [...],
  companies: [...],
  assignments: [
    { companyId, subProjectId, startDate, endDate, isActive }
  ]
}
```

#### Firma-Alt Proje Tarih Atama

```typescript
// Toplu Tarih Atama
POST   /api/projects/[projectId]/sub-projects/[subProjectId]/dates/bulk
Body: {
  dates: [
    { companyId: "uuid1", startDate: "2025-01-01", endDate: "2025-03-31" },
    { companyId: "uuid2", startDate: "2025-01-15", endDate: "2025-04-15" }
  ]
}

// Tarih Kaydırma
POST   /api/projects/[projectId]/sub-projects/[subProjectId]/dates/shift
Body: {
  companyIds: ["uuid1", "uuid2"],
  days: 30 // +30 gün öne al
}
```

#### Görevleri Firma Bazlı Getir (Otomatik Inherit)

```typescript
// Görevleri Firma Bazlı Getir
GET    /api/companies/[companyId]/sub-projects/[subProjectId]/tasks
Response: {
  subProject: {...},
  assignment: { startDate, endDate },
  tasks: [
    { id, title, calculatedStartDate, calculatedEndDate, ... }
  ]
}
```

---

### 5. Use Cases

#### BulkAssignSubProjectsToCompaniesUseCase

**Input:**

```typescript
{
  projectId: string;
  assignments: Array<{
    companyId: string;
    subProjectIds: string[];
  }>;
}
```

**Logic:**

1. Validate project exists
2. Validate all companies exist
3. Validate all sub-projects belong to project
4. Bulk insert into `company_project_assignments`
5. Return success/failure report

**Output:**

```typescript
{
  success: boolean;
  data: {
    successCount: number;
    failureCount: number;
    errors: Array<{
      companyId: string;
      subProjectId: string;
      error: string;
    }>;
  }
}
```

#### BulkAssignDatesToCompanySubProjectsUseCase

**Input:**

```typescript
{
  projectId: string;
  subProjectId: string;
  dates: Array<{
    companyId: string;
    startDate?: Date;
    endDate?: Date;
  }>;
}
```

**Logic:**

1. Validate assignments exist
2. Validate date ranges
3. Check for conflicts
4. Bulk update dates
5. Recalculate task dates (if needed)

#### GetAssignmentMatrixUseCase

**Input:**

```typescript
{
  projectId: string;
}
```

**Output:**

```typescript
{
  project: Project;
  subProjects: SubProject[];
  companies: Company[];
  assignments: Array<{
    companyId: string;
    subProjectId: string;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
  }>;
}
```

#### GetCompanyTasksWithInheritedDatesUseCase

**Input:**

```typescript
{
  companyId: string;
  subProjectId: string;
}
```

**Logic:**

1. Get assignment (startDate, endDate)
2. Get tasks from sub_project
3. Calculate task dates based on offset
4. Return enriched task list

**Output:**

```typescript
{
  subProject: SubProject;
  assignment: {
    startDate: Date | null;
    endDate: Date | null;
  }
  tasks: Array<{
    id: string;
    title: string;
    calculatedStartDate: Date;
    calculatedEndDate: Date;
    // ... diğer task özellikleri
  }>;
}
```

---

## 📊 TAHMİNİ SÜRE

### Faz 1: Database & Backend (10-12 saat)

1. **Migration** (1 saat)
   - `company_project_assignments` tablosu
   - İndeksler
   - RLS policies

2. **Domain Layer** (1 saat)
   - `CompanyProjectAssignment` entity
   - Repository interface

3. **Infrastructure Layer** (2 saat)
   - `CompanyProjectAssignmentRepository`
   - RLS policy helper functions

4. **Application Layer** (6-8 saat)
   - `BulkAssignSubProjectsToCompaniesUseCase`
   - `BulkAssignDatesToCompanySubProjectsUseCase`
   - `GetAssignmentMatrixUseCase`
   - `GetCompanyTasksWithInheritedDatesUseCase`
   - `ShiftCompanySubProjectDatesUseCase`

5. **API Routes** (3-4 saat)
   - `/api/projects/[id]/assignments/bulk`
   - `/api/projects/[id]/assignment-matrix`
   - `/api/projects/[id]/sub-projects/[subId]/dates/bulk`
   - `/api/projects/[id]/sub-projects/[subId]/dates/shift`
   - `/api/companies/[id]/sub-projects/[subId]/tasks`

### Faz 2: Frontend - Matris Sayfaları (12-15 saat)

1. **Firma-Alt Proje Atama Matrisi** (5-6 saat)
   - Matris tablo component
   - Checkbox seçim sistemi
   - Toplu seçim/kaldırma
   - Filtreleme
   - API entegrasyonu

2. **Firma-Alt Proje Tarih Atama Matrisi** (5-6 saat)
   - Inline date picker
   - Toplu tarih atama
   - Tarih kaydırma
   - Şablon tarih aralıkları
   - Çakışma uyarıları

3. **Görev Görünümü (Firma Bazlı)** (2-3 saat)
   - Firma bazlı görev listesi
   - Otomatik tarih hesaplama gösterimi
   - Görev durumu takibi

### Faz 3: Test & Polish (4-5 saat)

1. **Backend Test** (2 saat)
   - Use case testleri
   - API endpoint testleri

2. **Frontend Test** (1 saat)
   - Component testleri
   - E2E testleri (kritik akışlar)

3. **Bug Fixes & Polish** (1-2 saat)
   - UI iyileştirmeleri
   - Performance optimizasyonu
   - Error handling

**Toplam: 26-32 saat (3-4 gün)**

---

## 🎯 AVANTAJLAR

✅ **Tek seferde toplu atama**: 50 firmaya 10 alt proje → 1 işlem  
✅ **Firma bazlı tarihler**: Her firma kendi hızında ilerler  
✅ **Otomatik görev tarihleri**: Alt proje tarihi değişince görevler otomatik güncellenir  
✅ **Matris görünümü**: Tüm atamaları tek sayfada görürsün  
✅ **Hızlı değişiklik**: Checkbox ile hızlı seç/kaldır  
✅ **Toplu tarih kaydırma**: Tüm firmaların tarihlerini +30 gün öne al  
✅ **Esnek**: Bazı firmalar bazı alt projeleri atlar

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. Mevcut Kod Yapısı

- `CreateProjectFromTemplateUseCase` sadece tek `companyId` alıyor
- Toplu işlemler için yeni use case'ler gerekli
- Transaction wrapper gerekli (tüm projeler ya hep ya hiç)

### 2. Program → Projects İlişkisi

- Mevcut kodda `projects.company_id` var, `companies.program_id` var
- Program'daki tüm projeleri bulmak için join gerekli
- Veya `projects.program_id` eklenebilir (ilişkiyi güçlendirir)

### 3. Frontend UX

- Çoklu seçim sistemi (checkbox'lar)
- Toplu işlemler toolbar
- Progress indicator
- Sonuç gösterimi (başarılı/başarısız)

---

## 📝 SONUÇ

Senin önerdiğin sistem çok daha mantıklı! Özellikle:

1. **Matris UI** → Görsel ve hızlı
2. **Firma bazlı tarihler** → Esnek
3. **Otomatik görev inherit** → Tek tek atamaya gerek yok

Bu sistem ile:

- 50 firmaya 10 alt proje atamak → 1 işlem (5 dakika)
- Her firma için ayrı tarih belirlemek → Matris sayfasında (10 dakika)
- Görevler otomatik görünür → Hiç işlem yok

**Eski sistem**: 50 firma × 10 alt proje = 500 işlem (saatlerce)  
**Yeni sistem**: 1 matris sayfası = 5 dakika

---

**Hazırlayan:** AI Assistant  
**Tarih:** Ocak 2025  
**Versiyon:** 1.0  
**Durum:** 📋 Analiz Tamamlandı - Uygulama Beklemede
