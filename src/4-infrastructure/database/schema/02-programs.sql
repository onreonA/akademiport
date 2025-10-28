-- =====================================================
-- PROGRAMS TABLE
-- =====================================================
-- Ana program/grup tablosu
-- Her program bağımsız bir eğitim/danışmanlık grubudur

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Location
  city VARCHAR(100),
  region VARCHAR(100),
  
  -- Program Details
  program_type VARCHAR(100), -- "E-İhracat", "Dijital Dönüşüm", "Tekstil", etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months INTEGER,
  
  -- Capacity
  max_companies INTEGER DEFAULT 20,
  current_companies INTEGER DEFAULT 0,
  
  -- Status
  status program_status DEFAULT 'planned',
  
  -- Sponsor/Budget
  sponsor VARCHAR(255), -- "Bakanlık", "KOSGEB", "TİM", etc.
  budget DECIMAL(15, 2),
  
  -- Manager
  program_manager_id UUID, -- Foreign key to users table (will be added later)
  
  -- Settings (JSONB for flexibility)
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_capacity CHECK (max_companies > 0),
  CONSTRAINT valid_current_companies CHECK (current_companies >= 0 AND current_companies <= max_companies)
);

-- Indexes
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_city ON programs(city);
CREATE INDEX idx_programs_program_type ON programs(program_type);
CREATE INDEX idx_programs_manager ON programs(program_manager_id);
CREATE INDEX idx_programs_dates ON programs(start_date, end_date);
CREATE INDEX idx_programs_slug ON programs(slug);

-- Full-text search index
CREATE INDEX idx_programs_search ON programs USING gin(to_tsvector('turkish', name || ' ' || COALESCE(description, '')));

-- Comments
COMMENT ON TABLE programs IS 'Ana program/grup tablosu. Her program bağımsız bir eğitim/danışmanlık grubudur.';
COMMENT ON COLUMN programs.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN programs.settings IS 'Program-specific settings in JSON format';
COMMENT ON COLUMN programs.current_companies IS 'Programdaki mevcut firma sayısı (otomatik güncellenir)';

