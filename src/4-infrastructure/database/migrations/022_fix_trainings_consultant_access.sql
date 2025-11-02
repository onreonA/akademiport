-- ============================================================================
-- FIX TRAININGS CONSULTANT ACCESS
-- ============================================================================
-- Master admin tarafından oluşturulan eğitimler consultant tarafından görülemiyor.
-- Sorun: Master admin tarafından oluşturulan eğitimler consultant'a görünmüyor
-- çünkü `consultant_id = null` ve `is_global = false`.
-- 
-- Çözüm: Consultant'lar aynı programdaki tüm eğitimleri görebilir (program bazlı eğitimler).
-- ============================================================================

-- Drop existing consultant SELECT policy
-- ============================================================================
DROP POLICY IF EXISTS "Consultant can view own trainings" ON trainings;

-- Recreate consultant SELECT policy with improved logic
-- ============================================================================
-- Consultant can see:
-- 1. Global trainings (is_global = true)
-- 2. Own trainings (consultant_id = auth.uid())
-- 3. Program trainings where consultant is assigned to the program
-- 4. Program trainings where consultant is program manager
CREATE POLICY "Consultant can view own trainings"
  ON trainings
  FOR SELECT
  USING (
    -- Global trainings - tüm consultantlar görebilir
    is_global = true OR 
    -- Own trainings - kendi eğitimleri
    consultant_id = auth.uid() OR
    -- Program trainings - consultant programa atanmışsa tüm program eğitimlerini görebilir
    (program_id IS NOT NULL AND is_consultant_in_program(program_id)) OR
    -- Program manager - program yöneticisi ise program eğitimlerini görebilir
    (program_id IS NOT NULL AND is_program_manager(program_id))
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

