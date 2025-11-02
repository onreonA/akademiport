-- ============================================================================
-- FIX TRAINING_DOCUMENTS RLS INSERT POLICY
-- ============================================================================
-- Bu migration training_documents tablosunda consultant'ın INSERT yapabilmesi
-- için RLS policy'lerini düzeltir.
-- ============================================================================

-- Consultant için mevcut policy'leri kaldır
-- NOT: Migration 018'de oluşturulan policy'yi de kaldırıyoruz
DROP POLICY IF EXISTS "Consultant can manage documents of own trainings" ON training_documents;
DROP POLICY IF EXISTS "Consultant can view documents of own trainings" ON training_documents;
DROP POLICY IF EXISTS "Consultant can insert documents to own trainings" ON training_documents;
DROP POLICY IF EXISTS "Consultant can update documents of own trainings" ON training_documents;
DROP POLICY IF EXISTS "Consultant can delete documents of own trainings" ON training_documents;

-- Master Admin policy'yi de güncelleyelim (FOR ALL için WITH CHECK eklememiz gerekiyor)
DROP POLICY IF EXISTS "Master admin can do everything on training_documents" ON training_documents;

-- Master Admin için yeni policy (FOR ALL için WITH CHECK ekliyoruz)
CREATE POLICY "Master admin can do everything on training_documents"
  ON training_documents
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Consultant için ayrı policy'ler oluştur:
-- 1. SELECT için
CREATE POLICY "Consultant can view documents of own trainings"
  ON training_documents
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND (
            is_program_manager(t.program_id) OR
            is_consultant_in_program(t.program_id)
          ))
        )
    )
  );

-- 2. INSERT için (WITH CHECK gerekli)
-- NOT: WITH CHECK clause'unda yeni satırın column'larına direkt erişilebilir
-- training_documents.training_id ile erişilir
-- Consultant'ın INSERT yapabilmesi için:
-- 1. Training'in consultant_id'si auth.uid() ile eşleşmeli VEYA
-- 2. Training'in program_id'si NULL değilse ve consultant bu programda manager VEYA consultant olmalı
CREATE POLICY "Consultant can insert documents to own trainings"
  ON training_documents
  FOR INSERT
  WITH CHECK (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND (
            is_program_manager(t.program_id) OR
            is_consultant_in_program(t.program_id)
          ))
        )
    )
  );

-- 3. UPDATE için
CREATE POLICY "Consultant can update documents of own trainings"
  ON training_documents
  FOR UPDATE
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND (
            is_program_manager(t.program_id) OR
            is_consultant_in_program(t.program_id)
          ))
        )
    )
  )
  WITH CHECK (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND (
            is_program_manager(t.program_id) OR
            is_consultant_in_program(t.program_id)
          ))
        )
    )
  );

-- 4. DELETE için
CREATE POLICY "Consultant can delete documents of own trainings"
  ON training_documents
  FOR DELETE
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND (
            is_program_manager(t.program_id) OR
            is_consultant_in_program(t.program_id)
          ))
        )
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================


