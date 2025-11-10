# E2E Test Setup Guide

**Tarih:** 2025-01-XX  
**Durum:** ✅ Hazır

---

## 🎯 Amaç

E2E test'lerin çalışması için gerekli setup adımlarını açıklar.

---

## ⚠️ Önkoşullar

E2E test'lerin çalışması için:

1. ✅ Next.js development server çalışıyor olmalı (`npm run dev`)
2. ✅ Test kullanıcıları database'de olmalı
3. ✅ Playwright browser'ları yüklü olmalı (`npx playwright install`)

---

## 📋 Test Kullanıcıları Setup

### 1. Supabase Dashboard'a Giriş

1. Supabase Dashboard'a giriş yapın
2. Projenizi seçin

### 2. Test Kullanıcılarını Oluştur

**Authentication > Users** bölümüne gidin ve şu kullanıcıları oluşturun:

#### Admin Kullanıcı

- **Email:** `admin@test.com`
- **Password:** `Test123!`
- **Role:** `MASTER_ADMIN` (users tablosunda)

#### Consultant Kullanıcı

- **Email:** `consultant@test.com`
- **Password:** `Test123!`
- **Role:** `CONSULTANT` (users tablosunda)
- **Program:** Bir programa atanmış olmalı

#### Company Kullanıcı

- **Email:** `company@test.com`
- **Password:** `Test123!`
- **Role:** `COMPANY_USER` (users tablosunda)
- **Company:** Bir firmaya atanmış olmalı
- **Program:** Firması bir programa atanmış olmalı

### 3. Users Tablosunda Role Ata

SQL Editor'de şu sorguları çalıştırın:

```sql
-- Admin kullanıcısına role ata
UPDATE users
SET role = 'MASTER_ADMIN'
WHERE email = 'admin@test.com';

-- Consultant kullanıcısına role ata ve program'a bağla
UPDATE users
SET role = 'CONSULTANT'
WHERE email = 'consultant@test.com';

-- Company kullanıcısına role ata ve company'ye bağla
UPDATE users
SET role = 'COMPANY_USER',
    company_id = (SELECT id FROM companies LIMIT 1)
WHERE email = 'company@test.com';
```

### 4. Test Verilerini Oluştur (Opsiyonel)

Test'lerin daha kapsamlı çalışması için:

- En az 1 program oluşturun
- En az 1 consultant'ı programa atayın
- En az 1 company'yi programa atayın
- Company kullanıcısını company'ye atayın

---

## 🚀 Test Çalıştırma

### İlk Kurulum

```bash
# Playwright browser'ları yükle
npx playwright install

# Development server'ı başlat (başka bir terminal'de)
npm run dev
```

### Test Çalıştırma

```bash
# Tüm E2E testleri
npm run test:e2e

# Sadece component E2E testleri
npx playwright test e2e/components

# UI mode (interaktif)
npm run test:e2e:ui

# Headed mode (browser görünür)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

---

## 🔧 Troubleshooting

### Login Başarısız

**Sorun:** `TimeoutError: page.waitForURL: Timeout 10000ms exceeded`

**Çözüm:**

1. Test kullanıcılarının database'de olduğundan emin olun
2. Login sayfası URL'ini kontrol edin (`/login`)
3. Form field selector'larını kontrol edin
4. Browser console'da hata mesajlarını kontrol edin

### Element Bulunamıyor

**Sorun:** `TimeoutError: locator.click: Timeout 15000ms exceeded`

**Çözüm:**

1. Sayfanın tamamen yüklendiğinden emin olun (`waitForLoadState`)
2. Selector'ları kontrol edin
3. Screenshot'ları kontrol edin (`test-results/` klasöründe)
4. Timeout değerlerini artırın

### Test Kullanıcıları Yok

**Sorun:** Test'ler skip ediliyor veya login başarısız

**Çözüm:**

1. Test kullanıcılarını Supabase Dashboard üzerinden oluşturun
2. Role'leri users tablosunda doğru şekilde atayın
3. Company kullanıcısını bir company'ye atayın
4. Consultant kullanıcısını bir programa atayın

---

## 📝 Notlar

### Test Isolation

Her test bağımsız çalışmalı. Test'ler arasında:

- State temizlenmez (şimdilik)
- Database verileri kalıcıdır
- Test kullanıcıları paylaşılır

### Test Verileri

Test'ler gerçek database'i kullanır. Test verileri:

- Production verilerini etkilemez (RLS policies sayesinde)
- Test kullanıcıları sadece kendi verilerini görebilir
- Test'ler arasında veriler kalıcıdır

### Performance

E2E test'ler component test'lerden daha yavaştır:

- Her test gerçek browser açıp kapatır
- Network istekleri gerçekten yapılır
- Database sorguları gerçekten çalışır

---

## 🎯 Sonraki Adımlar

1. **Test Data Seed Script:** Test kullanıcıları ve verileri için otomatik seed script
2. **Test Cleanup:** Her test sonrası verileri temizleme
3. **Test Isolation:** Her test için izole database state
4. **CI/CD Integration:** GitHub Actions'da E2E test'leri çalıştırma

---

## 📚 Referanslar

- [Playwright Documentation](https://playwright.dev/)
- [E2E Test Best Practices](https://playwright.dev/docs/best-practices)
- [Test Setup Guide](./E2E-TEST-SETUP-GUIDE.md)
