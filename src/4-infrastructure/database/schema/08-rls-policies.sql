-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Güvenlik politikaları

-- =====================================================
-- Enable RLS
-- =====================================================
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is master admin
CREATE OR REPLACE FUNCTION is_master_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'master_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is program manager of a program
CREATE OR REPLACE FUNCTION is_program_manager(program_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_programs 
    WHERE user_id = auth.uid() 
      AND program_id = program_uuid 
      AND role_in_program = 'program_manager'
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is consultant in a program
CREATE OR REPLACE FUNCTION is_consultant_in_program(program_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_programs 
    WHERE user_id = auth.uid() 
      AND program_id = program_uuid 
      AND role_in_program = 'consultant'
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user belongs to a company
CREATE OR REPLACE FUNCTION is_company_member(company_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND company_id = company_uuid
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- PROGRAMS Policies
-- =====================================================

-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on programs"
  ON programs
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Program Manager: Can view and update their programs
CREATE POLICY "Program managers can view their programs"
  ON programs
  FOR SELECT
  USING (is_program_manager(id));

CREATE POLICY "Program managers can update their programs"
  ON programs
  FOR UPDATE
  USING (is_program_manager(id))
  WITH CHECK (is_program_manager(id));

-- Consultants: Can view programs they're assigned to
CREATE POLICY "Consultants can view their programs"
  ON programs
  FOR SELECT
  USING (is_consultant_in_program(id));

-- =====================================================
-- USERS Policies
-- =====================================================

-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on users"
  ON users
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Consultants and Program Managers: Can view users in their program companies
CREATE POLICY "Consultants and Program Managers can view users in their program companies"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      INNER JOIN user_programs up ON up.program_id = c.program_id
      WHERE c.id = users.company_id
        AND up.user_id = auth.uid()
        AND up.role_in_program IN ('consultant', 'program_manager')
        AND up.is_active = true
    )
  );

-- =====================================================
-- USER_PROGRAMS Policies
-- =====================================================

-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on user_programs"
  ON user_programs
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Program Managers: Can manage their program assignments
CREATE POLICY "Program managers can manage their program assignments"
  ON user_programs
  FOR ALL
  USING (is_program_manager(program_id))
  WITH CHECK (is_program_manager(program_id));

-- Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
  ON user_programs
  FOR SELECT
  USING (user_id = auth.uid());

-- =====================================================
-- COMPANIES Policies
-- =====================================================

-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on companies"
  ON companies
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Program Managers: Can manage companies in their programs
CREATE POLICY "Program managers can manage companies in their programs"
  ON companies
  FOR ALL
  USING (is_program_manager(program_id))
  WITH CHECK (is_program_manager(program_id));

-- Consultants: Can view companies in their programs
CREATE POLICY "Consultants can view companies in their programs"
  ON companies
  FOR SELECT
  USING (is_consultant_in_program(program_id));

-- Company members: Can view their own company
CREATE POLICY "Company members can view their own company"
  ON companies
  FOR SELECT
  USING (is_company_member(id));

-- Company admins: Can update their own company
CREATE POLICY "Company admins can update their own company"
  ON companies
  FOR UPDATE
  USING (
    is_company_member(id) AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'company_admin')
  )
  WITH CHECK (
    is_company_member(id) AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'company_admin')
  );

