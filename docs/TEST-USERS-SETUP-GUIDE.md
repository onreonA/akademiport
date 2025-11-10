# Test Kullanıcıları Setup Rehberi

**Tarih:** 2025-01-XX  
**Durum:** ⚠️ Manuel Setup Gerekli

---

## ⚠️ Önemli Not

SQL script'leri otomatik çalıştırılamaz. Bu script'leri **Supabase Dashboard** üzerinden manuel olarak çalıştırmanız gerekiyor.

---

## 📋 Adım Adım Setup

### Adım 1: Supabase Auth'da Kullanıcıları Oluştur

1. **Supabase Dashboard'a giriş yapın**
   - https://app.supabase.com

2. **Authentication > Users** bölümüne gidin

3. **Her bir test kullanıcısını oluşturun:**

   #### Admin Kullanıcı
   - **Email:** `admin@test.com`
   - **Password:** `Test123!`
   - **Auto Confirm User:** ✅ (işaretleyin)

   #### Consultant Kullanıcı
   - **Email:** `consultant@test.com`
   - **Password:** `Test123!`
   - **Auto Confirm User:** ✅ (işaretleyin)

   #### Company Kullanıcı
   - **Email:** `company@test.com`
   - **Password:** `Test123!`
   - **Auto Confirm User:** ✅ (işaretleyin)

### Adım 2: SQL Script'ini Çalıştır

1. **Supabase Dashboard > SQL Editor** bölümüne gidin

2. **`scripts/seed-test-users.sql`** dosyasının içeriğini kopyalayın

3. **SQL Editor'e yapıştırın ve çalıştırın** (Run butonuna tıklayın)

4. **Sonuçları kontrol edin:**
   - Script başarıyla çalıştıysa, son satırda kullanıcı listesi görünecek
   - Her kullanıcının `role`, `company_name`, ve `program_name` bilgileri görünmeli

### Adım 3: Kontrol Script'ini Çalıştır

1. **`scripts/check-test-users.sql`** dosyasının içeriğini kopyalayın

2. **SQL Editor'e yapıştırın ve çalıştırın**

3. **Sonuçları kontrol edin:**
   - Her kullanıcı için `durum` sütunu `✅ Tamam` olmalı
   - Consultant için `✅ Programa atanmış` olmalı
   - Company için `✅ Programa atanmış` olmalı

---

## ✅ Başarılı Setup Kontrolü

### Kontrol 1: Auth Kullanıcıları

```sql
SELECT email, created_at
FROM auth.users
WHERE email IN ('admin@test.com', 'consultant@test.com', 'company@test.com');
```

**Beklenen:** 3 kullanıcı görünmeli

### Kontrol 2: Users Tablosu

```sql
SELECT email, role, "isActive"
FROM users
WHERE email IN ('admin@test.com', 'consultant@test.com', 'company@test.com');
```

**Beklenen:**

- `admin@test.com` → `MASTER_ADMIN`
- `consultant@test.com` → `CONSULTANT`
- `company@test.com` → `COMPANY_USER`

### Kontrol 3: Consultant Program İlişkisi

```sql
SELECT u.email, p.name as program_name
FROM users u
JOIN program_consultants pc ON u.id = pc."consultantId"
JOIN programs p ON pc."programId" = p.id
WHERE u.email = 'consultant@test.com';
```

**Beklenen:** Consultant bir programa atanmış olmalı

### Kontrol 4: Company Program İlişkisi

```sql
SELECT u.email, c.name as company_name, p.name as program_name
FROM users u
JOIN companies c ON u."companyId" = c.id
JOIN company_programs cp ON c.id = cp."companyId"
JOIN programs p ON cp."programId" = p.id
WHERE u.email = 'company@test.com';
```

**Beklenen:** Company bir programa atanmış olmalı

---

## 🔧 Sorun Giderme

### Sorun 1: "Auth kullanıcısı yok"

**Çözüm:**

- Supabase Auth > Users bölümünden kullanıcıyı kontrol edin
- Email adresinin doğru yazıldığından emin olun
- Kullanıcıyı yeniden oluşturun

### Sorun 2: "Users tablosunda kayıt yok"

**Çözüm:**

- `seed-test-users.sql` script'ini tekrar çalıştırın
- Script'teki `auth.users` sorgusunun doğru çalıştığından emin olun
- RLS policies'in script çalışmasını engellemediğinden emin olun

### Sorun 3: "Role atanmamış"

**Çözüm:**

- `seed-test-users.sql` script'ini tekrar çalıştırın
- Script'teki `UPDATE` sorgularının çalıştığından emin olun
- Manuel olarak role atayın:
  ```sql
  UPDATE users
  SET role = 'MASTER_ADMIN'
  WHERE email = 'admin@test.com';
  ```

### Sorun 4: "Programa atanmamış"

**Çözüm:**

- Önce bir program oluşturun (eğer yoksa)
- `seed-test-users.sql` script'i otomatik olarak program oluşturur
- Manuel olarak atama yapın:

  ```sql
  -- Consultant için
  INSERT INTO program_consultants ("programId", "consultantId")
  SELECT id, (SELECT id FROM users WHERE email = 'consultant@test.com')
  FROM programs LIMIT 1;

  -- Company için
  INSERT INTO company_programs ("companyId", "programId")
  SELECT (SELECT "companyId" FROM users WHERE email = 'company@test.com'), id
  FROM programs LIMIT 1;
  ```

---

## 🧪 Test

Setup tamamlandıktan sonra E2E test'leri çalıştırın:

```bash
npm run test:e2e
```

Test'ler başarılı olmalı. Eğer login hataları alırsanız, yukarıdaki kontrol script'lerini çalıştırın.

---

## 📝 Notlar

- Test kullanıcıları production verilerini etkilemez (RLS policies sayesinde)
- Test kullanıcıları sadece kendi verilerini görebilir
- Script'ler idempotent'tir (birden fazla kez çalıştırılabilir)
- Kullanıcılar zaten varsa, script'ler güncelleme yapar (ON CONFLICT)

---

## 🔗 İlgili Dosyalar

- `scripts/seed-test-users.sql` - Test kullanıcıları oluşturma script'i
- `scripts/check-test-users.sql` - Test kullanıcıları kontrol script'i
- `e2e/helpers/auth.ts` - E2E test auth helper'ları
- `docs/E2E-TEST-SETUP-GUIDE.md` - E2E test setup rehberi
