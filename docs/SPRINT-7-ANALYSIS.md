# 📋 Sprint 7: Consultant Management - Detaylı Analiz

**Tarih:** 29 Ekim 2025  
**Sprint:** 7 / 23  
**Süre:** 1 hafta  
**Durum:** 🏃 Başlıyor

---

## 🎯 Sprint Hedefi

**Ana Hedef:** Danışman (Consultant) paneli ve yönetim sistemi tam çalışır hale gelecek.

**Alt Hedefler:**

1. Consultant dashboard oluşturulacak
2. Program seçici component çalışacak
3. Consultant-Program ilişkisi yönetilecek
4. Consultant-Company görüntüleme çalışacak
5. Program bazlı filtreleme aktif olacak

---

## 📊 Mevcut Durum Analizi

### ✅ Tamamlanmış Özellikler (Sprint 1-6)

**Backend:**

- ✅ Database schema (programs, users, companies, user_programs)
- ✅ Authentication & Authorization
- ✅ Program Repository & Use Cases
- ✅ User Repository & Use Cases
- ✅ Company Repository & Use Cases
- ✅ API Routes (Programs, Users, Companies)

**Frontend:**

- ✅ Atomic Design System (Atoms, Molecules, Organisms)
- ✅ Program Management UI
- ✅ User Management UI
- ✅ Company Management UI
- ✅ Dashboard (basic)

### 🔍 Eksik Özellikler (Sprint 7'de Yapılacak)

**Backend:**

- ❌ Consultant-specific API endpoints
- ❌ Consultant dashboard data aggregation
- ❌ Program-based filtering logic

**Frontend:**

- ❌ Consultant Dashboard
- ❌ Program Selector Component
- ❌ Consultant-specific Company List
- ❌ Consultant-specific Statistics

---

## 🗂️ Sprint 7 Görev Listesi

### 📦 Faz A: Consultant DTOs & Interfaces (30 dakika)

**Hedef:** Consultant'a özel veri transfer objeleri oluşturmak

**Dosyalar:**

1. `src/2-application/dto/consultant/ConsultantDashboardDto.ts`
   - Dashboard istatistikleri için DTO
   - Program bazlı firma sayısı
   - Toplam görev sayısı (gelecek sprintler için)

2. `src/2-application/dto/consultant/ConsultantProgramDto.ts`
   - Consultant'ın atandığı programlar
   - Program detayları + firma sayısı

3. `src/2-application/dto/consultant/index.ts`
   - Barrel export

**Kabul Kriterleri:**

- ✅ DTOs TypeScript ile tip güvenli
- ✅ Zod validation schemas hazır
- ✅ Export structure düzgün

---

### 📦 Faz B: Consultant Use Cases (1 saat)

**Hedef:** Consultant'a özel business logic oluşturmak

**Dosyalar:**

1. `src/2-application/use-cases/consultant/GetConsultantDashboardUseCase.ts`
   - Consultant dashboard verileri
   - Program bazlı istatistikler
   - Firma sayıları

2. `src/2-application/use-cases/consultant/ListConsultantProgramsUseCase.ts`
   - Consultant'ın atandığı programlar
   - Her program için firma sayısı

3. `src/2-application/use-cases/consultant/ListConsultantCompaniesUseCase.ts`
   - Belirli bir programdaki firmalar
   - Consultant'ın erişebildiği firmalar

4. `src/2-application/use-cases/consultant/index.ts`
   - Barrel export

**Kabul Kriterleri:**

- ✅ Use cases Clean Architecture'e uygun
- ✅ Authorization kontrolleri yapılıyor
- ✅ Sadece atandığı programları görebiliyor
- ✅ Sadece atandığı firmaları görebiliyor

---

### 📦 Faz C: Consultant API Routes (1 saat)

**Hedef:** Consultant'a özel API endpoint'leri oluşturmak

**Dosyalar:**

1. `src/app/api/consultant/dashboard/route.ts`
   - GET: Dashboard verileri
   - Authentication required
   - Role: CONSULTANT

2. `src/app/api/consultant/programs/route.ts`
   - GET: Consultant'ın programları
   - Query params: sortBy, sortOrder

3. `src/app/api/consultant/programs/[programId]/companies/route.ts`
   - GET: Program'daki firmalar
   - Pagination support

**Kabul Kriterleri:**

- ✅ API routes çalışıyor
- ✅ Authentication kontrol ediliyor
- ✅ Authorization doğru çalışıyor
- ✅ Error handling yapılıyor

---

### 📦 Faz D: Program Selector Component (1.5 saat)

**Hedef:** Program seçici component oluşturmak

**Dosyalar:**

1. `src/1-presentation/components/features/consultant/ProgramSelector.tsx`
   - Dropdown/Select component
   - Consultant'ın programlarını listeler
   - Seçilen program'ı context'e kaydeder
   - Program değiştiğinde event trigger

2. `src/1-presentation/components/features/consultant/ProgramSelector.stories.tsx`
   - Storybook documentation

3. `src/5-shared/contexts/ConsultantProgramContext.tsx`
   - Selected program state management
   - Program değiştirme fonksiyonu

**Kabul Kriterleri:**

- ✅ Component render oluyor
- ✅ Program listesi geliyor
- ✅ Program seçilebiliyor
- ✅ Context güncelleniyor
- ✅ Storybook'ta görünüyor

---

### 📦 Faz E: Consultant Dashboard UI (2 saat)

**Hedef:** Consultant dashboard sayfası oluşturmak

**Dosyalar:**

1. `src/app/consultant-dashboard/page.tsx`
   - Ana dashboard sayfası
   - Program selector
   - İstatistik kartları
   - Firma listesi (özet)

2. `src/1-presentation/components/features/consultant/ConsultantStats.tsx`
   - İstatistik kartları component
   - Program bazlı istatistikler

3. `src/1-presentation/components/features/consultant/ConsultantCompanyList.tsx`
   - Firma listesi component
   - Program bazlı filtreleme
   - Firma kartları

4. `src/1-presentation/components/features/consultant/index.ts`
   - Barrel export

**Kabul Kriterleri:**

- ✅ Dashboard render oluyor
- ✅ Program seçici çalışıyor
- ✅ İstatistikler gösteriliyor
- ✅ Firma listesi gösteriliyor
- ✅ Program değiştiğinde liste güncelleniyor

---

### 📦 Faz F: Consultant Company Detail (1 saat)

**Hedef:** Consultant'ın firma detay sayfası

**Dosyalar:**

1. `src/app/consultant-dashboard/companies/[id]/page.tsx`
   - Firma detay sayfası
   - Firma bilgileri
   - Firma istatistikleri
   - Quick actions

2. `src/1-presentation/components/features/consultant/ConsultantCompanyDetail.tsx`
   - Firma detay component
   - Tabs: Overview, Projects (gelecek), Training (gelecek)

**Kabul Kriterleri:**

- ✅ Detay sayfası açılıyor
- ✅ Firma bilgileri gösteriliyor
- ✅ Sadece atandığı firmaları görebiliyor
- ✅ Authorization çalışıyor

---

### 📦 Faz G: Navigation & Layout Updates (30 dakika)

**Hedef:** Consultant için navigation güncellemeleri

**Dosyalar:**

1. `src/1-presentation/components/ui/organisms/sidebar.tsx`
   - Consultant role için menu items
   - Dashboard, Companies, Programs (read-only)

2. `src/app/consultant-dashboard/layout.tsx`
   - Consultant dashboard layout
   - Sidebar + Header

**Kabul Kriterleri:**

- ✅ Sidebar'da Consultant menüleri görünüyor
- ✅ Layout çalışıyor
- ✅ Navigation doğru yönlendiriyor

---

### 📦 Faz H: Testing & Documentation (1 saat)

**Hedef:** Test ve dokümantasyon

**Dosyalar:**

1. `docs/SPRINT-7-SUMMARY.md`
   - Sprint özeti
   - Yapılan değişiklikler
   - API documentation
   - Component documentation

2. Manual testing checklist
   - Consultant login
   - Program seçimi
   - Firma listesi
   - Firma detayı
   - Authorization kontrolleri

**Kabul Kriterleri:**

- ✅ Tüm özellikler test edildi
- ✅ Dokümantasyon hazır
- ✅ Known issues listelendi

---

## 📊 Dosya ve Kod Tahmini

### Oluşturulacak Dosyalar

**Backend (8 dosya):**

- 3 DTO dosyası
- 4 Use Case dosyası
- 3 API Route dosyası

**Frontend (10 dosya):**

- 1 Context dosyası
- 6 Component dosyası
- 2 Page dosyası
- 1 Layout dosyası

**Documentation (1 dosya):**

- 1 Summary dosyası

**Toplam:** ~19 dosya, ~2500 satır kod

---

## 🔐 Authorization Matrix

| Role            | Dashboard | Programs    | Companies   | Company Detail |
| --------------- | --------- | ----------- | ----------- | -------------- |
| CONSULTANT      | ✅ Kendi  | ✅ Atandığı | ✅ Atandığı | ✅ Atandığı    |
| MASTER_ADMIN    | ✅ Tümü   | ✅ Tümü     | ✅ Tümü     | ✅ Tümü        |
| PROGRAM_MANAGER | ✅ Kendi  | ✅ Kendi    | ✅ Kendi    | ✅ Kendi       |

---

## 🎯 Kabul Kriterleri (Sprint 7)

### Fonksiyonel Gereksinimler

- ✅ Consultant login yapabiliyor
- ✅ Consultant dashboard görüntülenebiliyor
- ✅ Program seçici çalışıyor
- ✅ Seçilen programa göre firmalar listeleniyor
- ✅ Firma detay sayfası açılabiliyor
- ✅ Sadece atandığı programları görebiliyor
- ✅ Sadece atandığı firmaları görebiliyor
- ✅ Program değiştiğinde liste güncelleniyor

### Teknik Gereksinimler

- ✅ Clean Architecture'e uygun
- ✅ TypeScript tip güvenli
- ✅ Zod validation çalışıyor
- ✅ Error handling yapılıyor
- ✅ Loading states var
- ✅ Responsive design
- ✅ Dark mode destekli

### Güvenlik Gereksinimleri

- ✅ Authentication kontrol ediliyor
- ✅ Authorization doğru çalışıyor
- ✅ Sadece kendi verilerine erişebiliyor
- ✅ API routes korumalı

---

## 🚧 Bilinen Kısıtlamalar

1. **Proje Yönetimi:** Sprint 8'de gelecek, şimdilik placeholder
2. **Eğitim Yönetimi:** Sprint 9'da gelecek, şimdilik placeholder
3. **Görev Yönetimi:** Sprint 8'de gelecek, şimdilik placeholder
4. **Gerçek İstatistikler:** Sprint 10'da geliştirilecek

---

## 🔜 Sonraki Adımlar (Sprint 8+)

### Sprint 8: Project Management

- Ana Proje → Alt Proje → Görev hiyerarşisi
- Consultant: Proje oluşturma/atama
- Consultant: Görev oluşturma/atama

### Sprint 9: Training Management

- Video eğitim yönetimi
- Consultant: Eğitim atama
- Firma: Eğitim izleme

### Sprint 10: Dashboard & Analytics

- Gerçek istatistikler
- Grafikler ve chartlar
- Advanced filtering

---

## 📝 Notlar

- Sprint 7, Sprint 8-9 için temel oluşturuyor
- Consultant dashboard, proje ve eğitim modülleri için hazır olacak
- Authorization matrix Sprint 8-9'da genişletilecek

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Son Güncelleme:** 29 Ekim 2025
