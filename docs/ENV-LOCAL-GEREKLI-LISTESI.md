# 📋 .env.local Gerekli İçerikler Listesi

Bu dokümanda proje için gerekli tüm environment variable'lar ve nasıl alınacakları listelenmiştir.

---

## 🔴 ZORUNLU (Critical) - Proje Çalışması İçin Gerekli

### 1. Supabase (Database & Auth)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nasıl Alınır:**

1. [supabase.com](https://supabase.com) adresine git
2. Yeni proje oluştur veya mevcut projeyi seç
3. **Project Settings > API** bölümüne git
4. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Gizli tutulmalı!)

**Not:** Service Role Key'i asla client-side'da kullanma! Sadece server-side işlemler için.

---

### 2. Uygulama URL'i

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nasıl Alınır:**

- Development: `http://localhost:3000`
- Production: `https://akademiport.com` (veya domain'iniz)

---

## 🟡 ÖNEMLİ (Important) - Özellikler İçin Gerekli

### 3. AI Servisleri (OpenAI & Anthropic)

```env
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_BASE_URL=https://api.openai.com/v1
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

**Nasıl Alınır:**

#### OpenAI:

1. [platform.openai.com](https://platform.openai.com) adresine git
2. Hesap oluştur veya giriş yap
3. **API Keys** bölümüne git
4. **Create new secret key** → `OPENAI_API_KEY`
5. Base URL varsayılan: `https://api.openai.com/v1` (değiştirmene gerek yok)

#### Anthropic (Claude):

1. [console.anthropic.com](https://console.anthropic.com) adresine git
2. Hesap oluştur veya giriş yap
3. **API Keys** bölümüne git
4. **Create Key** → `ANTHROPIC_API_KEY`
5. Base URL varsayılan: `https://api.anthropic.com` (değiştirmene gerek yok)

**Not:** Her iki servis de ücretsiz tier sunuyor. Test için yeterli.

---

### 4. Email Servisi (SendGrid)

```env
SENDGRID_API_KEY=SG.xxxxx...
SENDGRID_FROM_EMAIL=noreply@akademiport.com
SENDGRID_FROM_NAME=Akademi Port
SENDGRID_REPLY_TO=info@akademiport.com
```

**Nasıl Alınır:**

1. [sendgrid.com](https://sendgrid.com) adresine git
2. Hesap oluştur (ücretsiz tier: 100 email/gün)
3. **Settings > API Keys** bölümüne git
4. **Create API Key** → `SENDGRID_API_KEY`
5. **Settings > Sender Authentication** → Domain veya Single Sender doğrula
6. `SENDGRID_FROM_EMAIL`: Doğrulanmış email adresi
7. `SENDGRID_FROM_NAME`: Gönderen adı (opsiyonel)
8. `SENDGRID_REPLY_TO`: Yanıt adresi (opsiyonel)

**Alternatif:** Development için email göndermeyi devre dışı bırakabilirsin:

```env
EMAIL_ENABLED=false
```

---

### 5. Web Push Notifications (VAPID Keys)

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGxxxxx...
VAPID_PRIVATE_KEY=xxxxx...
VAPID_SUBJECT=mailto:support@akademiport.com
```

**Nasıl Alınır:**

1. Terminal'de çalıştır:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

2. Çıktıdaki **Public Key** → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
3. Çıktıdaki **Private Key** → `VAPID_PRIVATE_KEY`
4. `VAPID_SUBJECT`: Email adresi veya `mailto:` formatında

**Not:** Bu anahtarlar browser push notification'ları için gereklidir.

---

## 🟢 OPSIYONEL (Optional) - Ek Özellikler İçin

### 6. Analytics (Google Analytics & Mixpanel)

```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=xxxxx...
```

**Nasıl Alınır:**

#### Google Analytics 4:

1. [analytics.google.com](https://analytics.google.com) adresine git
2. Yeni property oluştur
3. **Admin > Data Streams > Web** → Measurement ID → `NEXT_PUBLIC_GA4_MEASUREMENT_ID`

#### Mixpanel:

1. [mixpanel.com](https://mixpanel.com) adresine git
2. Hesap oluştur
3. **Project Settings > Project Token** → `NEXT_PUBLIC_MIXPANEL_TOKEN`

---

### 7. Error Tracking (Sentry)

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_ENABLE_DEV=false
```

**Nasıl Alınır:**

1. [sentry.io](https://sentry.io) adresine git
2. Yeni proje oluştur
3. **Settings > Client Keys (DSN)** → `NEXT_PUBLIC_SENTRY_DSN`
4. Development'ta test için: `NEXT_PUBLIC_SENTRY_ENABLE_DEV=true`

---

### 8. WhatsApp API (Meta Business)

```env
WHATSAPP_API_BASE_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=xxxxx
WHATSAPP_ACCESS_TOKEN=xxxxx
```

**Nasıl Alınır:**

1. [developers.facebook.com](https://developers.facebook.com) adresine git
2. Meta Business hesabı oluştur
3. WhatsApp Business API'yi aktifleştir
4. **WhatsApp > API Setup** → Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
5. **Access Token** → `WHATSAPP_ACCESS_TOKEN`

**Not:** Bu özellik şu an kullanılmıyor olabilir, opsiyoneldir.

---

### 9. YouTube API (Video Embed)

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSy...
```

**Nasıl Alınır:**

1. [console.cloud.google.com](https://console.cloud.google.com) adresine git
2. Yeni proje oluştur
3. **APIs & Services > Library** → YouTube Data API v3'ü aktifleştir
4. **APIs & Services > Credentials** → Create Credentials → API Key → `NEXT_PUBLIC_YOUTUBE_API_KEY`

**Not:** YouTube video embed için gerekli değil, sadece video metadata için.

---

### 10. Cron Jobs Secret

```env
CRON_SECRET=your-random-secret-key-here
```

**Nasıl Alınır:**

1. Güvenli bir random string oluştur:

```bash
openssl rand -hex 32
```

2. Veya online generator kullan: [randomkeygen.com](https://randomkeygen.com)
3. Bu secret, cron job endpoint'lerini korumak için kullanılır

---

## 🔧 OPSIYONEL KONFIGÜRASYONLAR

### Email Queue Ayarları

```env
EMAIL_QUEUE_BATCH_SIZE=10
EMAIL_RETRY_DELAY=300000
EMAIL_MAX_RETRIES=3
EMAIL_TRACKING_ENABLED=true
EMAIL_OPEN_TRACKING=true
EMAIL_CLICK_TRACKING=true
```

**Varsayılanlar:** Yukarıdaki değerler varsayılan olarak kullanılır, değiştirmene gerek yok.

---

### Notification Ayarları

```env
NOTIFICATION_EXPIRATION_DAYS=30
MAX_NOTIFICATIONS_PER_USER=1000
NOTIFICATION_BATCH_SIZE=100
```

**Varsayılanlar:** Yukarıdaki değerler varsayılan olarak kullanılır.

---

### Test & Development

```env
NODE_ENV=development
BASE_URL=http://localhost:3000
```

**Not:** `NODE_ENV` otomatik olarak Next.js tarafından ayarlanır.

---

## 📝 ÖRNEK .env.local DOSYASI

```env
# ============================================
# ZORUNLU - Proje Çalışması İçin
# ============================================

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# ÖNEMLİ - Özellikler İçin
# ============================================

# AI Servisleri
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx...
SENDGRID_FROM_EMAIL=noreply@akademiport.com
SENDGRID_FROM_NAME=Akademi Port
SENDGRID_REPLY_TO=info@akademiport.com

# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGxxxxx...
VAPID_PRIVATE_KEY=xxxxx...
VAPID_SUBJECT=mailto:support@akademiport.com

# ============================================
# OPSIYONEL - Ek Özellikler
# ============================================

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=xxxxx...

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_ENABLE_DEV=false

# WhatsApp (Opsiyonel)
# WHATSAPP_API_BASE_URL=https://graph.facebook.com/v18.0
# WHATSAPP_PHONE_NUMBER_ID=xxxxx
# WHATSAPP_ACCESS_TOKEN=xxxxx

# YouTube API (Opsiyonel)
# NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSy...

# Cron Jobs
CRON_SECRET=your-random-secret-key-here

# ============================================
# OPSIYONEL KONFIGÜRASYONLAR
# ============================================

# Email Queue (Varsayılanlar yeterli)
# EMAIL_QUEUE_BATCH_SIZE=10
# EMAIL_RETRY_DELAY=300000
# EMAIL_MAX_RETRIES=3
# EMAIL_TRACKING_ENABLED=true

# Notifications (Varsayılanlar yeterli)
# NOTIFICATION_EXPIRATION_DAYS=30
# MAX_NOTIFICATIONS_PER_USER=1000
# NOTIFICATION_BATCH_SIZE=100
```

---

## ✅ KONTROL LİSTESİ

### Minimum Gereksinimler (Proje Çalışması İçin):

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`

### Özellikler İçin:

- [ ] AI Özellikleri → `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- [ ] Email Gönderimi → `SENDGRID_API_KEY`
- [ ] Push Notifications → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- [ ] Analytics → `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_MIXPANEL_TOKEN`
- [ ] Error Tracking → `NEXT_PUBLIC_SENTRY_DSN`
- [ ] WhatsApp → `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`
- [ ] YouTube API → `NEXT_PUBLIC_YOUTUBE_API_KEY`
- [ ] Cron Jobs → `CRON_SECRET`

---

## 🔍 KONTROL KOMUTLARI

### AI Servisleri Kontrolü:

```bash
npx tsx src/5-shared/services/ai/check-env.ts
```

### Supabase Bağlantı Kontrolü:

```bash
npm run dev
# Tarayıcıda http://localhost:3000 açılmalı
```

### Environment Variables Kontrolü:

```bash
# Tüm environment variable'ları göster (güvenli değil, dikkatli kullan!)
node -e "console.log(process.env)"
```

---

## ⚠️ GÜVENLİK UYARILARI

1. **`.env.local` dosyasını asla commit etme!** (`.gitignore`'da olmalı)
2. **Service Role Key'i asla client-side'da kullanma!**
3. **API Key'leri production'da environment variable olarak ayarla**
4. **Vercel/Netlify gibi platformlarda Secrets olarak ekle**

---

## 📚 İLGİLİ DOKÜMANTASYON

- [Developer Guide](./DEVELOPER.md)
- [AI Service README](../src/5-shared/services/ai/README.md)
- [Sentry Setup](./SENTRY-SETUP.md)
- [Storage Setup Guide](./STORAGE-SETUP-GUIDE.md)

---

**Son Güncelleme:** 20 Kasım 2025
