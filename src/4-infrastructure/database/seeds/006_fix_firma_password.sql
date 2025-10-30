-- =====================================================
-- FIX FIRMA USER PASSWORD
-- =====================================================
-- Bu SQL'i Supabase SQL Editor'de çalıştır

-- 1. Önce mevcut kullanıcıyı kontrol et
SELECT 
  id, 
  email, 
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users 
WHERE email = 'firma@test.com';

-- 2. Eğer kullanıcı yoksa, Supabase Dashboard'dan "Add user" ile oluştur:
--    Email: firma@test.com
--    Password: Test123!
--    Auto Confirm User: EVET (işaretle)

-- 3. Eğer kullanıcı varsa ama şifre çalışmıyorsa, şifreyi güncelle:
-- NOT: Supabase Auth'un kendi password hash mekanizması kullanılmalı
-- Bu yüzden Supabase Dashboard'dan "Reset Password" yapmalısın
-- VEYA aşağıdaki SQL'i çalıştır (ama bu her zaman çalışmayabilir):

-- UPDATE auth.users
-- SET 
--   encrypted_password = crypt('Test123!', gen_salt('bf')),
--   email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
--   updated_at = NOW()
-- WHERE email = 'firma@test.com';

-- 4. Public.users tablosunu kontrol et
SELECT 
  id, 
  email, 
  first_name,
  last_name,
  full_name, 
  role, 
  company_id,
  is_active,
  is_email_verified
FROM public.users 
WHERE email = 'firma@test.com';

-- 5. Eğer public.users'da yoksa veya eksikse, ekle/güncelle:
-- NOT: Auth.users'daki ID'yi kullan (yukarıdaki query'den al)
/*
INSERT INTO public.users (
  id, -- Auth.users'daki ID'yi buraya yapıştır
  email,
  first_name,
  last_name,
  full_name,
  phone,
  role,
  company_id,
  is_active,
  is_email_verified,
  created_at,
  updated_at
) VALUES (
  '7e75a2f7-e44b-4d88-990b-ef8fc5beb89', -- Auth.users'daki ID
  'firma@test.com',
  'Ömer',
  'Test',
  'Ömer Test',
  '+90 555 123 4567',
  'company_user',
  'e5f76e70-ecc9-4005-8819-2bb2c118f8a5',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active,
  is_email_verified = EXCLUDED.is_email_verified,
  updated_at = NOW();
*/

