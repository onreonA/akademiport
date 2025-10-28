-- =====================================================
-- SEED: Master Admin User
-- =====================================================
-- İlk master admin kullanıcısı
-- NOT: Bu kullanıcı Supabase Auth'da manuel oluşturulmalıdır!

-- Master Admin bilgileri:
-- Email: admin@akademiport.com
-- Password: (Supabase'de oluşturulacak)
-- Role: master_admin

-- Bu script sadece users tablosuna ekler
-- Önce Supabase Auth'da kullanıcı oluşturulmalı!

INSERT INTO users (
  id,
  email,
  full_name,
  role,
  is_active,
  is_email_verified
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- Placeholder ID
  'admin@akademiport.com',
  'Master Admin',
  'master_admin',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- NOT: Gerçek ID Supabase Auth'dan gelecek
-- Bu sadece örnek bir seed data'dır

