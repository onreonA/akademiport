# 📋 Sprint 6: Company Management - Detaylı Analiz

## 🎯 Sprint Hedefi

**Firma CRUD + Firma paneli temeli**

---

## 📊 Mevcut Durum Analizi

### ✅ Zaten Var (Sprint 4'ten)

#### 1. Domain Layer

- ✅ **Company Entity** (`src/3-domain/entities/Company.ts`)
  - 34 field tanımlı
  - `maxUsers`, `currentUsers` field'ları var
  - `programId` ile programa bağlı

#### 2. Infrastructure Layer

- ✅ **ICompanyRepository** (`src/3-domain/interfaces/ICompanyRepository.ts`)
  - 7 method: `findById`, `findAll`, `findByProgramId`, `findByCity`, `create`, `update`, `delete`
  - ⚠️ Inline DTO kullanıyor (TODO: Sprint 6'da ayrılacak)
- ✅ **CompanyRepository** (`src/4-infrastructure/database/repositories/CompanyRepository.ts`)
  - 267 satır, tam implement edilmiş
  - Supabase integration var
  - ⚠️ Inline DTO kullanıyor (TODO: Sprint 6'da ayrılacak)

#### 3. API Layer

- ✅ **API Routes** (`src/app/api/companies/`)
  - `GET/POST /api/companies` - List & Create
  - `GET/PATCH/DELETE /api/companies/[id]` - Get, Update, Delete
  - ✅ Real auth kullanıyor (Sprint 5'te güncellendi)

---

## ❌ Eksik Olanlar

### 1. Application Layer

#### DTOs (Yok - Inline kullanılıyor)

- ❌ `CreateCompanyDto.ts` - Zod validation ile
- ❌ `UpdateCompanyDto.ts` - Zod validation ile
- ❌ `CompanyFilterDto.ts` - Filtering & pagination
- ❌ `AssignCompanyProgramDto.ts` - Program assignment
- ❌ `ManageCompanyUsersDto.ts` - User management
- ❌ `index.ts` - Barrel export

#### Use Cases (Yok)

- ❌ `CreateCompanyUseCase.ts` - Authorization & validation
- ❌ `UpdateCompanyUseCase.ts` - Role-based restrictions
- ❌ `DeleteCompanyUseCase.ts` - Business rules
- ❌ `GetCompanyUseCase.ts` - Single company
- ❌ `ListCompaniesUseCase.ts` - Filtering & pagination
- ❌ `AssignCompanyProgramUseCase.ts` - Program assignment
- ❌ `AddCompanyUserUseCase.ts` - Add user (max 2 check)
- ❌ `RemoveCompanyUserUseCase.ts` - Remove user
- ❌ `ListCompanyUsersUseCase.ts` - List users
- ❌ `index.ts` - Barrel export

### 2. Presentation Layer

#### UI Components (Yok)

- ❌ `CompanyCard.tsx` - Company summary card
- ❌ `CompanyFilters.tsx` - Search & filters
- ❌ `CompanyForm.tsx` - Create/Edit form (React Hook Form + Zod)
- ❌ `CompanyUsersList.tsx` - Users management
- ❌ `CompanyProgramsList.tsx` - Assigned programs
- ❌ `CompanyProfileCard.tsx` - Detailed profile
- ❌ `CompanyStatsCard.tsx` - Stats overview
- ❌ `index.ts` - Barrel export

#### Pages (Yok)

- ❌ `/dashboard/companies` - List with filters
- ❌ `/dashboard/companies/[id]` - Detail with tabs
- ❌ `/dashboard/companies/new` - Create
- ❌ `/dashboard/companies/[id]/edit` - Edit
- ❌ `/dashboard/companies/[id]/users` - Users management

#### Company Dashboard (Yok - Firma kullanıcıları için)

- ❌ `/company-dashboard` - Company user dashboard
- ❌ `/company-dashboard/profile` - Company profile
- ❌ `/company-dashboard/users` - Manage sub-users
- ❌ `/company-dashboard/settings` - Company settings

### 3. API Routes (Eksik)

- ❌ `POST /api/companies/[id]/program` - Assign program
- ❌ `GET /api/companies/[id]/users` - List users
- ❌ `POST /api/companies/[id]/users` - Add user (max 2 check)
- ❌ `DELETE /api/companies/[id]/users/[userId]` - Remove user

---

## 📦 Sprint 6 Görev Listesi

### Faz A: Company DTOs (6 dosya - ~350 satır)

1. `CreateCompanyDto.ts` - Zod validation
2. `UpdateCompanyDto.ts` - Zod validation
3. `CompanyFilterDto.ts` - Filtering & pagination
4. `AssignCompanyProgramDto.ts` - Program assignment
5. `ManageCompanyUsersDto.ts` - User management
6. `index.ts` - Barrel export

**Özellikler:**

- Zod schema validation
- Slug auto-generation
- Max users validation (default: 2)
- Helper functions

---

### Faz B: Repository Güncelleme (2 dosya - ~100 satır)

1. `ICompanyRepository.ts` - Yeni methodlar ekle
2. `CompanyRepository.ts` - Yeni methodlar implement et

**Yeni Methodlar:**

- `getCompanyUsers(companyId: string)` - List users
- `addCompanyUser(companyId: string, userId: string)` - Add user
- `removeCompanyUser(companyId: string, userId: string)` - Remove user
- `search(query: string)` - Search companies
- `findWithFilters(filter: CompanyFilterDto)` - Filtering & pagination

---

### Faz C: Company Use Cases (10 dosya - ~800 satır)

1. `CreateCompanyUseCase.ts` - Authorization & validation
2. `UpdateCompanyUseCase.ts` - Role-based restrictions
3. `DeleteCompanyUseCase.ts` - Business rules
4. `GetCompanyUseCase.ts` - Single company
5. `ListCompaniesUseCase.ts` - Filtering & pagination
6. `AssignCompanyProgramUseCase.ts` - Program assignment
7. `AddCompanyUserUseCase.ts` - Add user (max 2 check)
8. `RemoveCompanyUserUseCase.ts` - Remove user
9. `ListCompanyUsersUseCase.ts` - List users
10. `index.ts` - Barrel export

**Authorization Rules:**

- **MASTER_ADMIN:** Tüm işlemler
- **PROGRAM_MANAGER:** Sadece kendi programındaki firmalar
- **CONSULTANT:** Sadece atandığı firmaları görebilir
- **COMPANY_ADMIN:** Sadece kendi firmasını yönetebilir
- **COMPANY_USER:** Sadece kendi firmasını görebilir

**Business Rules:**

- Max 2 aktif kullanıcı (COMPANY_ADMIN + COMPANY_USER)
- Firma silinirken aktif kullanıcı varsa hata
- Program değiştirirken mevcut kullanıcılar kontrol edilmeli

---

### Faz D: Company API Routes (4 dosya - ~400 satır)

1. `POST /api/companies/[id]/program` - Assign program
2. `GET /api/companies/[id]/users` - List users
3. `POST /api/companies/[id]/users` - Add user
4. `DELETE /api/companies/[id]/users/[userId]` - Remove user

**Güncelleme:**

- Mevcut routes'ları Use Case'lere bağla
- Real auth kullanımı (zaten var)
- Error handling (400, 404, 500)

---

### Faz E: Company UI Components (8 dosya - ~1200 satır)

1. `CompanyCard.tsx` - Company summary card
   - Logo, name, sector
   - Active users count
   - Program badge
   - Actions (view, edit, delete)

2. `CompanyFilters.tsx` - Search & filters
   - Search by name
   - Filter by program
   - Filter by city
   - Filter by sector
   - Sort options

3. `CompanyForm.tsx` - Create/Edit form
   - React Hook Form + Zod
   - Company info fields
   - Program selection
   - Logo upload (optional)

4. `CompanyUsersList.tsx` - Users management
   - List users (max 2)
   - Add user button
   - Remove user action
   - User role badges

5. `CompanyProgramsList.tsx` - Assigned programs
   - Program info
   - Assign/Remove actions

6. `CompanyProfileCard.tsx` - Detailed profile
   - All company info
   - Edit button
   - Stats

7. `CompanyStatsCard.tsx` - Stats overview
   - Active users
   - Program info
   - Created date

8. `index.ts` - Barrel export

---

### Faz F: Company Pages - Admin (5 dosya - ~700 satır)

1. `/dashboard/companies/page.tsx` - List
   - CompanyCard grid
   - CompanyFilters
   - Pagination
   - Create button

2. `/dashboard/companies/[id]/page.tsx` - Detail
   - CompanyProfileCard
   - Tabs: Overview, Users, Settings
   - Edit button

3. `/dashboard/companies/new/page.tsx` - Create
   - CompanyForm
   - Back button

4. `/dashboard/companies/[id]/edit/page.tsx` - Edit
   - CompanyForm with initial data
   - Back button

5. `/dashboard/companies/[id]/users/page.tsx` - Users management
   - CompanyUsersList
   - Add user dialog
   - Remove confirmation

---

### Faz G: Company Dashboard - Firma Paneli (4 dosya - ~500 satır)

1. `/company-dashboard/page.tsx` - Dashboard
   - Stats cards
   - Quick actions
   - Recent activity

2. `/company-dashboard/profile/page.tsx` - Profile
   - CompanyProfileCard
   - Edit company info (limited)

3. `/company-dashboard/users/page.tsx` - Manage users
   - CompanyUsersList
   - Add/Remove users (max 2)

4. `/company-dashboard/settings/page.tsx` - Settings
   - Company settings
   - Notifications
   - Preferences

**Authorization:**

- Sadece `COMPANY_ADMIN` ve `COMPANY_USER` erişebilir
- `COMPANY_ADMIN` kullanıcı ekleyebilir/çıkarabilir
- `COMPANY_USER` sadece görüntüleyebilir

---

### Faz H: Test & Documentation (~200 satır)

1. TypeScript type check
2. Test senaryoları
3. Sprint 6 Summary
4. API documentation update

---

## 📈 Sprint 6 İstatistikleri

### Dosya Sayıları

| Kategori          | Dosya Sayısı | Tahmini Satır |
| ----------------- | ------------ | ------------- |
| DTOs              | 6            | ~350          |
| Repository Update | 2            | ~100          |
| Use Cases         | 10           | ~800          |
| API Routes        | 4            | ~400          |
| UI Components     | 8            | ~1200         |
| Admin Pages       | 5            | ~700          |
| Company Dashboard | 4            | ~500          |
| Documentation     | 2            | ~200          |
| **TOPLAM**        | **41**       | **~4250**     |

---

## 🎯 Sprint 6 Kabul Kriterleri

### Backend

- ✅ Firma oluşturulabiliyor
- ✅ Programa atanabiliyor
- ✅ Alt kullanıcı eklenebiliyor (max 2)
- ✅ Alt kullanıcı çıkarılabiliyor
- ✅ Filtering & pagination çalışıyor
- ✅ Authorization çalışıyor

### Frontend - Admin

- ✅ Firma listesi görüntülenebiliyor
- ✅ Firma detayı görüntülenebiliyor
- ✅ Firma oluşturulabiliyor
- ✅ Firma düzenlenebiliyor
- ✅ Firma silinebiliyor
- ✅ Kullanıcı yönetimi çalışıyor

### Frontend - Company Dashboard

- ✅ Firma dashboard'u çalışıyor
- ✅ Firma profili görüntülenebiliyor
- ✅ Alt kullanıcı eklenebiliyor (max 2)
- ✅ Alt kullanıcı çıkarılabiliyor
- ✅ Ayarlar değiştirilebiliyor

---

## 🔗 Bağımlılıklar

### Sprint 4 (Tamamlandı)

- ✅ Program Management
- ✅ Company Entity & Repository

### Sprint 5 (Tamamlandı)

- ✅ User Management
- ✅ Authentication
- ✅ Real Auth in API Routes

---

## 🚀 Uygulama Planı

### 1. Hazırlık (5 dakika)

- TODO list oluştur
- Klasörleri oluştur

### 2. Faz A: DTOs (15 dakika)

- 6 DTO dosyası oluştur
- Zod validation ekle

### 3. Faz B: Repository (10 dakika)

- Interface güncelle
- Implementation güncelle

### 4. Faz C: Use Cases (25 dakika)

- 10 Use Case oluştur
- Authorization ekle

### 5. Faz D: API Routes (15 dakika)

- 4 yeni route oluştur
- Mevcut routes'ları güncelle

### 6. Faz E: UI Components (30 dakika)

- 8 component oluştur
- Storybook stories (optional)

### 7. Faz F: Admin Pages (25 dakika)

- 5 sayfa oluştur
- Routing yapılandır

### 8. Faz G: Company Dashboard (20 dakika)

- 4 sayfa oluştur
- Authorization ekle

### 9. Faz H: Test & Docs (10 dakika)

- Type check
- Documentation

**Toplam Tahmini Süre:** ~2.5 saat

---

## 💡 Önemli Notlar

### Max Users Validation

```typescript
// Business Rule: Max 2 aktif kullanıcı
if (company.currentUsers >= company.maxUsers) {
  return Result.fail('Maksimum kullanıcı sayısına ulaşıldı');
}
```

### Role-Based Access

```typescript
// COMPANY_ADMIN: Kullanıcı ekleyebilir/çıkarabilir
// COMPANY_USER: Sadece görüntüleyebilir
// PROGRAM_MANAGER: Kendi programındaki firmaları yönetebilir
// MASTER_ADMIN: Tüm firmaları yönetebilir
```

### Slug Generation

```typescript
// Auto-generate slug from company name
const slug = name
  .toLowerCase()
  .replace(/ş/g, 's')
  .replace(/ğ/g, 'g')
  .replace(/ü/g, 'u')
  .replace(/ö/g, 'o')
  .replace(/ç/g, 'c')
  .replace(/ı/g, 'i')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
```

---

## 🎓 Sprint 6'dan Beklenenler

1. **Clean Architecture** - Use Case pattern kullanımı
2. **Authorization** - Role-based access control
3. **Validation** - Zod schema validation
4. **Business Rules** - Max users, program assignment
5. **UI/UX** - Responsive, dark mode, loading states
6. **Company Dashboard** - Firma kullanıcıları için ayrı panel

---

**Analiz Tamamlandı!** ✅

**Hazır olduğunuzda uygulamaya geçebiliriz!** 🚀
