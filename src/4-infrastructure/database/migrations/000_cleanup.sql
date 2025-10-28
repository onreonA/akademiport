-- =====================================================
-- CLEANUP: Remove all existing tables and types
-- =====================================================
-- Bu dosyayı sadece geliştirme aşamasında kullanın!
-- Production'da ASLA çalıştırmayın!

-- Drop policies first
DROP POLICY IF EXISTS "Company admins can update their own company" ON companies;
DROP POLICY IF EXISTS "Company members can view their own company" ON companies;
DROP POLICY IF EXISTS "Consultants can view companies in their programs" ON companies;
DROP POLICY IF EXISTS "Program managers can manage companies in their programs" ON companies;
DROP POLICY IF EXISTS "Master admin can do everything on companies" ON companies;

DROP POLICY IF EXISTS "Users can view their own assignments" ON user_programs;
DROP POLICY IF EXISTS "Program managers can manage their program assignments" ON user_programs;
DROP POLICY IF EXISTS "Master admin can do everything on user_programs" ON user_programs;

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Master admin can do everything on users" ON users;

DROP POLICY IF EXISTS "Consultants can view their programs" ON programs;
DROP POLICY IF EXISTS "Program managers can update their programs" ON programs;
DROP POLICY IF EXISTS "Program managers can view their programs" ON programs;
DROP POLICY IF EXISTS "Master admin can do everything on programs" ON programs;

-- Drop triggers
DROP TRIGGER IF EXISTS sync_user_email_verification_trigger ON auth.users;
DROP TRIGGER IF EXISTS generate_company_slug ON companies;
DROP TRIGGER IF EXISTS generate_program_slug ON programs;
DROP TRIGGER IF EXISTS update_program_company_count_trigger ON companies;
DROP TRIGGER IF EXISTS update_company_user_count_trigger ON users;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_user_programs_updated_at ON user_programs;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;

-- Drop functions
DROP FUNCTION IF EXISTS sync_user_email_verification();
DROP FUNCTION IF EXISTS generate_slug();
DROP FUNCTION IF EXISTS update_program_company_count();
DROP FUNCTION IF EXISTS update_company_user_count();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS is_company_member(UUID);
DROP FUNCTION IF EXISTS is_consultant_in_program(UUID);
DROP FUNCTION IF EXISTS is_program_manager(UUID);
DROP FUNCTION IF EXISTS is_master_admin();
DROP FUNCTION IF EXISTS get_user_role();

-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS user_programs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS programs CASCADE;

-- Drop types
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS event_type;
DROP TYPE IF EXISTS training_type;
DROP TYPE IF EXISTS task_priority;
DROP TYPE IF EXISTS task_status;
DROP TYPE IF EXISTS project_status;
DROP TYPE IF EXISTS program_status;
DROP TYPE IF EXISTS user_role;

-- Extensions are kept (no need to drop)

