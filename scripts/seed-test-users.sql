/**
 * Test Kullanıcıları Seed Script
 * 
 * E2E test'ler için test kullanıcılarını oluşturur
 * 
 * Kullanım:
 * 1. Supabase SQL Editor'de çalıştırın
 * 2. Veya migration olarak ekleyin
 */

-- Test kullanıcılarını oluştur (Supabase Auth üzerinden manuel oluşturulmalı)
-- Bu script sadece users tablosundaki role'leri ve ilişkileri ayarlar

-- Admin kullanıcısı için role ata (admin@test.com)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Kullanıcıyı bul (email ile)
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@test.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Users tablosunda kayıt yoksa oluştur
    INSERT INTO users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (
      admin_user_id,
      'admin@test.com',
      'Test Admin',
      'master_admin',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'master_admin',
        is_active = true,
        updated_at = NOW();
  END IF;
END $$;

-- Consultant kullanıcısı için role ata ve programa bağla (consultant@test.com)
DO $$
DECLARE
  consultant_user_id UUID;
  test_program_id UUID;
BEGIN
  -- Kullanıcıyı bul
  SELECT id INTO consultant_user_id
  FROM auth.users
  WHERE email = 'consultant@test.com';
  
  -- İlk programı bul (veya oluştur)
  SELECT id INTO test_program_id
  FROM programs
  LIMIT 1;
  
  -- Eğer program yoksa oluştur
  IF test_program_id IS NULL THEN
    INSERT INTO programs (id, name, start_date, end_date, max_companies, status, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Test Program',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 year',
      10,
      'active',
      NOW(),
      NOW()
    )
    RETURNING id INTO test_program_id;
  END IF;
  
  IF consultant_user_id IS NOT NULL THEN
    -- Users tablosunda kayıt yoksa oluştur
    INSERT INTO users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (
      consultant_user_id,
      'consultant@test.com',
      'Test Consultant',
      'consultant',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'consultant',
        is_active = true,
        updated_at = NOW();
    
    -- Consultant'ı programa ata (user_programs tablosu kullanılır)
    INSERT INTO user_programs (id, user_id, program_id, role_in_program, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      consultant_user_id,
      test_program_id,
      'consultant',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, program_id) DO UPDATE
    SET role_in_program = 'consultant',
        is_active = true,
        updated_at = NOW();
  END IF;
END $$;

-- Company kullanıcısı için role ata ve company'ye bağla (company@test.com)
DO $$
DECLARE
  company_user_id UUID;
  test_company_id UUID;
  test_program_id UUID;
BEGIN
  -- Kullanıcıyı bul
  SELECT id INTO company_user_id
  FROM auth.users
  WHERE email = 'company@test.com';
  
  -- İlk programı bul (company oluşturmadan önce programa ihtiyacımız var)
  SELECT id INTO test_program_id
  FROM programs
  LIMIT 1;
  
  -- Eğer program yoksa oluştur
  IF test_program_id IS NULL THEN
    INSERT INTO programs (id, name, start_date, end_date, max_companies, status, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Test Program',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 year',
      10,
      'active',
      NOW(),
      NOW()
    )
    RETURNING id INTO test_program_id;
  END IF;
  
  -- İlk company'yi bul (veya oluştur)
  SELECT id INTO test_company_id
  FROM companies
  WHERE program_id = test_program_id
  LIMIT 1;
  
  -- Eğer company yoksa oluştur (program_id ile birlikte)
  IF test_company_id IS NULL THEN
    INSERT INTO companies (
      id, program_id, name, legal_name, country, city, sector, is_active,
      created_at, updated_at
    )
    VALUES (
      gen_random_uuid(),
      test_program_id,
      'Test Company',
      'Test Company Ltd.',
      'Türkiye',
      'Istanbul',
      'E-ticaret',
      true,
      NOW(),
      NOW()
    )
    RETURNING id INTO test_company_id;
  END IF;
  
  IF company_user_id IS NOT NULL THEN
    -- Users tablosunda kayıt yoksa oluştur
    INSERT INTO users (id, email, full_name, role, company_id, is_active, created_at, updated_at)
    VALUES (
      company_user_id,
      'company@test.com',
      'Test Company User',
      'company_user',
      test_company_id,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'company_user',
        company_id = test_company_id,
        is_active = true,
        updated_at = NOW();
  END IF;
END $$;

-- Sonuçları kontrol et
SELECT 
  u.email,
  u.role,
  u.company_id,
  c.name as company_name,
  p.name as program_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN programs p ON c.program_id = p.id OR EXISTS (
  SELECT 1 FROM user_programs up 
  WHERE up.user_id = u.id AND up.program_id = p.id
)
WHERE u.email IN ('admin@test.com', 'consultant@test.com', 'company@test.com');

