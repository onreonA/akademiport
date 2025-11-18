# 📊 Sprint 27: Dashboard & Analytics - Analiz ve Plan

**Tarih:** Ocak 2025  
**Durum:** 📋 Planlandı  
**Bağımlılıklar:** ✅ Sprint 17 (AI Altyapısı), Sprint 18 (AI Özellikleri) - Tamamlandı  
**Tahmini Süre:** 0.5 hafta (20 saat)

---

## 🎯 HEDEF

Dashboard'ları geliştirmek, custom raporlar eklemek, analytics entegrasyonu yapmak ve AI-powered insights eklemek.

---

## 📊 MEVCUT DURUM ANALİZİ

### ✅ Mevcut Dashboard'lar

1. **Master Admin Dashboard** (`/dashboard`)
   - ✅ Temel istatistikler (programs, companies, users)
   - ✅ Stat cards
   - ❌ Grafikler yok
   - ❌ Trend analizi yok
   - ❌ Custom reports yok

2. **Consultant Dashboard** (`/consultant-dashboard`)
   - ✅ Program seçici
   - ✅ Firma listesi
   - ❌ İstatistikler eksik
   - ❌ Grafikler yok

3. **Company Dashboard** (`/company-dashboard`)
   - ✅ Temel bilgiler
   - ❌ İstatistikler eksik
   - ❌ Grafikler yok

4. **Bakanlık Dashboard** (`/admin-dashboard/ministry`)
   - ✅ E-ticaret metrikleri
   - ✅ Grafikler (Recharts)
   - ✅ Platform dağılımı
   - ✅ Top firmalar

### ❌ Eksikler

1. **Dashboard İyileştirmeleri**
   - ❌ Grafikler ve chartlar (Recharts entegrasyonu eksik)
   - ❌ Trend analizi yok
   - ❌ Karşılaştırma grafikleri yok
   - ❌ Filtreleme ve tarih aralığı seçimi yok

2. **Custom Reports**
   - ❌ Custom report builder yok
   - ❌ Report templates yok
   - ❌ Scheduled reports yok

3. **Export Functionality**
   - ❌ PDF export yok
   - ❌ Excel export yok
   - ❌ CSV export yok

4. **Analytics Entegrasyonu**
   - ❌ Google Analytics 4 entegrasyonu yok
   - ❌ Mixpanel entegrasyonu yok
   - ❌ Custom event tracking yok

5. **AI-Powered Insights**
   - ❌ AI insights widget'ı yok
   - ❌ Trend tahminleri yok
   - ❌ Anomali tespiti yok

---

## 📦 SPRINT 27 KAPSAMI

### 1. Dashboard İyileştirmeleri (6 saat)

#### a) Grafik Kütüphanesi Kurulumu

- ✅ Recharts kurulumu (zaten var mı kontrol et)
- Chart component'leri oluşturma
- Responsive chart wrapper

#### b) Master Admin Dashboard İyileştirmeleri

- Kullanıcı büyüme grafiği (aylık)
- Program aktivite grafiği
- Firma dağılım grafiği
- Görev tamamlanma oranı grafiği
- Trend analizi (son 6 ay)

#### c) Consultant Dashboard İyileştirmeleri

- Firma performans grafiği
- Proje ilerleme grafiği
- Eğitim tamamlanma grafiği
- Etkinlik katılım grafiği

#### d) Company Dashboard İyileştirmeleri

- Proje ilerleme grafiği
- Eğitim ilerleme grafiği
- Etkinlik katılım grafiği
- E-ticaret metrikleri grafiği

### 2. Custom Reports (4 saat)

#### a) Report Builder UI

- Report template seçimi
- Metrik seçimi (checkbox list)
- Tarih aralığı seçimi
- Filtreleme seçenekleri
- Preview

#### b) Report Management

- Kaydedilmiş raporlar listesi
- Rapor oluşturma
- Rapor düzenleme
- Rapor silme
- Scheduled reports (cron)

### 3. Export Functionality (4 saat)

#### a) PDF Export

- PDF kütüphanesi kurulumu (react-pdf veya jsPDF)
- PDF template'leri
- Dashboard PDF export
- Report PDF export

#### b) Excel Export

- Excel kütüphanesi kurulumu (xlsx veya exceljs)
- Excel export servisi
- Dashboard Excel export
- Report Excel export

#### c) CSV Export

- CSV export servisi
- Dashboard CSV export
- Report CSV export

### 4. Analytics Entegrasyonu (4 saat)

#### a) Google Analytics 4

- GA4 kurulumu
- Page view tracking
- Custom event tracking
- User properties
- Conversion tracking

#### b) Mixpanel (Opsiyonel)

- Mixpanel kurulumu
- Event tracking
- User identification
- Funnel analysis

#### c) Custom Event Tracking

- Event tracking servisi
- Dashboard view events
- Report generation events
- Export events

### 5. AI-Powered Insights (2 saat)

#### a) AI Insights Widget

- Dashboard'a AI insights widget ekleme
- Trend tahminleri
- Anomali tespiti
- Öneriler

#### b) AI Insights API

- AI insights use case
- Trend analizi
- Anomali tespiti
- Öneriler üretimi

---

## 🗂️ DETAYLI GÖREV LİSTESİ

### Faz 1: Dashboard İyileştirmeleri

**Süre:** 6 saat

1. **Recharts Kurulumu ve Chart Components** (1 saat)
   - `npm install recharts`
   - `ChartContainer` component
   - `LineChart`, `BarChart`, `PieChart` wrapper'ları
   - Responsive chart wrapper

2. **Master Admin Dashboard Grafikleri** (2 saat)
   - Kullanıcı büyüme grafiği (Line Chart)
   - Program aktivite grafiği (Bar Chart)
   - Firma dağılım grafiği (Pie Chart)
   - Görev tamamlanma oranı (Area Chart)
   - API endpoint: `/api/dashboard/stats`

3. **Consultant Dashboard Grafikleri** (1.5 saat)
   - Firma performans grafiği
   - Proje ilerleme grafiği
   - Eğitim tamamlanma grafiği
   - API endpoint: `/api/consultant-dashboard/stats`

4. **Company Dashboard Grafikleri** (1.5 saat)
   - Proje ilerleme grafiği
   - Eğitim ilerleme grafiği
   - E-ticaret metrikleri grafiği
   - API endpoint: `/api/company-dashboard/stats`

### Faz 2: Custom Reports

**Süre:** 4 saat

1. **Report Builder UI** (2 saat)
   - Report builder component
   - Template seçimi
   - Metrik seçimi
   - Tarih aralığı seçimi
   - Preview component

2. **Report Management** (2 saat)
   - Report entity ve repository
   - Report CRUD use cases
   - Report listesi sayfası
   - Report detay sayfası
   - Scheduled reports (cron job)

### Faz 3: Export Functionality

**Süre:** 4 saat

1. **PDF Export** (2 saat)
   - `react-pdf` veya `jsPDF` kurulumu
   - PDF template'leri
   - PDF export servisi
   - Dashboard PDF export endpoint
   - Report PDF export endpoint

2. **Excel Export** (1 saat)
   - `xlsx` veya `exceljs` kurulumu
   - Excel export servisi
   - Dashboard Excel export endpoint
   - Report Excel export endpoint

3. **CSV Export** (1 saat)
   - CSV export servisi
   - Dashboard CSV export endpoint
   - Report CSV export endpoint

### Faz 4: Analytics Entegrasyonu

**Süre:** 4 saat

1. **Google Analytics 4** (2 saat)
   - GA4 script ekleme
   - Page view tracking
   - Custom event tracking
   - User properties
   - Conversion tracking

2. **Custom Event Tracking** (2 saat)
   - Event tracking servisi
   - Dashboard view events
   - Report generation events
   - Export events
   - User action events

### Faz 5: AI-Powered Insights

**Süre:** 2 saat

1. **AI Insights Widget** (1 saat)
   - Dashboard'a AI insights widget ekleme
   - Trend tahminleri gösterimi
   - Anomali tespiti gösterimi
   - Öneriler gösterimi

2. **AI Insights API** (1 saat)
   - AI insights use case
   - Trend analizi
   - Anomali tespiti
   - Öneriler üretimi

---

## 📁 OLUŞTURULACAK DOSYALAR

### Backend

```
src/2-application/use-cases/analytics/
  - GetDashboardStatsUseCase.ts
  - GetConsultantStatsUseCase.ts
  - GetCompanyStatsUseCase.ts
  - GenerateReportUseCase.ts
  - ExportDashboardUseCase.ts
  - ExportReportUseCase.ts
  - GetAIInsightsUseCase.ts

src/3-domain/entities/
  - Report.ts
  - DashboardStats.ts

src/3-domain/interfaces/repositories/
  - IReportRepository.ts

src/4-infrastructure/database/repositories/
  - SupabaseReportRepository.ts

src/4-infrastructure/database/migrations/
  - 050_create_reports_table.sql

src/5-shared/services/analytics/
  - GoogleAnalyticsService.ts
  - EventTrackingService.ts
  - ExportService.ts

src/app/api/
  - dashboard/stats/route.ts
  - consultant-dashboard/stats/route.ts
  - company-dashboard/stats/route.ts
  - reports/route.ts
  - reports/[id]/route.ts
  - reports/[id]/export/route.ts
  - dashboard/export/route.ts
  - analytics/insights/route.ts
```

### Frontend

```
src/1-presentation/components/features/analytics/
  - DashboardStats.tsx
  - UserGrowthChart.tsx
  - ProgramActivityChart.tsx
  - CompanyDistributionChart.tsx
  - TaskCompletionChart.tsx
  - ReportBuilder.tsx
  - ReportList.tsx
  - ReportPreview.tsx
  - AIInsightsWidget.tsx

src/1-presentation/components/features/export/
  - ExportButton.tsx
  - ExportDialog.tsx

src/app/dashboard/
  - analytics/page.tsx
  - reports/page.tsx
  - reports/[id]/page.tsx
```

---

## ✅ KABUL KRİTERLERİ

### Fonksiyonel Gereksinimler

- ✅ Dashboard'larda grafikler görüntüleniyor
- ✅ Custom raporlar oluşturulabiliyor
- ✅ Raporlar PDF, Excel, CSV olarak export edilebiliyor
- ✅ Google Analytics 4 çalışıyor
- ✅ Custom event tracking çalışıyor
- ✅ AI insights widget'ı çalışıyor

### Teknik Gereksinimler

- ✅ Clean Architecture'e uygun
- ✅ TypeScript tip güvenli
- ✅ Responsive design
- ✅ Dark mode destekli
- ✅ Performance optimized (lazy loading, memoization)

---

## 🚧 BİLİNEN KISITLAMALAR

1. **Mixpanel:** Opsiyonel, ihtiyaç durumunda eklenebilir
2. **Scheduled Reports:** İlk versiyonda manuel, sonra cron job eklenecek
3. **AI Insights:** Basit versiyon, ileride geliştirilebilir

---

## 📝 NOTLAR

- Recharts zaten kurulu mu kontrol et
- Mevcut dashboard'ları bozmadan iyileştirme yap
- Export functionality için performans optimizasyonu önemli
- Analytics entegrasyonu için environment variables gerekli

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Son Güncelleme:** Ocak 2025
