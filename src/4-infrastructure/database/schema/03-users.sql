-- =====================================================
-- USERS TABLE
-- =====================================================
-- Kullanıcı tablosu (Supabase Auth ile entegre)

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  email CITEXT UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  
  -- Role
  role user_role NOT NULL DEFAULT 'company_user',
  
  -- Company (if applicable)
  company_id UUID, -- Foreign key to companies table (will be added later)
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Profile
  bio TEXT,
  expertise_areas TEXT[], -- For consultants
  social_links JSONB DEFAULT '{}'::jsonb,
  
  -- Settings
  settings JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "language": "tr",
    "timezone": "Europe/Istanbul"
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_full_name ON users(full_name);

-- Full-text search index
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('turkish', full_name || ' ' || email));

-- Comments
COMMENT ON TABLE users IS 'Kullanıcı tablosu. Supabase Auth ile entegre çalışır.';
COMMENT ON COLUMN users.id IS 'Supabase Auth user ID';
COMMENT ON COLUMN users.role IS 'Kullanıcı rolü (master_admin, program_manager, consultant, company_admin, company_user, observer)';
COMMENT ON COLUMN users.expertise_areas IS 'Danışmanlar için uzmanlık alanları';
COMMENT ON COLUMN users.settings IS 'Kullanıcı ayarları (notifications, language, timezone, etc.)';

