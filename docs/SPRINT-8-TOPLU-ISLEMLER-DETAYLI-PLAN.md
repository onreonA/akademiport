# 🚀 SPRINT 8 - TOPLU İŞLEMLER VE MATRİS TABANLI PROJE YÖNETİMİ - DETAYLI PLAN

**Plan Tarihi:** Ocak 2025  
**Hazırlayan:** AI Assistant  
**Durum:** 📋 Plan Hazır - Uygulama Beklemede

---

## 📋 İÇİNDEKİLER

1. [Genel Bakış](#genel-bakış)
2. [Faz 1: Database & Backend](#faz-1-database--backend)
3. [Faz 2: Frontend - Matris Sayfaları](#faz-2-frontend---matris-sayfaları)
4. [Faz 3: Test & Polish](#faz-3-test--polish)
5. [Zaman Çizelgesi](#zaman-çizelgesi)
6. [Kontrol Listesi](#kontrol-listesi)

---

## 🎯 GENEL BAKIŞ

### Hedef

Ana Proje → Alt Proje → Görev hiyerarşisinde:

- **Toplu firma atama** (birden fazla firmaya aynı anda alt proje atama)
- **Firma bazlı tarih yönetimi** (her firma için ayrı tarih)
- **Otomatik görev inherit** (alt projeye atanan firmalar otomatik görevleri görür)
- **Matris tabanlı UI** (görsel ve hızlı yönetim)

### Süre

**Toplam:** 26-32 saat (3-4 gün)

### Öncelik

🔴 **YÜKSEK** - Sprint 8'in kritik eksikliği

### Kasım 2025 Güncellemesi

- 🧭 Ön Analiz: Repository’de migration, entity ve use-case dosyaları henüz oluşturulmadı; planlanan dosya yolları boş.
- 📌 Öncelikli Aksiyonlar:
  1. `028_company_project_assignments.sql` migration’ı oluşturma ve RLS testleri
  2. Domain + repository katmanlarında `CompanyProjectAssignment` yapısını ekleme
  3. Bulk use-case’lerin (assign, dates) ve `GetAssignmentMatrixUseCase`’in servis katmanı entegrasyonu
  4. Matris sayfaları için admin panelde yeni rota seti (`/dashboard/projects/[id]/assignments`, `/dashboard/projects/[id]/dates`)
  5. Firma bazlı görev görünümü için danışman/şirket panellerinde API genişletmesi
- ✅ Bağımlılıklar güncel: Hiyerarşi akordeon yapısı tamamlandı, yeni matris Uİ’si bu altyapı üzerine inşa edilecek.

---

## 🗄️ FAZ 1: DATABASE & BACKEND

### Süre: 10-12 saat

---

### 1.1 Migration (1 saat)

#### Dosya: `src/4-infrastructure/database/migrations/028_company_project_assignments.sql`

**Yapılacaklar:**

```sql
-- 1. Tablo Oluşturma
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

-- 2. İndeksler
CREATE INDEX idx_company_project_assignments_company ON company_project_assignments(company_id);
CREATE INDEX idx_company_project_assignments_project ON company_project_assignments(project_id);
CREATE INDEX idx_company_project_assignments_sub_project ON company_project_assignments(sub_project_id);
CREATE INDEX idx_company_project_assignments_active ON company_project_assignments(is_active) WHERE is_active = true;

-- 3. RLS Policies
ALTER TABLE company_project_assignments ENABLE ROW LEVEL SECURITY;

-- Master Admin: Tüm erişim
CREATE POLICY "Master admin can manage all assignments" ON company_project_assignments
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Consultant: Kendi projelerinin atamalarını görebilir
CREATE POLICY "Consultant can view assignments of own projects" ON company_project_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = company_project_assignments.project_id
      AND p.consultant_id = auth.uid()
    )
  );

-- Consultant: Kendi projelerinin atamalarını yapabilir
CREATE POLICY "Consultant can manage assignments of own projects" ON company_project_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = company_project_assignments.project_id
      AND p.consultant_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = company_project_assignments.project_id
      AND p.consultant_id = auth.uid()
    )
  );

-- Company User: Kendi firma atamalarını görebilir
CREATE POLICY "Company user can view own company assignments" ON company_project_assignments
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

-- 4. Trigger: updated_at otomasyonu
CREATE TRIGGER update_company_project_assignments_updated_at
  BEFORE UPDATE ON company_project_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Kontrol Listesi:**

- [ ] Migration dosyası oluşturuldu
- [ ] Tablo oluşturuldu
- [ ] İndeksler eklendi
- [ ] RLS policies eklendi
- [ ] Trigger eklendi
- [ ] Migration test edildi

---

### 1.2 Domain Layer (1 saat)

#### Dosya: `src/3-domain/entities/CompanyProjectAssignment.ts`

**Yapılacaklar:**

```typescript
export interface CompanyProjectAssignment {
  id: string;
  companyId: string;
  projectId: string;
  subProjectId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyProjectAssignmentDto {
  companyId: string;
  projectId: string;
  subProjectId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
}

export interface UpdateCompanyProjectAssignmentDto {
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
}

export class CompanyProjectAssignmentEntity implements CompanyProjectAssignment {
  // ... implementation
}
```

#### Dosya: `src/3-domain/interfaces/repositories/ICompanyProjectAssignmentRepository.ts`

**Yapılacaklar:**

```typescript
export interface ICompanyProjectAssignmentRepository {
  create(data: CreateCompanyProjectAssignmentDto): Promise<CompanyProjectAssignment>;
  createMany(data: CreateCompanyProjectAssignmentDto[]): Promise<CompanyProjectAssignment[]>;
  findById(id: string): Promise<CompanyProjectAssignment | null>;
  findByCompanyAndProject(
    companyId: string,
    projectId: string
  ): Promise<CompanyProjectAssignment[]>;
  findByProject(projectId: string): Promise<CompanyProjectAssignment[]>;
  findBySubProject(subProjectId: string): Promise<CompanyProjectAssignment[]>;
  update(id: string, data: UpdateCompanyProjectAssignmentDto): Promise<CompanyProjectAssignment>;
  updateMany(
    updates: Array<{ id: string; data: UpdateCompanyProjectAssignmentDto }>
  ): Promise<CompanyProjectAssignment[]>;
  delete(id: string): Promise<void>;
  deleteByCompanyAndSubProject(companyId: string, subProjectId: string): Promise<void>;
}
```

**Kontrol Listesi:**

- [ ] Entity oluşturuldu
- [ ] DTO'lar tanımlandı
- [ ] Repository interface oluşturuldu
- [ ] Validation logic eklendi

---

### 1.3 Infrastructure Layer (2 saat)

#### Dosya: `src/4-infrastructure/database/repositories/CompanyProjectAssignmentRepository.ts`

**Yapılacaklar:**

- `ICompanyProjectAssignmentRepository` implementasyonu
- Tüm CRUD metodları
- Bulk operations (createMany, updateMany)
- Soft delete desteği (is_active)

**Kontrol Listesi:**

- [ ] Repository implementasyonu tamamlandı
- [ ] Tüm metodlar test edildi
- [ ] Error handling eklendi
- [ ] Logging eklendi

---

### 1.4 Application Layer (6-8 saat)

#### Use Case 1: `BulkAssignSubProjectsToCompaniesUseCase.ts`

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
4. Check for existing assignments (conflict)
5. Bulk insert into `company_project_assignments`
6. Return success/failure report

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

#### Use Case 2: `BulkAssignDatesToCompanySubProjectsUseCase.ts`

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
2. Validate date ranges (startDate < endDate)
3. Check for conflicts (overlapping dates)
4. Bulk update dates
5. Recalculate task dates (if needed)

#### Use Case 3: `GetAssignmentMatrixUseCase.ts`

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

#### Use Case 4: `GetCompanyTasksWithInheritedDatesUseCase.ts`

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

#### Use Case 5: `ShiftCompanySubProjectDatesUseCase.ts`

**Input:**

```typescript
{
  projectId: string;
  subProjectId: string;
  companyIds: string[];
  days: number; // +30 gün öne al, -10 gün geri al
}
```

**Logic:**

1. Validate assignments exist
2. Update startDate and endDate (add days)
3. Recalculate task dates

**Kontrol Listesi:**

- [ ] BulkAssignSubProjectsToCompaniesUseCase
- [ ] BulkAssignDatesToCompanySubProjectsUseCase
- [ ] GetAssignmentMatrixUseCase
- [ ] GetCompanyTasksWithInheritedDatesUseCase
- [ ] ShiftCompanySubProjectDatesUseCase
- [ ] Tüm use case'ler test edildi
- [ ] Error handling eklendi

---

### 1.5 API Routes (3-4 saat)

#### Endpoint 1: `POST /api/projects/[id]/assignments/bulk`

**Dosya:** `src/app/api/projects/[id]/assignments/bulk/route.ts`

**Request:**

```typescript
{
  assignments: Array<{
    companyId: string;
    subProjectIds: string[];
  }>;
}
```

**Response:**

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

#### Endpoint 2: `GET /api/projects/[id]/assignment-matrix`

**Dosya:** `src/app/api/projects/[id]/assignment-matrix/route.ts`

**Response:**

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

#### Endpoint 3: `POST /api/projects/[id]/sub-projects/[subId]/dates/bulk`

**Dosya:** `src/app/api/projects/[id]/sub-projects/[subId]/dates/bulk/route.ts`

**Request:**

```typescript
{
  dates: Array<{
    companyId: string;
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
  }>;
}
```

#### Endpoint 4: `POST /api/projects/[id]/sub-projects/[subId]/dates/shift`

**Dosya:** `src/app/api/projects/[id]/sub-projects/[subId]/dates/shift/route.ts`

**Request:**

```typescript
{
  companyIds: string[];
  days: number; // +30 veya -10
}
```

#### Endpoint 5: `GET /api/companies/[id]/sub-projects/[subId]/tasks`

**Dosya:** `src/app/api/companies/[id]/sub-projects/[subId]/tasks/route.ts`

**Response:**

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

**Kontrol Listesi:**

- [ ] POST /api/projects/[id]/assignments/bulk
- [ ] GET /api/projects/[id]/assignment-matrix
- [ ] POST /api/projects/[id]/sub-projects/[subId]/dates/bulk
- [ ] POST /api/projects/[id]/sub-projects/[subId]/dates/shift
- [ ] GET /api/companies/[id]/sub-projects/[subId]/tasks
- [ ] Tüm endpoint'ler test edildi
- [ ] Authorization kontrolü eklendi
- [ ] Error handling eklendi

---

## 🎨 FAZ 2: FRONTEND - MATRİS SAYFALARI

### Süre: 12-15 saat

---

### 2.1 Firma-Alt Proje Atama Matrisi (5-6 saat)

#### Sayfa: `/dashboard/projects/[projectId]/assignments`

**Yapılacaklar:**

1. **Matris Tablo Component** (`AssignmentMatrix.tsx`)
   - Satır: Firmalar
   - Sütun: Alt Projeler
   - Checkbox'lar: Atama durumu
   - Checkbox seçim sistemi
   - Toplu seçim/kaldırma butonları

2. **Filtreleme**
   - Program filtresi
   - Şehir filtresi
   - Sektör filtresi
   - Arama (firma adı)

3. **Toplu İşlemler Toolbar**
   - "Tümünü Seç" butonu
   - "Tümünü Kaldır" butonu
   - "Seçilenleri Kaydet" butonu
   - Progress indicator

4. **API Entegrasyonu**
   - GET `/api/projects/[id]/assignment-matrix`
   - POST `/api/projects/[id]/assignments/bulk`
   - Loading states
   - Error handling
   - Success/error notifications

**Kontrol Listesi:**

- [ ] Matris tablo component oluşturuldu
- [ ] Checkbox seçim sistemi çalışıyor
- [ ] Toplu seçim/kaldırma çalışıyor
- [ ] Filtreleme çalışıyor
- [ ] API entegrasyonu tamamlandı
- [ ] Loading states eklendi
- [ ] Error handling eklendi
- [ ] Success/error notifications eklendi

---

### 2.2 Firma-Alt Proje Tarih Atama Matrisi (5-6 saat)

#### Sayfa: `/dashboard/projects/[projectId]/sub-projects/[subProjectId]/dates`

**Yapılacaklar:**

1. **Tarih Matris Tablo Component** (`DateAssignmentMatrix.tsx`)
   - Satır: Firmalar
   - Sütun: Başlangıç Tarihi, Bitiş Tarihi, Süre, Durum
   - Inline date picker (her hücrede)
   - Süre hesaplama (otomatik)
   - Durum göstergesi (Aktif/Pasif)

2. **Toplu İşlemler Toolbar**
   - "Seçili Firmalara Tarih Ata" butonu
   - "Tüm Firmalara Aynı Tarih" butonu
   - "Tarihleri Kaydır" butonu (+/- gün)
   - Progress indicator

3. **Hızlı Şablonlar**
   - Q1 2025, Q2 2025, Q3 2025, Q4 2025 butonları
   - "Özel Tarih Aralığı" modal

4. **Çakışma Uyarıları**
   - Tarih çakışması kontrolü
   - Uyarı mesajları

5. **API Entegrasyonu**
   - GET `/api/projects/[id]/assignment-matrix` (filtrelenmiş)
   - POST `/api/projects/[id]/sub-projects/[subId]/dates/bulk`
   - POST `/api/projects/[id]/sub-projects/[subId]/dates/shift`

**Kontrol Listesi:**

- [ ] Tarih matris tablo component oluşturuldu
- [ ] Inline date picker çalışıyor
- [ ] Süre hesaplama çalışıyor
- [ ] Toplu işlemler çalışıyor
- [ ] Hızlı şablonlar çalışıyor
- [ ] Çakışma uyarıları çalışıyor
- [ ] API entegrasyonu tamamlandı

---

### 2.3 Görev Görünümü (Firma Bazlı) (2-3 saat)

#### Sayfa: `/company-dashboard/projects/[projectId]/sub-projects/[subProjectId]/tasks`

**Yapılacaklar:**

1. **Görev Listesi Component** (`CompanySubProjectTasks.tsx`)
   - Firma bazlı görev listesi
   - Otomatik tarih hesaplama gösterimi
   - Görev durumu takibi
   - Görev atama

2. **Tarih Bilgisi**
   - Alt proje başlangıç tarihi
   - Alt proje bitiş tarihi
   - Görev başlangıç tarihi (hesaplanmış)
   - Görev bitiş tarihi (hesaplanmış)

3. **API Entegrasyonu**
   - GET `/api/companies/[id]/sub-projects/[subId]/tasks`

**Kontrol Listesi:**

- [ ] Görev listesi component oluşturuldu
- [ ] Otomatik tarih hesaplama gösterimi çalışıyor
- [ ] Görev durumu takibi çalışıyor
- [ ] API entegrasyonu tamamlandı

---

## 🧪 FAZ 3: TEST & POLISH

### Süre: 4-5 saat

---

### 3.1 Backend Test (2 saat)

**Yapılacaklar:**

1. **Use Case Testleri**
   - `BulkAssignSubProjectsToCompaniesUseCase` test
   - `BulkAssignDatesToCompanySubProjectsUseCase` test
   - `GetAssignmentMatrixUseCase` test
   - `GetCompanyTasksWithInheritedDatesUseCase` test
   - `ShiftCompanySubProjectDatesUseCase` test

2. **API Endpoint Testleri**
   - Tüm endpoint'ler için test senaryoları
   - Authorization testleri
   - Error handling testleri

**Kontrol Listesi:**

- [ ] Use case testleri yazıldı
- [ ] API endpoint testleri yazıldı
- [ ] Tüm testler geçti

---

### 3.2 Frontend Test (1 saat)

**Yapılacaklar:**

1. **Component Testleri**
   - `AssignmentMatrix` component test
   - `DateAssignmentMatrix` component test
   - `CompanySubProjectTasks` component test

2. **E2E Testleri**
   - Firma-Alt Proje atama akışı
   - Tarih atama akışı

**Kontrol Listesi:**

- [ ] Component testleri yazıldı
- [ ] E2E testleri yazıldı
- [ ] Tüm testler geçti

---

### 3.3 Bug Fixes & Polish (1-2 saat)

**Yapılacaklar:**

1. **UI İyileştirmeleri**
   - Responsive design kontrolü
   - Dark mode desteği
   - Loading states iyileştirmeleri
   - Error messages iyileştirmeleri

2. **Performance Optimizasyonu**
   - API call optimizasyonu
   - Component re-render optimizasyonu

3. **Error Handling**
   - Daha detaylı error messages
   - Retry mekanizması (gerekirse)

**Kontrol Listesi:**

- [ ] UI iyileştirmeleri yapıldı
- [ ] Performance optimizasyonu yapıldı
- [ ] Error handling iyileştirildi
- [ ] Tüm sayfalar test edildi

---

## 📅 ZAMAN ÇİZELGESİ

### Gün 1: Database & Backend (10-12 saat)

**Sabah (4 saat):**

- Migration (1 saat)
- Domain Layer (1 saat)
- Infrastructure Layer (2 saat)

**Öğleden Sonra (6-8 saat):**

- Application Layer (6-8 saat)

### Gün 2: API Routes & Frontend Başlangıç (6-8 saat)

**Sabah (3-4 saat):**

- API Routes (3-4 saat)

**Öğleden Sonra (3-4 saat):**

- Firma-Alt Proje Atama Matrisi başlangıç (3-4 saat)

### Gün 3: Frontend Devam (6-8 saat)

**Sabah (3-4 saat):**

- Firma-Alt Proje Atama Matrisi bitiş (2 saat)
- Firma-Alt Proje Tarih Atama Matrisi başlangıç (2 saat)

**Öğleden Sonra (3-4 saat):**

- Firma-Alt Proje Tarih Atama Matrisi bitiş (3-4 saat)

### Gün 4: Frontend Bitiş & Test (4-5 saat)

**Sabah (2-3 saat):**

- Görev Görünümü (Firma Bazlı) (2-3 saat)

**Öğleden Sonra (2-3 saat):**

- Test & Polish (2-3 saat)

---

## ✅ KONTROL LİSTESİ

### Faz 1: Database & Backend

- [ ] Migration dosyası oluşturuldu ve test edildi
- [ ] Domain Layer tamamlandı
- [ ] Infrastructure Layer tamamlandı
- [ ] Application Layer (5 use case) tamamlandı
- [ ] API Routes (5 endpoint) tamamlandı
- [ ] Tüm backend testleri geçti

### Faz 2: Frontend

- [ ] Firma-Alt Proje Atama Matrisi sayfası tamamlandı
- [ ] Firma-Alt Proje Tarih Atama Matrisi sayfası tamamlandı
- [ ] Görev Görünümü (Firma Bazlı) sayfası tamamlandı
- [ ] Tüm sayfalar test edildi

### Faz 3: Test & Polish

- [ ] Backend testleri yazıldı ve geçti
- [ ] Frontend testleri yazıldı ve geçti
- [ ] UI iyileştirmeleri yapıldı
- [ ] Performance optimizasyonu yapıldı
- [ ] Error handling iyileştirildi

---

## 🎯 BAŞARI KRİTERLERİ

1. ✅ 50 firmaya 10 alt proje atama → 1 işlem (5 dakika)
2. ✅ Her firma için ayrı tarih belirleme → Matris sayfasında (10 dakika)
3. ✅ Görevler otomatik görünür → Hiç işlem yok
4. ✅ Tüm sayfalar responsive ve dark mode destekli
5. ✅ Tüm API endpoint'leri çalışıyor
6. ✅ Tüm testler geçiyor

---

**Hazırlayan:** AI Assistant  
**Tarih:** Ocak 2025  
**Versiyon:** 1.0  
**Durum:** 📋 Plan Hazır - Uygulama Beklemede
