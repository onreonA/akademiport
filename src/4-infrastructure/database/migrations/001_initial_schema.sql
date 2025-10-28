-- =====================================================
-- MIGRATION: 001_initial_schema
-- Description: Initial database schema for Akademi Port
-- Created: 2025-10-28
-- =====================================================

-- This migration combines all schema files in order

-- 00: Extensions
\i '../schema/00-extensions.sql'

-- 01: Enums
\i '../schema/01-enums.sql'

-- 02: Programs
\i '../schema/02-programs.sql'

-- 03: Users
\i '../schema/03-users.sql'

-- 04: User Programs
\i '../schema/04-user-programs.sql'

-- 05: Companies
\i '../schema/05-companies.sql'

-- 06: Foreign Keys
\i '../schema/06-foreign-keys.sql'

-- 07: Triggers
\i '../schema/07-triggers.sql'

-- 08: RLS Policies
\i '../schema/08-rls-policies.sql'

