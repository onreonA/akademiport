# 📋 Migration 050-051 Uygulama Rehberi

**Tarih:** Ocak 2025  
**Migration Dosyaları:**

- `050_create_custom_reports_table.sql` - Custom Reports tablosu
- `051_add_report_email_template.sql` - Rapor email template'i

---

## 🚀 MIGRATION UYGULAMA ADIMLARI

### Adım 1: Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://supabase.com/dashboard) açın
2. **Akademi Port** projesini seçin
3. Sol menüden **SQL Editor** seçin
4. **New Query** butonuna tıklayın

### Adım 2: Migration 050 - Custom Reports Tablosu

1. `src/4-infrastructure/database/migrations/050_create_custom_reports_table.sql` dosyasını açın
2. **TÜM İÇERİĞİNİ** kopyalayın (155 satır)
3. Supabase SQL Editor'a yapıştırın
4. **Run** butonuna tıklayın
5. Başarılı olursa "Success. No rows returned" mesajı göreceksiniz

**Oluşturulan Yapı:**

- ✅ `custom_report_status` ENUM tipi
- ✅ `custom_reports` tablosu
- ✅ Index'ler (user_id, program_id, company_id, status, is_scheduled, next_generation_at, created_at)
- ✅ RLS Policies (Users, Admins, Consultants)

### Adım 3: Migration 051 - Rapor Email Template'i

1. `src/4-infrastructure/database/migrations/051_add_report_email_template.sql` dosyasını açın
2. **TÜM İÇERİĞİNİ** kopyalayın (129 satır)
3. Supabase SQL Editor'a yapıştırın
4. **Run** butonuna tıklayın
5. Başarılı olursa "Success. No rows returned" mesajı göreceksiniz

**Oluşturulan Yapı:**

- ✅ `report-completed` email template'i (`email_templates` tablosuna eklenir)

---

## ✅ DOĞRULAMA

### Custom Reports Tablosu

1. Sol menüden **Table Editor** seçin
2. **custom_reports** tablosunu açın
3. Tablo yapısını kontrol edin:
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR)
   - `description` (TEXT)
   - `user_id` (UUID, Foreign Key -> users)
   - `program_id` (UUID, Foreign Key -> programs)
   - `company_id` (UUID, Foreign Key -> companies)
   - `report_type` (VARCHAR)
   - `selected_metrics` (JSONB)
   - `date_range_start`, `date_range_end` (DATE)
   - `filters` (JSONB)
   - `is_scheduled` (BOOLEAN)
   - `schedule_cron` (VARCHAR)
   - `status` (custom_report_status ENUM)
   - `created_at`, `updated_at` (TIMESTAMP)

### Email Template

1. Sol menüden **Table Editor** seçin
2. **email_templates** tablosunu açın
3. `name = 'report-completed'` filtresi uygulayın
4. Template'i görmelisiniz:
   - `name`: 'report-completed'
   - `description`: 'Rapor tamamlandığında gönderilen email template''i'
   - `subject`: 'Raporunuz Hazır: {{report_title}}'
   - `html_content`: HTML email içeriği
   - `text_content`: Plain text email içeriği
   - `email_type`: 'transactional'
   - `is_active`: true

---

## 🔍 YARARLI SORGU'LAR

### Custom Reports Listesi

```sql
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

### Zamanlanmış Raporlar

```sql
SELECT
  cr.name,
  cr.schedule_cron,
  cr.schedule_timezone,
  cr.next_generation_at,
  cr.last_generated_at
FROM custom_reports cr
WHERE cr.is_scheduled = true
  AND cr.status = 'scheduled'
ORDER BY cr.next_generation_at ASC;
```

### Email Template Kontrolü

```sql
SELECT
  name,
  description,
  subject,
  email_type,
  is_active,
  created_at
FROM email_templates
WHERE name = 'report-completed';
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Migration Sırası:** Migration'ları sırayla çalıştırın (050 → 051)
2. **Idempotent:** Migration'lar idempotent (tekrar çalıştırılabilir) - `IF NOT EXISTS` ve `DROP POLICY IF EXISTS` kullanılıyor
3. **RLS Policies:** Custom reports tablosunda RLS aktif ve politikalar tanımlı
4. **Foreign Keys:** `custom_reports` tablosu `users`, `programs`, `companies` ve `report_templates` tablolarına referans veriyor
5. **Consultant Access:** Consultant'ların firmalara erişimi `user_programs` ve `companies.program_id` üzerinden sağlanıyor (doğrudan `consultant_companies` tablosu yok)

---

## 🐛 SORUN GİDERME

### Hata: "relation custom_reports does not exist"

- Migration 050 çalıştırılmamış olabilir
- Önce Migration 050'i çalıştırın

### Hata: "type custom_report_status already exists"

- Migration 050 daha önce çalıştırılmış
- Bu normal, migration idempotent olduğu için devam edebilirsiniz

### Hata: "email_templates table does not exist"

- Email tables migration'ı (038_create_email_tables.sql) çalıştırılmamış olabilir
- Önce email tables migration'ını çalıştırın

---

## 📚 İLGİLİ DOSYALAR

- `src/4-infrastructure/database/migrations/050_create_custom_reports_table.sql`
- `src/4-infrastructure/database/migrations/051_add_report_email_template.sql`
- `src/3-domain/entities/CustomReport.ts`
- `src/2-application/use-cases/custom-report/`
