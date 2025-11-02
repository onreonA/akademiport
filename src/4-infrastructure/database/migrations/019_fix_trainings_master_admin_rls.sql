-- ============================================================================
-- FIX TRAININGS MASTER ADMIN RLS
-- ============================================================================
-- Bu migration trainings tablosu için master admin RLS policy'sini düzeltir.
-- Master admin olarak oluşturulan eğitimler görünmüyor çünkü policy çalışmıyor.
-- ============================================================================

-- Drop existing master admin policy if it exists
-- ============================================================================
DROP POLICY IF EXISTS "Master admin can do everything on trainings" ON trainings;

-- Recreate master admin policy with explicit SELECT, INSERT, UPDATE, DELETE
-- ============================================================================

-- Master Admin: Full SELECT access
CREATE POLICY "Master admin can SELECT all trainings"
  ON trainings
  FOR SELECT
  USING (is_master_admin());

-- Master Admin: Full INSERT access
CREATE POLICY "Master admin can INSERT trainings"
  ON trainings
  FOR INSERT
  WITH CHECK (is_master_admin());

-- Master Admin: Full UPDATE access
CREATE POLICY "Master admin can UPDATE all trainings"
  ON trainings
  FOR UPDATE
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Master Admin: Full DELETE access
CREATE POLICY "Master admin can DELETE all trainings"
  ON trainings
  FOR DELETE
  USING (is_master_admin());

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

