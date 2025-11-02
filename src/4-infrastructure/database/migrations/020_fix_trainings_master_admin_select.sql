-- ============================================================================
-- FIX TRAININGS MASTER ADMIN SELECT POLICY
-- ============================================================================
-- Master admin SELECT policy'sini en öncelikli hale getiriyoruz.
-- PostgreSQL RLS'de birden fazla policy varsa OR ile birleşir, ama
-- master admin policy'si diğer policy'lerle çakışıyor olabilir.
-- ============================================================================

-- Drop all existing SELECT policies on trainings
-- ============================================================================
DROP POLICY IF EXISTS "Master admin can SELECT all trainings" ON trainings;
DROP POLICY IF EXISTS "Master admin can do everything on trainings" ON trainings;
DROP POLICY IF EXISTS "Consultant can view own trainings" ON trainings;
DROP POLICY IF EXISTS "Company can view assigned trainings" ON trainings;

-- Recreate policies in correct order (master admin FIRST)
-- ============================================================================

-- 1. Master Admin: SELECT (en öncelikli - önce kontrol edilmeli)
CREATE POLICY "Master admin can SELECT all trainings"
  ON trainings
  FOR SELECT
  USING (is_master_admin());

-- 2. Consultant: SELECT (master admin değilse)
CREATE POLICY "Consultant can view own trainings"
  ON trainings
  FOR SELECT
  USING (
    is_global = true OR 
    consultant_id = auth.uid() OR
    (program_id IS NOT NULL AND is_program_manager(program_id)) OR
    (program_id IS NOT NULL AND is_consultant_in_program(program_id))
  );

-- 3. Company: SELECT (master admin ve consultant değilse)
CREATE POLICY "Company can view assigned trainings"
  ON trainings
  FOR SELECT
  USING (
    is_global = true OR
    user_company_has_training(id)
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

