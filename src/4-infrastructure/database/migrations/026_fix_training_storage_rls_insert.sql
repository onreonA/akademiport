-- ============================================================================
-- FIX TRAINING STORAGE BUCKET RLS INSERT POLICY
-- ============================================================================
-- Bu migration training-documents storage bucket'ında consultant'ın INSERT
-- yapabilmesi için RLS policy'lerini düzeltir.
-- ============================================================================

-- Storage için helper fonksiyonlar (eğer yoksa oluşturulur)
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

-- ============================================================================
-- STORAGE BUCKET POLICIES (storage.objects tablosu için)
-- ============================================================================

-- Mevcut policy'leri kaldır
DROP POLICY IF EXISTS "Master admin can manage all training documents" ON storage.objects;
DROP POLICY IF EXISTS "Consultant can manage own training documents" ON storage.objects;
DROP POLICY IF EXISTS "Consultant can upload training documents" ON storage.objects;

-- Master Admin için: Full Access
CREATE POLICY "Master admin can manage all training documents"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'training-documents'
    AND is_master_admin_storage()
  )
  WITH CHECK (
    bucket_id = 'training-documents'
    AND is_master_admin_storage()
  );

-- Consultant için: INSERT (Upload)
-- NOT: Consultant'lar training-documents bucket'ına dosya yükleyebilir
-- Gerçek erişim kontrolü training_documents tablosunda yapılacak
CREATE POLICY "Consultant can upload training documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'training-documents'
    AND (
      is_master_admin_storage()
      OR
      is_consultant_storage()
    )
  );

-- Consultant için: SELECT (Read) - kendi eğitimlerinin dökümanlarına erişebilir
CREATE POLICY "Consultant can read own training documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'training-documents'
    AND (
      is_master_admin_storage()
      OR
      (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() 
            AND u.role = 'consultant'
        )
        AND EXISTS (
          SELECT 1 FROM training_documents td
          INNER JOIN trainings t ON t.id = td.training_id
          WHERE td.file_url LIKE '%' || storage.objects.name
            AND (
              t.consultant_id = auth.uid() OR
              (t.program_id IS NOT NULL AND (
                is_program_manager(t.program_id) OR
                is_consultant_in_program(t.program_id)
              ))
            )
        )
      )
    )
  );

-- Consultant için: UPDATE/DELETE - kendi eğitimlerinin dökümanlarını güncelleyebilir/silebilir
CREATE POLICY "Consultant can update own training documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'training-documents'
    AND (
      is_master_admin_storage()
      OR
      (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() 
            AND u.role = 'consultant'
        )
        AND EXISTS (
          SELECT 1 FROM training_documents td
          INNER JOIN trainings t ON t.id = td.training_id
          WHERE td.file_url LIKE '%' || storage.objects.name
            AND (
              t.consultant_id = auth.uid() OR
              (t.program_id IS NOT NULL AND (
                is_program_manager(t.program_id) OR
                is_consultant_in_program(t.program_id)
              ))
            )
        )
      )
    )
  )
  WITH CHECK (
    bucket_id = 'training-documents'
    AND (
      is_master_admin_storage()
      OR
      (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() 
            AND u.role = 'consultant'
        )
        AND EXISTS (
          SELECT 1 FROM training_documents td
          INNER JOIN trainings t ON t.id = td.training_id
          WHERE td.file_url LIKE '%' || storage.objects.name
            AND (
              t.consultant_id = auth.uid() OR
              (t.program_id IS NOT NULL AND (
                is_program_manager(t.program_id) OR
                is_consultant_in_program(t.program_id)
              ))
            )
        )
      )
    )
  );

CREATE POLICY "Consultant can delete own training documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'training-documents'
    AND (
      is_master_admin_storage()
      OR
      (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() 
            AND u.role = 'consultant'
        )
        AND EXISTS (
          SELECT 1 FROM training_documents td
          INNER JOIN trainings t ON t.id = td.training_id
          WHERE td.file_url LIKE '%' || storage.objects.name
            AND (
              t.consultant_id = auth.uid() OR
              (t.program_id IS NOT NULL AND (
                is_program_manager(t.program_id) OR
                is_consultant_in_program(t.program_id)
              ))
            )
        )
      )
    )
  );

-- Company users için: SELECT (Read) - atanmış eğitimlerin dökümanlarına erişebilir
CREATE POLICY "Company can read assigned training documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'training-documents'
    AND (
      is_master_admin_storage()
      OR
      EXISTS (
        SELECT 1 FROM training_documents td
        INNER JOIN trainings t ON t.id = td.training_id
        INNER JOIN company_trainings ct ON ct.training_id = t.id
        INNER JOIN users u ON u.company_id = ct.company_id
        WHERE td.file_url LIKE '%' || storage.objects.name
          AND u.id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM training_documents td
        INNER JOIN trainings t ON t.id = td.training_id
        WHERE td.file_url LIKE '%' || storage.objects.name
          AND t.is_global = true
      )
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

