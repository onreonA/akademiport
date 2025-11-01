-- =====================================================
-- DEBUG: Check auth.users triggers and functions
-- =====================================================
-- Bu script Supabase Database'de çalıştırılmalıdır
-- Supabase Dashboard → SQL Editor → New Query → Paste this

-- 1. Check all triggers on auth.users table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
ORDER BY trigger_name;

-- 2. Check all functions that might be called by triggers
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'auth'
  AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- 3. Check for any hooks or webhooks that might affect auth.users
-- (This requires checking Supabase Dashboard → Database → Webhooks)

-- 4. Check recent errors in PostgreSQL logs
-- (This is visible in Supabase Dashboard → Logs → Postgres Logs)

-- 5. Try to create a test user directly in auth.users (should fail with same error)
-- WARNING: This might create an orphaned record, only for testing!
-- DO $$
-- DECLARE
--   test_email TEXT := 'test-debug-' || gen_random_uuid()::text || '@example.com';
-- BEGIN
--   RAISE NOTICE 'Attempting to create test user with email: %', test_email;
--   -- This will fail if there's a trigger issue
--   INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
--   VALUES (
--     gen_random_uuid(),
--     '00000000-0000-0000-0000-000000000000',
--     'authenticated',
--     'authenticated',
--     test_email,
--     crypt('Test123!', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
--   );
--   RAISE NOTICE 'Test user created successfully!';
-- EXCEPTION
--   WHEN OTHERS THEN
--     RAISE NOTICE 'Error creating test user: %', SQLERRM;
-- END $$;

