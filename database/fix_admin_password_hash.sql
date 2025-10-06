-- =====================================================
-- ADMIN PASSWORD HASH FIX
-- =====================================================
-- Bu script admin kullanıcısının password_hash'ini 
-- auth.users tablosundan public.users tablosuna kopyalar

-- 1. public.users tablosuna password_hash alanı ekle
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. admin@ihracatakademi.com kullanıcısını public.users tablosuna ekle (eğer yoksa)
INSERT INTO public.users (email, full_name, role, password_hash, created_at, updated_at)
VALUES (
    'admin@ihracatakademi.com',
    'Admin User',
    'admin',
    '$2a$10$u6n4ZB7kOMZ/8D97OrJlMu7kY5W2xh/Wqvym0A65GASomiG.O4dli',
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 3. Diğer admin/consultant kullanıcıları için de hash ekle (eğer varsa)
-- Zarife hocam için
INSERT INTO public.users (email, full_name, role, password_hash, created_at, updated_at)
VALUES (
    'zarife.yilmaz@ihracatakademiiii.com',
    'Zarife Hocam',
    'consultant',
    '$2a$10$NURbOcPCLvABx.tTgUJBy.zLQi1y9/de2yz6uNppQr8bJatJn8KPS',
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 4. Kontrol sorgusu - tüm kullanıcıları listele
SELECT 
    email,
    full_name,
    role,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Hash var'
        ELSE 'Hash yok'
    END as password_status,
    created_at
FROM public.users 
ORDER BY created_at DESC;
