# JWT Kimlik Doğrulama Geçiş Planı

## 📊 Durum Özeti

| Kategori | Dosya Sayısı | Oran |
|----------|--------------|------|
| ✅ JWT Kimlik Doğrulama | 38 | 21% |
| 🔶 Cookie Kimlik Doğrulama | 44 | 24% |
| 🔷 Header Kimlik Doğrulama | 61 | 33% |
| ⚠️ Kimlik Doğrulama Yok | 42 | 23% |
| **Toplam** | **185** | **100%** |

## 🎯 Öncelikli Dosyalar (Cookie Auth → JWT)

### 1. Kritik Admin API'leri (3 dosya)
- [x] `app/api/admin/bulk-date-operations/route.ts` - Elle düzeltildi
- [ ] `app/api/admin/bulk-operations/route.ts`
- [ ] `app/api/admin/check-missing-company-users/route.ts`

### 2. Firma API'leri (11 dosya)
- [ ] `app/api/firma/assigned-projects/route.ts`
- [ ] `app/api/firma/projects/[id]/dates/route.ts`
- [ ] `app/api/firma/sub-project-reports/[id]/route.ts`
- [ ] `app/api/firma/sub-projects/[id]/dates/route.ts`
- [ ] `app/api/firma/sub-projects/[id]/route.ts`
- [ ] `app/api/firma/tasks/[id]/comment/route.ts`
- [ ] `app/api/firma/tasks/[id]/dates/route.ts`
- [ ] `app/api/firma/tasks/[id]/route.ts`
- [ ] `app/api/firma/tasks/[id]/upload/route.ts`
- [ ] `app/api/firma/tasks/route.ts`

### 3. Consultant API'leri (5 dosya)
- [ ] `app/api/consultant/pending-tasks/route.ts`
- [ ] `app/api/consultant/sub-project-reports/[id]/route.ts`
- [ ] `app/api/consultant/sub-project-reports/route.ts`
- [ ] `app/api/consultant/tasks/[id]/approve/route.ts`
- [ ] `app/api/consultant/tasks/[id]/reject/route.ts`

### 4. Proje Yönetimi API'leri (13 dosya)
- [ ] `app/api/projects/[id]/assign-companies/route.ts`
- [ ] `app/api/projects/[id]/dates/[companyId]/route.ts`
- [ ] `app/api/projects/[id]/dates/bulk-sub-projects/route.ts`
- [ ] `app/api/projects/[id]/dates/bulk-tasks/route.ts`
- [ ] `app/api/projects/[id]/dates/hierarchical/route.ts`
- [ ] `app/api/projects/[id]/dates/route.ts`
- [ ] `app/api/projects/[id]/progress/route.ts`
- [ ] `app/api/projects/[id]/progress/update/route.ts`
- [ ] `app/api/projects/[id]/route.ts`
- [ ] `app/api/projects/[id]/sub-projects/route.ts`
- [ ] `app/api/projects/[id]/tasks/route.ts`

### 5. Alt Proje ve Görev API'leri (9 dosya)
- [ ] `app/api/sub-projects/[id]/assign/route.ts`
- [ ] `app/api/sub-projects/[id]/completion-status/[companyId]/route.ts`
- [ ] `app/api/sub-projects/[id]/dates/route.ts`
- [ ] `app/api/sub-projects/[id]/route.ts`
- [ ] `app/api/sub-projects/[id]/tasks/route.ts`
- [ ] `app/api/tasks/[id]/dates/route.ts`
- [ ] `app/api/tasks/[id]/route.ts`

### 6. Diğer API'ler (3 dosya)
- [ ] `app/api/companies/route.ts`
- [ ] `app/api/notification-settings/route.ts`
- [ ] `app/api/progress/dashboard/route.ts`

## 🎯 Öncelikli Dosyalar (Header Auth → JWT)

### 1. Eğitim API'leri (7 dosya)
- [ ] `app/api/education-sets/[id]/route.ts`
- [ ] `app/api/education-sets/assign/route.ts`
- [ ] `app/api/education-sets/route.ts`
- [ ] `app/api/videos/[id]/route.ts`
- [ ] `app/api/videos/route.ts`
- [ ] `app/api/video-watch-progress/route.ts`

### 2. Döküman API'leri (8 dosya)
- [ ] `app/api/documents/[id]/download/route.ts`
- [ ] `app/api/documents/[id]/route.ts`
- [ ] `app/api/documents/assign/remove/route.ts`
- [ ] `app/api/documents/assign/route.ts`
- [ ] `app/api/documents/assignments/[id]/route.ts`
- [ ] `app/api/documents/assignments/route.ts`
- [ ] `app/api/documents/route.ts`
- [ ] `app/api/documents/upload/route.ts`
- [ ] `app/api/document-categories/route.ts`
- [ ] `app/api/document-progress/route.ts`

### 3. Haber API'leri (5 dosya)
- [ ] `app/api/news/[id]/comments/route.ts`
- [ ] `app/api/news/[id]/interactions/route.ts`
- [ ] `app/api/news/[id]/route.ts`
- [ ] `app/api/news/categories/route.ts`
- [ ] `app/api/news/experts/route.ts`
- [ ] `app/api/news/route.ts`

### 4. Randevu API'leri (6 dosya)
- [ ] `app/api/appointments/[id]/notes/[noteId]/route.ts`
- [ ] `app/api/appointments/[id]/notes/route.ts`
- [ ] `app/api/appointments/[id]/revise/route.ts`
- [ ] `app/api/appointments/[id]/route.ts`
- [ ] `app/api/appointments/route.ts`

### 5. Firma Yönetimi API'leri (5 dosya)
- [ ] `app/api/companies/[id]/route.ts`
- [ ] `app/api/company/education-assignments/route.ts`
- [ ] `app/api/company/reports/route.ts`
- [ ] `app/api/firma/date-stats/route.ts`
- [ ] `app/api/firma/project-date-info/route.ts`
- [ ] `app/api/firma/sub-project-reports/route.ts`
- [ ] `app/api/firma/task-date-info/route.ts`
- [ ] `app/api/firma/tasks/[id]/complete/route.ts`
- [ ] `app/api/firma/users/[id]/route.ts`
- [ ] `app/api/firma/users/route.ts`

## ⏭️ Düşük Öncelikli (Kimlik Doğrulama Yok - Public veya İç API'ler)

Bu endpoint'ler ya public endpoint'ler (career, forum) ya da kimlik doğrulama için kullanılan endpoint'ler (auth/*). Bu dosyalar için JWT geçişi gerekli değil veya daha düşük öncelikli:

- `app/api/auth/*` - Kimlik doğrulama için kullanılan endpoint'ler
- `app/api/career/*` - Public kariyer başvuruları
- `app/api/forum/*` - Public forum endpoint'leri
- `app/api/gamification/achievements/route.ts` - Public başarımlar
- `app/api/hr-pool/*` - İç HR endpoint'leri
- `app/api/notifications/*` - Bildirim sistemleri
- `app/api/socket/route.ts` - WebSocket endpoint'i

## 🚀 Geçiş Stratejisi

### Faze 1: Kritik Cookie Auth Dosyalar (Toplam: 44 dosya)
1. Admin bulk operations (3 dosya) - ✅ 1/3 tamamlandı
2. Firma API'leri (11 dosya)
3. Consultant API'leri (5 dosya)
4. Proje yönetimi API'leri (13 dosya)
5. Alt proje ve görev API'leri (9 dosya)
6. Diğer API'ler (3 dosya)

### Faze 2: Header Auth Dosyalar (Toplam: 61 dosya)
1. Eğitim API'leri (7 dosya)
2. Döküman API'leri (10 dosya)
3. Haber API'leri (6 dosya)
4. Randevu API'leri (5 dosya)
5. Firma yönetimi API'leri (10 dosya)
6. Diğer API'ler (23 dosya)

### Faze 3: Test ve Doğrulama
1. Her kategori güncellemesinden sonra test
2. Build kontrolü
3. Lint kontrolü
4. Fonksiyonel test

## 📝 Güncelleme Şablonu

```typescript
// Eski
const userEmail = request.cookies.get('auth-user-email')?.value;
const userRole = request.cookies.get('auth-user-role')?.value;

if (!userEmail || !['admin'].includes(userRole || '')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Yeni
const user = await requireAdmin(request); // veya requireCompany, requireAuth

// user.id, user.email, user.role, user.company_id kullanılabilir
```

## 🔄 Tahmini Süre

- **Manuel güncelleme:** 44 cookie + 61 header = 105 dosya × 2-3 dk = 3.5-5 saat
- **Otomatik script (riskli):** 105 dosya × 30 saniye = 50 dakika (ancak hataları düzeltmek 2-3 saat ekler)
- **Hibrit yaklaşım (önerilen):** Kritik 20 dosyayı manuel (1 saat) + geri kalanı script (2 saat) = 3 saat

## ✅ Tamamlanan Dosyalar

- `app/api/admin/dashboard-stats/route.ts`
- `app/api/firma/dashboard-stats/route.ts`
- `app/api/firma/me/route.ts`
- `app/api/firma/progress/route.ts`
- `app/api/firma/projects/[id]/route.ts`
- `app/api/projects/route.ts`
- `app/api/tasks/[id]/complete/route.ts`
- `app/api/admin/bulk-date-operations/route.ts`
