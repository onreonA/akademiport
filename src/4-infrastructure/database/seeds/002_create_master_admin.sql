-- =====================================================
-- SEED: Create Master Admin (Complete Solution)
-- =====================================================
-- Bu script hem auth.users hem de public.users'a ekler
-- RLS ve trigger'ları bypass eder

-- 1. RLS'i geçici olarak kapat
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Auth user oluştur (Supabase extension function kullanarak)
-- NOT: Bu sadece auth.users'a ekler
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Önce kontrol et, varsa silme
  DELETE FROM auth.users WHERE email = 'admin@akademiport.com';
  DELETE FROM public.users WHERE email = 'admin@akademiport.com';
  
  -- Yeni UUID oluştur
  new_user_id := gen_random_uuid();
  
  -- Auth user oluştur (manuel insert)
  -- NOT: Normalde Supabase Auth API kullanılmalı ama seed için direkt insert yapıyoruz
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@akademiport.com',
    crypt('Admin123!', gen_salt('bf')), -- Bcrypt hash
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Public users'a ekle
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    is_active,
    is_email_verified
  ) VALUES (
    new_user_id,
    'admin@akademiport.com',
    'Master Admin',
    'master_admin',
    true,
    true
  );
  
  RAISE NOTICE 'Master Admin created with ID: %', new_user_id;
  RAISE NOTICE 'Email: admin@akademiport.com';
  RAISE NOTICE 'Password: Admin123!';
END $$;

-- 3. RLS'i tekrar aç
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Kontrol et
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  u.is_email_verified
FROM public.users u
WHERE u.email = 'admin@akademiport.com';

