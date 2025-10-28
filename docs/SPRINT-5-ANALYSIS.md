# 📋 Sprint 5: Authentication & User Management - Detaylı Analiz

**Tarih:** 28 Ekim 2025  
**Sprint:** 5 - Kullanıcı Yönetimi  
**Durum:** 🔍 Analiz Aşaması

---

## 🎯 Sprint 5 Hedefi

Multi-role kullanıcı yönetimi sistemini tamamlamak ve geçici authentication bypass'ları kaldırarak gerçek authentication flow'u devreye almak.

---

## 📊 MEVCUT DURUM ANALİZİ

### ✅ TAMAMLANMIŞ BÖLÜMLER

#### 1. Authentication Altyapısı (%80 Tamamlandı)

**Mevcut:**

- ✅ `AuthService` (src/2-application/services/auth.service.ts)
  - signUp, signIn, signOut
  - getCurrentUser
  - resetPasswordRequest, updatePassword
- ✅ `useAuth` Hook (src/5-shared/hooks/useAuth.ts)
  - Client-side auth state management
  - signIn, signOut, checkUser
- ✅ API Routes:
  - `/api/auth/signin` - Login endpoint
  - `/api/auth/signup` - Register endpoint
  - `/api/auth/signout` - Logout endpoint
  - `/api/auth/me` - Current user endpoint
- ✅ Login Page (`src/app/login/page.tsx`)
  - Form validation
  - Error handling
  - Demo credentials
- ✅ Proxy (src/proxy.ts)
  - Route protection
  - Supabase SSR integration
  - Redirect logic

**Eksikler:**

- ❌ Register sayfası yok
- ❌ Password reset sayfaları yok
- ❌ Email verification flow yok
- ❌ Session refresh logic eksik
- ❌ Auth error handling iyileştirilebilir

#### 2. User Entity & Domain (%100 Tamamlandı)

**Mevcut:**

- ✅ User Entity (src/3-domain/entities/User.ts)
  - User interface
  - UserSettings interface
  - AuthUser interface
- ✅ UserRole Enum (src/3-domain/enums/UserRole.ts)
  - MASTER_ADMIN
  - PROGRAM_MANAGER
  - CONSULTANT
  - COMPANY_ADMIN
  - COMPANY_USER

**Eksikler:**

- Yok! Domain layer tam.

#### 3. Database Schema (%100 Tamamlandı)

**Mevcut:**

- ✅ `users` tablosu
- ✅ `user_programs` tablosu (Many-to-Many)
- ✅ Supabase Auth entegrasyonu

---

### ❌ EKSİK BÖLÜMLER

#### 1. User DTOs (%0 - Hiç Yok)

**Gerekli DTOs:**

```typescript
// src/2-application/dto/user/
-CreateUserDto.ts -
  UpdateUserDto.ts -
  UserFilterDto.ts -
  ChangePasswordDto.ts -
  UpdateProfileDto.ts -
  AssignRoleDto.ts -
  AssignProgramDto.ts;
```

**Mevcut Durum:**

- DTO'lar geçici olarak inline tanımlanmış (auth.service.ts, API routes)
- Clean Architecture ihlali var
- Sprint 5'te düzeltilmeli

#### 2. User Repository (%0 - Hiç Yok)

**Gerekli:**

```typescript
// src/3-domain/interfaces/IUserRepository.ts
- findById(id: string)
- findAll()
- findByEmail(email: string)
- findByRole(role: UserRole)
- findByCompanyId(companyId: string)
- findByProgramId(programId: string)
- create(dto: CreateUserDto)
- update(id: string, dto: UpdateUserDto)
- delete(id: string)
- assignRole(userId: string, role: UserRole)
- assignProgram(userId: string, programId: string)
- removeProgram(userId: string, programId: string)
- getPrograms(userId: string)
- changePassword(userId: string, newPassword: string)
```

**Implementation:**

```typescript
// src/4-infrastructure/database/repositories/UserRepository.ts
- IUserRepository implementation
- Supabase queries
- Error handling
```

#### 3. User Use Cases (%0 - Hiç Yok)

**Gerekli Use Cases:**

```typescript
// src/2-application/use-cases/user/
1. CreateUserUseCase.ts
   - Authorization (MASTER_ADMIN, PROGRAM_MANAGER)
   - Validation
   - Email uniqueness check
   - Password strength check
   - Role assignment rules

2. UpdateUserUseCase.ts
   - Authorization (MASTER_ADMIN, PROGRAM_MANAGER, self)
   - Role-based field restrictions
   - Email change validation

3. DeleteUserUseCase.ts
   - Authorization (MASTER_ADMIN)
   - Soft delete
   - Cascade checks

4. GetUserUseCase.ts
   - Authorization (MASTER_ADMIN, PROGRAM_MANAGER, self)
   - Privacy rules

5. ListUsersUseCase.ts
   - Authorization (MASTER_ADMIN, PROGRAM_MANAGER)
   - Filtering (role, company, program, search)
   - Pagination
   - Sorting

6. ChangePasswordUseCase.ts
   - Authorization (self)
   - Old password verification
   - Password strength check

7. UpdateProfileUseCase.ts
   - Authorization (self)
   - Avatar upload
   - Bio, expertise areas, social links

8. AssignRoleUseCase.ts
   - Authorization (MASTER_ADMIN)
   - Role transition rules
   - Validation

9. AssignProgramUseCase.ts
   - Authorization (MASTER_ADMIN, PROGRAM_MANAGER)
   - Program existence check
   - Duplicate check

10. RemoveProgramUseCase.ts
    - Authorization (MASTER_ADMIN, PROGRAM_MANAGER)
    - Cascade effects check
```

#### 4. User API Routes (%0 - Hiç Yok)

**Gerekli Endpoints:**

```typescript
// src/app/api/users/
GET    /api/users              - List users (with filters)
POST   /api/users              - Create user
GET    /api/users/[id]         - Get user by ID
PATCH  /api/users/[id]         - Update user
DELETE /api/users/[id]         - Delete user

POST   /api/users/[id]/role    - Assign role
POST   /api/users/[id]/program - Assign program
DELETE /api/users/[id]/program/[programId] - Remove program
GET    /api/users/[id]/programs - Get user programs

PATCH  /api/users/[id]/password - Change password
PATCH  /api/users/[id]/profile  - Update profile
```

#### 5. User UI Components (%0 - Hiç Yok)

**Gerekli Components:**

```typescript
// src/1-presentation/components/features/users/
1. UserCard.tsx
   - User summary card
   - Avatar, name, role, email
   - Quick actions

2. UserFilters.tsx
   - Search box
   - Role filter
   - Company filter
   - Program filter
   - Status filter (active/inactive)

3. UserForm.tsx
   - Create/Edit form
   - React Hook Form + Zod
   - Email, fullName, phone, role
   - Company selection
   - Program assignment

4. UserRoleSelector.tsx
   - Role dropdown
   - Role descriptions
   - Permission preview

5. UserProgramList.tsx
   - Assigned programs list
   - Add/Remove program
   - Program details

6. UserProfileCard.tsx
   - Profile information
   - Avatar upload
   - Bio, expertise, social links

7. ChangePasswordForm.tsx
   - Old password
   - New password
   - Confirm password
   - Strength indicator
```

#### 6. User Pages (%0 - Hiç Yok)

**Gerekli Pages:**

```typescript
// src/app/dashboard/users/
1. page.tsx - User list page
   - UserFilters
   - UserCard grid/list
   - Pagination
   - Create button

2. [id]/page.tsx - User detail page
   - UserProfileCard
   - UserProgramList
   - Edit button
   - Delete button

3. new/page.tsx - Create user page
   - UserForm
   - Role selection
   - Program assignment

4. [id]/edit/page.tsx - Edit user page
   - UserForm (pre-filled)
   - Role change
   - Program management

// src/app/profile/
1. page.tsx - Current user profile
   - UserProfileCard
   - UpdateProfileForm
   - ChangePasswordForm
```

#### 7. Authentication Pages (Eksik Sayfalar)

**Gerekli:**

```typescript
// src/app/register/
1. page.tsx - Register page
   - Registration form
   - Email, password, fullName
   - Terms & conditions

// src/app/auth/
1. forgot-password/page.tsx - Password reset request
   - Email input
   - Send reset link

2. reset-password/page.tsx - Password reset
   - New password
   - Confirm password
   - Token validation

3. verify-email/page.tsx - Email verification
   - Token validation
   - Success/Error message
```

---

## 🔧 GEÇİCİ BYPASS'LAR (Kaldırılacak)

### proxy.ts'deki Geçici Public Paths:

```typescript
// ❌ KALDRILACAK:
request.nextUrl.pathname.startsWith('/dashboard'); // Sprint 4 test için
request.nextUrl.pathname.startsWith('/api/programs'); // Sprint 4 test için
request.nextUrl.pathname.startsWith('/api/companies'); // Sprint 4 test için
```

### API Routes'daki Mock User:

```typescript
// ❌ KALDRILACAK:
// src/app/api/programs/route.ts
const userId = 'mock-user-id';
const userRole = UserRole.MASTER_ADMIN;

// ✅ YENİ:
const authUser = await getCurrentUser(); // Real user from session
if (!authUser) return unauthorized();
```

---

## 📋 SPRINT 5 GÖREV LİSTESİ

### Faz A: DTOs Oluşturma (1-2 saat)

1. ✅ `src/2-application/dto/user/` klasörü oluştur
2. ✅ CreateUserDto.ts
3. ✅ UpdateUserDto.ts
4. ✅ UserFilterDto.ts
5. ✅ ChangePasswordDto.ts
6. ✅ UpdateProfileDto.ts
7. ✅ AssignRoleDto.ts
8. ✅ AssignProgramDto.ts
9. ✅ index.ts (exports)

### Faz B: Repository Layer (2-3 saat)

1. ✅ IUserRepository.ts interface
2. ✅ UserRepository.ts implementation
3. ✅ Test basic CRUD operations

### Faz C: Use Cases (4-5 saat)

1. ✅ CreateUserUseCase.ts
2. ✅ UpdateUserUseCase.ts
3. ✅ DeleteUserUseCase.ts
4. ✅ GetUserUseCase.ts
5. ✅ ListUsersUseCase.ts
6. ✅ ChangePasswordUseCase.ts
7. ✅ UpdateProfileUseCase.ts
8. ✅ AssignRoleUseCase.ts
9. ✅ AssignProgramUseCase.ts
10. ✅ RemoveProgramUseCase.ts
11. ✅ index.ts (exports)

### Faz D: API Routes (2-3 saat)

1. ✅ /api/users/route.ts (GET, POST)
2. ✅ /api/users/[id]/route.ts (GET, PATCH, DELETE)
3. ✅ /api/users/[id]/role/route.ts (POST)
4. ✅ /api/users/[id]/program/route.ts (POST, GET)
5. ✅ /api/users/[id]/program/[programId]/route.ts (DELETE)
6. ✅ /api/users/[id]/password/route.ts (PATCH)
7. ✅ /api/users/[id]/profile/route.ts (PATCH)

### Faz E: UI Components (3-4 saat)

1. ✅ UserCard.tsx
2. ✅ UserFilters.tsx
3. ✅ UserForm.tsx
4. ✅ UserRoleSelector.tsx
5. ✅ UserProgramList.tsx
6. ✅ UserProfileCard.tsx
7. ✅ ChangePasswordForm.tsx

### Faz F: Pages (2-3 saat)

1. ✅ /dashboard/users/page.tsx
2. ✅ /dashboard/users/[id]/page.tsx
3. ✅ /dashboard/users/new/page.tsx
4. ✅ /dashboard/users/[id]/edit/page.tsx
5. ✅ /profile/page.tsx

### Faz G: Authentication Pages (2 saat)

1. ✅ /register/page.tsx
2. ✅ /auth/forgot-password/page.tsx
3. ✅ /auth/reset-password/page.tsx
4. ✅ /auth/verify-email/page.tsx

### Faz H: Geçici Bypass'ları Kaldırma (1 saat)

1. ✅ proxy.ts'den geçici public path'leri kaldır
2. ✅ API routes'dan mock user'ları kaldır
3. ✅ getCurrentUser() helper oluştur
4. ✅ Tüm API routes'a gerçek auth ekle

### Faz I: Test & Bug Fix (2-3 saat)

1. ✅ TypeScript kontrol
2. ✅ Login/Logout test
3. ✅ User CRUD test
4. ✅ Role assignment test
5. ✅ Program assignment test
6. ✅ Profile update test
7. ✅ Password change test

---

## 📊 TOPLAM TAHMİNİ SÜRE

| Faz        | Görev           | Tahmini Süre   |
| ---------- | --------------- | -------------- |
| A          | DTOs            | 1-2 saat       |
| B          | Repository      | 2-3 saat       |
| C          | Use Cases       | 4-5 saat       |
| D          | API Routes      | 2-3 saat       |
| E          | UI Components   | 3-4 saat       |
| F          | Pages           | 2-3 saat       |
| G          | Auth Pages      | 2 saat         |
| H          | Bypass Kaldırma | 1 saat         |
| I          | Test & Bug Fix  | 2-3 saat       |
| **TOPLAM** | **9 Faz**       | **19-26 saat** |

---

## 🎯 KABUL KRİTERLERİ

### Fonksiyonel Kriterler:

- [ ] Master Admin kullanıcı oluşturabilir
- [ ] Master Admin kullanıcı düzenleyebilir
- [ ] Master Admin kullanıcı silebilir
- [ ] Master Admin rol atayabilir
- [ ] Master Admin/Program Manager programa kullanıcı atayabilir
- [ ] Kullanıcı kendi profilini güncelleyebilir
- [ ] Kullanıcı şifresini değiştirebilir
- [ ] Login/Logout çalışıyor
- [ ] Register çalışıyor
- [ ] Password reset çalışıyor
- [ ] Email verification çalışıyor
- [ ] Role-based access control çalışıyor

### Teknik Kriterler:

- [ ] Tüm DTOs Clean Architecture'e uygun
- [ ] Tüm Use Cases authorization içeriyor
- [ ] Tüm API routes gerçek auth kullanıyor
- [ ] Geçici bypass'lar kaldırıldı
- [ ] TypeScript hatasız
- [ ] Linter hatasız
- [ ] UI responsive
- [ ] Dark mode çalışıyor

---

## 🚨 RİSKLER VE BAĞIMLILIKLAR

### Riskler:

1. **Yüksek Risk:** Geçici bypass'ları kaldırınca mevcut Sprint 4 UI'ı bozulabilir
   - **Çözüm:** Önce gerçek auth'u ekle, sonra bypass'ları kaldır

2. **Orta Risk:** Role-based authorization karmaşık olabilir
   - **Çözüm:** Her use case'de açık authorization logic

3. **Düşük Risk:** Email verification Supabase'de farklı çalışabilir
   - **Çözüm:** Supabase dokümantasyonunu takip et

### Bağımlılıklar:

- ✅ Sprint 2 (Database & Auth) - Tamamlandı
- ✅ Sprint 3 (UI Foundation) - Tamamlandı
- ✅ Sprint 4 (Program Management) - Tamamlandı
- ⚠️ Supabase projesi aktif olmalı
- ⚠️ Environment variables doğru olmalı

---

## 📝 NOTLAR

### Sprint 4'ten Öğrenilenler:

1. **DTO'ları baştan doğru yere koy** - Inline tanımlamak sonra sorun çıkarıyor
2. **Use Case'leri küçük tut** - Her use case tek sorumluluk
3. **Authorization'ı baştan ekle** - Sonradan eklemek zor
4. **Test ederken ilerle** - Sonunda toplu test yapmak riskli

### Sprint 5 için Öneriler:

1. **Faz faz ilerle** - Her fazı tamamla, test et, commit et
2. **DTOs ile başla** - Temeli sağlam at
3. **Use Case'lerde authorization'a dikkat** - Her use case kendi auth'unu yapsın
4. **UI'ı sona bırak** - Backend hazır olunca UI kolay gelir
5. **Bypass'ları en son kaldır** - Önce gerçek auth'u ekle

---

## 🎯 SONRAKİ ADIM

**Seçenek A: Adım Adım İmplementasyon** (Önerilen)

- Her fazı onayınızla ilerleyelim
- Testlerle birlikte gidelim
- Sorun çıkarsa hemen düzeltelim

**Başlangıç:** Faz A - DTOs Oluşturma

**Onayınızı bekliyorum!** 🚀
