-- Add first_name and last_name to users table
-- Sprint 7.5: Fix user schema

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Mevcut full_name'leri split edelim (varsa)
UPDATE public.users
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN full_name LIKE '% %' THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Doğrula
SELECT id, email, first_name, last_name, full_name, role FROM public.users;

