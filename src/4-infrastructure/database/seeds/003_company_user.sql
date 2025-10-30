/**
 * Create Company User
 * Sprint 7.5: Company User Management
 * 
 * Bu script bir firma kullanıcısı oluşturur
 * Email: firma@test.com
 * Password: Test123!
 */

DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid := 'e5f76e70-ecc9-4005-8819-2bb2c118f8a5'; -- Mevcut firma ID'si
BEGIN
  -- 1. Önce mevcut kullanıcıyı kontrol et
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'firma@test.com';

  -- 2. Eğer auth.users'da yoksa oluştur
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'firma@test.com',
      crypt('Test123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Auth user created with ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Auth user already exists with ID: %', v_user_id;
  END IF;

  -- 3. Public.users tablosuna ekle veya güncelle
  IF EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    -- Kullanıcı varsa güncelle
    UPDATE public.users
    SET
      email = 'firma@test.com',
      full_name = 'Test Firma Kullanıcısı',
      phone = '+90 555 123 4567',
      role = 'company_user',
      company_id = v_company_id,
      is_active = true,
      is_email_verified = true,
      updated_at = now()
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Public user updated';
  ELSE
    -- Kullanıcı yoksa ekle
    INSERT INTO public.users (
      id,
      email,
      full_name,
      phone,
      role,
      company_id,
      is_active,
      is_email_verified,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      'firma@test.com',
      'Test Firma Kullanıcısı',
      '+90 555 123 4567',
      'company_user',
      v_company_id,
      true,
      true,
      now(),
      now()
    );
    
    RAISE NOTICE 'Public user created';
  END IF;

  -- 4. Firma'nın current_users sayısını güncelle
  UPDATE public.companies
  SET 
    current_users = (
      SELECT COUNT(*)
      FROM public.users
      WHERE company_id = v_company_id
        AND role = 'company_user'
        AND is_active = true
    ),
    updated_at = now()
  WHERE id = v_company_id;

  RAISE NOTICE 'Company user count updated';
  
END $$;

-- 5. Doğrulama - Kullanıcı bilgilerini göster
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  c.name as company_name,
  u.is_active,
  u.created_at
FROM public.users u
LEFT JOIN public.companies c ON u.company_id = c.id
WHERE u.email = 'firma@test.com';
