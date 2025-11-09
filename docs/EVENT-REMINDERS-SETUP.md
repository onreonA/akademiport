# 📧 Etkinlik Hatırlatma Sistemi Kurulumu

**Sprint 10: Etkinlik Yönetimi**  
**Son Güncelleme:** 2025-01-XX

---

## 📋 Genel Bakış

Akademi Port, yaklaşan etkinlikler için otomatik hatırlatma sistemi sunar. Sistem Vercel Cron Jobs kullanarak periyodik olarak çalışır ve katılımcılara email hatırlatmaları gönderir.

---

## ⚙️ Kurulum

### 1. Vercel Cron Jobs Yapılandırması

`vercel.json` dosyasında iki cron job tanımlıdır:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-event-reminders?type=1hour",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-event-reminders?type=24hours",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Cron Schedule Açıklamaları:**

- `0 * * * *` - Her saat başı (1 saat önce hatırlatma)
- `0 9 * * *` - Her gün saat 09:00'da (24 saat önce hatırlatma)

### 2. Environment Variables

`.env.local` veya Vercel Environment Variables'a şu değişkenleri ekleyin:

```env
# Cron Job Security
CRON_SECRET=your_random_secret_key_here

# Email Configuration (gelecekte SendGrid için)
EMAIL_ENABLED=true
EMAIL_SERVICE_API_KEY=your_email_api_key
```

**CRON_SECRET:** Vercel Cron Jobs'un güvenliği için kullanılır. Rastgele bir string oluşturun.

### 3. Vercel'de Cron Jobs Aktifleştirme

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. "Settings" > "Cron Jobs" sekmesine gidin
4. Cron jobs'ların aktif olduğunu kontrol edin

**Not:** Vercel Pro plan gerektirebilir (Free tier'da sınırlı cron job desteği var).

---

## 🔄 Nasıl Çalışır?

### 1. 24 Saat Önce Hatırlatma

- **Zaman:** Her gün saat 09:00'da çalışır
- **Hedef:** 24 saat sonra başlayacak etkinlikler
- **Pencere:** ±30 dakika tolerans

### 2. 1 Saat Önce Hatırlatma

- **Zaman:** Her saat başı çalışır
- **Hedef:** 1 saat sonra başlayacak etkinlikler
- **Pencere:** ±7.5 dakika tolerans

### 3. Hatırlatma Gönderme Süreci

1. Cron job tetiklenir
2. Yaklaşan etkinlikler sorgulanır
3. Her etkinlik için katılımcılar alınır
4. Katılımcıların email adresleri toplanır
5. Email hatırlatmaları gönderilir
6. Sonuçlar loglanır

---

## 📧 Email İçeriği

### 24 Saat Önce Hatırlatma

```
Konu: Etkinlik Hatırlatması: [Etkinlik Başlığı] - yarın

İçerik:
- Etkinlik başlığı
- Tarih ve saat
- Program adı (varsa)
- Açıklama (varsa)
- Zoom linki (varsa)
- Zoom şifresi (varsa)
```

### 1 Saat Önce Hatırlatma

```
Konu: Etkinlik Hatırlatması: [Etkinlik Başlığı] - 1 saat sonra

İçerik:
- Etkinlik başlığı
- Tarih ve saat
- Program adı (varsa)
- Zoom linki (varsa)
- Zoom şifresi (varsa)
```

---

## 🧪 Test Etme

### Manuel Test

Cron job'u manuel olarak test etmek için:

```bash
# 1 saat önce hatırlatma testi
curl -X POST http://localhost:3000/api/cron/send-event-reminders?type=1hour \
  -H "Authorization: Bearer your_cron_secret"

# 24 saat önce hatırlatma testi
curl -X POST http://localhost:3000/api/cron/send-event-reminders?type=24hours \
  -H "Authorization: Bearer your_cron_secret"
```

### Test Senaryosu

1. Bir test etkinliği oluşturun (1 saat sonra başlayacak)
2. Etkinliğe katılımcı ekleyin
3. Cron job'u manuel olarak tetikleyin
4. Email'in geldiğini kontrol edin

---

## 📊 Monitoring

### Loglar

Cron job çalıştığında şu bilgiler loglanır:

- İşlenen etkinlik sayısı
- Gönderilen hatırlatma sayısı
- Başarısız hatırlatma sayısı
- Hata detayları

### Vercel Dashboard

Vercel Dashboard'da cron job çalışma geçmişini görebilirsiniz:

- "Deployments" > "Functions" > "Cron Jobs"

---

## ⚠️ Önemli Notlar

1. **Email Servisi:** Şu anda email gönderme simüle ediliyor. Gerçek email göndermek için SendGrid veya benzeri bir servis entegre edilmelidir.

2. **Vercel Pro Plan:** Production'da cron jobs için Vercel Pro plan gerekebilir.

3. **Rate Limiting:** Email servisi rate limit'lerine dikkat edin.

4. **Duplicate Prevention:** Aynı hatırlatmanın birden fazla gönderilmemesi için `event_reminders` tablosu eklenebilir (gelecekte).

---

## 🔮 Gelecek İyileştirmeler

- [ ] WhatsApp hatırlatmaları (Sprint 16)
- [ ] In-app bildirimler
- [ ] Hatırlatma tercihleri (kullanıcı bazlı)
- [ ] Hatırlatma geçmişi tablosu
- [ ] Duplicate prevention mekanizması
- [ ] Retry logic (başarısız gönderimler için)

---

## 📚 Kaynaklar

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Notification Service](../src/4-infrastructure/external/notification.service.ts)
- [SendEventRemindersUseCase](../src/2-application/use-cases/event/SendEventRemindersUseCase.ts)

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Son Güncelleme:** 2025-01-XX
