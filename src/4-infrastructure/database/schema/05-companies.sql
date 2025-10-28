-- =====================================================
-- COMPANIES TABLE
-- =====================================================
-- Firma tablosu

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Program
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  tax_number VARCHAR(20),
  trade_registry_number VARCHAR(50),
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Contact
  email CITEXT,
  phone VARCHAR(20),
  website VARCHAR(255),
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'Türkiye',
  
  -- Business Info
  sector VARCHAR(100),
  sub_sector VARCHAR(100),
  employee_count INTEGER,
  foundation_year INTEGER,
  
  -- Logo
  logo_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- User Limits
  max_users INTEGER DEFAULT 2, -- Max 2 active users per company
  current_users INTEGER DEFAULT 0,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_user_limit CHECK (max_users > 0),
  CONSTRAINT valid_current_users CHECK (current_users >= 0 AND current_users <= max_users),
  CONSTRAINT valid_employee_count CHECK (employee_count IS NULL OR employee_count > 0),
  CONSTRAINT valid_foundation_year CHECK (foundation_year IS NULL OR (foundation_year >= 1800 AND foundation_year <= EXTRACT(YEAR FROM CURRENT_DATE)))
);

-- Indexes
CREATE INDEX idx_companies_program ON companies(program_id);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_is_active ON companies(is_active);

-- Full-text search index
CREATE INDEX idx_companies_search ON companies USING gin(to_tsvector('turkish', name || ' ' || COALESCE(legal_name, '') || ' ' || COALESCE(sector, '')));

-- Comments
COMMENT ON TABLE companies IS 'Firma tablosu. Her firma bir programa aittir.';
COMMENT ON COLUMN companies.program_id IS 'Firmanın bağlı olduğu program';
COMMENT ON COLUMN companies.max_users IS 'Maksimum aktif kullanıcı sayısı (default: 2)';
COMMENT ON COLUMN companies.current_users IS 'Mevcut aktif kullanıcı sayısı (otomatik güncellenir)';
COMMENT ON COLUMN companies.slug IS 'URL-friendly unique identifier';

