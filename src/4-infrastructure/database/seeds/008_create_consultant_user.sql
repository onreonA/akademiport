-- ============================================================================
-- Danışman Kullanıcısı Oluşturma Script'i
-- ============================================================================
-- Bu script danisman@test.com kullanıcısını oluşturur ve Test Program'a atar
-- Email: danisman@test.com
-- Password: Test123!
-- ============================================================================

-- 1. Önce mevcut danışman kullanıcısını temizle (varsa)
DELETE FROM auth.users WHERE email = 'danisman@test.com';
DELETE FROM public.users WHERE email = 'danisman@test.com';

-- 2. Yeni danışman kullanıcısı oluştur
DO $$
DECLARE
  new_user_id uuid;
  test_program_id uuid;
BEGIN
  -- Test programının ID'sini al
  SELECT id INTO test_program_id
  FROM public.programs
  WHERE name = 'Test Program'
  LIMIT 1;

  -- Eğer program yoksa hata ver
  IF test_program_id IS NULL THEN
    RAISE EXCEPTION 'Test Program bulunamadı! Önce 007_create_firma_user_final.sql script''ini çalıştırın.';
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
    'danisman@test.com',
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
    is_active,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'danisman@test.com',
    'Test',
    'Danışman',
    'Test Danışman',
    'consultant',
    true,
    NOW(),
    NOW()
  );

  -- Danışmanı Test Program'a ata
  INSERT INTO public.user_programs (
    user_id,
    program_id,
    assigned_at,
    assigned_by
  ) VALUES (
    new_user_id,
    test_program_id,
    NOW(),
    (SELECT id FROM public.users WHERE role = 'master_admin' LIMIT 1)
  );

  RAISE NOTICE '✅ Danışman kullanıcısı başarıyla oluşturuldu!';
  RAISE NOTICE '📧 Email: danisman@test.com';
  RAISE NOTICE '🔑 Password: Test123!';
  RAISE NOTICE '👤 User ID: %', new_user_id;
  RAISE NOTICE '📋 Program ID: %', test_program_id;
  RAISE NOTICE '🎯 Program: Test Program';
END $$;

-- 3. Oluşturulan kullanıcıyı kontrol et
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.full_name,
  u.role,
  u.is_active,
  u.created_at,
  (
    SELECT COUNT(*)
    FROM public.user_programs up
    WHERE up.user_id = u.id
  ) as assigned_programs_count,
  (
    SELECT p.name
    FROM public.user_programs up
    JOIN public.programs p ON up.program_id = p.id
    WHERE up.user_id = u.id
    LIMIT 1
  ) as first_program_name
FROM public.users u
WHERE u.email = 'danisman@test.com';

