# ⚠️ SPRINT 26 - WHATSAPP API ENVIRONMENT VARIABLES HATIRLATMASI

**Tarih:** Ocak 2025  
**Durum:** 🔴 Bekliyor - Kullanıcı Aksiyonu Gerekli  
**Sprint:** 26 - WhatsApp Bildirimleri

---

## 📋 YAPILMASI GEREKENLER

### 1. WhatsApp Business API Kurulumu

WhatsApp bildirimleri göndermek için WhatsApp Business API hesabı ve credentials gereklidir.

#### Adım 1: WhatsApp Business API Hesabı Oluşturma

1. **Meta for Developers** hesabı oluşturun
   - URL: `https://developers.facebook.com/`
   - Business hesabı oluşturun

2. **WhatsApp Business API** erişimi alın
   - Meta Business Suite üzerinden WhatsApp Business API'ye başvurun
   - Onay süreci 1-3 gün sürebilir

3. **WhatsApp Business Account** oluşturun
   - Phone number ID alın
   - Access token oluşturun

#### Adım 2: Environment Variables Ekle

`.env.local` dosyasına aşağıdaki satırları ekle:

```env
# WhatsApp Business API (Opsiyonel - WhatsApp bildirimleri için)
WHATSAPP_API_BASE_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

**Not:** Bu değişkenler opsiyoneldir. Eğer eklenmezse WhatsApp bildirimleri gönderilmez, sadece email bildirimleri çalışır.

---

### 2. WhatsApp Template'leri Oluşturma

WhatsApp Business API kullanmak için template'lerin Meta Business Suite'te onaylanması gerekiyor.

#### Gerekli Template'ler:

1. **`event_reminder_24h`** - Etkinlik hatırlatması (24 saat önce)
   - **Kategori:** UTILITY
   - **Dil:** Türkçe (tr)
   - **Parametreler:**
     - `{{1}}` - Etkinlik başlığı
     - `{{2}}` - Etkinlik tarihi
     - `{{3}}` - Etkinlik saati
     - `{{4}}` - Program adı (opsiyonel)
   - **Button:** Zoom linki (opsiyonel)

2. **`event_reminder_1h`** - Etkinlik hatırlatması (1 saat önce)
   - **Kategori:** UTILITY
   - **Dil:** Türkçe (tr)
   - **Parametreler:** (Aynı)

3. **`appointment_reminder_24h`** - Randevu hatırlatması (24 saat önce)
   - **Kategori:** UTILITY
   - **Dil:** Türkçe (tr)
   - **Parametreler:**
     - `{{1}}` - Randevu başlığı
     - `{{2}}` - Randevu tarihi
     - `{{3}}` - Randevu saati
     - `{{4}}` - Danışman adı
     - `{{5}}` - Firma adı
   - **Button:** Zoom linki (opsiyonel)

4. **`appointment_reminder_1h`** - Randevu hatırlatması (1 saat önce)
   - **Kategori:** UTILITY
   - **Dil:** Türkçe (tr)
   - **Parametreler:** (Aynı)

#### Template Oluşturma Adımları:

1. **Meta Business Suite** → **WhatsApp** → **Message Templates**
2. **"Create Template"** butonuna tıklayın
3. Template bilgilerini girin:
   - **Name:** Template adı (örn: `event_reminder_24h`)
   - **Category:** UTILITY
   - **Language:** Turkish (tr)
4. **Message Content** bölümünde template içeriğini oluşturun
5. **Submit for Review** ile onaya gönderin
6. Onay süreci 24-48 saat sürebilir

#### Örnek Template İçeriği:

**event_reminder_24h:**

```
Merhaba!

{{1}} etkinliği yarın gerçekleşecek.

📅 Tarih: {{2}}
🕐 Saat: {{3}}
{{#if programName}}
📚 Program: {{4}}
{{/if}}

Etkinliğe katılmak için aşağıdaki linke tıklayın.
```

**appointment_reminder_24h:**

```
Merhaba!

{{1}} randevunuz yarın gerçekleşecek.

📅 Tarih: {{2}}
🕐 Saat: {{3}}
👤 Danışman: {{4}}
🏢 Firma: {{5}}

Randevuya katılmak için aşağıdaki linke tıklayın.
```

---

## ✅ DOĞRULAMA CHECKLIST

- [ ] WhatsApp Business API hesabı oluşturuldu
- [ ] Phone Number ID alındı
- [ ] Access Token oluşturuldu
- [ ] Environment variables `.env.local`'e eklendi
- [ ] WhatsApp template'leri oluşturuldu ve onaylandı
- [ ] Template'ler test edildi

---

## 🎯 NEDEN GEREKLİ?

- Event ve Appointment hatırlatmaları WhatsApp üzerinden gönderilebilir
- Kullanıcılar email yerine WhatsApp üzerinden bildirim alabilir
- Daha yüksek açılma oranları (WhatsApp bildirimleri %98+ açılma oranına sahip)
- Kullanıcı deneyimi iyileşir

---

## 📝 NOTLAR

- **Phone Number Format:** WhatsApp için telefon numaraları E.164 formatında olmalı (örn: `+905551234567`)
- **Template Onayı:** Template'ler Meta tarafından onaylanmadan kullanılamaz
- **Rate Limits:** WhatsApp API rate limit'leri var (günlük mesaj limiti)
- **Opsiyonel:** WhatsApp API credentials olmadan da sistem çalışır (sadece email bildirimleri gönderilir)

---

## 🧪 TEST ETME

Environment variables eklendikten sonra test edin:

1. Bir etkinlik oluşturun
2. Etkinlik hatırlatması cron job'ını çalıştırın
3. WhatsApp mesajının gönderildiğini kontrol edin

**Test Endpoint:**

```bash
# Event reminder test
curl -X POST http://localhost:3000/api/cron/send-event-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Appointment reminder test
curl -X POST http://localhost:3000/api/cron/send-appointment-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🔗 İLGİLİ DOSYALAR

- **WhatsApp API Service:** `src/4-infrastructure/external/whatsapp-api.service.ts`
- **Notification Service:** `src/4-infrastructure/external/notification.service.ts`
- **Event Reminders:** `src/2-application/use-cases/event/SendEventRemindersUseCase.ts`
- **Appointment Reminders:** `src/2-application/use-cases/appointment/SendAppointmentRemindersUseCase.ts`

---

## 📚 KAYNAKLAR

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates)

---

**Hatırlatma:** WhatsApp API credentials olmadan WhatsApp bildirimleri gönderilmez, ancak sistem normal çalışmaya devam eder (sadece email bildirimleri gönderilir).
