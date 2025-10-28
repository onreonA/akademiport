# 🎯 Sprint 4: Program Yönetimi

**Başlangıç:** 29 Ekim 2025  
**Hedef Süre:** 1 hafta  
**Durum:** 🏃 Başlıyor

---

## 📋 GENEL BAKIŞ

### Hedef

Program CRUD işlemleri ve Master Admin paneli tam çalışır hale getirmek.

### Kapsam

- Program oluşturma, düzenleme, silme, listeleme
- Program yöneticisi atama
- Danışman atama (Many-to-Many)
- Firma atama (Many-to-Many)
- Program filtreleme ve arama
- Master Admin dashboard

### Bağımlılıklar

- ✅ Sprint 1: Proje Kurulumu
- ✅ Sprint 2: Database & Auth
- ✅ Sprint 3: UI Foundation

---

## 🎯 GÖREVLER

### 1. Domain Layer - Program Entity İyileştirme ✅

**Durum:** Mevcut (Sprint 2'de oluşturuldu)  
**Dosya:** `src/3-domain/entities/Program.ts`

**Kontrol Edilecekler:**

- [x] Program entity tanımlandı
- [x] ProgramStatus enum tanımlandı
- [x] Validation kuralları var
- [ ] Business logic metodları eklenecek

**Yeni Eklenecekler:**

```typescript
// Program.ts'e eklenecek metodlar
- canEdit(userId: string, userRole: UserRole): boolean
- canDelete(userId: string, userRole: UserRole): boolean
- isActive(): boolean
- canAddConsultant(): boolean
- canAddCompany(): boolean
```

---

### 2. Infrastructure Layer - Program Repository İyileştirme

**Durum:** Mevcut (Sprint 2'de oluşturuldu)  
**Dosya:** `src/4-infrastructure/database/repositories/ProgramRepository.ts`

**Kontrol Edilecekler:**

- [x] findAll() mevcut
- [x] findById() mevcut
- [x] create() mevcut
- [x] update() mevcut
- [x] delete() mevcut

**Yeni Eklenecekler:**

```typescript
// ProgramRepository.ts'e eklenecek metodlar
- findByStatus(status: ProgramStatus): Promise<Program[]>
- findByManagerId(managerId: string): Promise<Program[]>
- search(query: string): Promise<Program[]>
- addConsultant(programId: string, consultantId: string): Promise<void>
- removeConsultant(programId: string, consultantId: string): Promise<void>
- addCompany(programId: string, companyId: string): Promise<void>
- removeCompany(programId: string, companyId: string): Promise<void>
- getConsultants(programId: string): Promise<User[]>
- getCompanies(programId: string): Promise<Company[]>
```

---

### 3. Application Layer - Program Use Cases

**Durum:** Yeni oluşturulacak  
**Klasör:** `src/2-application/use-cases/program/`

**Oluşturulacak Dosyalar:**

#### 3.1. CreateProgramUseCase.ts

```typescript
// Program oluşturma
- Input: CreateProgramDto
- Output: Result<Program>
- Validasyonlar: Name, description, dates, manager
- Business rules: Sadece Master Admin oluşturabilir
```

#### 3.2. UpdateProgramUseCase.ts

```typescript
// Program güncelleme
- Input: UpdateProgramDto
- Output: Result<Program>
- Validasyonlar: Tüm alanlar
- Business rules: Master Admin veya Program Manager
```

#### 3.3. DeleteProgramUseCase.ts

```typescript
// Program silme (soft delete)
- Input: programId
- Output: Result<void>
- Business rules: Sadece Master Admin
- Kontrol: Aktif firmalar varsa silinmez
```

#### 3.4. GetProgramUseCase.ts

```typescript
// Program detayı getirme
- Input: programId
- Output: Result<Program>
- İlişkiler: Manager, consultants, companies
```

#### 3.5. ListProgramsUseCase.ts

```typescript
// Program listesi
- Input: filters (status, managerId, search)
- Output: Result<Program[]>
- Pagination: Sayfa, limit
- Sorting: Name, createdAt, status
```

#### 3.6. AssignManagerUseCase.ts

```typescript
// Program yöneticisi atama
- Input: programId, managerId
- Output: Result<void>
- Validasyon: User role = PROGRAM_MANAGER
- Business rules: Sadece Master Admin
```

#### 3.7. ManageConsultantsUseCase.ts

```typescript
// Danışman ekleme/çıkarma
- addConsultant(programId, consultantId)
- removeConsultant(programId, consultantId)
- Validasyon: User role = CONSULTANT
- Business rules: Master Admin veya Program Manager
```

#### 3.8. ManageCompaniesUseCase.ts

```typescript
// Firma ekleme/çıkarma
- addCompany(programId, companyId)
- removeCompany(programId, companyId)
- Business rules: Master Admin veya Program Manager
```

---

### 4. Application Layer - DTOs

**Klasör:** `src/2-application/dto/program/`

**Oluşturulacak Dosyalar:**

#### 4.1. CreateProgramDto.ts

```typescript
interface CreateProgramDto {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  managerId?: string;
  status?: ProgramStatus;
}
```

#### 4.2. UpdateProgramDto.ts

```typescript
interface UpdateProgramDto {
  id: string;
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  managerId?: string;
  status?: ProgramStatus;
}
```

#### 4.3. ProgramFilterDto.ts

```typescript
interface ProgramFilterDto {
  status?: ProgramStatus;
  managerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}
```

---

### 5. API Routes - Program Endpoints

**Klasör:** `src/app/api/programs/`

**Oluşturulacak Dosyalar:**

#### 5.1. route.ts (GET, POST)

```typescript
// GET /api/programs - Liste
// POST /api/programs - Oluştur
```

#### 5.2. [id]/route.ts (GET, PUT, DELETE)

```typescript
// GET /api/programs/:id - Detay
// PUT /api/programs/:id - Güncelle
// DELETE /api/programs/:id - Sil
```

#### 5.3. [id]/consultants/route.ts (GET, POST, DELETE)

```typescript
// GET /api/programs/:id/consultants - Danışman listesi
// POST /api/programs/:id/consultants - Danışman ekle
// DELETE /api/programs/:id/consultants/:consultantId - Danışman çıkar
```

#### 5.4. [id]/companies/route.ts (GET, POST, DELETE)

```typescript
// GET /api/programs/:id/companies - Firma listesi
// POST /api/programs/:id/companies - Firma ekle
// DELETE /api/programs/:id/companies/:companyId - Firma çıkar
```

---

### 6. Presentation Layer - Program Pages

**Klasör:** `src/app/(dashboard)/programs/`

**Oluşturulacak Sayfalar:**

#### 6.1. page.tsx - Program Listesi

```typescript
// /programs
- DataTable ile program listesi
- Filtreleme (status, manager, search)
- Sorting
- Pagination
- "Yeni Program" butonu (Master Admin)
- Durum badge'leri
```

#### 6.2. new/page.tsx - Program Oluşturma

```typescript
// /programs/new
- Form: Name, description, dates, manager
- Validation
- Success/Error toast
- Redirect to list
```

#### 6.3. [id]/page.tsx - Program Detay

```typescript
// /programs/:id
- Program bilgileri
- Manager bilgisi
- Danışman listesi
- Firma listesi
- "Düzenle" butonu
- "Sil" butonu (Master Admin)
```

#### 6.4. [id]/edit/page.tsx - Program Düzenleme

```typescript
// /programs/:id/edit
- Form: Tüm alanlar
- Pre-filled data
- Validation
- Success/Error toast
```

---

### 7. Presentation Layer - Program Components

**Klasör:** `src/1-presentation/components/features/program/`

**Oluşturulacak Componentler:**

#### 7.1. ProgramList.tsx

```typescript
// Program listesi component
- Props: programs[], onEdit, onDelete, onView
- DataTable wrapper
- Status badges
- Action buttons
```

#### 7.2. ProgramForm.tsx

```typescript
// Program form component
- Props: initialData?, onSubmit, isLoading
- Form fields: name, description, dates, manager
- Validation
- Error handling
```

#### 7.3. ProgramCard.tsx

```typescript
// Program card component
- Props: program
- Özet bilgiler
- Status badge
- Quick actions
```

#### 7.4. ProgramFilters.tsx

```typescript
// Filtreleme component
- Props: onFilterChange
- Status dropdown
- Manager select
- Search input
- Reset button
```

#### 7.5. ConsultantManager.tsx

```typescript
// Danışman yönetimi component
- Props: programId, consultants[]
- Add consultant modal
- Remove consultant
- Consultant list
```

#### 7.6. CompanyManager.tsx

```typescript
// Firma yönetimi component
- Props: programId, companies[]
- Add company modal
- Remove company
- Company list
```

---

### 8. Master Admin Dashboard

**Klasör:** `src/app/(dashboard)/admin/`

**Oluşturulacak Sayfalar:**

#### 8.1. page.tsx - Admin Dashboard

```typescript
// /admin
- Program istatistikleri
  - Toplam program sayısı
  - Aktif/Pasif program sayısı
  - Program durumları (pie chart)
- Son eklenen programlar
- Quick actions
  - Yeni program oluştur
  - Program listesi
  - Kullanıcı yönetimi
```

#### 8.2. programs/page.tsx - Admin Program Yönetimi

```typescript
// /admin/programs
- Tüm programlar listesi
- Advanced filters
- Bulk actions
- Export to CSV
```

---

### 9. Validation & Error Handling

**Klasör:** `src/6-core/errors/`

**Oluşturulacak Dosyalar:**

#### 9.1. ProgramErrors.ts

```typescript
export class ProgramNotFoundError extends AppError
export class ProgramAlreadyExistsError extends AppError
export class InvalidProgramDateError extends AppError
export class ProgramHasActiveCompaniesError extends AppError
export class UnauthorizedProgramAccessError extends AppError
```

---

### 10. Testing (Opsiyonel - Sprint 21'de detaylı)

**Klasör:** `src/__tests__/program/`

**Temel Testler:**

- [ ] CreateProgramUseCase.test.ts
- [ ] UpdateProgramUseCase.test.ts
- [ ] ProgramRepository.test.ts
- [ ] Program API routes.test.ts

---

## 📊 KABUL KRİTERLERİ

### Fonksiyonel Gereksinimler

- [ ] **Program CRUD**
  - [x] Program oluşturulabiliyor
  - [x] Program güncellenebiliyor
  - [x] Program silinebiliyor (soft delete)
  - [x] Program detayı görüntülenebiliyor
  - [x] Program listesi görüntülenebiliyor

- [ ] **Program Yöneticisi**
  - [x] Program yöneticisi atanabiliyor
  - [x] Program yöneticisi değiştirilebiliyor
  - [x] Sadece PROGRAM_MANAGER rolü atanabiliyor

- [ ] **Danışman Yönetimi**
  - [x] Danışman eklenebiliyor
  - [x] Danışman çıkarılabiliyor
  - [x] Danışman listesi görüntülenebiliyor
  - [x] Sadece CONSULTANT rolü eklenebiliyor

- [ ] **Firma Yönetimi**
  - [x] Firma eklenebiliyor
  - [x] Firma çıkarılabiliyor
  - [x] Firma listesi görüntülenebiliyor

- [ ] **Filtreleme ve Arama**
  - [x] Program durumuna göre filtreleme
  - [x] Program yöneticisine göre filtreleme
  - [x] İsme göre arama
  - [x] Pagination çalışıyor

### Teknik Gereksinimler

- [ ] **Clean Architecture**
  - [x] Domain layer bağımsız
  - [x] Use cases iş mantığını içeriyor
  - [x] Repository pattern uygulanmış
  - [x] DTOs kullanılıyor

- [ ] **API**
  - [x] RESTful endpoint'ler
  - [x] Proper HTTP status codes
  - [x] Error handling
  - [x] Validation

- [ ] **UI/UX**
  - [x] Responsive tasarım
  - [x] Loading states
  - [x] Error messages
  - [x] Success feedback
  - [x] Dark mode support

- [ ] **Güvenlik**
  - [x] Role-based access control
  - [x] Input validation
  - [x] SQL injection koruması
  - [x] XSS koruması

---

## 🎨 UI TASARIM ÖNERİLERİ

### Program Listesi Sayfası

```
┌─────────────────────────────────────────────────┐
│ Header: "Programlar"                            │
│ [Yeni Program +]                    [Filtrele]  │
├─────────────────────────────────────────────────┤
│ Filters: [Durum ▼] [Yönetici ▼] [Ara...]       │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Program Adı    │ Yönetici │ Durum │ Actions│ │
│ ├─────────────────────────────────────────────┤ │
│ │ DYS Program    │ Ali Y.   │ 🟢    │ [⋯]   │ │
│ │ IGEME Program  │ Ayşe K.  │ 🟡    │ [⋯]   │ │
│ │ KOSGEB Program │ -        │ 🔴    │ [⋯]   │ │
│ └─────────────────────────────────────────────┘ │
│ Pagination: [<] 1 2 3 [>]                       │
└─────────────────────────────────────────────────┘
```

### Program Detay Sayfası

```
┌─────────────────────────────────────────────────┐
│ [← Geri]  Program Detayı         [Düzenle] [Sil]│
├─────────────────────────────────────────────────┤
│ ┌─ Program Bilgileri ──────────────────────────┐│
│ │ Adı: DYS E-İhracat Programı                  ││
│ │ Durum: 🟢 Aktif                               ││
│ │ Başlangıç: 01.01.2025                        ││
│ │ Bitiş: 31.12.2025                            ││
│ │ Yönetici: Ali Yılmaz                         ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ ┌─ Danışmanlar (3) ────────────────────────────┐│
│ │ [+ Danışman Ekle]                            ││
│ │ • Ayşe Kaya        [Çıkar]                   ││
│ │ • Mehmet Demir     [Çıkar]                   ││
│ │ • Zeynep Arslan    [Çıkar]                   ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ ┌─ Firmalar (12) ──────────────────────────────┐│
│ │ [+ Firma Ekle]                               ││
│ │ • ABC Ltd.         [Çıkar]                   ││
│ │ • XYZ A.Ş.         [Çıkar]                   ││
│ │ ...                                          ││
│ └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

---

## 🔄 WORKFLOW

### Program Oluşturma Akışı

```
1. Master Admin → /programs/new
2. Form doldur (name, description, dates, manager)
3. Submit → CreateProgramUseCase
4. Validation → Repository.create()
5. Success → Redirect to /programs/:id
6. Toast: "Program başarıyla oluşturuldu"
```

### Danışman Atama Akışı

```
1. Program Manager → /programs/:id
2. "Danışman Ekle" butonu
3. Modal açılır → Consultant listesi
4. Consultant seç → Submit
5. ManageConsultantsUseCase.addConsultant()
6. Repository.addConsultant()
7. Success → Modal kapanır, liste güncellenir
8. Toast: "Danışman eklendi"
```

---

## 📈 METRIKLER

### Başarı Kriterleri

- [ ] Tüm CRUD işlemleri çalışıyor
- [ ] API response time < 500ms
- [ ] Zero TypeScript errors
- [ ] Tüm sayfalar responsive
- [ ] Dark mode tam destekli

### Kod Kalitesi

- [ ] Clean Architecture uygulanmış
- [ ] SOLID prensipleri uygulanmış
- [ ] DRY (Don't Repeat Yourself)
- [ ] Proper error handling
- [ ] Meaningful variable names

---

## 🚀 DEPLOYMENT HAZIRLIĞI

### Sprint 4 Sonrası Çalışır Durumda Olacaklar

- ✅ Program CRUD tam çalışır
- ✅ Master Admin paneli kullanılabilir
- ✅ Program yöneticisi atama çalışır
- ✅ Danışman ve firma atamaları çalışır
- ✅ Filtreleme ve arama çalışır

### Eksik Kalacaklar (Sonraki Sprint'lerde)

- ⏳ Kullanıcı profil sayfaları (Sprint 5)
- ⏳ Firma detay sayfaları (Sprint 6)
- ⏳ Dashboard istatistikleri (Sprint 7)
- ⏳ Notification sistemi (Sprint 8)

---

## 📝 NOTLAR

### Önemli Kararlar

1. **Soft Delete:** Programlar silinmez, `deleted_at` alanı set edilir
2. **Many-to-Many:** Danışman ve firma atamaları `user_programs` ve `company_programs` tablolarında
3. **Authorization:** Master Admin her şeyi yapabilir, Program Manager sadece kendi programını yönetebilir
4. **Validation:** Frontend ve backend'de çift validasyon

### Teknik Borçlar

- [ ] Unit test coverage (Sprint 21'de)
- [ ] E2E test coverage (Sprint 21'de)
- [ ] Performance optimization (Sprint 22'de)
- [ ] Caching strategy (Sprint 22'de)

---

## 🔗 İLGİLİ DOSYALAR

### Mevcut Dosyalar (Sprint 2'den)

- `src/3-domain/entities/Program.ts`
- `src/3-domain/enums/ProgramStatus.ts`
- `src/3-domain/interfaces/IProgramRepository.ts`
- `src/4-infrastructure/database/repositories/ProgramRepository.ts`
- `src/app/api/programs/route.ts`
- `src/app/api/programs/[id]/route.ts`

### Yeni Oluşturulacak Dosyalar

- `src/2-application/use-cases/program/*` (8 dosya)
- `src/2-application/dto/program/*` (3 dosya)
- `src/app/(dashboard)/programs/*` (4 sayfa)
- `src/1-presentation/components/features/program/*` (6 component)
- `src/6-core/errors/ProgramErrors.ts`

---

**Sprint Sahibi:** AI Assistant  
**Gözden Geçiren:** Ömer Ünsal  
**Durum:** 🏃 Başlıyor  
**Güncelleme:** 29 Ekim 2025
