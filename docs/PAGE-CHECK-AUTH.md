# 🔐 Page Check - Authentication Rehberi

## 📋 Genel Bakış

Page check script'i artık authentication desteği ile çalışıyor. Her role için ayrı browser context'i oluşturulup login yapılıyor.

## 🔑 Test Kullanıcıları

Script şu test kullanıcılarını kullanır:

| Role         | Email                 | Password   | Navigation Role             |
| ------------ | --------------------- | ---------- | --------------------------- |
| Master Admin | `admin@test.com`      | `Test123!` | Master Admin                |
| Consultant   | `consultant@test.com` | `Test123!` | Consultant                  |
| Company User | `company@test.com`    | `Test123!` | Company Admin, Company User |

## ⚙️ Nasıl Çalışır?

1. **Role Gruplandırma:** Navigation linkleri role'lerine göre gruplandırılır
2. **Browser Context:** Her role için ayrı browser context'i oluşturulur
3. **Login:** Her role için test kullanıcısı ile login yapılır
4. **Sayfa Kontrolü:** Login sonrası o role'e ait sayfalar kontrol edilir
5. **Public Sayfalar:** Authentication gerektirmeyen sayfalar ayrı kontrol edilir

## 🚀 Kullanım

### Normal Kullanım

```bash
npm run check:pages
```

Script otomatik olarak:

- Her role için login yapar
- Role bazlı sayfaları kontrol eder
- Public sayfaları kontrol eder

### Test Kullanıcıları Yoksa

Eğer test kullanıcıları database'de yoksa:

- Script uyarı verir
- Sayfalar login'e yönlendirilir (normal davranış)
- Rapor oluşturulur

## 📊 Sonuçlar

### Başarılı Login

- Sayfalar gerçekten kontrol edilir
- Sidebar ve Header kontrolü yapılır
- 404 hataları tespit edilir

### Başarısız Login

- Sayfalar login'e yönlendirilir
- Rapor'da "redirect" olarak işaretlenir
- Uyarı mesajı gösterilir

## 🔧 Sorun Giderme

### Login Başarısız

**Sorun:** Tüm sayfalar login'e yönlendiriliyor

**Çözüm:**

1. Test kullanıcılarının database'de olduğundan emin olun
2. Kullanıcıların doğru role'lere sahip olduğunu kontrol edin
3. Password'lerin doğru olduğunu kontrol edin

### Test Kullanıcıları Oluşturma

1. **Supabase Dashboard'a giriş yapın**
2. **Authentication > Users** bölümüne gidin
3. Her kullanıcıyı oluşturun:
   - Email ve password girin
   - Email'i verify edin
4. **SQL Editor'de role'leri atayın:**

```sql
-- Admin
UPDATE users SET role = 'master_admin' WHERE email = 'admin@test.com';

-- Consultant
UPDATE users SET role = 'consultant' WHERE email = 'consultant@test.com';

-- Company User
UPDATE users SET role = 'company_user' WHERE email = 'company@test.com';
```

Detaylı bilgi için: `docs/E2E-TEST-SETUP-GUIDE.md`

## 💡 İpuçları

- Test kullanıcıları production database'de olmamalı
- Her test ortamı için ayrı kullanıcılar kullanın
- Password'leri environment variable'dan okuyabilirsiniz (gelecek özellik)

## 🔄 Gelecek Özellikler

- [ ] Environment variable'dan test kullanıcı bilgilerini okuma
- [ ] Custom test kullanıcı desteği
- [ ] Login retry mekanizması
- [ ] Session cache (daha hızlı çalışma)
