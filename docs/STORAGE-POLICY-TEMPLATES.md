# 📋 Storage Policy Templates - Supabase Dashboard İçin

Bu dosya Supabase Dashboard'da Storage Policy eklerken kullanılacak hazır template'leri içerir.

---

## 🔴 Policy 1: Master Admin - Full Access

### Policy Form Doldurma:

**Policy name:**

```
Master admin can manage all training documents
```

**Allowed operation:**

- ✅ SELECT
- ✅ INSERT
- ✅ UPDATE
- ✅ DELETE

veya spesifik operations:

- ✅ upload
- ✅ download
- ✅ list
- ✅ update
- ✅ move
- ✅ copy
- ✅ remove
- ✅ createSignedUrl
- ✅ createSignedUrls
- ✅ getPublicUrl

**Target roles:**

- "Defaults to all (public) roles if none selected" olarak bırakın (veya "authenticated" seçin)

**Policy definition:**

```sql
bucket_id = 'training-documents'
AND EXISTS (
  SELECT 1 FROM users
  WHERE id = auth.uid()
    AND role = 'master_admin'
)
```

**WITH CHECK clause:** (Aynı SQL'i kullanın)

```sql
bucket_id = 'training-documents'
AND EXISTS (
  SELECT 1 FROM users
  WHERE id = auth.uid()
    AND role = 'master_admin'
)
```

---

## 🟡 Policy 2: Consultant - Manage Own Training Documents

### Policy Form Doldurma:

**Policy name:**

```
Consultant can manage own training documents
```

**Allowed operation:**

- ✅ SELECT
- ✅ INSERT
- ✅ UPDATE
- ✅ DELETE

veya spesifik operations:

- ✅ upload
- ✅ download
- ✅ list
- ✅ update
- ✅ move
- ✅ copy
- ✅ remove
- ✅ createSignedUrl
- ✅ createSignedUrls
- ✅ getPublicUrl

**Target roles:**

- "Defaults to all (public) roles if none selected" olarak bırakın (veya "authenticated" seçin)

**Policy definition (USING clause):**

```sql
bucket_id = 'training-documents'
AND (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'master_admin'
  )
  OR
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

**WITH CHECK clause:** (Aynı SQL'i kullanın)

```sql
bucket_id = 'training-documents'
AND (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'master_admin'
  )
  OR
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

---

## 🟢 Policy 3: Company - Read Assigned Training Documents

### Policy Form Doldurma:

**Policy name:**

```
Company can read assigned training documents
```

**Allowed operation:**

- ✅ SELECT **ONLY** (Sadece SELECT seçili olmalı)
- ❌ INSERT
- ❌ UPDATE
- ❌ DELETE

veya spesifik operations (sadece read operations):

- ✅ download
- ✅ list
- ✅ createSignedUrl
- ✅ createSignedUrls
- ✅ getPublicUrl

**Target roles:**

- "Defaults to all (public) roles if none selected" olarak bırakın (veya "authenticated" seçin)

**Policy definition (USING clause):**

```sql
bucket_id = 'training-documents'
AND (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'master_admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'consultant'
  )
  OR
  EXISTS (
    SELECT 1 FROM training_documents td
    INNER JOIN trainings t ON t.id = td.training_id
    INNER JOIN company_trainings ct ON ct.training_id = t.id
    INNER JOIN users u ON u.company_id = ct.company_id
    WHERE td.file_url LIKE '%' || name
      AND u.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM training_documents td
    INNER JOIN trainings t ON t.id = td.training_id
    WHERE td.file_url LIKE '%' || name
      AND t.is_global = true
  )
)
```

**WITH CHECK clause:** (SELECT için genelde boş bırakılabilir, ama aynı SQL kullanılabilir)

```sql
bucket_id = 'training-documents'
AND (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'master_admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'consultant'
  )
  OR
  EXISTS (
    SELECT 1 FROM training_documents td
    INNER JOIN trainings t ON t.id = td.training_id
    INNER JOIN company_trainings ct ON ct.training_id = t.id
    INNER JOIN users u ON u.company_id = ct.company_id
    WHERE td.file_url LIKE '%' || name
      AND u.id = auth.uid()
  )
  OR
    EXISTS (
      SELECT 1 FROM training_documents td
      INNER JOIN trainings t ON t.id = td.training_id
      WHERE td.file_url LIKE '%' || name
        AND t.is_global = true
  )
)
```

---

## ⚠️ Önemli Notlar

1. **USING vs WITH CHECK:**
   - USING: Veriyi okurken kontrol eder (SELECT için)
   - WITH CHECK: Veriyi yazarken kontrol eder (INSERT/UPDATE için)
   - Genelde ikisi de aynı SQL'i kullanır

2. **File URL Matching:**
   - `td.file_url LIKE '%' || (storage.objects).name` ifadesi, storage'daki dosya yolunu training_documents tablosundaki file_url ile eşleştirmek için kullanılır
   - Örnek: `training-documents/training-123/document.pdf` → `(storage.objects).name` = `training-123/document.pdf`

3. **Target Roles:**
   - Genelde "authenticated" seçilir veya boş bırakılır
   - Boş bırakılırsa tüm authenticated kullanıcılar için geçerli olur

4. **Policy Sırası:**
   - Policies'ler sırayla kontrol edilir
   - İlk eşleşen policy uygulanır
   - Master Admin policy genelde ilk sırada olmalı (bypass için)

---

## 📝 Hızlı Kopyala-Yapıştır Versiyonları

### Policy 1 - Master Admin (Kısa Versiyon):

**Policy definition:**

```sql
bucket_id = 'training-documents' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'master_admin')
```

### Policy 2 - Consultant (Kısa Versiyon):

**Policy definition:**

```sql
bucket_id = 'training-documents' AND (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'master_admin') OR EXISTS (SELECT 1 FROM training_documents td INNER JOIN trainings t ON t.id = td.training_id WHERE td.file_url LIKE '%' || name AND (t.consultant_id = auth.uid() OR EXISTS (SELECT 1 FROM programs p WHERE p.id = t.program_id AND p.program_manager_id = auth.uid()))))
```

### Policy 3 - Company Read (Kısa Versiyon):

**Policy definition:**

```sql
bucket_id = 'training-documents' AND (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'master_admin') OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant') OR EXISTS (SELECT 1 FROM training_documents td INNER JOIN trainings t ON t.id = td.training_id INNER JOIN company_trainings ct ON ct.training_id = t.id INNER JOIN users u ON u.company_id = ct.company_id WHERE td.file_url LIKE '%' || (storage.objects).name AND u.id = auth.uid()) OR EXISTS (SELECT 1 FROM training_documents td INNER JOIN trainings t ON t.id = td.training_id WHERE td.file_url LIKE '%' || (storage.objects).name AND t.is_global = true))
```

---

## ✅ Doğrulama Checklist

Her policy ekledikten sonra:

- [ ] Policy name girildi
- [ ] Doğru operations seçildi
- [ ] Policy definition SQL'i doğru kopyalandı
- [ ] WITH CHECK clause eklendi (gerekliyse)
- [ ] "Review" butonuna tıklandı
- [ ] Policy başarıyla oluşturuldu

---

**Son Güncelleme:** Sprint 9 - Training Management System
