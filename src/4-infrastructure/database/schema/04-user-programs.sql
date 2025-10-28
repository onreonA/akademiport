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

