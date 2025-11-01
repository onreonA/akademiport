-- Insert user into public.users table
-- This user exists in auth.users but not in public.users
-- UID: d7a14b04-ce17-42a3-a8bc-f00512e70520
-- Email: test10@kayseritekstil.com
-- Company ID: e5f76e70-ecc9-4005-8819-2bb2c118f8a5

-- First, check if user already exists
SELECT 
  id,
  email,
  full_name,
  role,
  company_id,
  is_active
FROM public.users
WHERE id = 'd7a14b04-ce17-42a3-a8bc-f00512e70520';

-- If user doesn't exist, insert it
-- Note: You need to replace the values based on the actual user data from auth.users
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  company_id,
  is_active,
  is_email_verified,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_app_meta_data->>'full_name',
    split_part(email, '@', 1) -- Fallback to email prefix if no full_name
  ) as full_name,
  'company_user' as role, -- Default role, change if needed
  'e5f76e70-ecc9-4005-8819-2bb2c118f8a5'::uuid as company_id, -- Company ID from debug log
  true as is_active,
  COALESCE(email_confirmed_at IS NOT NULL, false) as is_email_verified,
  created_at,
  updated_at
FROM auth.users
WHERE id = 'd7a14b04-ce17-42a3-a8bc-f00512e70520'
  AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = 'd7a14b04-ce17-42a3-a8bc-f00512e70520'
  )
RETURNING *;

-- Verify the user was inserted
SELECT 
  id,
  email,
  full_name,
  role,
  company_id,
  is_active,
  is_email_verified,
  created_at
FROM public.users
WHERE id = 'd7a14b04-ce17-42a3-a8bc-f00512e70520';

