# 🔗 Zoom API Entegrasyonu Dokümantasyonu

**Sprint 10: Etkinlik Yönetimi**  
**Son Güncelleme:** 2025-01-XX

---

## 📋 Genel Bakış

Akademi Port, Zoom Meeting API'sini kullanarak etkinlikler için otomatik Zoom meeting oluşturma, güncelleme ve silme özelliklerini destekler.

---

## 🔑 Zoom API Credentials Alma

### Adım 1: Zoom Marketplace'te OAuth App Oluşturma

1. [Zoom Marketplace](https://marketplace.zoom.us/) üzerinden giriş yapın
2. "Develop" > "Build App" seçeneğine tıklayın
3. "Server-to-Server OAuth" seçeneğini seçin
4. App bilgilerini doldurun:
   - **App Name:** Akademi Port
   - **Company Name:** Şirket Adınız
   - **Developer Contact Information:** İletişim bilgileriniz

### Adım 2: App Credentials Alma

1. App oluşturulduktan sonra "App Credentials" sekmesine gidin
2. Şu bilgileri kopyalayın:
   - **Account ID** → `ZOOM_ACCOUNT_ID`
   - **Client ID** → `ZOOM_CLIENT_ID`
   - **Client Secret** → `ZOOM_CLIENT_SECRET`

### Adım 3: Scopes (İzinler) Ayarlama

"Scopes" sekmesinde şu izinleri aktif edin:

- `meeting:write` - Meeting oluşturma ve güncelleme
- `meeting:write:admin` - Admin yetkisiyle meeting yönetimi
- `meeting:delete` - Meeting silme

### Adım 4: Environment Variables Ayarlama

`.env.local` dosyanıza şu değişkenleri ekleyin:

```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
```

---

## 🚀 Kullanım

### Etkinlik Oluştururken Zoom Meeting Oluşturma

Etkinlik oluştururken `createZoomMeeting: true` parametresi gönderilirse, otomatik olarak Zoom meeting oluşturulur:

```typescript
const event = await createEvent({
  title: 'Webinar: Dijital Pazarlama',
  startTime: new Date('2025-02-01T10:00:00Z'),
  endTime: new Date('2025-02-01T11:00:00Z'),
  createZoomMeeting: true, // Zoom meeting oluştur
});
```

### Zoom Meeting Bilgileri

Etkinlik oluşturulduktan sonra şu bilgiler otomatik olarak kaydedilir:

- `zoomMeetingId` - Zoom meeting ID
- `zoomJoinUrl` - Katılımcılar için join URL
- `zoomStartUrl` - Host için start URL
- `zoomPassword` - Meeting şifresi (varsa)

### Zoom Meeting Güncelleme

Etkinlik güncellendiğinde Zoom meeting'i de güncellemek için:

```typescript
const updatedEvent = await updateEvent(eventId, {
  title: 'Güncellenmiş Başlık',
  startTime: new Date('2025-02-01T11:00:00Z'),
  updateZoomMeeting: true, // Zoom meeting'i de güncelle
});
```

### Zoom Meeting Silme

Etkinlik silindiğinde Zoom meeting'i de silmek için:

```typescript
await deleteEvent(eventId, {
  deleteZoomMeeting: true, // Zoom meeting'i de sil
});
```

---

## 🔧 Teknik Detaylar

### ZoomApiService

`src/4-infrastructure/external/zoom-api.service.ts` dosyasında Zoom API entegrasyonu yönetilir.

#### Özellikler:

- ✅ OAuth token yönetimi
- ✅ Meeting oluşturma
- ✅ Meeting güncelleme
- ✅ Meeting silme
- ✅ Hata yönetimi
- ✅ Graceful fallback (Zoom API çalışmazsa event yine de oluşturulur)

#### Kullanım:

```typescript
import { ZoomApiService } from '@/infrastructure/external/zoom-api.service';

// Meeting oluştur
const meeting = await ZoomApiService.createMeeting({
  topic: 'Etkinlik Başlığı',
  startTime: new Date('2025-02-01T10:00:00Z'),
  duration: 60, // dakika
  timezone: 'Europe/Istanbul',
  password: 'optional_password',
});

if (meeting) {
  console.log('Meeting ID:', meeting.id);
  console.log('Join URL:', meeting.joinUrl);
}
```

---

## ⚠️ Hata Yönetimi

### Zoom API Kullanılamazsa

Eğer Zoom API credentials yapılandırılmamışsa veya bir hata oluşursa:

- Event yine de oluşturulur/güncellenir
- Zoom meeting bilgileri `null` olarak kalır
- Kullanıcıya uyarı mesajı gösterilir (opsiyonel)

### Yaygın Hatalar

1. **Invalid Credentials**
   - Çözüm: Environment variables'ı kontrol edin
   - `.env.local` dosyasının doğru yüklendiğinden emin olun

2. **Insufficient Scopes**
   - Çözüm: Zoom Marketplace'te gerekli scopes'ları aktif edin

3. **Rate Limiting**
   - Çözüm: Zoom API rate limit'lerine dikkat edin
   - Retry logic eklenebilir (gelecekte)

---

## 🧪 Test Etme

### Local Development

1. `.env.local` dosyasına Zoom credentials ekleyin
2. Bir test etkinliği oluşturun
3. Zoom meeting'in oluşturulduğunu kontrol edin
4. Zoom dashboard'da meeting'in göründüğünü doğrulayın

### Production

1. Vercel Environment Variables'a Zoom credentials ekleyin
2. Production'da bir test etkinliği oluşturun
3. Zoom meeting'in oluşturulduğunu kontrol edin

---

## 📚 Kaynaklar

- [Zoom Marketplace Documentation](https://marketplace.zoom.us/docs/guides)
- [Zoom Meeting API Reference](https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Meetings)
- [Server-to-Server OAuth Guide](https://marketplace.zoom.us/docs/guides/build/server-to-server-oauth-app/)

---

## 🔒 Güvenlik

- ✅ Zoom credentials `.env.local` dosyasında saklanır (git'e commit edilmez)
- ✅ Production'da Vercel Environment Variables kullanılır
- ✅ OAuth token'lar memory'de saklanır (geçici)
- ✅ Meeting şifreleri opsiyonel olarak ayarlanabilir

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Son Güncelleme:** 2025-01-XX
