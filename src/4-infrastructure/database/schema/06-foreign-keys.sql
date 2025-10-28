-- =====================================================
-- FOREIGN KEYS
-- =====================================================
-- Foreign key'leri sonradan ekliyoruz (circular dependency'den kaçınmak için)

-- Programs table
ALTER TABLE programs
  ADD CONSTRAINT fk_programs_manager 
  FOREIGN KEY (program_manager_id) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

ALTER TABLE programs
  ADD CONSTRAINT fk_programs_created_by 
  FOREIGN KEY (created_by) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

ALTER TABLE programs
  ADD CONSTRAINT fk_programs_updated_by 
  FOREIGN KEY (updated_by) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

-- Users table
ALTER TABLE users
  ADD CONSTRAINT fk_users_company 
  FOREIGN KEY (company_id) 
  REFERENCES companies(id) 
  ON DELETE SET NULL;

ALTER TABLE users
  ADD CONSTRAINT fk_users_created_by 
  FOREIGN KEY (created_by) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

ALTER TABLE users
  ADD CONSTRAINT fk_users_updated_by 
  FOREIGN KEY (updated_by) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

