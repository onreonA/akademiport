/**
 * Test Kullanıcıları Kontrol Script'i
 * 
 * E2E test'ler için test kullanıcılarının var olup olmadığını kontrol eder
 * 
 * Kullanım:
 * 1. Supabase SQL Editor'de çalıştırın
 * 2. Sonuçları kontrol edin
 */

-- Test kullanıcılarını kontrol et
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_active,
  u.company_id,
  c.name as company_name,
  p.name as program_name,
  CASE 
    WHEN au.id IS NULL THEN '❌ Auth kullanıcısı yok'
    WHEN u.id IS NULL THEN '❌ Users tablosunda kayıt yok'
    WHEN u.role IS NULL THEN '⚠️ Role atanmamış'
    WHEN u.company_id IS NOT NULL AND c.id IS NULL THEN '⚠️ Company ilişkisi eksik'
    ELSE '✅ Tamam'
  END as durum
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN programs p ON c.program_id = p.id OR EXISTS (
  SELECT 1 FROM user_programs up 
  WHERE up.user_id = u.id AND up.program_id = p.id
)
WHERE au.email IN ('admin@test.com', 'consultant@test.com', 'company@test.com')
ORDER BY au.email;

-- Consultant'ın programa atanıp atanmadığını kontrol et
SELECT 
  u.email,
  u.role,
  p.name as program_name,
  up.created_at as atanma_tarihi,
  CASE 
    WHEN up.id IS NULL THEN '❌ Programa atanmamış'
    ELSE '✅ Programa atanmış'
  END as durum
FROM auth.users au
JOIN users u ON au.id = u.id
LEFT JOIN user_programs up ON u.id = up.user_id
LEFT JOIN programs p ON up.program_id = p.id
WHERE au.email = 'consultant@test.com';

-- Company'nin programa atanıp atanmadığını kontrol et
SELECT 
  u.email,
  c.name as company_name,
  p.name as program_name,
  c.created_at as atanma_tarihi,
  CASE 
    WHEN c.program_id IS NULL THEN '❌ Programa atanmamış'
    ELSE '✅ Programa atanmış'
  END as durum
FROM auth.users au
JOIN users u ON au.id = u.id
JOIN companies c ON u.company_id = c.id
LEFT JOIN programs p ON c.program_id = p.id
WHERE au.email = 'company@test.com';

-- Özet rapor
SELECT 
  COUNT(*) FILTER (WHERE au.email IN ('admin@test.com', 'consultant@test.com', 'company@test.com')) as toplam_auth_kullanici,
  COUNT(*) FILTER (WHERE u.id IS NOT NULL AND au.email IN ('admin@test.com', 'consultant@test.com', 'company@test.com')) as users_tablosunda_kayit,
  COUNT(*) FILTER (WHERE u.role IS NOT NULL AND au.email IN ('admin@test.com', 'consultant@test.com', 'company@test.com')) as role_atanmis,
  COUNT(*) FILTER (WHERE up.id IS NOT NULL AND au.email = 'consultant@test.com') as consultant_programa_atanmis,
  COUNT(*) FILTER (WHERE c.program_id IS NOT NULL AND au.email = 'company@test.com') as company_programa_atanmis
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN user_programs up ON u.id = up.user_id AND au.email = 'consultant@test.com'
LEFT JOIN companies c ON u.company_id = c.id AND au.email = 'company@test.com'
WHERE au.email IN ('admin@test.com', 'consultant@test.com', 'company@test.com');

