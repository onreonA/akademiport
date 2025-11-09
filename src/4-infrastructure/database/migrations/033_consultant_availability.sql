-- ============================================================================
-- CONSULTANT AVAILABILITY SYSTEM
-- ============================================================================
-- Bu migration danışman müsaitlik yönetimi sistemi için gerekli tabloları oluşturur.
-- Sprint 11.5: Müsaitlik Yönetimi
-- ============================================================================

-- 1) Consultant Availability - Haftalık çalışma saatleri ve tekrarlayan kurallar
CREATE TABLE IF NOT EXISTS consultant_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Haftalık çalışma saatleri (tekrarlayan)
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  start_time TIME NOT NULL, -- Örn: 09:00
  end_time TIME NOT NULL,   -- Örn: 17:00
  
  -- Tarih aralığı (opsiyonel - belirtilmezse süresiz geçerli)
  valid_from DATE,
  valid_until DATE,
  
  -- Program bazlı (opsiyonel - belirtilmezse tüm programlar için geçerli)
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Durum
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_time CHECK (end_time > start_time),
  CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
);

-- Indexes
CREATE INDEX idx_consultant_availability_consultant ON consultant_availability(consultant_id);
CREATE INDEX idx_consultant_availability_program ON consultant_availability(program_id);
CREATE INDEX idx_consultant_availability_day ON consultant_availability(day_of_week);
CREATE INDEX idx_consultant_availability_active ON consultant_availability(is_active);
CREATE INDEX idx_consultant_availability_dates ON consultant_availability(valid_from, valid_until);

-- Comments
COMMENT ON TABLE consultant_availability IS 'Danışmanların haftalık çalışma saatleri ve tekrarlayan müsaitlik kuralları';
COMMENT ON COLUMN consultant_availability.day_of_week IS 'Haftanın günü: 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi';
COMMENT ON COLUMN consultant_availability.start_time IS 'Başlangıç saati (örn: 09:00)';
COMMENT ON COLUMN consultant_availability.end_time IS 'Bitiş saati (örn: 17:00)';
COMMENT ON COLUMN consultant_availability.valid_from IS 'Kuralın geçerli olmaya başladığı tarih (NULL ise süresiz)';
COMMENT ON COLUMN consultant_availability.valid_until IS 'Kuralın geçerliliğinin bittiği tarih (NULL ise süresiz)';
COMMENT ON COLUMN consultant_availability.program_id IS 'Program bazlı müsaitlik için program ID (NULL ise tüm programlar için geçerli)';

-- 2) Consultant Unavailable Dates - Müsait olmadığı tarihler (tatil, eğitim, vb.)
CREATE TABLE IF NOT EXISTS consultant_unavailable_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tarih/Saat aralığı
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Sebep
  reason VARCHAR(255), -- "Tatil", "Kişisel", "Eğitim", "Toplantı", vb.
  notes TEXT,
  
  -- Program bazlı (opsiyonel)
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_consultant_unavailable_consultant ON consultant_unavailable_dates(consultant_id);
CREATE INDEX idx_consultant_unavailable_program ON consultant_unavailable_dates(program_id);
CREATE INDEX idx_consultant_unavailable_start ON consultant_unavailable_dates(start_time);
CREATE INDEX idx_consultant_unavailable_end ON consultant_unavailable_dates(end_time);
CREATE INDEX idx_consultant_unavailable_range ON consultant_unavailable_dates USING GIST (tstzrange(start_time, end_time));

-- Comments
COMMENT ON TABLE consultant_unavailable_dates IS 'Danışmanların müsait olmadığı tarih/saat aralıkları (tatil, eğitim, vb.)';
COMMENT ON COLUMN consultant_unavailable_dates.reason IS 'Müsait olmama sebebi (Tatil, Kişisel, Eğitim, vb.)';
COMMENT ON COLUMN consultant_unavailable_dates.notes IS 'Ek notlar';

-- 3) Updated_at trigger function (eğer yoksa)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_consultant_availability_updated_at
  BEFORE UPDATE ON consultant_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_unavailable_dates_updated_at
  BEFORE UPDATE ON consultant_unavailable_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4) RLS Policies
ALTER TABLE consultant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_unavailable_dates ENABLE ROW LEVEL SECURITY;

-- Consultant Availability Policies
-- Consultants can view their own availability
CREATE POLICY consultant_availability_select_own ON consultant_availability
  FOR SELECT
  USING (
    consultant_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant')
  );

-- Consultants can insert their own availability
CREATE POLICY consultant_availability_insert_own ON consultant_availability
  FOR INSERT
  WITH CHECK (
    consultant_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant')
  );

-- Consultants can update their own availability
CREATE POLICY consultant_availability_update_own ON consultant_availability
  FOR UPDATE
  USING (
    consultant_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant')
  );

-- Consultants can delete their own availability
CREATE POLICY consultant_availability_delete_own ON consultant_availability
  FOR DELETE
  USING (
    consultant_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant')
  );

-- Admins can view all availability
CREATE POLICY consultant_availability_select_admin ON consultant_availability
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('master_admin', 'program_manager')
    )
  );

-- Admins can manage all availability
CREATE POLICY consultant_availability_all_admin ON consultant_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('master_admin', 'program_manager')
    )
  );

-- Company users can view availability for consultants in their program
CREATE POLICY consultant_availability_select_company ON consultant_availability
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN companies c ON c.id = u.company_id
      WHERE u.id = auth.uid()
      AND u.role IN ('company_admin', 'company_user')
      AND (
        consultant_availability.program_id IS NULL OR
        consultant_availability.program_id = c.program_id
      )
    )
  );

-- Consultant Unavailable Dates Policies
-- Consultants can view their own unavailable dates
CREATE POLICY consultant_unavailable_select_own ON consultant_unavailable_dates
  FOR SELECT
  USING (
    consultant_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant')
  );

-- Consultants can insert their own unavailable dates
CREATE POLICY consultant_unavailable_insert_own ON consultant_unavailable_dates
  FOR INSERT
  WITH CHECK (
    consultant_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant')
  );

-- Consultants can update their own unavailable dates
CREATE POLICY consultant_unavailable_update_own ON consultant_unavailable_dates
  FOR UPDATE
  USING (
    consultant_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant')
  );

-- Consultants can delete their own unavailable dates
CREATE POLICY consultant_unavailable_delete_own ON consultant_unavailable_dates
  FOR DELETE
  USING (
    consultant_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'consultant')
  );

-- Admins can view all unavailable dates
CREATE POLICY consultant_unavailable_select_admin ON consultant_unavailable_dates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('master_admin', 'program_manager')
    )
  );

-- Admins can manage all unavailable dates
CREATE POLICY consultant_unavailable_all_admin ON consultant_unavailable_dates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('master_admin', 'program_manager')
    )
  );

-- Company users can view unavailable dates for consultants in their program
CREATE POLICY consultant_unavailable_select_company ON consultant_unavailable_dates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN companies c ON c.id = u.company_id
      WHERE u.id = auth.uid()
      AND u.role IN ('company_admin', 'company_user')
      AND (
        consultant_unavailable_dates.program_id IS NULL OR
        consultant_unavailable_dates.program_id = c.program_id
      )
    )
  );

