-- ============================================================================
-- TRAINING STORAGE SETUP MIGRATION
-- ============================================================================
-- Bu migration eğitim dökümanları için Supabase Storage bucket ve policies oluşturur.
-- ============================================================================

-- ============================================================================
-- 1. STORAGE BUCKET OLUŞTURMA
-- ============================================================================
-- Supabase Storage'da bucket oluşturma işlemi SQL ile yapılamaz.
-- Bucket oluşturmak için Supabase Dashboard kullanılmalı veya
-- Supabase Management API kullanılmalıdır.
--
-- Gerekli bucket:
-- - Name: training-documents
-- - Public: false (private bucket)
-- - File size limit: 50MB
-- - Allowed MIME types: application/pdf, application/msword, 
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--   application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
--   image/png, image/jpeg, image/jpg
--
-- Bu migration dosyası sadece RLS politikalarını tanımlar.
-- Bucket oluşturma işlemi manuel olarak yapılmalıdır.
-- ============================================================================

-- ============================================================================
-- 2. STORAGE BUCKET POLICIES (RLS)
-- ============================================================================
-- Not: Supabase Storage RLS politikaları 'storage.objects' tablosu için tanımlanır.
-- Ancak bu politikalar genellikle Supabase Dashboard'dan yönetilir.
-- 
-- Aşağıdaki politikalar örnek olarak verilmiştir ve Supabase Dashboard'da
-- Storage > Policies > training-documents bucket'ı için oluşturulmalıdır.
-- ============================================================================

-- Helper Functions for Storage Policies
-- ============================================================================

-- Master Admin kontrolü (storage için)
CREATE OR REPLACE FUNCTION is_master_admin_storage()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
      AND role = 'master_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Consultant kontrolü (storage için)
CREATE OR REPLACE FUNCTION is_consultant_storage()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
      AND role = 'consultant'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Company user kontrolü (storage için)
CREATE OR REPLACE FUNCTION is_company_user_storage()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
      AND (role = 'company_user' OR role = 'company_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Training'a erişim kontrolü (storage için)
CREATE OR REPLACE FUNCTION can_access_training_storage(training_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.id = training_id
      AND (
        -- Master Admin: Full access
        is_master_admin_storage()
        OR
        -- Consultant: Own trainings
        (t.consultant_id = auth.uid() OR is_consultant_storage())
        OR
        -- Company: Assigned trainings
        EXISTS (
          SELECT 1 FROM company_trainings ct
          INNER JOIN users u ON u.company_id = ct.company_id
          WHERE ct.training_id = training_id
            AND u.id = auth.uid()
        )
        OR
        -- Global trainings: Everyone
        t.is_global = true
      )
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- STORAGE POLICY TEMPLATES
-- ============================================================================
-- Aşağıdaki politikalar Supabase Dashboard'dan Storage > Policies bölümünde
-- training-documents bucket'ı için oluşturulmalıdır.
-- 
-- Bu SQL migration dosyası sadece helper fonksiyonları oluşturur.
-- Storage politikaları Supabase Dashboard veya Management API ile eklenmelidir.
-- ============================================================================

-- Örnek Policy SQL (Supabase Dashboard'da kullanılacak):
-- ============================================================================
/*
-- POLICY 1: Master Admin - Full Access
CREATE POLICY "Master admin can manage all training documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'training-documents'
  AND is_master_admin_storage()
);

-- POLICY 2: Consultant - Upload/Update/Delete own training documents
CREATE POLICY "Consultant can manage own training documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'training-documents'
  AND (
    is_master_admin_storage()
    OR
    (
      is_consultant_storage()
      AND EXISTS (
        SELECT 1 FROM training_documents td
        INNER JOIN trainings t ON t.id = td.training_id
        WHERE td.file_url LIKE '%' || storage.objects.name
          AND (t.consultant_id = auth.uid() OR is_program_manager(t.program_id))
      )
    )
  )
);

-- POLICY 3: Company - Read assigned training documents
CREATE POLICY "Company can read assigned training documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'training-documents'
  AND (
    is_master_admin_storage()
    OR
    (
      is_company_user_storage()
      AND EXISTS (
        SELECT 1 FROM training_documents td
        INNER JOIN trainings t ON t.id = td.training_id
        INNER JOIN company_trainings ct ON ct.training_id = t.id
        INNER JOIN users u ON u.company_id = ct.company_id
        WHERE td.file_url LIKE '%' || storage.objects.name
          AND u.id = auth.uid()
      )
    )
    OR
    (
      -- Global trainings
      EXISTS (
        SELECT 1 FROM training_documents td
        INNER JOIN trainings t ON t.id = td.training_id
        WHERE td.file_url LIKE '%' || storage.objects.name
          AND t.is_global = true
      )
    )
  )
);
*/
-- ============================================================================
-- YUKARIDAKI POLICIES'LER SUPABASE DASHBOARD'DAN EKLENMELİDİR
-- ============================================================================

-- ============================================================================
-- 3. STORAGE HELPER FUNCTIONS (Client-side kullanım için)
-- ============================================================================

-- Storage URL helper function (opsiyonel - frontend'de kullanılabilir)
-- Bu fonksiyon training document için public URL oluşturur
CREATE OR REPLACE FUNCTION get_training_document_url(document_id UUID)
RETURNS TEXT AS $$
  SELECT file_url
  FROM training_documents
  WHERE id = document_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 4. COMMENTS
-- ============================================================================

COMMENT ON FUNCTION is_master_admin_storage() IS 'Master admin kontrolü (storage için)';
COMMENT ON FUNCTION is_consultant_storage() IS 'Consultant kontrolü (storage için)';
COMMENT ON FUNCTION is_company_user_storage() IS 'Company user kontrolü (storage için)';
COMMENT ON FUNCTION can_access_training_storage(UUID) IS 'Training storage erişim kontrolü';
COMMENT ON FUNCTION get_training_document_url(UUID) IS 'Training document URL helper';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- NOT: Bu migration sadece helper fonksiyonları oluşturur.
-- Storage bucket ve politikalar Supabase Dashboard'dan manuel olarak eklenmelidir:
--
-- 1. Supabase Dashboard > Storage > New Bucket
--    - Name: training-documents
--    - Public: false
--    - File size limit: 50MB
--    - Allowed MIME types: application/pdf, image/*, etc.
--
-- 2. Supabase Dashboard > Storage > Policies > training-documents
--    - Yukarıdaki policy örneklerini ekleyin
--
-- 3. Alternatif olarak Supabase Management API kullanılabilir:
--    - POST /storage/v1/bucket (bucket oluşturma)
--    - POST /storage/v1/bucket/{id}/policy (policy ekleme)
-- ============================================================================

