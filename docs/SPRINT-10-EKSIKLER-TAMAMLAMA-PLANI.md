# 📋 Sprint 10 Eksiklerini Tamamlama Planı

**Tarih:** 2025-01-XX  
**Durum:** 🟡 Planlama Aşaması  
**Tahmini Süre:** 2-3 gün

---

## 🎯 Genel Bakış

Sprint 10 (Etkinlik Yönetimi) temel özellikleri tamamlandı. Şimdi eksik kalan kritik özellikleri tamamlayacağız:

1. ✅ **Zoom Entegrasyonu** - Kod hazır, test ve config gerekli
2. ✅ **Katılım Takibi** - Backend hazır, Frontend'de katılımcı listesi eksik
3. ❌ **Otomatik Hatırlatmalar** - Sistem eksik
4. ✅ **Company Etkinlik Detay** - Mevcut ve çalışıyor

---

## 📦 Görev 1: Zoom Entegrasyonu İyileştirmeleri

### Durum

- ✅ Zoom API service mevcut (`zoom-api.service.ts`)
- ✅ Event entity'de Zoom alanları var
- ✅ CreateEventUseCase'de Zoom meeting oluşturma var
- ⚠️ Environment variables kontrolü yapılıyor ama `.env` dosyası yok

### Yapılacaklar

#### 1.1 Environment Variables Dokümantasyonu

- [ ] `.env.example` dosyası oluştur
- [ ] Zoom API credentials için dokümantasyon hazırla
- [ ] Vercel environment variables setup guide

#### 1.2 Zoom API Hata Yönetimi İyileştirmeleri

- [ ] Daha detaylı error messages
- [ ] Retry logic ekle
- [ ] Fallback mekanizması (Zoom oluşturulamazsa event yine de oluşturulsun)

#### 1.3 Zoom Meeting Test

- [ ] Test event oluşturma
- [ ] Zoom meeting oluşturma testi
- [ ] Zoom meeting güncelleme testi
- [ ] Zoom meeting silme testi

**Dosyalar:**

- `src/4-infrastructure/external/zoom-api.service.ts`
- `.env.example`
- `docs/ZOOM-INTEGRATION.md`

**Tahmini Süre:** 2-3 saat

---

## 📦 Görev 2: Katılımcı Listesi Görüntüleme

### Durum

- ✅ `event_attendances` tablosu mevcut
- ✅ `GetEventAttendeesUseCase` mevcut
- ✅ API route mevcut (`GET /api/events/[id]/attendance`)
- ❌ Frontend'de katılımcı listesi görüntüleme eksik

### Yapılacaklar

#### 2.1 EventDetail Component'ine Katılımcı Listesi Ekle

- [ ] `EventDetail.tsx` component'ine katılımcı listesi bölümü ekle
- [ ] `useEventAttendees` hook oluştur
- [ ] Katılımcı kartları component'i oluştur
- [ ] Loading ve empty states ekle

#### 2.2 Katılımcı Bilgileri

- [ ] Kullanıcı adı
- [ ] Firma adı
- [ ] Kayıt tarihi
- [ ] Katılım durumu (registered/attended)
- [ ] Notlar (varsa)

#### 2.3 Yetkilendirme

- [ ] Admin: Tüm katılımcıları görebilir
- [ ] Consultant: Kendi etkinliklerinin katılımcılarını görebilir
- [ ] Company: Sadece kendi katılımını görebilir

**Dosyalar:**

- `src/1-presentation/components/features/events/EventDetail.tsx`
- `src/5-shared/hooks/api/useEventAttendees.ts`
- `src/1-presentation/components/features/events/AttendeeList.tsx` (yeni)

**Tahmini Süre:** 3-4 saat

---

## 📦 Görev 3: Otomatik Hatırlatma Sistemi

### Durum

- ✅ Notification service mevcut (`notification.service.ts`)
- ✅ Email template'lerinde Zoom linki var
- ❌ Otomatik hatırlatma sistemi eksik (cron job, scheduled tasks)

### Yapılacaklar

#### 3.1 Vercel Cron Jobs Setup

- [ ] `vercel.json` dosyasına cron job tanımları ekle
- [ ] Her saat başı çalışacak cron job oluştur
- [ ] Yaklaşan etkinlikleri kontrol eden API route oluştur

#### 3.2 Hatırlatma Mantığı

- [ ] 24 saat önce hatırlatma gönder
- [ ] 1 saat önce hatırlatma gönder
- [ ] Etkinlik başladığında bildirim gönder

#### 3.3 Hatırlatma Gönderme

- [ ] Email hatırlatması gönder
- [ ] In-app notification oluştur
- [ ] WhatsApp hatırlatması (opsiyonel, gelecekte)

#### 3.4 Hatırlatma Geçmişi

- [ ] `event_reminders` tablosu oluştur (opsiyonel)
- [ ] Gönderilen hatırlatmaları kaydet
- [ ] Duplicate hatırlatma önleme

**Dosyalar:**

- `vercel.json` (yeni veya güncelle)
- `src/app/api/cron/send-event-reminders/route.ts` (yeni)
- `src/2-application/use-cases/event/SendEventRemindersUseCase.ts` (yeni)
- `src/4-infrastructure/database/migrations/032_event_reminders.sql` (opsiyonel)

**Tahmini Süre:** 4-5 saat

---

## 📦 Görev 4: Katılım İstatistikleri ve Raporlama

### Durum

- ✅ Katılım kaydı sistemi çalışıyor
- ❌ İstatistikler ve raporlama eksik

### Yapılacaklar

#### 4.1 Katılım İstatistikleri API

- [ ] Event bazlı katılım istatistikleri endpoint'i
- [ ] Program bazlı katılım istatistikleri endpoint'i
- [ ] Consultant bazlı katılım istatistikleri endpoint'i

#### 4.2 İstatistikler

- [ ] Toplam kayıt sayısı
- [ ] Gerçek katılım sayısı (attended_at dolu olanlar)
- [ ] Katılım oranı (%)
- [ ] Firma bazlı katılım dağılımı

#### 4.3 Frontend İstatistik Görünümü

- [ ] EventDetail sayfasına istatistik kartları ekle
- [ ] Grafik görünümü (opsiyonel)

**Dosyalar:**

- `src/app/api/events/[id]/statistics/route.ts` (yeni)
- `src/2-application/use-cases/event/GetEventStatisticsUseCase.ts` (yeni)
- `src/1-presentation/components/features/events/EventStatistics.tsx` (yeni)

**Tahmini Süre:** 3-4 saat

---

## 📊 Öncelik Sırası

1. **Yüksek Öncelik:**
   - ✅ Görev 2: Katılımcı Listesi Görüntüleme (kullanıcı deneyimi için kritik)
   - ✅ Görev 1: Zoom Entegrasyonu İyileştirmeleri (temel özellik)

2. **Orta Öncelik:**
   - ✅ Görev 3: Otomatik Hatırlatma Sistemi (kullanıcı deneyimi için önemli)

3. **Düşük Öncelik:**
   - ✅ Görev 4: Katılım İstatistikleri (nice-to-have)

---

## 🎯 Kabul Kriterleri

### Görev 1: Zoom Entegrasyonu

- [ ] `.env.example` dosyası mevcut
- [ ] Zoom API credentials dokümante edilmiş
- [ ] Zoom meeting oluşturma test edilmiş
- [ ] Hata durumlarında graceful fallback çalışıyor

### Görev 2: Katılımcı Listesi

- [ ] EventDetail sayfasında katılımcı listesi görünüyor
- [ ] Katılımcı bilgileri doğru gösteriliyor
- [ ] Yetkilendirme doğru çalışıyor
- [ ] Loading ve empty states var

### Görev 3: Otomatik Hatırlatmalar

- [ ] Vercel cron job çalışıyor
- [ ] 24 saat önce hatırlatma gönderiliyor
- [ ] 1 saat önce hatırlatma gönderiliyor
- [ ] Email hatırlatmaları gönderiliyor
- [ ] Duplicate hatırlatma önleniyor

### Görev 4: Katılım İstatistikleri

- [ ] Event bazlı istatistikler API'den geliyor
- [ ] İstatistikler EventDetail sayfasında gösteriliyor
- [ ] Grafik görünümü çalışıyor (opsiyonel)

---

## 📝 Notlar

- Zoom API için test credentials gerekli
- Vercel Cron Jobs için pro plan gerekebilir (free tier'da sınırlı)
- WhatsApp entegrasyonu gelecekte eklenecek
- İstatistikler için grafik kütüphanesi seçimi gerekli (recharts, chart.js, vs.)

---

## 🔗 İlgili Dosyalar

- `src/4-infrastructure/external/zoom-api.service.ts`
- `src/1-presentation/components/features/events/EventDetail.tsx`
- `src/app/api/events/[id]/attendance/route.ts`
- `src/4-infrastructure/external/notification.service.ts`

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Son Güncelleme:** 2025-01-XX
