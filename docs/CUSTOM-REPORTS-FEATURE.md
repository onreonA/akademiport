# 📊 Custom Reports Özellik Dokümantasyonu

**Tarih:** Ocak 2025  
**Durum:** ✅ Tamamlandı

---

## 📋 GENEL BAKIŞ

Custom Reports özelliği, kullanıcıların özelleştirilebilir raporlar oluşturmasına, zamanlamasına ve export etmesine olanak sağlar. Bu özellik, dashboard metriklerini, program metriklerini ve firma metriklerini içeren çeşitli rapor tiplerini destekler.

---

## 🎯 ÖZELLİKLER

### 1. Rapor Tipleri

- **Dashboard Reports:** Tüm sistem metriklerini içeren genel dashboard raporları
- **Program Reports:** Belirli bir programa ait metrikleri içeren raporlar
- **Company Reports:** Belirli bir firmaya ait metrikleri içeren raporlar
- **Custom Reports:** Özel metrik kombinasyonları içeren raporlar

### 2. Rapor Oluşturma

- **Metrik Seçimi:** Kullanıcılar raporlarına dahil etmek istedikleri metrikleri seçebilir
- **Tarih Aralığı:** Aylık, haftalık, yıllık veya özel tarih aralığı seçimi
- **Filtreleme:** Program, firma veya diğer kriterlere göre filtreleme
- **Zamanlama:** Cron expression ile otomatik rapor üretimi

### 3. Export Formatları

- **PDF:** Profesyonel PDF formatında export
- **Excel:** `.xlsx` formatında export
- **CSV:** `.csv` formatında export

### 4. Rapor Yönetimi

- **Listeleme:** Tüm raporları görüntüleme ve filtreleme
- **Düzenleme:** Mevcut raporları güncelleme
- **Silme:** Raporları silme
- **Detay Görüntüleme:** Rapor detaylarını ve AI analizini görüntüleme

---

## 🗂️ DOSYA YAPISI

### Backend

```
src/
├── 3-domain/
│   └── entities/
│       └── CustomReport.ts                    # Custom Report entity ve DTOs
├── 2-application/
│   └── use-cases/
│       └── custom-report/
│           ├── CreateCustomReportUseCase.ts
│           ├── UpdateCustomReportUseCase.ts
│           ├── DeleteCustomReportUseCase.ts
│           ├── GetCustomReportUseCase.ts
│           └── ListCustomReportsUseCase.ts
├── 4-infrastructure/
│   └── database/
│       ├── repositories/
│       │   └── SupabaseCustomReportRepository.ts
│       └── migrations/
│           ├── 050_create_custom_reports_table.sql
│           └── 051_add_report_email_template.sql
└── app/
    └── api/
        └── custom-reports/
            ├── route.ts                       # GET (list), POST (create)
            ├── [id]/
            │   ├── route.ts                   # GET, PUT, DELETE
            │   └── export/
            │       └── route.ts               # GET (export)
            └── route.test.ts                  # API route tests
```

### Frontend

```
src/app/dashboard/custom-reports/
├── page.tsx                                   # Liste sayfası
├── new/
│   └── page.tsx                               # Yeni rapor oluşturma
└── [id]/
    ├── page.tsx                               # Detay sayfası
    └── edit/
        └── page.tsx                           # Düzenleme sayfası

src/1-presentation/components/features/reports/
└── CustomReportBuilder.tsx                    # Rapor builder component
```

---

## 🔌 API ENDPOINTS

### GET /api/custom-reports

Rapor listesini getirir.

**Query Parameters:**

- `userId` (optional): Kullanıcı ID'si
- `programId` (optional): Program ID'si
- `companyId` (optional): Firma ID'si
- `reportType` (optional): Rapor tipi
- `status` (optional): Rapor durumu
- `isScheduled` (optional): Zamanlanmış raporlar
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına kayıt (default: 10)
- `sortBy` (optional): Sıralama alanı (default: 'createdAt')
- `sortOrder` (optional): Sıralama yönü (default: 'desc')

**Response:**

```json
{
  "reports": [
    {
      "id": "uuid",
      "name": "Rapor Adı",
      "reportType": "dashboard",
      "status": "completed",
      "selectedMetrics": ["totalUsers", "totalCompanies"],
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### POST /api/custom-reports

Yeni rapor oluşturur.

**Request Body:**

```json
{
  "name": "Rapor Adı",
  "description": "Rapor açıklaması",
  "reportType": "dashboard",
  "selectedMetrics": ["totalUsers", "totalCompanies"],
  "dateRangeType": "month",
  "dateRangeStart": "2025-01-01",
  "dateRangeEnd": "2025-01-31",
  "isScheduled": false,
  "scheduleCron": "0 0 1 * *",
  "scheduleTimezone": "Europe/Istanbul"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Rapor Adı",
  "status": "pending",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### GET /api/custom-reports/[id]

Rapor detayını getirir.

**Response:**

```json
{
  "id": "uuid",
  "name": "Rapor Adı",
  "reportType": "dashboard",
  "status": "completed",
  "selectedMetrics": ["totalUsers"],
  "aiAnalysis": {
    "summary": "AI analiz özeti",
    "strengths": ["Güçlü yön 1"],
    "weaknesses": ["Zayıf yön 1"],
    "recommendations": ["Öneri 1"],
    "riskScore": 50,
    "successProbability": 75
  }
}
```

### PUT /api/custom-reports/[id]

Raporu günceller.

**Request Body:** (POST ile aynı, tüm alanlar optional)

### DELETE /api/custom-reports/[id]

Raporu siler.

**Response:**

```json
{
  "success": true
}
```

### GET /api/custom-reports/[id]/export?format=pdf|excel|csv

Raporu export eder.

**Query Parameters:**

- `format` (required): Export formatı (`pdf`, `excel`, `csv`)

**Response:**

- PDF: `application/pdf` content-type ile blob
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` content-type ile blob
- CSV: `text/csv;charset=utf-8` content-type ile text

---

## 🔐 YETKİLENDİRME

### Master Admin & Program Manager

- Tüm raporları görüntüleyebilir
- Tüm raporları oluşturabilir, düzenleyebilir ve silebilir
- Tüm rapor tiplerine erişebilir

### Consultant

- Kendi programlarına ait raporları görüntüleyebilir
- Program ve Custom rapor tiplerini oluşturabilir
- Kendi oluşturduğu raporları düzenleyebilir ve silebilir

### Company Admin

- Kendi firmasına ait raporları görüntüleyebilir
- Company rapor tiplerini oluşturabilir
- Kendi oluşturduğu raporları düzenleyebilir ve silebilir

### Company User

- Kendi firmasına ait raporları görüntüleyebilir
- Rapor oluşturamaz, düzenleyemez veya silemez

---

## 📊 METRİKLER

### Dashboard Metrikleri

- `totalUsers`: Toplam kullanıcı sayısı
- `totalCompanies`: Toplam firma sayısı
- `totalPrograms`: Toplam program sayısı
- `totalProjects`: Toplam proje sayısı
- `totalTasks`: Toplam görev sayısı

### Program Metrikleri

- `totalProjects`: Programdaki toplam proje sayısı
- `totalTrainings`: Programdaki toplam eğitim sayısı
- `totalEvents`: Programdaki toplam etkinlik sayısı

### Company Metrikleri

- `totalProjects`: Firmadaki toplam proje sayısı
- `totalTrainings`: Firmadaki toplam eğitim sayısı
- `totalEvents`: Firmadaki toplam etkinlik sayısı
- `ecommerceMetrics`: E-ticaret metrikleri

---

## 🧪 TESTLER

### API Route Tests

- ✅ `src/app/api/custom-reports/route.test.ts` - List ve Create endpoint'leri
- ✅ `src/app/api/custom-reports/[id]/route.test.ts` - Get, Update, Delete endpoint'leri
- ✅ `src/app/api/custom-reports/[id]/export/route.test.ts` - Export endpoint'i

### Test Coverage

- Authentication kontrolü
- Authorization kontrolü
- Validation kontrolü
- Use case entegrasyonu
- Export formatları (PDF, Excel, CSV)
- Hata yönetimi

---

## 🚀 KULLANIM ÖRNEKLERİ

### Yeni Rapor Oluşturma

1. `/dashboard/custom-reports` sayfasına gidin
2. **"Yeni Rapor Oluştur"** butonuna tıklayın
3. Rapor bilgilerini doldurun:
   - Rapor adı ve açıklaması
   - Rapor tipi seçin
   - Metrikleri seçin
   - Tarih aralığı seçin
   - İsteğe bağlı: Zamanlama ayarları
4. **"Rapor Oluştur"** butonuna tıklayın

### Rapor Export Etme

1. Rapor detay sayfasına gidin (`/dashboard/custom-reports/[id]`)
2. **"PDF İndir"**, **"Excel İndir"** veya **"CSV İndir"** butonuna tıklayın
3. Dosya otomatik olarak indirilecektir

### Zamanlanmış Rapor Oluşturma

1. Rapor oluştururken **"Zamanlanmış Rapor"** seçeneğini işaretleyin
2. Cron expression girin (örn: `0 0 1 * *` - her ayın 1'i saat 00:00)
3. Zaman dilimi seçin (örn: `Europe/Istanbul`)
4. Rapor otomatik olarak zamanlanacaktır

---

## 🔧 TEKNİK DETAYLAR

### Database Schema

```sql
CREATE TABLE custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id),
  program_id UUID REFERENCES programs(id),
  company_id UUID REFERENCES companies(id),
  report_type VARCHAR(50) NOT NULL,
  selected_metrics JSONB NOT NULL,
  date_range_type VARCHAR(50) NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB DEFAULT '{}',
  is_scheduled BOOLEAN DEFAULT false,
  schedule_cron VARCHAR(255),
  schedule_timezone VARCHAR(100),
  status custom_report_status DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies

- **Users:** Kendi oluşturdukları raporları görüntüleyebilir
- **Admins:** Tüm raporları görüntüleyebilir
- **Consultants:** İlişkili program ve firmaların raporlarını görüntüleyebilir

---

## 📝 NOTLAR

1. **Lazy Imports:** API route'larında lazy import kullanılarak build-time execution önlenir
2. **Dynamic Rendering:** Tüm API route'larında `export const dynamic = 'force-dynamic'` kullanılır
3. **Export Services:** PDF, Excel ve CSV export servisleri `@/5-shared/services/export` modülünden gelir
4. **Navigation:** Custom Reports linki Master Admin navigation menüsünde Reports alt menüsünde bulunur

---

## 🔗 İLGİLİ DOKÜMANTASYON

- [Migration Rehberi](./MIGRATION-050-051-REHBERI.md)
- [API Dokümantasyonu](./API-DOCUMENTATION.md)
- [User Guide](./USER_GUIDE.md)

---

## ✅ TAMAMLANAN ÖZELLİKLER

- ✅ Custom Reports tablosu ve migration'ları
- ✅ Custom Reports use case'leri (Create, Update, Delete, Get, List)
- ✅ Custom Reports API route'ları
- ✅ Custom Reports UI sayfaları (List, Create, Detail, Edit)
- ✅ Export fonksiyonları (PDF, Excel, CSV)
- ✅ Navigation menüsü entegrasyonu
- ✅ API route testleri
- ✅ Export route testleri

---

## 🎯 SONRAKI ADIMLAR

- [ ] AI analiz entegrasyonu (AI insights ile rapor analizi)
- [ ] Email bildirimleri (rapor tamamlandığında email gönderimi)
- [ ] Rapor şablonları (önceden tanımlı rapor şablonları)
- [ ] Rapor paylaşımı (raporları diğer kullanıcılarla paylaşma)
