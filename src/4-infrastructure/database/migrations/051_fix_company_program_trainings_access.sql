-- ============================================================================
-- FIX COMPANY ACCESS TO PROGRAM-SPECIFIC TRAININGS
-- ============================================================================
-- Bu migration company kullanıcılarının programa özel eğitimleri görebilmesini sağlar.
-- Şu anda RLS policy'si sadece company_trainings tablosunda kayıt olan eğitimleri gösteriyor,
-- ama programa özel eğitimler otomatik olarak gösterilmeli.
-- ============================================================================

-- Helper function: Check if user's company belongs to the same program as training
-- ============================================================================
CREATE OR REPLACE FUNCTION user_company_has_program_training(training_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM trainings t
    INNER JOIN users u ON u.company_id IS NOT NULL
    INNER JOIN companies c ON c.id = u.company_id
    WHERE t.id = training_uuid
      AND u.id = auth.uid()
      AND c.program_id IS NOT NULL
      AND t.program_id IS NOT NULL
      AND c.program_id = t.program_id
      AND t.is_global = false
      AND t.status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing Company policy
-- ============================================================================
DROP POLICY IF EXISTS "Company can view assigned trainings" ON trainings;

-- Recreate Company policy with program training support
-- ============================================================================
CREATE POLICY "Company can view assigned trainings"
  ON trainings
  FOR SELECT
  USING (
    is_master_admin() OR
    is_global = true OR
    user_company_has_training(id) OR
    user_company_has_program_training(id)
  );

-- Update TRAINING_VIDEOS policy to include program trainings
-- ============================================================================
DROP POLICY IF EXISTS "Company can view videos of assigned trainings" ON training_videos;

CREATE POLICY "Company can view videos of assigned trainings"
  ON training_videos
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND t.is_global = true
    ) OR
    user_company_has_training(training_videos.training_id) OR
    user_company_has_program_training(training_videos.training_id)
  );

-- Update TRAINING_DOCUMENTS policy to include program trainings
-- ============================================================================
DROP POLICY IF EXISTS "Company can view documents of assigned trainings" ON training_documents;

CREATE POLICY "Company can view documents of assigned trainings"
  ON training_documents
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND t.is_global = true
    ) OR
    user_company_has_training(training_documents.training_id) OR
    user_company_has_program_training(training_documents.training_id)
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

