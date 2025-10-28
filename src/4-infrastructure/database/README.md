# Database

Akademi Port veritabanı schema ve migration dosyaları.

## 📁 Klasör Yapısı

```
database/
├── schema/              # Schema tanımları (modüler)
│   ├── 00-extensions.sql
│   ├── 01-enums.sql
│   ├── 02-programs.sql
│   ├── 03-users.sql
│   ├── 04-user-programs.sql
│   ├── 05-companies.sql
│   ├── 06-foreign-keys.sql
│   ├── 07-triggers.sql
│   └── 08-rls-policies.sql
├── migrations/          # Migration dosyaları
│   ├── 001_initial_schema.sql
│   └── combined_initial_schema.sql
├── seeds/               # Seed data (örnek veriler)
│   ├── 001_master_admin.sql
│   └── 002_sample_data.sql
├── repositories/        # Repository implementasyonları
└── README.md
```

## 🚀 Migration Nasıl Çalıştırılır?

### Yöntem 1: Supabase Dashboard (Önerilen)

⚠️ **ÖNEMLİ:** `001_initial_schema.sql` DEĞİL, `combined_initial_schema.sql` kullanın!

1. [Supabase Dashboard](https://supabase.com/dashboard) açın
2. Projenizi seçin: **Akademi Port** (wkorllmsuhwtrxpjtgwk)
3. Sol menüden **SQL Editor** seçin
4. **New Query** butonuna tıklayın
5. `migrations/combined_initial_schema.sql` dosyasının **TÜM İÇERİĞİNİ** kopyalayıp yapıştırın (763 satır)
6. **Run** butonuna tıklayın
7. Başarılı olursa "Success. No rows returned" mesajı göreceksiniz

**Neden combined_initial_schema.sql?**

- `001_initial_schema.sql` → `\i` komutları içerir (sadece psql için)
- `combined_initial_schema.sql` → Tüm SQL kodları tek dosyada (Supabase için)

### Yöntem 2: Supabase CLI

```bash
# Supabase CLI kurulu değilse
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref wkorllmsuhwtrxpjtgwk

# Migration çalıştır
supabase db push
```

## 📊 Database Schema

### Core Tables

#### 1. **programs**

Multi-program mimarisinin temel tablosu.

```sql
- id: UUID (PK)
- name: VARCHAR(255)
- slug: VARCHAR(255) UNIQUE
- city: VARCHAR(100)
- program_type: VARCHAR(100)
- start_date: DATE
- end_date: DATE
- max_companies: INTEGER
- current_companies: INTEGER (auto-updated)
- status: program_status ENUM
- program_manager_id: UUID (FK -> users)
```

#### 2. **users**

Kullanıcı tablosu (Supabase Auth ile entegre).

```sql
- id: UUID (PK, FK -> auth.users)
- email: CITEXT UNIQUE
- full_name: VARCHAR(255)
- role: user_role ENUM
- company_id: UUID (FK -> companies)
- is_active: BOOLEAN
```

**Roller:**

- `master_admin` - Tüm sistemi yöneten
- `program_manager` - Program yöneticisi
- `consultant` - Danışman
- `company_admin` - Firma yöneticisi
- `company_user` - Firma kullanıcısı
- `observer` - Gözlemci

#### 3. **user_programs**

Kullanıcı-Program ilişki tablosu (Many-to-Many).

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- program_id: UUID (FK -> programs)
- role_in_program: user_role ENUM
- is_active: BOOLEAN
```

#### 4. **companies**

Firma tablosu.

```sql
- id: UUID (PK)
- program_id: UUID (FK -> programs)
- name: VARCHAR(255)
- slug: VARCHAR(255) UNIQUE
- city: VARCHAR(100)
- sector: VARCHAR(100)
- max_users: INTEGER (default: 2)
- current_users: INTEGER (auto-updated)
```

## 🔒 Row Level Security (RLS)

Tüm tablolarda RLS aktif. Politikalar:

### Master Admin

- Tüm tablolara tam erişim

### Program Manager

- Kendi programlarını görüntüleme ve güncelleme
- Programındaki firmaları yönetme
- Programına danışman atama

### Consultant

- Atandığı programları görüntüleme
- Programındaki firmaları görüntüleme

### Company Admin

- Kendi firmasını görüntüleme ve güncelleme

### Company User

- Kendi firmasını görüntüleme

## 🔄 Otomatik Trigger'lar

### 1. **updated_at Auto-Update**

Her güncelleme işleminde `updated_at` otomatik güncellenir.

### 2. **Company User Count**

Firmaya kullanıcı eklendiğinde/çıkarıldığında `current_users` otomatik güncellenir.

### 3. **Program Company Count**

Programa firma eklendiğinde/çıkarıldığında `current_companies` otomatik güncellenir.

### 4. **Slug Auto-Generation**

`name` alanından otomatik slug oluşturur (Turkish character support).

### 5. **Email Verification Sync**

Supabase Auth'daki email verification durumunu senkronize eder.

## 🌱 Seed Data

Test için örnek veriler:

```bash
# Supabase SQL Editor'de çalıştırın
seeds/001_master_admin.sql
seeds/002_sample_data.sql
```

**Örnek Veriler:**

- 1 Master Admin
- 1 Program (Kayseri E-İhracat 2025)
- 1 Firma (Örnek Tekstil A.Ş.)
- 1 Danışman
- 1 Firma Admin

## 🔍 Useful Queries

### Programdaki Firma Sayısı

```sql
SELECT
  p.name,
  p.current_companies,
  p.max_companies,
  ROUND((p.current_companies::DECIMAL / p.max_companies) * 100, 2) as fill_percentage
FROM programs p;
```

### Danışmanın Programları

```sql
SELECT
  u.full_name,
  p.name as program_name,
  up.role_in_program
FROM users u
JOIN user_programs up ON u.id = up.user_id
JOIN programs p ON up.program_id = p.id
WHERE u.role = 'consultant';
```

### Firmadaki Kullanıcı Sayısı

```sql
SELECT
  c.name,
  c.current_users,
  c.max_users
FROM companies c;
```

## 📚 Referanslar

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
