# 🚀 Storage Policy - Basit Versiyonlar (Yorum Satırsız)

Supabase Storage policies'de yorum satırları (`--`) sorun çıkarabilir. Aşağıda yorum satırsız, temiz versiyonlar var.

---

## 🔴 Policy 1: Master Admin - Full Access

### Policy Name:

```
Master admin can manage all training documents
```

### Allowed Operations:

- ✅ SELECT
- ✅ INSERT
- ✅ UPDATE
- ✅ DELETE

### Policy Definition (USING):

```sql
bucket_id = 'training-documents'
AND EXISTS (
  SELECT 1 FROM users
  WHERE id = auth.uid()
    AND role = 'master_admin'
)
```

### WITH CHECK: (Aynı SQL)

```sql
bucket_id = 'training-documents'
AND EXISTS (
  SELECT 1 FROM users
  WHERE id = auth.uid()
    AND role = 'master_admin'
)
```

---

## 🟡 Policy 2: Consultant - Manage Own Documents

### Policy Name:

```
Consultant can manage own training documents
```

### Allowed Operations:

- ✅ SELECT
- ✅ INSERT
- ✅ UPDATE
- ✅ DELETE

### Policy Definition (USING):

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

### WITH CHECK: (Aynı SQL)

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

## 🟢 Policy 3: Company - Read Assigned Documents

### Policy Name:

```
Company can read assigned training documents
```

### Allowed Operations:

- ✅ SELECT **ONLY**

### Policy Definition (USING):

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

### WITH CHECK: (SELECT için aynı SQL)

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

1. **Yorum satırları yok** - Supabase Storage policies'de yorum satırları (`--`) hata verebilir
2. **Noktalı virgül yok** - SQL'in sonunda noktalı virgül (`;`) olmamalı
3. **Basit syntax** - Karmaşık JOIN'ler veya subquery'ler sorun çıkarabilir
4. **Test edin** - Her policy'yi tek tek ekleyip test edin

---

**Son Güncelleme:** Sprint 9 - Training Management System
