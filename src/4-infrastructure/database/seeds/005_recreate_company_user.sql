/**
 * Recreate Company User (Correct Way)
 * Sprint 7.5: Company User Management
 * 
 * Önce eski kullanıcıyı sil, sonra Supabase Dashboard'dan yeniden oluştur
 */

-- 1. Public users'dan sil
DELETE FROM public.users WHERE email = 'firma@test.com';

-- 2. Auth users'dan sil
DELETE FROM auth.users WHERE email = 'firma@test.com';

-- 3. Doğrula - artık hiç kullanıcı olmamalı
SELECT * FROM auth.users WHERE email = 'firma@test.com';
SELECT * FROM public.users WHERE email = 'firma@test.com';

/**
 * ŞİMDİ SUPABASE DASHBOARD'DAN OLUŞTUR:
 * 
 * 1. Supabase Dashboard → Authentication → Users
 * 2. "Add user" → "Create new user"
 * 3. Email: firma@test.com
 * 4. Password: Test123!
 * 5. ✅ Auto Confirm User (işaretle!)
 * 6. "Create user" butonuna bas
 * 7. Oluşturulan kullanıcının ID'sini kopyala
 * 
 * SONRA AŞAĞIDAKİ SQL'İ ÇALIŞTIR (USER_ID'Yİ DEĞİŞTİR):
 */

-- Public users tablosuna ekle
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
  'USER_ID_BURAYA', -- Supabase Dashboard'dan kopyalanan ID
  'firma@test.com',
  'Test Firma Kullanıcısı',
  '+90 555 123 4567',
  'company_user',
  'e5f76e70-ecc9-4005-8819-2bb2c118f8a5',
  true,
  true,
  now(),
  now()
);

-- Firma'nın current_users sayısını güncelle
UPDATE public.companies
SET 
  current_users = (
    SELECT COUNT(*)
    FROM public.users
    WHERE company_id = 'e5f76e70-ecc9-4005-8819-2bb2c118f8a5'
      AND role = 'company_user'
      AND is_active = true
  ),
  updated_at = now()
WHERE id = 'e5f76e70-ecc9-4005-8819-2bb2c118f8a5';

-- Doğrula
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  c.name as company_name,
  u.is_active
FROM public.users u
LEFT JOIN public.companies c ON u.company_id = c.id
WHERE u.email = 'firma@test.com';

