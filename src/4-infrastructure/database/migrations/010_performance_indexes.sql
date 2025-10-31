-- =====================================================
-- Performance Optimization: Database Indexes
-- =====================================================
-- Sprint 8.5 - Performance improvements
-- Created: 2025-10-31
-- =====================================================

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================

-- Index for email lookups (login, user search)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index for company users lookup
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id) WHERE company_id IS NOT NULL;

-- Composite index for users by role and creation date
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, created_at DESC);

-- =====================================================
-- PROGRAMS TABLE INDEXES
-- =====================================================

-- Note: idx_programs_status already exists in schema/02-programs.sql
-- Note: idx_programs_manager already exists in schema/02-programs.sql (on program_manager_id)
-- Note: idx_programs_dates already exists in schema/02-programs.sql

-- Composite index for active programs by status and dates
CREATE INDEX IF NOT EXISTS idx_programs_status_dates ON programs(status, start_date, end_date);

-- =====================================================
-- COMPANIES TABLE INDEXES
-- =====================================================

-- Index for program assignments
CREATE INDEX IF NOT EXISTS idx_companies_program_id ON companies(program_id) WHERE program_id IS NOT NULL;

-- Index for companies by creation date
CREATE INDEX IF NOT EXISTS idx_companies_created ON companies(created_at DESC);

-- =====================================================
-- PROJECTS TABLE INDEXES
-- =====================================================

-- Index for company projects
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);

-- Index for consultant projects
CREATE INDEX IF NOT EXISTS idx_projects_consultant_id ON projects(consultant_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Index for template projects
CREATE INDEX IF NOT EXISTS idx_projects_is_template ON projects(is_template) WHERE is_template = true;

-- Composite index for active projects by consultant
CREATE INDEX IF NOT EXISTS idx_projects_consultant_status ON projects(consultant_id, status, created_at DESC);

-- Composite index for company projects with status
CREATE INDEX IF NOT EXISTS idx_projects_company_status ON projects(company_id, status, created_at DESC);

-- =====================================================
-- SUB_PROJECTS TABLE INDEXES
-- =====================================================

-- Index for project's sub-projects
CREATE INDEX IF NOT EXISTS idx_sub_projects_project_id ON sub_projects(project_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_sub_projects_status ON sub_projects(status);

-- Composite index for ordered sub-projects
CREATE INDEX IF NOT EXISTS idx_sub_projects_project_order ON sub_projects(project_id, order_index);

-- =====================================================
-- TASKS TABLE INDEXES
-- =====================================================

-- Index for sub-project tasks
CREATE INDEX IF NOT EXISTS idx_tasks_sub_project_id ON tasks(sub_project_id);

-- Index for assigned tasks
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Index for priority filtering
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Index for due date sorting
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;

-- Composite index for user's tasks
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status ON tasks(assigned_to, status, due_date) WHERE assigned_to IS NOT NULL;

-- Composite index for review tasks
CREATE INDEX IF NOT EXISTS idx_tasks_review ON tasks(status, completed_at) WHERE status = 'review';

-- =====================================================
-- TASK_COMMENTS TABLE INDEXES
-- =====================================================

-- Index for task comments
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

-- Index for user comments
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);

-- Composite index for task comments ordered by date
CREATE INDEX IF NOT EXISTS idx_task_comments_task_date ON task_comments(task_id, created_at DESC);

-- Index for questions
CREATE INDEX IF NOT EXISTS idx_task_comments_questions ON task_comments(task_id, is_question) WHERE is_question = true;

-- =====================================================
-- USER_PROGRAMS TABLE INDEXES
-- =====================================================

-- Index for user's programs
CREATE INDEX IF NOT EXISTS idx_user_programs_user_id ON user_programs(user_id);

-- Index for program's users
CREATE INDEX IF NOT EXISTS idx_user_programs_program_id ON user_programs(program_id);

-- Composite unique index (if not already exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_programs_unique ON user_programs(user_id, program_id);

-- =====================================================
-- PERFORMANCE NOTES
-- =====================================================
-- 
-- These indexes are designed to optimize:
-- 1. User authentication and role-based queries
-- 2. Project and task filtering by status, priority
-- 3. Consultant and company dashboards
-- 4. Task assignment and review workflows
-- 5. Comment loading for tasks
-- 
-- Index Maintenance:
-- - Indexes are automatically maintained by PostgreSQL
-- - Use ANALYZE after bulk inserts to update statistics
-- - Monitor index usage with pg_stat_user_indexes
-- 
-- To check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
-- 
-- =====================================================

