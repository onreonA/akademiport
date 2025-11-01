-- Check if user exists in public.users table
SELECT 
  id,
  email,
  full_name,
  role,
  company_id,
  is_active,
  created_at
FROM public.users
WHERE id = 'd7a14b04-ce17-42a3-a8bc-f00512e70520';

-- Check all users for the company
SELECT 
  id,
  email,
  full_name,
  role,
  company_id,
  is_active,
  created_at
FROM public.users
WHERE company_id = 'e5f76e70-ecc9-4005-8819-2bb2c118f8a5';

-- Check if user exists in auth.users
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at
FROM auth.users
WHERE id = 'd7a14b04-ce17-42a3-a8bc-f00512e70520';

