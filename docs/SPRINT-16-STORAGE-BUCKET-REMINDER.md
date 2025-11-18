# ⚠️ SPRINT 16 - SUPABASE STORAGE BUCKET HATIRLATMASI

**Tarih:** Ocak 2025  
**Durum:** 🔴 Bekliyor - Kullanıcı Aksiyonu Gerekli  
**Sprint:** 16 - AI Raporlama Sistemi

---

## 📋 YAPILMASI GEREKENLER

### 1. Supabase Dashboard'da Reports Bucket Oluşturma

#### Adım 1: Supabase Dashboard'a Giriş

1. Supabase Dashboard'a giriş yapın
   - URL: `https://supabase.com/dashboard/project/[project-id]`

#### Adım 2: Storage Bölümüne Gidin

1. Sol menüden **Storage** seçeneğine tıklayın

#### Adım 3: Yeni Bucket Oluşturun

1. **"New bucket"** butonuna tıklayın
2. Formu doldurun:
   - **Bucket name:** `reports`
   - **Public bucket:** ❌ Kapalı (Private bucket)
   - **File size limit:** `10MB` (veya ihtiyacınıza göre)
   - **Allowed MIME types:** (opsiyonel, boş bırakılabilir veya sadece PDF için)
     ```
     application/pdf
     ```
3. **"Create bucket"** butonuna tıklayın

#### Adım 4: Storage Policies (RLS) Oluşturma

Bucket oluşturulduktan sonra, güvenlik için RLS politikaları ekleyin:

##### Policy 1: Master Admin - Full Access

1. Storage > **Policies** > `reports` bucket'ına gidin
2. **"New Policy"** butonuna tıklayın
3. Formu doldurun:
   - **Policy name:** `Master admin can manage all reports`
   - **Allowed operation:** `All operations` (veya SELECT, INSERT, UPDATE, DELETE)
   - **Policy definition (USING clause):**
     ```sql
     bucket_id = 'reports'
     AND EXISTS (
       SELECT 1 FROM users
       WHERE id = auth.uid()
         AND role = 'master_admin'
     )
     ```
   - **WITH CHECK clause:** (Aynı SQL'i kullanın)
     ```sql
     bucket_id = 'reports'
     AND EXISTS (
       SELECT 1 FROM users
       WHERE id = auth.uid()
         AND role = 'master_admin'
     )
     ```
4. **"Save"** butonuna tıklayın

##### Policy 2: Authenticated Users - Read Access (Raporları görüntüleme)

1. **"New Policy"** butonuna tekrar tıklayın
2. Formu doldurun:
   - **Policy name:** `Authenticated users can read reports`
   - **Allowed operation:** `SELECT` (sadece okuma)
   - **Policy definition (USING clause):**
     ```sql
     bucket_id = 'reports'
     AND auth.role() = 'authenticated'
     ```
   - **WITH CHECK clause:** (Aynı SQL'i kullanın)
     ```sql
     bucket_id = 'reports'
     AND auth.role() = 'authenticated'
     ```
3. **"Save"** butonuna tıklayın

---

## ✅ DOĞRULAMA CHECKLIST

- [ ] `reports` bucket'ı oluşturuldu
- [ ] Bucket private olarak ayarlandı
- [ ] File size limit ayarlandı (10MB veya uygun limit)
- [ ] Master Admin policy eklendi
- [ ] Authenticated users read policy eklendi
- [ ] Bucket ayarları doğrulandı

---

## 🎯 NEDEN GEREKLİ?

- PDF export servisi (`ReportPDFExportService`) PDF'leri Supabase Storage'a yükler
- Bucket olmadan PDF export çalışmaz
- Raporlar tamamlandığında otomatik PDF oluşturulur ve storage'a kaydedilir
- PDF'ler signed URL ile erişilebilir (1 yıl geçerlilik)

---

## 📝 NOTLAR

- **Private bucket:** PDF'ler signed URL ile erişilebilir (1 yıl geçerlilik)
- **File size limit:** PDF'ler genelde küçük olduğu için 10MB yeterli olabilir
- **MIME type:** Sadece PDF için `application/pdf` kısıtlaması eklenebilir
- **Path structure:** PDF'ler `reports/report-{id}-{timestamp}.pdf` formatında kaydedilir

---

## 🧪 TEST ETME

Bucket oluşturulduktan sonra test edin:

1. Bir rapor oluşturun (`POST /api/reports/generate`)
2. Rapor tamamlandığında PDF otomatik oluşturulmalı
3. PDF URL'ini kontrol edin (`GET /api/reports/[id]/pdf`)
4. PDF'in indirilebildiğini doğrulayın

---

## 🔗 İLGİLİ DOSYALAR

- **PDF Export Service:** `src/4-infrastructure/services/pdf/ReportPDFExportService.ts`
- **API Endpoint:** `src/app/api/reports/[id]/pdf/route.ts`
- **Use Case:** `src/2-application/use-cases/report/GenerateReportUseCase.ts`

---

**Hatırlatma:** Bu işlem yapılmadan PDF export özelliği çalışmayacaktır!
