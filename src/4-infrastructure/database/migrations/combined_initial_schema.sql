-- =====================================================
-- EXTENSIONS
-- =====================================================
-- PostgreSQL extensions that we need

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search (Turkish support)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Case-insensitive text type
CREATE EXTENSION IF NOT EXISTS "citext";

-- =====================================================
-- ENUMS
-- =====================================================
-- Enum types for type safety

-- User Roles
CREATE TYPE user_role AS ENUM (
  'master_admin',      -- Tüm sistemi yöneten
  'program_manager',   -- Program yöneticisi
  'consultant',        -- Danışman
  'company_admin',     -- Firma yöneticisi
  'company_user',      -- Firma kullanıcısı
  'observer'           -- Gözlemci (sadece görüntüleme)
);

-- Program Status
CREATE TYPE program_status AS ENUM (
  'planned',           -- Planlandı
  'active',            -- Aktif
  'completed',         -- Tamamlandı
  'paused',            -- Duraklatıldı
  'cancelled'          -- İptal edildi
);

-- Project Status
CREATE TYPE project_status AS ENUM (
  'not_started',       -- Başlanmadı
  'in_progress',       -- Devam ediyor
  'review',            -- İncelemede
  'completed',         -- Tamamlandı
  'on_hold',           -- Beklemede
  'cancelled'          -- İptal edildi
);

-- Task Status
CREATE TYPE task_status AS ENUM (
  'todo',              -- Yapılacak
  'in_progress',       -- Devam ediyor
  'review',            -- İncelemede
  'completed',         -- Tamamlandı
  'blocked'            -- Bloke
);

-- Task Priority
CREATE TYPE task_priority AS ENUM (
  'low',               -- Düşük
  'medium',            -- Orta
  'high',              -- Yüksek
  'urgent'             -- Acil
);

-- Training Type
CREATE TYPE training_type AS ENUM (
  'video',             -- Video eğitim
  'document',          -- Döküman
  'live_event',        -- Canlı etkinlik
  'quiz',              -- Quiz
  'assignment'         -- Ödev
);

-- Event Type
CREATE TYPE event_type AS ENUM (
  'online',            -- Online etkinlik
  'offline',           -- Yüz yüze etkinlik
  'hybrid'             -- Hibrit
);

-- Notification Type
CREATE TYPE notification_type AS ENUM (
  'info',              -- Bilgilendirme
  'success',           -- Başarı
  'warning',           -- Uyarı
  'error',             -- Hata
  'task_assigned',     -- Görev atandı
  'task_completed',    -- Görev tamamlandı
  'event_reminder',    -- Etkinlik hatırlatması
  'deadline_approaching' -- Deadline yaklaşıyor
);

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

-- =====================================================
-- USER_PROGRAMS TABLE
-- =====================================================
-- Kullanıcı-Program ilişki tablosu (Many-to-Many)
-- Bir danışman birden fazla programa atanabilir

CREATE TABLE user_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Role in this program
  role_in_program user_role NOT NULL,
  
  -- Assignment
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, program_id),
  CONSTRAINT valid_role CHECK (role_in_program IN ('program_manager', 'consultant', 'observer'))
);

-- Indexes
CREATE INDEX idx_user_programs_user ON user_programs(user_id);
CREATE INDEX idx_user_programs_program ON user_programs(program_id);
CREATE INDEX idx_user_programs_role ON user_programs(role_in_program);
CREATE INDEX idx_user_programs_active ON user_programs(is_active);

-- Comments
COMMENT ON TABLE user_programs IS 'Kullanıcı-Program ilişki tablosu. Danışmanlar birden fazla programa atanabilir.';
COMMENT ON COLUMN user_programs.role_in_program IS 'Bu programdaki rolü (program_manager, consultant, observer)';
COMMENT ON COLUMN user_programs.is_active IS 'Atama aktif mi? (Pasif yapılabilir ama silinmez)';

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

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Otomatik güncelleme ve validation trigger'ları

-- =====================================================
-- Updated At Trigger Function
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_programs_updated_at BEFORE UPDATE ON user_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Company User Count Trigger
-- =====================================================
-- Firma kullanıcı sayısını otomatik günceller

CREATE OR REPLACE FUNCTION update_company_user_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.company_id IS NOT NULL THEN
    UPDATE companies 
    SET current_users = current_users + 1 
    WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' AND OLD.company_id IS NOT NULL THEN
    UPDATE companies 
    SET current_users = current_users - 1 
    WHERE id = OLD.company_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.company_id IS NOT NULL AND NEW.company_id IS NULL THEN
      -- User removed from company
      UPDATE companies 
      SET current_users = current_users - 1 
      WHERE id = OLD.company_id;
    ELSIF OLD.company_id IS NULL AND NEW.company_id IS NOT NULL THEN
      -- User added to company
      UPDATE companies 
      SET current_users = current_users + 1 
      WHERE id = NEW.company_id;
    ELSIF OLD.company_id IS NOT NULL AND NEW.company_id IS NOT NULL AND OLD.company_id != NEW.company_id THEN
      -- User moved to different company
      UPDATE companies 
      SET current_users = current_users - 1 
      WHERE id = OLD.company_id;
      
      UPDATE companies 
      SET current_users = current_users + 1 
      WHERE id = NEW.company_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_user_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_company_user_count();

-- =====================================================
-- Program Company Count Trigger
-- =====================================================
-- Program firma sayısını otomatik günceller

CREATE OR REPLACE FUNCTION update_program_company_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE programs 
    SET current_companies = current_companies + 1 
    WHERE id = NEW.program_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE programs 
    SET current_companies = current_companies - 1 
    WHERE id = OLD.program_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.program_id != NEW.program_id THEN
    UPDATE programs 
    SET current_companies = current_companies - 1 
    WHERE id = OLD.program_id;
    
    UPDATE programs 
    SET current_companies = current_companies + 1 
    WHERE id = NEW.program_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_program_company_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW 
  EXECUTE FUNCTION update_program_company_count();

-- =====================================================
-- Slug Generation Trigger
-- =====================================================
-- Otomatik slug oluşturur (name'den)

CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  slug_exists BOOLEAN;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Turkish character conversion
    NEW.slug = lower(NEW.name);
    NEW.slug = regexp_replace(NEW.slug, '[çÇ]', 'c', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[ğĞ]', 'g', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[ıİ]', 'i', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[öÖ]', 'o', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[şŞ]', 's', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[üÜ]', 'u', 'g');
    
    -- Remove special characters
    NEW.slug = regexp_replace(NEW.slug, '[^a-z0-9]+', '-', 'g');
    NEW.slug = regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
    
    -- Check uniqueness dynamically
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE slug = $1 AND id != COALESCE($2, ''00000000-0000-0000-0000-000000000000''::uuid))', TG_TABLE_NAME)
      INTO slug_exists
      USING NEW.slug, NEW.id;
    
    -- Add suffix if not unique
    IF slug_exists THEN
      NEW.slug = NEW.slug || '-' || substr(md5(random()::text), 1, 6);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_program_slug BEFORE INSERT OR UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION generate_slug();

CREATE TRIGGER generate_company_slug BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION generate_slug();

-- =====================================================
-- User Email Verification Trigger
-- =====================================================
-- Supabase auth ile senkronize eder

CREATE OR REPLACE FUNCTION sync_user_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE users 
    SET is_email_verified = true 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_email_verification_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION sync_user_email_verification();

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

