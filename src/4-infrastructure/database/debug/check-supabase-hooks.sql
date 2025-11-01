-- =====================================================
-- DEBUG: Check Supabase Hooks, Functions, and Webhooks
-- =====================================================
-- Bu script Supabase Database'de çalıştırılmalıdır

-- 1. Check for any database functions that might be called on auth.users INSERT
SELECT 
    routine_name,
    routine_type,
    routine_schema,
    routine_definition
FROM information_schema.routines
WHERE routine_schema IN ('auth', 'public', 'extensions')
  AND (
    routine_definition ILIKE '%auth.users%' 
    OR routine_definition ILIKE '%INSERT%users%'
    OR routine_name ILIKE '%user%'
  )
ORDER BY routine_schema, routine_name;

-- 2. Check for any policies on auth.users that might block INSERT
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'auth'
  AND tablename = 'users';

-- 3. Check for any constraints that might fail
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'auth.users'::regclass
ORDER BY contype, conname;

-- 4. Check for any indexes that might have issues
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'auth'
  AND tablename = 'users';

-- NOT: Webhooks kontrolü için Supabase Dashboard → Database → Webhooks sayfasına bakın

