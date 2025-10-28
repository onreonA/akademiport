# 🔐 Sprint 5: Authentication Migration Guide

## ✅ Tamamlanan İşlemler

### 1. Proxy.ts Güncellendi

- ✅ Geçici bypass'lar kaldırıldı (`/dashboard`, `/api/programs`, `/api/companies`)
- ✅ Auth pages eklendi (`/register`, `/forgot-password`, `/reset-password`, `/verify-email`)
- ✅ `/api/auth` endpoints public yapıldı

### 2. Auth Helper Oluşturuldu

- ✅ `/src/4-infrastructure/api/helpers/auth.ts`
- ✅ `getAuthenticatedUser()` - Request'ten user bilgisi al
- ✅ `requireAuth()` - Auth zorunlu endpoint'ler için

### 3. UI Components & Pages

- ✅ 7 User Component (UserCard, UserFilters, UserForm, vb.)
- ✅ 5 User Page (List, Detail, Create, Edit, Profile)
- ✅ 4 Auth Page (Register, Forgot Password, Reset Password, Verify Email)

## ⚠️ Kalan İşlemler (Faz I - Test & Bug Fix)

### API Routes'ları Güncelle

Tüm API routes'larda mock user'ları kaldır ve gerçek auth kullan:

**Örnek Güncelleme:**

```typescript
// ❌ ESKİ (Mock)
const userId = 'mock-user-id';
const userRole = UserRole.MASTER_ADMIN;

// ✅ YENİ (Real Auth)
import { requireAuth } from '@/infrastructure/api/helpers/auth';

const user = await requireAuth(request);
const userId = user.id;
const userRole = user.role as UserRole;
```

**Güncellenecek Dosyalar:**

1. `/api/programs/route.ts` (GET, POST)
2. `/api/programs/[id]/route.ts` (GET, PATCH, DELETE)
3. `/api/programs/[id]/consultants/route.ts`
4. `/api/programs/[id]/consultants/[consultantId]/route.ts`
5. `/api/programs/[id]/manager/route.ts`
6. `/api/programs/search/route.ts`
7. `/api/users/route.ts` (GET, POST)
8. `/api/users/[id]/route.ts` (GET, PATCH, DELETE)
9. `/api/users/[id]/role/route.ts`
10. `/api/users/[id]/program/route.ts`
11. `/api/users/[id]/program/[programId]/route.ts`
12. `/api/users/[id]/password/route.ts`
13. `/api/users/[id]/profile/route.ts`
14. `/api/companies/route.ts`
15. `/api/companies/[id]/route.ts`

### Test Senaryoları

#### 1. Authentication Flow

- [ ] Register yeni kullanıcı
- [ ] Email verification
- [ ] Login başarılı
- [ ] Login başarısız (wrong password)
- [ ] Logout
- [ ] Forgot password
- [ ] Reset password

#### 2. Authorization

- [ ] Authenticated user dashboard'a erişebilir
- [ ] Unauthenticated user login'e yönlendirilir
- [ ] MASTER_ADMIN tüm işlemleri yapabilir
- [ ] PROGRAM_MANAGER sadece kendi programlarını görebilir
- [ ] COMPANY_USER sadece kendi firmasını görebilir

#### 3. API Endpoints

- [ ] GET /api/programs (auth required)
- [ ] POST /api/programs (auth required, role check)
- [ ] GET /api/users (auth required, role check)
- [ ] POST /api/users (auth required, role check)
- [ ] PATCH /api/users/[id] (auth required, ownership check)

#### 4. UI Components

- [ ] UserCard render
- [ ] UserFilters çalışıyor
- [ ] UserForm validation
- [ ] ProgramCard render
- [ ] ProgramFilters çalışıyor

#### 5. Pages

- [ ] /dashboard/programs - list görünüyor
- [ ] /dashboard/programs/new - form çalışıyor
- [ ] /dashboard/programs/[id] - detail görünüyor
- [ ] /dashboard/users - list görünüyor
- [ ] /dashboard/users/new - form çalışıyor
- [ ] /profile - profil görünüyor

## 🚀 Deployment Checklist

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database

- [ ] Migrations çalıştırıldı
- [ ] Seed data eklendi
- [ ] RLS policies aktif

### Next.js

- [ ] `npm run build` başarılı
- [ ] `npm run type-check` hatasız
- [ ] `npm run lint` hatasız

## 📝 Notlar

### Mock User Kullanımı

Sprint 4 ve Sprint 5'in ilk fazlarında mock user kullanıldı:

- `userId = 'mock-user-id'`
- `userRole = UserRole.MASTER_ADMIN`

Bu, UI ve business logic'i test etmek için geçici bir çözümdü.

### Real Auth Migration

Faz H'de:

1. `proxy.ts` güncellendi (bypass'lar kaldırıldı)
2. Auth helper oluşturuldu
3. Auth pages eklendi

Faz I'de:

1. Tüm API routes güncellenecek
2. Test senaryoları çalıştırılacak
3. Bug fix yapılacak

## 🎯 Sonraki Adımlar

1. **Faz I: Test & Bug Fix**
   - API routes'ları güncelle
   - Test senaryolarını çalıştır
   - Bug'ları düzelt
   - Production'a hazırla

2. **Sprint 6: Company Management**
   - Company CRUD
   - Company users
   - Company programs

3. **Sprint 7: Content Management**
   - Modules
   - Lessons
   - Resources

## 🔗 İlgili Dosyalar

- `/src/proxy.ts` - Route protection
- `/src/4-infrastructure/api/helpers/auth.ts` - Auth helpers
- `/src/5-shared/hooks/useAuth.ts` - Client-side auth hook
- `/src/2-application/services/auth.service.ts` - Auth service
- `/src/app/api/auth/` - Auth endpoints
