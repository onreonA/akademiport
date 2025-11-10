# Scripts

Bu klasör proje için yardımcı script'leri içerir.

## Test Kullanıcıları Setup

### ⚠️ ÖNEMLİ: Manuel Setup Gerekli

SQL script'leri **otomatik çalıştırılamaz**. Bu script'leri **Supabase Dashboard** üzerinden manuel olarak çalıştırmanız gerekiyor.

### `seed-test-users.sql`

E2E test'ler için test kullanıcılarını oluşturur.

**Adım 1: Supabase Auth'da Kullanıcıları Oluştur**

1. Supabase Dashboard > Authentication > Users
2. Her bir kullanıcıyı oluşturun:
   - `admin@test.com` / `Test123!`
   - `consultant@test.com` / `Test123!`
   - `company@test.com` / `Test123!`
3. **Auto Confirm User** seçeneğini işaretleyin

**Adım 2: SQL Script'ini Çalıştır**

1. Supabase Dashboard > SQL Editor
2. `seed-test-users.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'e yapıştırın ve **Run** butonuna tıklayın

**Adım 3: Kontrol Script'ini Çalıştır**

1. `check-test-users.sql` dosyasının içeriğini kopyalayın
2. SQL Editor'e yapıştırın ve çalıştırın
3. Sonuçları kontrol edin - her kullanıcı için `✅ Tamam` görünmeli

**Oluşturulan Kullanıcılar:**

- `admin@test.com` - MASTER_ADMIN role
- `consultant@test.com` - CONSULTANT role (program'a atanır)
- `company@test.com` - COMPANY_USER role (company'ye atanır, company program'a atanır)

**Detaylı Rehber:**

👉 [Test Kullanıcıları Setup Rehberi](../docs/TEST-USERS-SETUP-GUIDE.md)

### `check-test-users.sql`

Test kullanıcılarının doğru şekilde oluşturulup oluşturulmadığını kontrol eder.

**Kullanım:**

1. Supabase Dashboard > SQL Editor
2. Script'i çalıştırın
3. Sonuçları kontrol edin

**Beklenen Sonuçlar:**

- Her kullanıcı için `durum` sütunu `✅ Tamam` olmalı
- Consultant için `✅ Programa atanmış` olmalı
- Company için `✅ Programa atanmış` olmalı
