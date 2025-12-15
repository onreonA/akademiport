-- =====================================================
-- MIGRATION: 057_refresh_ecommerce_performance_and_check_companies
-- Description: Refresh ecommerce_performance view and check companies
-- Created: 2025-12-13
-- =====================================================

-- Refresh the materialized view to include all active companies
REFRESH MATERIALIZED VIEW CONCURRENTLY ecommerce_performance;

-- Check companies count and program_id distribution
-- This will help us understand why only 3 companies appear in the view
DO $$
DECLARE
  total_companies INTEGER;
  active_companies INTEGER;
  kayseri_program_id_old UUID := '10000000-0000-0000-0000-000000000001';
  kayseri_program_id_new UUID := '0560190a-9b8f-4c39-8c2b-c12bf81c46a6';
  companies_with_old_id INTEGER;
  companies_with_new_id INTEGER;
  companies_in_view INTEGER;
BEGIN
  -- Count total companies
  SELECT COUNT(*) INTO total_companies FROM companies;
  
  -- Count active companies
  SELECT COUNT(*) INTO active_companies FROM companies WHERE is_active = TRUE;
  
  -- Count companies with old Kayseri program ID
  SELECT COUNT(*) INTO companies_with_old_id 
  FROM companies 
  WHERE program_id = kayseri_program_id_old AND is_active = TRUE;
  
  -- Count companies with new Kayseri program ID
  SELECT COUNT(*) INTO companies_with_new_id 
  FROM companies 
  WHERE program_id = kayseri_program_id_new AND is_active = TRUE;
  
  -- Count companies in ecommerce_performance view
  SELECT COUNT(*) INTO companies_in_view FROM ecommerce_performance;
  
  RAISE NOTICE 'Total companies: %', total_companies;
  RAISE NOTICE 'Active companies: %', active_companies;
  RAISE NOTICE 'Companies with old Kayseri program ID (%): %', kayseri_program_id_old, companies_with_old_id;
  RAISE NOTICE 'Companies with new Kayseri program ID (%): %', kayseri_program_id_new, companies_with_new_id;
  RAISE NOTICE 'Companies in ecommerce_performance view: %', companies_in_view;
END $$;
