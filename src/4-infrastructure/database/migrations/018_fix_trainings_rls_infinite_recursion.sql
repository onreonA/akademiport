-- ============================================================================
-- FIX TRAININGS RLS INFINITE RECURSION
-- ============================================================================
-- Bu migration trainings tablosu için RLS policy'lerindeki sonsuz döngüyü düzeltir.
-- ============================================================================

-- Helper function: Check if user's company has training assigned (bypasses RLS)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_company_has_training(training_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_trainings ct
    INNER JOIN users u ON u.company_id = ct.company_id
    WHERE ct.training_id = training_uuid
      AND u.id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing problematic policies
-- ============================================================================
DROP POLICY IF EXISTS "Company can view assigned trainings" ON trainings;
DROP POLICY IF EXISTS "Consultant can view own trainings" ON trainings;
DROP POLICY IF EXISTS "Company can view videos of assigned trainings" ON training_videos;
DROP POLICY IF EXISTS "Consultant can manage videos of own trainings" ON training_videos;
DROP POLICY IF EXISTS "Company can view documents of assigned trainings" ON training_documents;
DROP POLICY IF EXISTS "Consultant can manage documents of own trainings" ON training_documents;

-- Recreate TRAININGS policies with fixed logic
-- ============================================================================

-- Consultant: Can view/manage own trainings (updated - master admin first, null-safe)
CREATE POLICY "Consultant can view own trainings"
  ON trainings
  FOR SELECT
  USING (
    is_master_admin() OR
    is_global = true OR 
    consultant_id = auth.uid() OR
    (program_id IS NOT NULL AND is_program_manager(program_id)) OR
    (program_id IS NOT NULL AND is_consultant_in_program(program_id))
  );

-- Company: Can view assigned trainings (fixed - no recursion, uses SECURITY DEFINER function)
CREATE POLICY "Company can view assigned trainings"
  ON trainings
  FOR SELECT
  USING (
    is_master_admin() OR
    is_global = true OR
    user_company_has_training(id)
  );

-- Recreate TRAINING_VIDEOS policies with fixed logic
-- ============================================================================

-- Consultant: Can manage videos of own trainings (updated - null-safe)
CREATE POLICY "Consultant can manage videos of own trainings"
  ON training_videos
  FOR ALL
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND is_program_manager(t.program_id))
        )
    )
  );

-- Company: Can view videos of assigned trainings (fixed - no recursion)
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
    user_company_has_training(training_videos.training_id)
  );

-- Recreate TRAINING_DOCUMENTS policies with fixed logic
-- ============================================================================

-- Consultant: Can manage documents of own trainings (updated - null-safe)
CREATE POLICY "Consultant can manage documents of own trainings"
  ON training_documents
  FOR ALL
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND is_program_manager(t.program_id))
        )
    )
  );

-- Company: Can view documents of assigned trainings (fixed - no recursion)
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
    user_company_has_training(training_documents.training_id)
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
