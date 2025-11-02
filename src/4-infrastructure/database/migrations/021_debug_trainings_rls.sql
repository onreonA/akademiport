-- ============================================================================
-- DEBUG TRAININGS RLS
-- ============================================================================
-- Bu migration trainings RLS policy'lerini test eder ve debug bilgileri sağlar.
-- ============================================================================

-- Test: Tüm eğitimleri listele (RLS bypass - admin client)
-- ============================================================================
-- Bu sorgu RLS'i bypass ederek tüm eğitimleri gösterir.
-- Admin panelinde görünen eğitimleri görmek için kullanılabilir.

-- Test: Consultant'ın görebileceği eğitimleri kontrol et
-- ============================================================================
-- Aşağıdaki sorgu consultant'ın görebileceği eğitimleri listeler.
-- Sorguyu çalıştırmak için Supabase SQL Editor'da:
-- 1. Consultant olarak giriş yap
-- 2. Bu sorguyu çalıştır

-- Example query for testing (run this in Supabase SQL Editor):
/*
SELECT 
  t.id,
  t.name,
  t.is_global,
  t.consultant_id,
  t.program_id,
  CASE 
    WHEN t.is_global = true THEN 'Global'
    WHEN t.consultant_id = auth.uid() THEN 'Own training'
    WHEN t.program_id IS NOT NULL AND is_program_manager(t.program_id) THEN 'Program manager'
    WHEN t.program_id IS NOT NULL AND is_consultant_in_program(t.program_id) THEN 'Program consultant'
    ELSE 'No access'
  END AS access_reason
FROM trainings t
LIMIT 10;
*/

-- Test: Global eğitimleri kontrol et
-- ============================================================================
-- Global eğitimler tüm consultantlar tarafından görülebilir olmalı.

-- Test: Consultant'ın programa atanıp atanmadığını kontrol et
-- ============================================================================
-- Consultant'ın programa atanıp atanmadığını kontrol etmek için:
/*
SELECT 
  up.user_id,
  up.program_id,
  up.role_in_program,
  up.is_active,
  p.name AS program_name
FROM user_programs up
INNER JOIN programs p ON p.id = up.program_id
WHERE up.user_id = auth.uid()
  AND up.is_active = true;
*/

-- ============================================================================
-- MIGRATION COMPLETE (Debug queries only - no schema changes)
-- ============================================================================

