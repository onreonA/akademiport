# 🔍 Sprint 4: Program Yönetimi - Detaylı Analiz Raporu

**Tarih:** 29 Ekim 2025  
**Analiz Türü:** Mevcut Durum ve Kopukluk Tespiti  
**Hedef:** Sprint 4 implementasyonu için hazırlık

---

## 📊 GENEL DURUM ÖZET

| Katman                   | Durum    | Tamamlanma | Notlar                                                  |
| ------------------------ | -------- | ---------- | ------------------------------------------------------- |
| **Domain Layer**         | ✅ İyi   | %80        | Entity'ler ve interface'ler hazır, business logic eksik |
| **Infrastructure Layer** | ⚠️ Kısmi | %70        | Temel CRUD var, ilişki yönetimi eksik                   |
| **Application Layer**    | ❌ Eksik | %0         | Use Cases ve DTOs yok                                   |
| **API Layer**            | ⚠️ Kısmi | %50        | Temel endpoint'ler var, ilişki endpoint'leri yok        |
| **Presentation Layer**   | ❌ Eksik | %0         | Hiç sayfa ve component yok                              |

**Genel Tamamlanma:** ~40%

---

## 1️⃣ DOMAIN LAYER ANALİZİ

### ✅ Mevcut Yapı

#### Entities

- ✅ **Program.ts** - Tam ve doğru
  - Tüm alanlar tanımlı
  - `CreateProgramDto` ve `UpdateProgramDto` entity içinde (⚠️ yanlış yer)
- ✅ **Company.ts** - Tam ve doğru
  - Tüm alanlar tanımlı
  - `CreateCompanyDto` ve `UpdateCompanyDto` entity içinde (⚠️ yanlış yer)
- ✅ **User.ts** - Tam ve doğru
  - Tüm alanlar tanımlı
  - `CreateUserDto`, `UpdateUserDto`, `AuthUser` entity içinde (⚠️ yanlış yer)

#### Enums

- ✅ **ProgramStatus.ts** - Var (kontrol edilmedi ama kullanılıyor)
- ✅ **UserRole.ts** - Var (kontrol edilmedi ama kullanılıyor)

#### Interfaces

- ✅ **IProgramRepository.ts** - Temel CRUD metodları var

  ```typescript
  - findById ✅
  - findAll ✅
  - findByStatus ✅
  - findByCity ✅
  - create ✅
  - update ✅
  - delete ✅
  ```

- ✅ **ICompanyRepository.ts** - Temel CRUD metodları var
  ```typescript
  - findById ✅
  - findAll ✅
  - findByProgramId ✅
  - findByCity ✅
  - create ✅
  - update ✅
  - delete ✅
  ```

### ❌ Eksiklikler

#### 1. Business Logic Metodları (Program Entity)

```typescript
// Program.ts'e eklenecek
class Program {
  // Business logic metodları eksik:
  - canEdit(userId: string, userRole: UserRole): boolean
  - canDelete(userId: string, userRole: UserRole): boolean
  - isActive(): boolean
  - canAddConsultant(): boolean
  - canAddCompany(): boolean
  - hasCapacity(): boolean
  - isDateValid(): boolean
}
```

#### 2. Repository Interface Genişletmeleri

**IProgramRepository.ts'e eklenecek:**

```typescript
- findByManagerId(managerId: string): Promise<Result<Program[]>>
- search(query: string): Promise<Result<Program[]>>
- addConsultant(programId: string, consultantId: string): Promise<Result<void>>
- removeConsultant(programId: string, consultantId: string): Promise<Result<void>>
- getConsultants(programId: string): Promise<Result<User[]>>
- addCompany(programId: string, companyId: string): Promise<Result<void>>
- removeCompany(programId: string, companyId: string): Promise<Result<void>>
- getCompanies(programId: string): Promise<Result<Company[]>>
```

#### 3. DTOs Yanlış Yerde

- ❌ DTOs entity dosyalarında tanımlı
- ✅ Olması gereken: `src/2-application/dto/` klasöründe

#### 4. IUserRepository Interface Yok

- ❌ `IUserRepository.ts` dosyası yok
- ⚠️ User CRUD işlemleri için gerekli

---

## 2️⃣ INFRASTRUCTURE LAYER ANALİZİ

### ✅ Mevcut Yapı

#### ProgramRepository.ts

- ✅ Temel CRUD tam implement edilmiş
- ✅ `findById`, `findAll`, `findByStatus`, `findByCity` çalışıyor
- ✅ `create`, `update`, `delete` çalışıyor
- ✅ `mapToEntity` helper metodu var
- ✅ Error handling iyi

#### CompanyRepository.ts

- ✅ Temel CRUD tam implement edilmiş
- ✅ `findByProgramId` çalışıyor
- ✅ Error handling iyi

### ❌ Eksiklikler

#### 1. Program-Consultant İlişkisi (user_programs tablosu)

```typescript
// ProgramRepository.ts'e eklenecek:
async addConsultant(programId: string, consultantId: string): Promise<Result<void>> {
  // user_programs tablosuna insert
  // role_in_program = 'consultant'
}

async removeConsultant(programId: string, consultantId: string): Promise<Result<void>> {
  // user_programs tablosundan delete veya is_active = false
}

async getConsultants(programId: string): Promise<Result<User[]>> {
  // user_programs JOIN users
  // WHERE program_id = ? AND role_in_program = 'consultant'
}

async findByManagerId(managerId: string): Promise<Result<Program[]>> {
  // programs WHERE program_manager_id = ?
}
```

#### 2. Search Fonksiyonu

```typescript
async search(query: string): Promise<Result<Program[]>> {
  // Full-text search on name, description
  // PostgreSQL: ilike veya pg_trgm
}
```

#### 3. UserRepository Yok

- ❌ `UserRepository.ts` dosyası yok
- ⚠️ User CRUD için gerekli

---

## 3️⃣ APPLICATION LAYER ANALİZİ

### ❌ Tamamen Eksik

#### Use Cases Klasörü

- 📁 `src/2-application/use-cases/` - **BOŞ**
- ❌ Hiç use case yok

**Oluşturulması Gerekenler:**

```
src/2-application/use-cases/
├── program/
│   ├── CreateProgramUseCase.ts
│   ├── UpdateProgramUseCase.ts
│   ├── DeleteProgramUseCase.ts
│   ├── GetProgramUseCase.ts
│   ├── ListProgramsUseCase.ts
│   ├── AssignManagerUseCase.ts
│   ├── ManageConsultantsUseCase.ts
│   └── ManageCompaniesUseCase.ts
├── company/
│   └── (Sprint 6'da)
└── user/
    └── (Sprint 5'te)
```

#### DTOs Klasörü

- 📁 `src/2-application/dto/` - **BOŞ**
- ❌ Hiç DTO yok (entity'lerde tanımlı, yanlış yer)

**Oluşturulması Gerekenler:**

```
src/2-application/dto/
├── program/
│   ├── CreateProgramDto.ts
│   ├── UpdateProgramDto.ts
│   └── ProgramFilterDto.ts
├── company/
│   └── (Sprint 6'da)
└── user/
    └── (Sprint 5'te)
```

#### Services

- ✅ `auth.service.ts` var (Sprint 2'den)
- ❌ `program.service.ts` yok (gerekli mi? Use Case'ler yeterli olabilir)

---

## 4️⃣ API LAYER ANALİZİ

### ✅ Mevcut Yapı

#### Programs API

- ✅ `/api/programs` (GET, POST) - **VAR**
- ✅ `/api/programs/[id]` (GET, PUT, DELETE) - **VAR**

#### Companies API

- ✅ `/api/companies` (GET, POST) - **VAR**
- ✅ `/api/companies/[id]` (GET, PUT, DELETE) - **VAR**

#### Auth API

- ✅ `/api/auth/signin` - **VAR**
- ✅ `/api/auth/signup` - **VAR**
- ✅ `/api/auth/signout` - **VAR**
- ✅ `/api/auth/me` - **VAR**

### ❌ Eksiklikler

#### 1. Program-Consultant İlişki Endpoint'leri

```
❌ /api/programs/[id]/consultants (GET, POST, DELETE)
   - GET: Danışman listesi
   - POST: Danışman ekle
   - DELETE: Danışman çıkar
```

#### 2. Program-Company İlişki Endpoint'leri

```
❌ /api/programs/[id]/companies (GET, POST, DELETE)
   - GET: Firma listesi
   - POST: Firma ekle
   - DELETE: Firma çıkar
```

#### 3. Program Filtreleme/Arama

```
⚠️ /api/programs?status=active&manager=xxx&search=yyy
   - Mevcut GET endpoint genişletilmeli
```

---

## 5️⃣ PRESENTATION LAYER ANALİZİ

### ❌ Tamamen Eksik

#### Pages

- ❌ `/programs` - Program listesi sayfası YOK
- ❌ `/programs/new` - Program oluşturma sayfası YOK
- ❌ `/programs/[id]` - Program detay sayfası YOK
- ❌ `/programs/[id]/edit` - Program düzenleme sayfası YOK
- ❌ `/admin` - Admin dashboard YOK
- ❌ `/admin/programs` - Admin program yönetimi YOK

**Mevcut:**

- ✅ `/dashboard` - Basit dashboard var (içerik minimal)
- ✅ `/login` - Login sayfası var
- ✅ `/components-demo` - UI demo sayfası var

#### Components

- 📁 `src/1-presentation/components/features/` - **BOŞ**
- ❌ Hiç feature component yok

**Oluşturulması Gerekenler:**

```
src/1-presentation/components/features/
└── program/
    ├── ProgramList.tsx
    ├── ProgramForm.tsx
    ├── ProgramCard.tsx
    ├── ProgramFilters.tsx
    ├── ConsultantManager.tsx
    └── CompanyManager.tsx
```

---

## 6️⃣ DATABASE SCHEMA ANALİZİ

### ✅ Mevcut Yapı

#### Tablolar

- ✅ `programs` - Tam ve doğru
- ✅ `users` - Tam ve doğru
- ✅ `companies` - Tam ve doğru
- ✅ `user_programs` - **Danışman atamaları için hazır!**
  - `user_id`, `program_id`, `role_in_program`
  - Unique constraint var
  - Index'ler var

### ⚠️ Potansiyel Sorunlar

#### 1. Company-Program İlişkisi

```sql
-- companies tablosunda:
program_id UUID NOT NULL REFERENCES programs(id)
```

- ⚠️ **One-to-Many:** Bir firma sadece bir programa ait
- ❓ **Soru:** Bir firma birden fazla programa katılabilir mi?
- 📋 **Karar:** Şimdilik One-to-Many yeterli (Sprint 4 için)

#### 2. Soft Delete

```sql
-- programs tablosunda deleted_at yok
-- companies tablosunda deleted_at yok
```

- ⚠️ Hard delete kullanılıyor
- 📋 **Öneri:** Soft delete eklenebilir (opsiyonel)

---

## 📋 KOPUKLUKLARIN ÖNCELİKLENDİRİLMESİ

### 🔴 KRİTİK (Sprint 4'te Mutlaka Yapılmalı)

#### 1. Application Layer - Use Cases (Öncelik: 1)

```
❌ CreateProgramUseCase.ts
❌ UpdateProgramUseCase.ts
❌ DeleteProgramUseCase.ts
❌ GetProgramUseCase.ts
❌ ListProgramsUseCase.ts
❌ AssignManagerUseCase.ts
❌ ManageConsultantsUseCase.ts
```

**Sebep:** Clean Architecture'ın kalbi. API'ler bunları kullanacak.

#### 2. Application Layer - DTOs (Öncelik: 2)

```
❌ CreateProgramDto.ts
❌ UpdateProgramDto.ts
❌ ProgramFilterDto.ts
```

**Sebep:** Entity'lerden ayrılmalı, validation için gerekli.

#### 3. Infrastructure - Repository Genişletme (Öncelik: 3)

```
❌ ProgramRepository.addConsultant()
❌ ProgramRepository.removeConsultant()
❌ ProgramRepository.getConsultants()
❌ ProgramRepository.findByManagerId()
❌ ProgramRepository.search()
```

**Sebep:** Danışman yönetimi için gerekli.

#### 4. API - İlişki Endpoint'leri (Öncelik: 4)

```
❌ /api/programs/[id]/consultants/route.ts
❌ /api/programs/[id]/companies/route.ts
```

**Sebep:** Frontend'den danışman/firma yönetimi için gerekli.

#### 5. Presentation - Program Pages (Öncelik: 5)

```
❌ /programs/page.tsx (Liste)
❌ /programs/new/page.tsx (Oluştur)
❌ /programs/[id]/page.tsx (Detay)
❌ /programs/[id]/edit/page.tsx (Düzenle)
```

**Sebep:** Kullanıcı arayüzü olmadan test edilemez.

#### 6. Presentation - Program Components (Öncelik: 6)

```
❌ ProgramList.tsx
❌ ProgramForm.tsx
❌ ProgramCard.tsx
❌ ProgramFilters.tsx
❌ ConsultantManager.tsx
❌ CompanyManager.tsx
```

**Sebep:** Sayfalar bu componentleri kullanacak.

### 🟡 ORTA (Sprint 4'te Yapılabilir)

#### 7. Domain - Business Logic (Öncelik: 7)

```
⚠️ Program.canEdit()
⚠️ Program.canDelete()
⚠️ Program.isActive()
```

**Sebep:** Use Case'lerde kullanılabilir ama zorunlu değil.

#### 8. Admin Dashboard (Öncelik: 8)

```
⚠️ /admin/page.tsx
⚠️ /admin/programs/page.tsx
```

**Sebep:** Master Admin için özel panel.

### 🟢 DÜŞÜK (Sonraki Sprint'lere Ertelenebilir)

#### 9. Error Handling (Öncelik: 9)

```
🟢 ProgramErrors.ts
🟢 ProgramNotFoundError
🟢 ProgramAlreadyExistsError
```

**Sebep:** Genel error handling şimdilik yeterli.

#### 10. Testing (Öncelik: 10)

```
🟢 Unit tests
🟢 Integration tests
```

**Sebep:** Sprint 21'de detaylı test coverage.

---

## 🎯 ÖNERİLEN İMPLEMENTASYON SIRASI

### Faz 1: Temel Altyapı (Gün 1-2)

1. ✅ DTOs oluştur (3 dosya)
2. ✅ Use Cases oluştur (7 dosya)
3. ✅ Repository genişlet (5 metod)
4. ✅ Error sınıfları oluştur (5 dosya)

**Çıktı:** Backend altyapısı hazır

### Faz 2: API Layer (Gün 2-3)

5. ✅ Mevcut API route'ları use case'lere bağla
6. ✅ Consultant endpoint'leri oluştur
7. ✅ Company endpoint'leri oluştur
8. ✅ Filtreleme/arama ekle

**Çıktı:** API tam çalışır

### Faz 3: UI Layer (Gün 3-5)

9. ✅ Program componentleri oluştur (6 dosya)
10. ✅ Program sayfaları oluştur (4 sayfa)
11. ✅ Admin dashboard oluştur (2 sayfa)

**Çıktı:** UI tam çalışır

### Faz 4: Test & Polish (Gün 5-6)

12. ✅ Manuel test
13. ✅ Bug fix
14. ✅ Documentation
15. ⏳ Unit tests (opsiyonel)

**Çıktı:** Sprint 4 tamamlandı

---

## 📊 TAHMINI SÜRE ANALİZİ

| Faz            | Görev Sayısı | Tahmini Süre | Zorluk    |
| -------------- | ------------ | ------------ | --------- |
| Faz 1: Altyapı | 15 dosya     | 6 saat       | 🟡 Orta   |
| Faz 2: API     | 4 endpoint   | 4 saat       | 🟡 Orta   |
| Faz 3: UI      | 12 dosya     | 8 saat       | 🔴 Yüksek |
| Faz 4: Test    | -            | 4 saat       | 🟢 Düşük  |

**Toplam:** ~22 saat (3 gün yoğun çalışma)

---

## 🚨 RİSKLER VE ENGELLER

### 1. DTOs Entity'lerde Tanımlı

**Risk:** DTO'ları taşırken import path'ler bozulabilir  
**Çözüm:** Önce yeni DTO'ları oluştur, sonra entity'lerden sil

### 2. IUserRepository Yok

**Risk:** Danışman listesi için User repository gerekli  
**Çözüm:** Sprint 4'te basit UserRepository oluştur (Sprint 5'te genişletilir)

### 3. user_programs Tablosu Test Edilmedi

**Risk:** İlişki sorguları çalışmayabilir  
**Çözüm:** Önce repository metodlarını test et

### 4. Soft Delete Yok

**Risk:** Silinen programlar geri getirilemez  
**Çözüm:** Şimdilik hard delete kullan, Sprint 22'de soft delete ekle

---

## ✅ SONUÇ VE ÖNERİLER

### Mevcut Durum

- ✅ Domain ve Infrastructure temeli sağlam
- ⚠️ Application layer tamamen eksik
- ❌ Presentation layer tamamen eksik
- ⚠️ API'ler temel seviyede

### Öncelikli Aksiyonlar

1. **Use Cases oluştur** - En kritik eksiklik
2. **DTOs taşı** - Clean Architecture için gerekli
3. **Repository genişlet** - İlişki yönetimi için
4. **UI oluştur** - Test için gerekli

### Başarı Kriterleri

- [ ] Tüm use case'ler implement edildi
- [ ] API'ler use case'leri kullanıyor
- [ ] Program CRUD tam çalışıyor
- [ ] Danışman ekleme/çıkarma çalışıyor
- [ ] UI responsive ve kullanılabilir

---

**Analiz Tamamlandı:** 29 Ekim 2025  
**Sonraki Adım:** Faz 1 - Temel Altyapı implementasyonuna başla  
**Tahmini Tamamlanma:** 1 Kasım 2025
