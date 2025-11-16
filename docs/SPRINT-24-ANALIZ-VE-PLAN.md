# 📧 Sprint 24: Email Sistemi - Detaylı Analiz ve Plan

**Tarih:** 15 Ocak 2025  
**Sprint:** 24 / 28  
**Durum:** 📋 Planlama Aşaması  
**Öncelik:** 🔴 Yüksek (Bildirimler ve hatırlatmalar için kritik)  
**Süre:** 0.5 hafta (~4 saat)

---

## 🎯 Sprint Hedefi

**Ana Hedef:** SendGrid entegrasyonu ile kapsamlı email sistemi oluşturmak.

**Alt Hedefler:**

1. ✅ SendGrid API entegrasyonu
2. ✅ Email service layer
3. ✅ Email templates (MJML)
4. ✅ Email queue system
5. ✅ Email analytics & tracking
6. ✅ Email tercihleri yönetimi
7. ✅ Transactional emails (kayıt, şifre sıfırlama, vb.)
8. ✅ Scheduled emails (hatırlatmalar, raporlar)

---

## 📊 Mevcut Durum Analizi

### ✅ Tamamlanmış Altyapı

- ✅ Database & Auth (Sprint 2)
- ✅ Clean Architecture yapısı
- ✅ Environment variable yönetimi
- ✅ Logger sistemi
- ✅ Error handling pattern'leri
- ✅ AI Altyapısı (Sprint 17) - AI ile email içerik üretimi için hazır

### ❌ Eksik Özellikler

- ❌ Email service layer yok
- ❌ SendGrid entegrasyonu yok
- ❌ Email template sistemi yok
- ❌ Email queue yok
- ❌ Email tracking yok
- ❌ Email tercihleri yok

### 📋 Mevcut Email İhtiyaçları

**Sprint 15'ten kalan:**

- E-ticaret metrikleri aylık hatırlatma email'i

**Diğer sprint'lerden beklenen:**

- Kullanıcı kayıt email'i
- Şifre sıfırlama email'i
- Randevu hatırlatma email'i
- Etkinlik hatırlatma email'i
- Görev deadline hatırlatma email'i
- Rapor hazır email'i (Sprint 16)
- Forum yanıt bildirimi (Sprint 13)

---

## 📦 Sprint Kapsamı

### Faz A: Database Schema (30 dakika)

**Migration:** `038_create_email_tables.sql`

**Tablo 1: `email_templates`**

- Template adı, konu, içerik (MJML/HTML)
- Template tipi (transactional, marketing, notification)
- Versiyonlama
- Variables mapping

**Tablo 2: `email_queue`**

- Email gönderim kuyruğu
- Priority, status, scheduled_at
- Retry logic
- Error tracking

**Tablo 3: `email_logs`**

- Gönderilen email'lerin logları
- Open, click tracking
- Bounce, spam reports
- Analytics için

**Tablo 4: `email_preferences`**

- Kullanıcı email tercihleri
- Email tipi bazlı onaylar
- Unsubscribe tokens

---

### Faz B: Dependencies & Configuration (15 dakika)

**Paketler:**

- `@sendgrid/mail` - SendGrid SDK
- `mjml` - MJML to HTML compiler
- `mjml-react` (opsiyonel) - React component'leri için

**Environment Variables:**

```env
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@akademiport.com
SENDGRID_FROM_NAME=Akademi Port
```

**Configuration:**

- `src/4-infrastructure/config/email.config.ts`

---

### Faz C: Core Services (2 saat)

#### 1. Email Service (`email.service.ts`)

- SendGrid entegrasyonu
- Template rendering
- Variable substitution
- Attachment support
- Batch sending

#### 2. Email Queue Service (`email-queue.service.ts`)

- Queue management
- Priority handling
- Retry logic
- Scheduled emails

#### 3. Email Template Service (`email-template.service.ts`)

- Template CRUD
- MJML compilation
- Variable validation
- Version management

#### 4. Email Analytics Service (`email-analytics.service.ts`)

- Open tracking
- Click tracking
- Bounce handling
- Spam report handling
- Analytics aggregation

---

### Faz D: Domain Layer (30 dakika)

**Entities:**

- `EmailTemplate`
- `EmailQueueItem`
- `EmailLog`
- `EmailPreferences`

**Enums:**

- `EmailType` (TRANSACTIONAL, MARKETING, NOTIFICATION)
- `EmailStatus` (PENDING, SENT, FAILED, BOUNCED)
- `EmailPriority` (LOW, NORMAL, HIGH, URGENT)

**Interfaces:**

- `IEmailService`
- `IEmailQueueService`
- `IEmailTemplateService`
- `IEmailAnalyticsService`

---

### Faz E: API Routes (30 dakika)

**Routes:**

- `POST /api/email/send` - Email gönder
- `GET /api/email/templates` - Template listesi
- `POST /api/email/templates` - Template oluştur
- `GET /api/email/logs` - Email logları
- `POST /api/email/preferences` - Email tercihleri
- `GET /api/email/unsubscribe/:token` - Unsubscribe

---

### Faz F: Email Templates (1 saat)

**Template'ler:**

1. **Kullanıcı Kayıt**
   - Hoş geldin mesajı
   - Hesap aktivasyon linki

2. **Şifre Sıfırlama**
   - Reset link
   - Güvenlik uyarısı

3. **Randevu Hatırlatma**
   - Randevu detayları
   - Zoom linki

4. **Etkinlik Hatırlatma**
   - Etkinlik bilgileri
   - Katılım linki

5. **Görev Deadline Hatırlatma**
   - Görev detayları
   - Dashboard linki

6. **E-ticaret Metrik Hatırlatma**
   - Aylık hatırlatma
   - Form linki

7. **Rapor Hazır**
   - Rapor linki
   - PDF download

8. **Forum Yanıt Bildirimi**
   - Yanıt özeti
   - Forum linki

---

### Faz G: Cron Jobs & Background Jobs (30 dakika)

**Cron Jobs:**

- Email queue processor (her dakika)
- Scheduled email sender (her dakika)
- Email analytics aggregator (günlük)

**Background Jobs:**

- Email sending (async)
- Template compilation (async)

---

### Faz H: Tests (30 dakika)

- Unit tests (her service için)
- Integration tests (SendGrid mock)
- Template rendering tests
- Queue processing tests

---

## 🏗️ Mimari Yapı

```
src/
├── 3-domain/
│   ├── entities/
│   │   ├── EmailTemplate.ts
│   │   ├── EmailQueueItem.ts
│   │   ├── EmailLog.ts
│   │   └── EmailPreferences.ts
│   ├── enums/
│   │   └── EmailEnums.ts
│   └── interfaces/
│       └── services/
│           ├── IEmailService.ts
│           ├── IEmailQueueService.ts
│           ├── IEmailTemplateService.ts
│           └── IEmailAnalyticsService.ts
│
├── 4-infrastructure/
│   ├── config/
│   │   └── email.config.ts
│   ├── database/
│   │   └── migrations/
│   │       └── 038_create_email_tables.sql
│   └── services/
│       └── sendgrid/
│           └── sendgrid-client.ts
│
├── 5-shared/
│   └── services/
│       └── email/
│           ├── email.service.ts
│           ├── email-queue.service.ts
│           ├── email-template.service.ts
│           ├── email-analytics.service.ts
│           └── index.ts
│
└── app/
    └── api/
        └── email/
            ├── send/
            ├── templates/
            ├── logs/
            ├── preferences/
            └── unsubscribe/
```

---

## 📋 Detaylı Görev Listesi

### 1. Database Schema ✅

- [ ] `email_templates` tablosu
- [ ] `email_queue` tablosu
- [ ] `email_logs` tablosu
- [ ] `email_preferences` tablosu
- [ ] Indexes
- [ ] RLS policies
- [ ] Migration dosyası

### 2. Dependencies ✅

- [ ] `@sendgrid/mail` paketi kurulumu
- [ ] `mjml` paketi kurulumu
- [ ] Environment variables ekleme

### 3. Configuration ✅

- [ ] `email.config.ts` oluşturma
- [ ] SendGrid client setup

### 4. Domain Layer ✅

- [ ] Entities
- [ ] Enums
- [ ] Interfaces

### 5. Services ✅

- [ ] Email Service
- [ ] Email Queue Service
- [ ] Email Template Service
- [ ] Email Analytics Service

### 6. API Routes ✅

- [ ] Email send endpoint
- [ ] Template management endpoints
- [ ] Email logs endpoint
- [ ] Preferences endpoint
- [ ] Unsubscribe endpoint

### 7. Email Templates ✅

- [ ] MJML template'leri
- [ ] Variable substitution
- [ ] Template compilation

### 8. Cron Jobs ✅

- [ ] Queue processor
- [ ] Scheduled email sender

### 9. Tests ✅

- [ ] Unit tests
- [ ] Integration tests

---

## 🎯 Email Tipleri ve Kullanım Senaryoları

### Transactional Emails

1. **Kullanıcı Kayıt**
   - Trigger: Yeni kullanıcı kaydı
   - Template: `user-welcome`
   - Priority: NORMAL

2. **Şifre Sıfırlama**
   - Trigger: Şifre sıfırlama isteği
   - Template: `password-reset`
   - Priority: HIGH

3. **Email Doğrulama**
   - Trigger: Email doğrulama isteği
   - Template: `email-verification`
   - Priority: NORMAL

### Notification Emails

4. **Randevu Hatırlatma**
   - Trigger: Randevudan 24 saat önce
   - Template: `appointment-reminder`
   - Priority: NORMAL
   - Scheduled: `scheduled_at`

5. **Etkinlik Hatırlatma**
   - Trigger: Etkinlikten 1 gün önce
   - Template: `event-reminder`
   - Priority: NORMAL
   - Scheduled: `scheduled_at`

6. **Görev Deadline Hatırlatma**
   - Trigger: Deadline'dan 2 gün önce
   - Template: `task-deadline-reminder`
   - Priority: HIGH
   - Scheduled: `scheduled_at`

7. **Forum Yanıt Bildirimi**
   - Trigger: Forum konusuna yanıt geldiğinde
   - Template: `forum-reply-notification`
   - Priority: LOW

### Marketing Emails

8. **E-ticaret Metrik Hatırlatma**
   - Trigger: Her ayın son günü (Sprint 15)
   - Template: `ecommerce-metrics-reminder`
   - Priority: NORMAL
   - Scheduled: Cron job

9. **Rapor Hazır**
   - Trigger: Rapor oluşturulduğunda (Sprint 16)
   - Template: `report-ready`
   - Priority: NORMAL

---

## 📊 SendGrid Configuration

### API Setup

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
```

### Email Options

```typescript
interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Attachment[];
  categories?: string[];
  customArgs?: Record<string, string>;
}
```

### Tracking

- Open tracking: Enabled
- Click tracking: Enabled
- Subscription tracking: Enabled
- Bounce handling: Enabled

---

## ✅ Kabul Kriterleri

- ✅ SendGrid entegrasyonu çalışıyor
- ✅ Email gönderimi çalışıyor
- ✅ Template sistemi çalışıyor
- ✅ Email queue çalışıyor
- ✅ Scheduled emails çalışıyor
- ✅ Email tracking çalışıyor
- ✅ Email tercihleri çalışıyor
- ✅ Unsubscribe çalışıyor
- ✅ Tests geçiyor

---

## 📊 Tahmini Süre

- **Faz A (Database):** 30 dakika
- **Faz B (Dependencies):** 15 dakika
- **Faz C (Services):** 2 saat
- **Faz D (Domain):** 30 dakika
- **Faz E (API Routes):** 30 dakika
- **Faz F (Templates):** 1 saat
- **Faz G (Cron Jobs):** 30 dakika
- **Faz H (Tests):** 30 dakika

**Toplam:** ~4 saat (~0.5 gün)

---

## 🚀 Başlangıç Adımları

1. Database migration oluştur
2. Dependencies kur
3. Configuration dosyası oluştur
4. Domain layer oluştur
5. Services implementasyonu
6. API routes oluştur
7. Email templates oluştur
8. Cron jobs setup
9. Tests yaz

---

## 🔗 Bağımlılıklar

- ✅ Sprint 2: Database & Auth (tamamlandı)
- ✅ Sprint 17: AI Altyapısı (tamamlandı - AI ile email içerik üretimi için)

---

## 📝 Notlar

### SendGrid Limits

- Free tier: 100 emails/day
- Essentials: 40,000 emails/month
- Pro: 100,000+ emails/month

### Email Best Practices

- SPF, DKIM, DMARC setup gerekli
- Unsubscribe link zorunlu
- Email validation gerekli
- Rate limiting önemli

---

**Son Güncelleme:** 15 Ocak 2025  
**Hazırlayan:** AI Assistant
