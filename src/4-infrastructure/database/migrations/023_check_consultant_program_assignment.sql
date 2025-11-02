-- ============================================================================
-- CHECK CONSULTANT PROGRAM ASSIGNMENT
-- ============================================================================
-- Consultant'ın programa atanıp atanmadığını kontrol et.
-- Eğer atanmamışsa, consultant'ı programa atar.
-- ============================================================================

-- Test: Consultant'ın programa atanıp atanmadığını kontrol et
-- ============================================================================
-- Bu sorguyu çalıştır ve sonuçları kontrol et:
/*
SELECT 
  up.user_id,
  up.program_id,
  up.role_in_program,
  up.is_active,
  p.name AS program_name
FROM user_programs up
INNER JOIN programs p ON p.id = up.program_id
WHERE up.user_id = '708300a1-7467-4f70-b7f1-490918a4ae02'
  AND up.program_id = 'd67a55af-e71b-43d4-ac63-e894217854f6'
  AND up.is_active = true;
*/

-- Çözüm 1: Consultant'ı programa atama (eğer atanmamışsa)
-- ============================================================================
-- Consultant'ı programa atamak için aşağıdaki sorguyu çalıştır.
-- NOT: Bu sorgu sadece consultant henüz programa atanmamışsa çalışır.
INSERT INTO user_programs (user_id, program_id, role_in_program, is_active, assigned_by)
SELECT 
  '708300a1-7467-4f70-b7f1-490918a4ae02'::UUID,
  'd67a55af-e71b-43d4-ac63-e894217854f6'::UUID,
  'consultant'::user_role,
  true,
  (SELECT id FROM users WHERE role = 'master_admin' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM user_programs
  WHERE user_id = '708300a1-7467-4f70-b7f1-490918a4ae02'
    AND program_id = 'd67a55af-e71b-43d4-ac63-e894217854f6'
    AND is_active = true
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

