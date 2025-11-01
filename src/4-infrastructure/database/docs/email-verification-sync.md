# Email Verification Senkronizasyonu

## Mevcut Durum

`sync_user_email_verification_trigger` trigger'ı kaldırılmıştır çünkü `auth.users` tablosuna INSERT yapılırken hata veriyordu.

Şu an email verification `UserRepository.create()` metodunda direkt olarak `is_email_verified: true` şeklinde set edilmektedir.

## Sorun

Kullanıcı Supabase Auth üzerinden kendi email'ini onayladığında (`email_confirmed_at` güncellendiğinde), `public.users.is_email_verified` alanı otomatik olarak güncellenmez.

## Gelecekte İzlenecek Çözüm: Supabase Webhook

### Seçenek 1: Supabase Webhook (Önerilen)

1. **Supabase Dashboard'da Webhook Oluşturma:**
   - Settings > Database > Webhooks
   - Yeni webhook oluştur
   - Event: `auth.users` tablosunda `UPDATE` event'i
   - URL: API endpoint (örn: `/api/webhooks/auth-users-update`)

2. **API Endpoint Oluşturma:**
   - `src/app/api/webhooks/auth-users-update/route.ts`
   - Webhook'dan gelen `auth.users` UPDATE event'ini yakala
   - `email_confirmed_at` değişikliğini kontrol et
   - `public.users.is_email_verified` alanını güncelle

3. **Örnek Implementation:**

   ```typescript
   // src/app/api/webhooks/auth-users-update/route.ts
   export async function POST(request: NextRequest) {
     const payload = await request.json();

     if (payload.type === 'UPDATE' && payload.table === 'users') {
       const newRecord = payload.record;
       const oldRecord = payload.old_record;

       // Email verification kontrolü
       if (newRecord.email_confirmed_at && !oldRecord.email_confirmed_at) {
         // public.users tablosunu güncelle
         await updateUserEmailVerification(newRecord.id, true);
       }
     }

     return NextResponse.json({ success: true });
   }
   ```

### Seçenek 2: API Endpoint ile Manuel Senkronizasyon

Kullanıcı email'ini onayladıktan sonra, frontend'den veya backend'den manuel olarak API endpoint'i çağırarak senkronizasyon yapılabilir.

## Notlar

- Trigger kullanımı `auth.users` tablosunda INSERT sırasında sorun yaratıyor
- Şu an her yeni kullanıcı için `is_email_verified: true` direkt set ediliyor
- Gelecekte kullanıcıların kendi email'lerini onaylaması durumunda senkronizasyon gerekebilir
- Supabase Webhook kullanımı daha güvenilir ve bakımı kolay bir çözümdür

## İlgili Dosyalar

- `src/4-infrastructure/database/schema/07-triggers.sql` - Trigger tanımları
- `src/4-infrastructure/database/repositories/UserRepository.ts` - User oluşturma logic'i
