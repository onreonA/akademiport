# ✅ Migration 050-051 Doğrulama Sorguları

Migration'lar başarıyla uygulandı. Aşağıdaki sorguları Supabase SQL Editor'da çalıştırarak doğrulayabilirsiniz.

## 🔍 Custom Reports Tablosu Doğrulama

### 1. Tablo Yapısını Kontrol Et

```sql
-- Tablo var mı?
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'custom_reports'
);
-- Sonuç: true olmalı

-- Tablo yapısını görüntüle
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'custom_reports'
ORDER BY ordinal_position;
```

### 2. Enum Tipini Kontrol Et

```sql
-- custom_report_status enum'u var mı?
SELECT EXISTS (
  SELECT FROM pg_type
  WHERE typname = 'custom_report_status'
);
-- Sonuç: true olmalı

-- Enum değerlerini görüntüle
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'custom_report_status'
)
ORDER BY enumsortorder;
-- Sonuç: draft, saved, scheduled, archived
```

### 3. Index'leri Kontrol Et

```sql
-- Index'ler oluşturulmuş mu?
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'custom_reports'
ORDER BY indexname;
-- Sonuç: 7 index görmelisiniz
```

### 4. RLS Policies Kontrol Et

```sql
-- RLS aktif mi?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'custom_reports';
-- Sonuç: rowsecurity = true olmalı

-- Policy'leri görüntüle
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'custom_reports'
ORDER BY policyname;
-- Sonuç: 6 policy görmelisiniz
```

## 🔍 Email Template Doğrulama

### 1. Template Var mı?

```sql
-- report-completed template'i var mı?
SELECT
  name,
  description,
  subject,
  email_type,
  is_active,
  created_at
FROM email_templates
WHERE name = 'report-completed';
-- Sonuç: 1 satır dönmeli
```

### 2. Template İçeriğini Kontrol Et

```sql
-- Template içeriğini görüntüle
SELECT
  name,
  description,
  subject,
  LENGTH(html_content) as html_length,
  LENGTH(text_content) as text_length,
  variables,
  is_active
FROM email_templates
WHERE name = 'report-completed';
-- Sonuç: HTML ve text içerikleri dolu olmalı
```

## 🧪 Test Verisi Oluşturma

### Custom Report Oluştur (Test)

```sql
-- Test kullanıcısı ID'sini al (kendi kullanıcınızı kullanın)
-- Örnek: Bir master_admin kullanıcısının ID'sini kullanın

-- Test custom report oluştur
INSERT INTO custom_reports (
  name,
  description,
  user_id,
  report_type,
  selected_metrics,
  date_range_type,
  status
) VALUES (
  'Test Dashboard Raporu',
  'Bu bir test raporudur',
  (SELECT id FROM users WHERE role = 'master_admin' LIMIT 1), -- Kendi user_id'nizi kullanın
  'dashboard',
  '["user_growth", "program_activity"]'::jsonb,
  'last_30_days',
  'saved'
)
RETURNING id, name, status, created_at;
```

### Custom Report Listesi

```sql
-- Tüm custom report'ları listele
SELECT
  cr.id,
  cr.name,
  cr.report_type,
  cr.status,
  u.full_name as created_by,
  cr.created_at
FROM custom_reports cr
JOIN users u ON cr.user_id = u.id
ORDER BY cr.created_at DESC;
```

## ✅ Başarı Kriterleri

Migration başarılı sayılır eğer:

- ✅ `custom_reports` tablosu oluşturulmuş
- ✅ `custom_report_status` enum tipi oluşturulmuş
- ✅ 7 index oluşturulmuş
- ✅ 6 RLS policy oluşturulmuş
- ✅ `report-completed` email template'i `email_templates` tablosuna eklenmiş
- ✅ Template'in HTML ve text içerikleri dolu
- ✅ Template aktif (`is_active = true`)

---

## 🎉 Migration Başarılı!

Migration'lar başarıyla uygulandı. Artık:

- ✅ Custom Reports özelliği kullanılabilir
- ✅ Rapor email template'i hazır
- ✅ Kullanıcılar özel raporlar oluşturabilir
- ✅ Raporlar tamamlandığında email gönderilebilir
