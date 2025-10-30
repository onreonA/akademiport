-- ============================================================================
-- Firma Kullanıcısı Oluşturma Script'i (Final Version)
-- ============================================================================
-- Bu script firma@test.com kullanıcısını oluşturur
-- Email: firma@test.com
-- Password: Test123!
-- ============================================================================

-- 1. Önce mevcut firma kullanıcısını temizle (varsa)
DELETE FROM auth.users WHERE email = 'firma@test.com';
DELETE FROM public.users WHERE email = 'firma@test.com';

-- 2. Yeni firma kullanıcısı oluştur
DO $$
DECLARE
  new_user_id uuid;
  test_company_id uuid;
  test_program_id uuid;
BEGIN
  -- Test programının ID'sini al veya oluştur
  SELECT id INTO test_program_id 
  FROM public.programs 
  WHERE name = 'Test Program' 
  LIMIT 1;
  
  -- Eğer program yoksa oluştur
  IF test_program_id IS NULL THEN
    INSERT INTO public.programs (
      name,
      slug,
      description,
      status,
      start_date,
      end_date
    ) VALUES (
      'Test Program',
      'test-program',
      'Test amaçlı oluşturulmuş program',
      'active',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 year'
    )
    RETURNING id INTO test_program_id;
    
    RAISE NOTICE '✅ Yeni test programı oluşturuldu: %', test_program_id;
  END IF;
  
  -- Test firmasının ID'sini al
  SELECT id INTO test_company_id 
  FROM public.companies 
  WHERE name = 'Test Firma' 
  LIMIT 1;
  
  -- Eğer firma yoksa oluştur
  IF test_company_id IS NULL THEN
    INSERT INTO public.companies (
      program_id,
      name,
      tax_number,
      address,
      phone,
      email,
      website,
      max_users,
      is_active,
      slug
    ) VALUES (
      test_program_id,
      'Test Firma',
      '1234567890',
      'Test Adres, İstanbul',
      '+90 555 123 4567',
      'info@testfirma.com',
      'https://testfirma.com',
      10,
      true,
      'test-firma'
    )
    RETURNING id INTO test_company_id;
    
    RAISE NOTICE '✅ Yeni firma oluşturuldu: %', test_company_id;
  END IF;
  
  -- Auth kullanıcısı oluştur
  new_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'firma@test.com',
    crypt('Test123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Public users tablosuna ekle
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    company_id,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'firma@test.com',
    'Firma',
    'Kullanıcı',
    'Firma Kullanıcı',
    'company_user',
    test_company_id,
    true,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Firma kullanıcısı başarıyla oluşturuldu!';
  RAISE NOTICE '📧 Email: firma@test.com';
  RAISE NOTICE '🔑 Password: Test123!';
  RAISE NOTICE '👤 User ID: %', new_user_id;
  RAISE NOTICE '🏢 Company ID: %', test_company_id;
  RAISE NOTICE '📋 Program ID: %', test_program_id;
END $$;

-- 3. Oluşturulan kullanıcıyı kontrol et
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.full_name,
  u.role,
  u.company_id,
  c.name as company_name,
  c.program_id,
  p.name as program_name,
  u.is_active,
  u.created_at
FROM public.users u
LEFT JOIN public.companies c ON u.company_id = c.id
LEFT JOIN public.programs p ON c.program_id = p.id
WHERE u.email = 'firma@test.com';
