# E2E Tests

Bu klasör End-to-End (E2E) testleri içerir. Playwright kullanılarak yazılmıştır.

## Klasör Yapısı

```
e2e/
├── helpers/           # Test helper fonksiyonları
│   ├── auth.ts       # Authentication helpers
│   ├── page-objects.ts # Page object pattern
│   └── test-setup.ts # Test setup helpers
├── components/       # Component E2E testleri (component test'lerden migrate edildi)
├── appointments/     # Randevu yönetimi testleri
├── events/          # Etkinlik yönetimi testleri
├── projects/        # Proje yönetimi testleri
└── README.md        # Bu dosya
```

## Test Çalıştırma

### Önkoşullar

**⚠️ ÖNEMLİ:** E2E test'lerin çalışması için test kullanıcılarının database'de olması gerekir.

### Test Kullanıcıları Setup

Test kullanıcıları `e2e/helpers/auth.ts` dosyasında tanımlıdır:

- `admin@test.com` - Admin kullanıcı (password: `Test123!`)
- `consultant@test.com` - Consultant kullanıcı (password: `Test123!`)
- `company@test.com` - Company kullanıcı (password: `Test123!`)

**Bu kullanıcıları manuel olarak oluşturmanız gerekiyor:**

1. Supabase Dashboard'a giriş yapın
2. Authentication > Users bölümüne gidin
3. Her bir test kullanıcısını oluşturun
4. Kullanıcılara uygun role'leri atayın (users tablosunda)

### Test Çalıştırma Komutları

```bash
# Tüm E2E testleri çalıştır
npm run test:e2e

# UI mode'da çalıştır (interaktif)
npm run test:e2e:ui

# Headed mode'da çalıştır (browser görünür)
npm run test:e2e:headed

# Debug mode'da çalıştır
npm run test:e2e:debug

# Belirli bir test dosyası çalıştır
npx playwright test e2e/appointments/appointment-flow.spec.ts

# Sadece component E2E testleri
npx playwright test e2e/components
```

## Test Senaryoları

### Component E2E Testleri (Component test'lerden migrate edildi)

#### AppointmentRequestForm

- ✅ Form alanlarını render eder
- ✅ Firma programı yoksa hata mesajı gösterir
- ✅ Kullanıcı form alanlarını doldurabilir
- ✅ Form submit edildiğinde başarı mesajı gösterir
- ✅ İptal butonuna tıklandığında dialog kapanır

#### BulkDatesDialog

- ✅ Dialog açılır ve form alanları görünür
- ✅ Alt proje seçilebilir
- ✅ Tarih aralığı seçilebilir
- ✅ Form submit edildiğinde başarı mesajı gösterir
- ✅ İptal butonuna tıklandığında dialog kapanır

#### EventForm

- ✅ Form alanlarını render eder
- ✅ Zorunlu alanlar doğrulanır
- ✅ Başlangıç zamanı bitiş zamanından önce olmalı
- ✅ Form submit edildiğinde başarı mesajı gösterir
- ✅ Mevcut etkinlik düzenlenebilir
- ✅ İptal butonuna tıklandığında dialog kapanır

#### AvailabilityManagement

- ✅ Müsaitlik yönetimi sayfası yüklenir
- ✅ Yeni müsaitlik kuralı ekle butonu görünür
- ✅ Yeni müsait olmama tarihi ekle butonu görünür
- ✅ Müsaitlik kuralı dialog açılır
- ✅ Müsait olmama tarihi dialog açılır
- ✅ Müsaitlik kuralı oluşturulabilir
- ✅ Müsait olmama tarihi eklenebilir
- ✅ Boş durumda mesaj gösterilir

### Randevu Yönetimi

- ✅ Randevu oluşturma → Onaylama → Tamamlama
- ✅ Randevu oluşturma → Reddetme
- ✅ Randevu revize etme
- ✅ Müsaitlik kontrolü

### Etkinlik Yönetimi

- ✅ Etkinlik oluşturma → Katılım → Hatırlatma
- ✅ Etkinlik güncelleme → Zoom güncelleme
- ✅ Etkinlik iptal etme
- ✅ Etkinlik istatistikleri görüntüleme

### Proje Yönetimi

- ✅ Proje oluşturma → Görev atama → Tamamlama
- ✅ Toplu firma atama
- ✅ Toplu tarih atama
- ✅ Matris görünümü

## Test Helpers

### Authentication

```typescript
import { loginAs } from '../helpers/auth';

// Belirtilen role ile login
await loginAs(page, 'company');
await loginAs(page, 'consultant');
await loginAs(page, 'admin');
```

**Not:** Login başarısız olursa (test kullanıcıları yoksa), test otomatik olarak skip edilir.

### Page Objects

```typescript
import { AppointmentPage } from '../helpers/page-objects';

const appointmentPage = new AppointmentPage(page);
await appointmentPage.goto();
await appointmentPage.createAppointment({...});
await appointmentPage.approveAppointment('Test Randevu');
```

## Best Practices

1. **Page Object Pattern:** Her sayfa için page object class'ı kullan
2. **Test Isolation:** Her test bağımsız olmalı
3. **Descriptive Names:** Test isimleri açıklayıcı olmalı
4. **Wait Strategies:** Explicit wait kullan (implicit wait'ten kaçın)
5. **Screenshots:** Hata durumlarında otomatik screenshot alınır
6. **Video:** Hata durumlarında otomatik video kaydı yapılır
7. **Skip on Missing Users:** Test kullanıcıları yoksa test'i skip et

## Troubleshooting

### Test kullanıcıları bulunamıyor

**Çözüm:** Test kullanıcılarını Supabase Dashboard üzerinden manuel olarak oluşturun.

### Login başarısız

- Login sayfası URL'ini kontrol edin (`/login`)
- Form field selector'larını kontrol edin
- Test kullanıcı bilgilerini kontrol edin
- Browser console'da hata mesajlarını kontrol edin

### Element bulunamıyor

- Selector'ları kontrol edin
- Sayfanın yüklenmesini bekleyin (`waitForLoadState`)
- Timeout değerlerini artırın
- Screenshot'ları kontrol edin

### Test timeout

- `actionTimeout` değerini artırın (playwright.config.ts)
- Network isteklerinin tamamlanmasını bekleyin
- Slow motion mode kullanın (`--slow-mo=1000`)

## Component Test vs E2E Test

### Component Test'ler

- ✅ Hızlı feedback
- ✅ Unit-level test coverage
- ✅ Mock'lar ile izole test
- ❌ Radix UI component'leri ile sorunlar (portal rendering)

### E2E Test'ler

- ✅ Gerçek browser ortamı
- ✅ Integration-level test coverage
- ✅ Radix UI component'leri düzgün çalışır
- ❌ Daha yavaş
- ❌ Test kullanıcıları gerektirir

## Gelecek İyileştirmeler

1. **Test Data Setup:** Test kullanıcıları için seed script
2. **Test Isolation:** Her test için cleanup
3. **Parallel Execution:** Test'lerin paralel çalışması
4. **Visual Regression:** Screenshot comparison
5. **Performance Testing:** Sayfa yükleme süreleri
