# 📦 Training Documents Storage Setup Guide

Bu doküman, eğitim dökümanları için Supabase Storage bucket ve politikalarının nasıl oluşturulacağını açıklar.

## 🎯 Gereksinimler

- Supabase projesi kurulu ve çalışıyor olmalı
- Supabase Dashboard'a erişim
- Admin yetkileri

---

## 📋 Adım 1: Storage Bucket Oluşturma

### Supabase Dashboard Üzerinden:

1. **Supabase Dashboard'a giriş yapın**
   - URL: `https://supabase.com/dashboard/project/[project-id]`

2. **Storage bölümüne gidin**
   - Sol menüden **Storage** seçeneğini tıklayın

3. **Yeni bucket oluşturun**
   - **New bucket** butonuna tıklayın
   - **Bucket adı:** `training-documents`
   - **Public bucket:** ❌ (Kapalı - Private bucket)
   - **File size limit:** `50MB` (veya istediğiniz limit)
   - **Allowed MIME types:**
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-excel
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     image/png
     image/jpeg
     image/jpg
     ```

4. **Bucket'ı oluşturun**
   - **Create bucket** butonuna tıklayın

---

## 📋 Adım 2: Storage Policies (RLS) Oluşturma

### Policy 1: Master Admin - Full Access

**Storage > Policies > training-documents > New Policy**

- **Policy name:** `Master admin can manage all training documents`
- **Allowed operation:** `All operations`
- **Policy definition (USING clause):**
  ```sql
  bucket_id = 'training-documents'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'master_admin'
  )
  ```
- **Policy definition (WITH CHECK clause):** (Aynı USING clause)
- **Policy enabled:** ✅

---

### Policy 2: Consultant - Upload/Update/Delete Own Training Documents

**Storage > Policies > training-documents > New Policy**

- **Policy name:** `Consultant can manage own training documents`
- **Allowed operation:** `All operations`
- **Policy definition (USING clause):**
  ```sql
  bucket_id = 'training-documents'
  AND (
    -- Master admin bypass
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'master_admin'
    )
    OR
    -- Consultant can manage documents of own trainings
    EXISTS (
      SELECT 1 FROM training_documents td
      INNER JOIN trainings t ON t.id = td.training_id
      WHERE td.file_url LIKE '%' || name
        AND (
          t.consultant_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM programs p
            WHERE p.id = t.program_id
              AND p.program_manager_id = auth.uid()
          )
        )
    )
  )
  ```
- **Policy definition (WITH CHECK clause):** (Aynı USING clause)
- **Policy enabled:** ✅

---

### Policy 3: Company - Read Assigned Training Documents

**Storage > Policies > training-documents > New Policy**

- **Policy name:** `Company can read assigned training documents`
- **Allowed operation:** `SELECT only`
- **Policy definition (USING clause):**
  ```sql
  bucket_id = 'training-documents'
  AND (
    -- Master admin bypass
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'master_admin'
    )
    OR
    -- Consultant can read all
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'consultant'
    )
    OR
    -- Company can read assigned trainings
    EXISTS (
      SELECT 1 FROM training_documents td
      INNER JOIN trainings t ON t.id = td.training_id
      INNER JOIN company_trainings ct ON ct.training_id = t.id
      INNER JOIN users u ON u.company_id = ct.company_id
      WHERE td.file_url LIKE '%' || name
        AND u.id = auth.uid()
    )
    OR
    -- Global trainings: Everyone can read
    EXISTS (
      SELECT 1 FROM training_documents td
      INNER JOIN trainings t ON t.id = td.training_id
      WHERE td.file_url LIKE '%' || name
        AND t.is_global = true
    )
  )
  ```
- **Policy enabled:** ✅

---

## 📋 Adım 3: Migration Çalıştırma

Helper fonksiyonları oluşturmak için migration'ı çalıştırın:

```bash
# Supabase CLI ile
supabase db push

# Veya migration dosyasını manuel olarak Supabase Dashboard SQL Editor'dan çalıştırın
```

Migration dosyası: `src/4-infrastructure/database/migrations/017_training_storage_setup.sql`

---

## 📋 Adım 4: Test Etme

### Storage Upload Test (Consultant):

```typescript
import { createClient } from '@/infrastructure/database/supabase-server';

const supabase = await createClient();
const { data, error } = await supabase.storage
  .from('training-documents')
  .upload(`training-${trainingId}/document-${Date.now()}.pdf`, file);

if (error) {
  console.error('Upload error:', error);
} else {
  console.log('Upload successful:', data);
}
```

### Storage Download Test (Company):

```typescript
import { createClient } from '@/infrastructure/database/supabase-server';

const supabase = await createClient();
const { data, error } = await supabase.storage
  .from('training-documents')
  .createSignedUrl(filePath, 3600); // 1 hour expiry

if (error) {
  console.error('Download error:', error);
} else {
  console.log('Signed URL:', data.signedUrl);
}
```

---

## 🔒 Güvenlik Notları

1. **Private Bucket:** `training-documents` bucket'ı private olmalı (public değil)
2. **Signed URLs:** Company users için signed URL kullanılmalı (doğrudan public URL değil)
3. **File Size Limits:** Dosya boyutu limitleri bucket seviyesinde ayarlanmalı
4. **MIME Type Validation:** Sadece izin verilen dosya tipleri yüklenebilmeli
5. **RLS Policies:** Tüm erişimler RLS politikaları ile kontrol edilmeli

---

## 📝 Alternatif: Supabase Management API ile Otomasyon

Bucket ve politikaları otomatik olarak oluşturmak için Supabase Management API kullanılabilir:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Bucket oluştur
await supabaseAdmin.storage.createBucket('training-documents', {
  public: false,
  fileSizeLimit: 52428800, // 50MB
  allowedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    // ...
  ],
});

// Policy ekle (Supabase Storage API'si policy eklemeyi desteklemez)
// Policies manuel olarak veya SQL ile eklenmelidir
```

---

## ✅ Doğrulama Checklist

- [ ] `training-documents` bucket'ı oluşturuldu
- [ ] Bucket private olarak ayarlandı
- [ ] File size limit ayarlandı (50MB)
- [ ] MIME type restrictions eklendi
- [ ] Master Admin policy eklendi
- [ ] Consultant policy eklendi
- [ ] Company read policy eklendi
- [ ] Migration çalıştırıldı (helper functions)
- [ ] Upload test başarılı
- [ ] Download test başarılı

---

## 🐛 Sorun Giderme

### Problem: Upload başarısız oluyor

- ✅ Bucket'ın var olduğunu kontrol edin
- ✅ Policy'lerin doğru tanımlandığını kontrol edin
- ✅ User'ın doğru role'e sahip olduğunu kontrol edin
- ✅ File size limit'i aşılmadığını kontrol edin
- ✅ MIME type'ın izin verilen listede olduğunu kontrol edin

### Problem: Download başarısız oluyor

- ✅ Signed URL'in doğru oluşturulduğunu kontrol edin
- ✅ URL'in expire olmadığını kontrol edin
- ✅ Company training assignment'ının var olduğunu kontrol edin
- ✅ Training'ın global veya assigned olduğunu kontrol edin

---

## 📚 İlgili Dosyalar

- Migration: `src/4-infrastructure/database/migrations/017_training_storage_setup.sql`
- Storage Helper: (Frontend'de oluşturulacak)
- API Routes: `src/app/api/trainings/[id]/documents/route.ts`

---

**Son Güncelleme:** Sprint 9 - Training Management System
