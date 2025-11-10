# 📋 Sprint 15-28: Özet Planlar

Bu dokümanda Sprint 15'ten Sprint 28'e kadar olan tüm sprint'lerin özet planları bulunmaktadır.

---

## 📊 Sprint 15: E-ticaret Metrikleri & Dashboard (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 6 (Company Management)

### 🎯 Hedef

Firma e-ticaret verilerini toplama, görselleştirme ve bakanlık dashboard'u

### 📦 Kapsam

#### Database Tables

```sql
-- ecommerce_metrics (aylık metrikler)
-- ecommerce_performance (materialized view)
```

#### Metrikler

- **Alibaba (B2B):** Ziyaretçi, ürün sayısı, RFQ, sipariş
- **B2C (Amazon, Etsy, vb.):** Ziyaretçi, ürün, sipariş, gelir

#### Features

- ✅ Aylık veri girişi formu (Company Dashboard)
- ✅ E-ticaret performans tablosu (ayrı liderlik)
- ✅ Admin/Consultant: Tüm firmaların verileri
- ✅ Bakanlık Dashboard: Toplu istatistikler
- ✅ Grafikler: Ziyaretçi, ürün, sipariş, gelir trendi
- ✅ Otomatik hatırlatma (her ayın sonu)
- ✅ Karşılaştırma analizi

#### API Routes

- `POST /api/ecommerce/metrics` - Veri girişi
- `GET /api/ecommerce/metrics` - Veri listesi
- `GET /api/ecommerce/performance` - Performans tablosu
- `GET /api/ecommerce/ministry-dashboard` - Bakanlık dashboard

#### Frontend Pages

- `/company-dashboard/ecommerce` - Veri girişi
- `/admin-dashboard/ecommerce` - Tüm firmalar
- `/admin-dashboard/ministry` - Bakanlık dashboard

### ✅ Kabul Kriterleri

- Firma aylık veri girebiliyor
- Veriler görselleştiriliyor
- Bakanlık dashboard'u erişilebilir
- Karşılaştırma analizi çalışıyor

---

## 🤖 Sprint 16: AI Raporlama Sistemi (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 15 (E-ticaret Metrikleri), Sprint 17 (AI Altyapısı)

### 🎯 Hedef

AI destekli otomatik rapor üretimi ve analiz

### 📦 Kapsam

#### Database Tables

```sql
-- progress_reports (raporlar)
-- report_templates (şablonlar)
```

#### Rapor Tipleri

1. **Ara Rapor:** Alt proje tamamlandığında (otomatik)
2. **Aylık Rapor:** Her ayın sonu (otomatik, cron)
3. **Program Raporu:** Program bitişinde
4. **Firma Raporu:** İstek üzerine
5. **Bakanlık Raporu:** İstek üzerine (tüm program)

#### AI Analizi İçeriği

- **Özet (Summary):** Genel durum
- **Güçlü Yönler (Strengths):** Başarılı alanlar
- **Zayıf Yönler (Weaknesses):** İyileştirme gereken alanlar
- **Öneriler (Recommendations):** Aksiyon önerileri
- **Risk Skoru (0-100):** Başarısızlık riski
- **Başarı Olasılığı (0-100):** Hedeflere ulaşma olasılığı

#### Features

- ✅ Otomatik rapor üretimi (cron job)
- ✅ AI analizi ve öneriler (OpenAI/Claude)
- ✅ PDF export (react-pdf)
- ✅ Email ile gönderim
- ✅ Rapor geçmişi
- ✅ Bakanlık özel dashboard
- ✅ Karşılaştırmalı analiz

#### API Routes

- `POST /api/reports/generate` - Rapor oluştur
- `GET /api/reports` - Rapor listesi
- `GET /api/reports/[id]` - Rapor detay
- `GET /api/reports/[id]/pdf` - PDF download

#### Cron Jobs

- Aylık rapor: Her ayın son günü 23:00
- Ara rapor: Alt proje tamamlandığında (trigger)

### ✅ Kabul Kriterleri

- Raporlar otomatik oluşuyor
- AI analizi kaliteli
- PDF export çalışıyor
- Bakanlık dashboard'u kullanılabilir

---

## 🧠 Sprint 17: AI Altyapısı (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 2 (Database & Auth)

### 🎯 Hedef

OpenAI + Claude entegrasyonu ve AI service layer

### 📦 Kapsam

#### Services

```typescript
// src/5-shared/services/ai/
-openai.service.ts - // OpenAI GPT-4
  claude.service.ts - // Anthropic Claude
  ai -
  router.service.ts - // Use case bazlı provider seçimi
  prompt -
  manager.service.ts - // Prompt yönetimi
  token -
  tracker.service.ts - // Token sayımı
  cost -
  tracker.service.ts; // Maliyet hesaplama
```

#### Database Tables

```sql
-- ai_usage_logs (kullanım logları)
-- ai_prompts (prompt şablonları)
```

#### Features

- ✅ OpenAI API entegrasyonu
- ✅ Claude API entegrasyonu
- ✅ AI router (use case bazlı provider seçimi)
- ✅ Prompt management (versiyonlama)
- ✅ Token tracking
- ✅ Cost tracking
- ✅ Error handling & retry
- ✅ Rate limiting
- ✅ Caching (Redis)

#### AI Provider Selection Strategy

```typescript
const AI_PROVIDER_MAP = {
  task_description: 'gpt-4', // Kısa metinler için GPT-4
  report_generation: 'claude', // Uzun raporlar için Claude
  news_rewrite: 'gpt-4', // Haber yeniden yazma için GPT-4
  forum_moderation: 'gpt-3.5', // Moderasyon için GPT-3.5
  cv_analysis: 'claude', // CV analizi için Claude
};
```

### ✅ Kabul Kriterleri

- AI API'ler çalışıyor
- Token sayılıyor
- Maliyet hesaplanıyor
- Error handling çalışıyor

---

## 🎨 Sprint 18: AI Özellikleri (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 8, 9, 17

### 🎯 Hedef

AI asistan özellikleri (görev açıklaması, eğitim özeti, rapor, risk analizi)

### 📦 Kapsam

#### AI Features

1. **Görev Açıklaması Üretimi (AI)**
   - Görev başlığından detaylı açıklama
   - Alt görev önerileri
2. **Eğitim Özeti Çıkarma (AI)**
   - Video transkript özeti
   - Döküman özeti
   - Anahtar kelimeler
3. **Rapor Otomatik Oluşturma (AI)**
   - Sprint 16'da detaylandırıldı
4. **Firma Risk Analizi (AI)**
   - Proje ilerlemesi analizi
   - Eğitim tamamlama oranı
   - Etkinlik katılımı
   - Risk skoru (0-100)
5. **Başarı Tahmini (AI)**
   - Geçmiş verilerden öğrenme
   - Başarı olasılığı (0-100)
6. **Trend Analizi (AI)**
   - Sektör trendleri
   - Firma performans trendi

#### Frontend

- Admin: AI özellikleri kullanımı
- Consultant: AI asistan kullanımı
- AI önerilerini kaydetme
- AI geçmişi görüntüleme

### ✅ Kabul Kriterleri

- AI özellikleri çalışıyor
- Sonuçlar kullanılabilir kalitede
- Kullanıcı AI önerilerini görebiliyor
- AI geçmişi kaydediliyor

---

## 🔄 Sprint 19: AI İçerik Otomasyonu (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 12, 13, 17, 18

### 🎯 Hedef

AI ile otomatik içerik üretimi ve moderasyon

### 📦 Kapsam

#### 1. AI Haber Otomasyonu

**Akış:**

```
1. N8N/Custom Scraper → RSS feed'lerden haber toplama
2. AI Relevance Check → E-ticaret/e-ihracat ile ilgili mi?
3. AI Rewrite → Haber yeniden yazma (plagiarism-free)
4. Taslak olarak kaydetme (status: draft)
5. Admin/Consultant onay paneli
6. Onaylanırsa → Otomatik yayınlama
```

**Haber Kaynakları:**

- E-ticaret siteleri (RSS)
- E-ihracat haberleri (RSS)
- Teknoloji haberleri (RSS)
- Resmi kurumlar (TİM, İTO, vb.)

**Cron Job:** Her gün sabah 09:00

#### 2. AI Forum Moderasyonu

**Features:**

- Otomatik spam tespiti (AI)
- Uygunsuz içerik tespiti (AI)
- Konu kategorisi önerisi (AI)
- Benzer konuları bulma (AI)
- Otomatik yanıt önerisi (AI) - Consultant'a öneri

#### N8N Workflow (Opsiyonel)

```json
{
  "nodes": [
    {
      "name": "RSS Feed Reader",
      "type": "n8n-nodes-base.rssFeedRead"
    },
    {
      "name": "AI Relevance Check",
      "type": "n8n-nodes-base.openAi"
    },
    {
      "name": "AI Rewrite",
      "type": "n8n-nodes-base.openAi"
    },
    {
      "name": "Save to Database",
      "type": "n8n-nodes-base.postgres"
    }
  ]
}
```

### ✅ Kabul Kriterleri

- Her gün otomatik haber taslakları oluşuyor
- Admin/Consultant onaylayabiliyor
- Forum spam tespiti çalışıyor

---

## 👔 Sprint 20: Kariyer Portalı - Program Bazlı (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 6

### 🎯 Hedef

Kariyer başvuru sistemi (program bazlı onay)

### 📦 Kapsam

#### Database Tables

```sql
-- career_applications (başvurular)
-- career_jobs (iş ilanları)
-- hr_pool (İK havuzu)
-- application_status_history (durum geçmişi)
```

#### Başvuru Akışı

```
1. Aday başvuru yapar (program seçer)
2. Danışman'a bildirim gider
3. Danışman inceler → Onaylar/Reddeder
4. Onaylanırsa → İK havuzuna ekler (sadece o program için)
5. Program firmaları İK havuzunda görür
```

#### Başvuru Formları (3 Tip)

1. **Danışman Başvurusu**
   - Uzmanlık alanları
   - Deneyim
   - CV upload
2. **Stajyer Başvurusu**
   - Eğitim bilgileri
   - İlgi alanları
   - CV upload
3. **İK Personeli Başvurusu**
   - Pozisyon
   - Deneyim
   - CV upload

#### Frontend Pages

- `/kariyer` - Public kariyer sayfası
- `/admin-dashboard/career/applications` - Başvuru yönetimi
- `/company-dashboard/hr-pool` - İK havuzu

### ✅ Kabul Kriterleri

- Başvuru formu çalışıyor
- CV upload çalışıyor
- Danışman başvuruları yönetebiliyor
- Firmalar İK havuzunu görebiliyor

---

## 🤝 Sprint 21: AI Kariyer Matching (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 17, 18, 20

### 🎯 Hedef

AI ile aday-firma eşleştirme

### 📦 Kapsam

#### AI Matching Features

1. **CV Analizi (AI)**
   - Beceri çıkarma
   - Deneyim analizi
   - Eğitim geçmişi
2. **Firma-Aday Eşleştirme (AI)**
   - Sektör uyumu
   - Beceri uyumu
   - Deneyim uyumu
   - Match score (0-100)
3. **Otomatik Öneri Sistemi**
   - Firmaya uygun adaylar
   - Adaya uygun firmalar
4. **Smart Search**
   - Doğal dil arama
   - Semantic search

#### İş İlanları

- Firma iş ilanı oluşturma
- AI ile ilan optimizasyonu
- Otomatik aday önerisi (AI)

### ✅ Kabul Kriterleri

- AI CV'yi analiz edebiliyor
- Match score hesaplanıyor
- Firmaya uygun adaylar öneriliyor
- İş ilanları çalışıyor

---

## 🌐 Sprint 22: Public Website (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** -

### 🎯 Hedef

Public website sayfaları

### 📦 Sayfalar

- `/` - Ana Sayfa
- `/program` - Program Hakkında
- `/destekler` - Destekler
- `/ozellikler` - Platform Özellikleri
- `/basari-hikayeleri` - Başarı Hikayeleri
- `/sss` - SSS
- `/iletisim` - İletişim & Başvuru
- `/kariyer` - Kariyer (Sprint 20'de yapıldı)
- `/blog` - Blog (Sprint 12'de yapıldı)
- `/login` - Login (Zaten var)

### Features

- ✅ Responsive design
- ✅ SEO optimization
- ✅ Performance optimization
- ✅ Contact form
- ✅ Application form

---

## 📝 Sprint 23: CMS (Site Yönetimi) (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 22

### 🎯 Hedef

Admin'in site içeriğini yönetebilmesi

### 📦 Kapsam

#### Database Tables

```sql
-- cms_pages (sayfalar)
-- cms_sections (bölümler)
-- cms_media (medya)
-- cms_settings (ayarlar)
```

#### Features

- Sayfa yönetimi (CRUD)
- Bölüm yönetimi (drag-drop)
- Medya yönetimi (upload)
- Site ayarları (genel, iletişim, sosyal medya, analytics)
- Rich text editor (TipTap)
- Image upload
- SEO ayarları
- Önizleme
- Yayınlama/arşivleme

---

## 📧 Sprint 24: Email Sistemi (0.5 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 2

### 🎯 Hedef

SendGrid entegrasyonu + Email templates

### Features

- SendGrid API entegrasyonu
- Email service layer
- Email templates (MJML)
- Email queue system
- Email analytics
- Email tercihleri

---

## 💬 Sprint 25: Chatbot (1 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 9, 17, 18

### 🎯 Hedef

AI Chatbot tüm panellerde

### Features

- Chatbot UI component
- Chatbot backend (streaming)
- Context management
- Intent detection
- Eğitim içeriği arama
- Akıllı yönlendirme
- Tüm panellere entegrasyon
- Chatbot analytics

---

## 🔔 Sprint 26: Bildirim Sistemi (0.5 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 2, 24

### 🎯 Hedef

Kapsamlı bildirim sistemi

### Features

- In-app notifications
- Push notifications (OneSignal)
- WhatsApp entegrasyonu
- Bildirim tercihleri
- Bildirim geçmişi
- Real-time bildirimler

---

## 📊 Sprint 27: Dashboard & Analytics (0.5 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Sprint 17, 18

### 🎯 Hedef

Gelişmiş dashboard ve analitik

### Features

- Dashboard iyileştirmeleri
- Custom reports
- Export functionality (PDF, Excel)
- Google Analytics 4 entegrasyonu
- Mixpanel entegrasyonu
- AI-powered insights

---

## 🚀 Sprint 28: Production Hazırlık (0.5 hafta)

**Durum:** 📋 Planlandı  
**Bağımlılıklar:** Tüm sprint'ler

### 🎯 Hedef

Production'a hazır

### Görevler

- Environment variables kontrolü
- Database migration kontrolü
- RLS policies kontrolü
- Error tracking (Sentry)
- Monitoring setup
- Backup stratejisi
- SSL sertifikası
- Domain setup
- CDN setup
- Performance optimization
- Security audit
- Documentation completion

---

**Son Güncelleme:** 10 Kasım 2025  
**Toplam Sprint:** 28  
**Tamamlanan:** 11  
**Kalan:** 17
