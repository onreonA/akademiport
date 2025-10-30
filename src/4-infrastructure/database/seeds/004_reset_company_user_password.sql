/**
 * Reset Company User Password
 * Sprint 7.5: Company User Management
 * 
 * Supabase Auth kullanıcısının şifresini güncelle
 * Email: firma@test.com
 * New Password: Test123!
 */

-- Supabase Auth kullanıcısının şifresini güncelle
UPDATE auth.users
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'firma@test.com';

-- Doğrulama
SELECT 
  id,
  email,
  created_at,
  updated_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'firma@test.com';

