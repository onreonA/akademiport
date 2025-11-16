# 📧 SendGrid Kurulum Rehberi

Bu dokümanda SendGrid API key'i nasıl alınacağı ve `.env.local` dosyasına nasıl ekleneceği açıklanmaktadır.

---

## 🔑 Adım 1: SendGrid Hesabı Oluşturma

1. **SendGrid Web Sitesine Git:**
   - https://sendgrid.com adresine gidin
   - "Start for Free" butonuna tıklayın

2. **Hesap Oluştur:**
   - Email adresinizi girin
   - Şifrenizi oluşturun
   - Hesap bilgilerinizi doldurun

3. **Email Doğrulama:**
   - Email adresinize gelen doğrulama linkine tıklayın

---

## 🔐 Adım 2: API Key Oluşturma

1. **SendGrid Dashboard'a Giriş Yapın:**
   - https://app.sendgrid.com adresine gidin
   - Email ve şifrenizle giriş yapın

2. **Settings > API Keys Bölümüne Gidin:**
   - Sol menüden "Settings" > "API Keys" seçeneğine tıklayın
   - Veya direkt link: https://app.sendgrid.com/settings/api_keys

3. **Yeni API Key Oluştur:**
   - "Create API Key" butonuna tıklayın
   - **API Key Name:** `Akademi Port Production` (veya istediğiniz bir isim)
   - **API Key Permissions:**
     - **Full Access** seçeneğini seçin (veya sadece "Mail Send" için "Restricted Access")
   - "Create & View" butonuna tıklayın

4. **API Key'i Kopyalayın:**
   - ⚠️ **ÖNEMLİ:** API key sadece bir kez gösterilir!
   - API key'i kopyalayın ve güvenli bir yere kaydedin
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 📧 Adım 3: Sender Identity (Gönderen Kimliği) Oluşturma

SendGrid'de email göndermek için bir "Sender Identity" (gönderen kimliği) oluşturmanız gerekir.

### Tek Email Adresi (Single Sender Verification)

1. **Settings > Sender Authentication Bölümüne Gidin:**
   - Sol menüden "Settings" > "Sender Authentication" seçeneğine tıklayın
   - "Verify a Single Sender" seçeneğine tıklayın

2. **Bilgileri Doldurun:**
   - **From Email Address:** `noreply@akademiport.com` (veya kendi domain'iniz)
   - **From Name:** `Akademi Port`
   - **Reply To:** `info@akademiport.com` (isteğe bağlı)
   - **Company Address:** Şirket adresiniz
   - **City:** Şehir
   - **State:** İl/Eyalet
   - **Country:** Ülke
   - **Zip Code:** Posta kodu

3. **Email Doğrulama:**
   - SendGrid size bir doğrulama email'i gönderecek
   - Email'i açın ve "Verify Single Sender" butonuna tıklayın

### Domain Authentication (Önerilen - Production için)

Production ortamı için domain authentication önerilir:

1. **Settings > Sender Authentication > Domain Authentication:**
   - "Authenticate Your Domain" butonuna tıklayın
   - Domain'inizi girin: `akademiport.com`
   - DNS kayıtlarını ekleyin (SendGrid size verecek)
   - DNS kayıtları doğrulandıktan sonra domain'inizden email gönderebilirsiniz

---

## 📝 Adım 4: .env.local Dosyasına Ekleme

1. **Proje Klasörüne Gidin:**

   ```bash
   cd /Users/omerunsal/Desktop/akademi-port
   ```

2. **.env.local Dosyasını Açın:**
   - Eğer yoksa oluşturun:

   ```bash
   touch .env.local
   ```

3. **Aşağıdaki Satırları Ekleyin:**

   ```env
   # SendGrid Configuration
   SENDGRID_API_KEY=SG.your-api-key-here
   SENDGRID_FROM_EMAIL=noreply@akademiport.com
   SENDGRID_FROM_NAME=Akademi Port
   SENDGRID_REPLY_TO=info@akademiport.com

   # Cron Job Secret (Email queue processor için)
   CRON_SECRET=your-random-secret-key-here
   ```

4. **Değerleri Değiştirin:**
   - `SG.your-api-key-here` → SendGrid'den aldığınız API key
   - `noreply@akademiport.com` → Doğruladığınız email adresi
   - `your-random-secret-key-here` → Güvenli bir random string (örnek: `openssl rand -hex 32`)

---

## 🔒 Adım 5: CRON_SECRET Oluşturma

Cron job'ların güvenliği için bir secret key oluşturun:

```bash
# Terminal'de çalıştırın:
openssl rand -hex 32
```

Çıktıyı kopyalayıp `.env.local` dosyasındaki `CRON_SECRET` değerine yapıştırın.

---

## ✅ Adım 6: Doğrulama

1. **Environment Variables'ları Kontrol Edin:**

   ```bash
   # .env.local dosyasını kontrol edin
   cat .env.local | grep SENDGRID
   ```

2. **Uygulamayı Yeniden Başlatın:**

   ```bash
   # Development server'ı durdurun (Ctrl+C)
   # Sonra tekrar başlatın:
   npm run dev
   ```

3. **Test Email Gönderin:**
   - API route'u test edin: `POST /api/email/send`
   - Veya uygulama içinden bir test email gönderin

---

## 📊 SendGrid Limits (Ücretsiz Plan)

- **Günlük Limit:** 100 email/gün
- **Aylık Limit:** Yok (günlük limit geçerli)
- **API Calls:** Sınırsız

**Not:** Production için ücretli plan önerilir (Essentials: $19.95/ay, 40,000 email/ay)

---

## 🛠️ Troubleshooting

### API Key Çalışmıyor

- API key'in doğru kopyalandığından emin olun
- API key'in "Full Access" veya "Mail Send" iznine sahip olduğundan emin olun
- `.env.local` dosyasının proje root'unda olduğundan emin olun

### Email Gönderilmiyor

- Sender Identity'nin doğrulandığından emin olun
- Email adresinin spam klasörüne düşmüş olabileceğini kontrol edin
- SendGrid Activity Feed'de email durumunu kontrol edin

### Domain Authentication Sorunları

- DNS kayıtlarının doğru eklendiğinden emin olun
- DNS propagation'ın tamamlanmasını bekleyin (24-48 saat)
- SendGrid'in DNS kontrol aracını kullanın

---

## 📚 İlgili Dokümantasyon

- SendGrid API Documentation: https://docs.sendgrid.com/api-reference
- SendGrid Node.js SDK: https://github.com/sendgrid/sendgrid-nodejs
- SendGrid Best Practices: https://docs.sendgrid.com/for-developers/sending-email/getting-started-with-authentication

---

**Son Güncelleme:** 15 Ocak 2025
