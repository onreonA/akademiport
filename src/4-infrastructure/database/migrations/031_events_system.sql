-- ============================================================================
-- EVENTS SYSTEM
-- ============================================================================
-- Bu migration etkinlik yönetimi sistemi için gerekli tabloları oluşturur.
-- Sprint 10: Etkinlik Yönetimi
-- ============================================================================

-- 1) Events tablosu
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Etkinlik bilgileri
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (category IN ('webinar', 'workshop', 'networking', 'announcement', 'other')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'ongoing', 'completed', 'cancelled')),
  
  -- Tarih/Saat bilgileri
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'Europe/Istanbul',
  
  -- Zoom entegrasyonu
  zoom_meeting_id VARCHAR(255),
  zoom_join_url TEXT,
  zoom_start_url TEXT,
  zoom_password VARCHAR(100),
  
  -- Katılım yönetimi
  attendance_required BOOLEAN DEFAULT true,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  
  -- Organizatör bilgileri
  organizer_name VARCHAR(255),
  organizer_email VARCHAR(255),
  
  -- Metadata
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Validasyonlar
  CONSTRAINT events_start_before_end CHECK (start_time < end_time),
  CONSTRAINT events_max_attendees_positive CHECK (max_attendees IS NULL OR max_attendees > 0),
  CONSTRAINT events_current_attendees_non_negative CHECK (current_attendees >= 0)
);

-- 2) Event Attendances tablosu
CREATE TABLE IF NOT EXISTS event_attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Katılım bilgileri
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Bir kullanıcı aynı etkinliğe sadece bir kez kayıt olabilir
  UNIQUE (event_id, user_id)
);

-- 3) İndeksler - Events
CREATE INDEX IF NOT EXISTS idx_events_program_id ON events(program_id);
CREATE INDEX IF NOT EXISTS idx_events_consultant_id ON events(consultant_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(start_time, end_time);

-- 4) İndeksler - Event Attendances
CREATE INDEX IF NOT EXISTS idx_event_attendances_event_id ON event_attendances(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendances_user_id ON event_attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendances_company_id ON event_attendances(company_id);
CREATE INDEX IF NOT EXISTS idx_event_attendances_registered_at ON event_attendances(registered_at);

-- 5) updated_at trigger fonksiyonu (eğer yoksa)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6) updated_at trigger'ları
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_attendances_updated_at ON event_attendances;
CREATE TRIGGER update_event_attendances_updated_at
  BEFORE UPDATE ON event_attendances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7) current_attendees otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET current_attendees = current_attendees + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET current_attendees = GREATEST(current_attendees - 1, 0)
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8) current_attendees trigger'ı
DROP TRIGGER IF EXISTS update_event_attendee_count_trigger ON event_attendances;
CREATE TRIGGER update_event_attendee_count_trigger
  AFTER INSERT OR DELETE ON event_attendances
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendee_count();

-- 9) Row Level Security aktif et
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendances ENABLE ROW LEVEL SECURITY;

-- 10) RLS Policies - Events

-- Master admin tüm etkinlikleri yönetebilir
DROP POLICY IF EXISTS "Master admin can manage all events" ON events;
CREATE POLICY "Master admin can manage all events"
  ON events
  FOR ALL
  USING (is_master_admin() AND deleted_at IS NULL)
  WITH CHECK (is_master_admin());

-- Program manager kendi programındaki etkinlikleri yönetebilir
DROP POLICY IF EXISTS "Program manager can manage own program events" ON events;
CREATE POLICY "Program manager can manage own program events"
  ON events
  FOR ALL
  USING (
    (is_master_admin() OR
     EXISTS (
       SELECT 1
       FROM programs p
       WHERE p.id = events.program_id
         AND p.program_manager_id = auth.uid()
     )) AND deleted_at IS NULL
  )
  WITH CHECK (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM programs p
      WHERE p.id = events.program_id
        AND p.program_manager_id = auth.uid()
    )
  );

-- Consultant kendi etkinliklerini yönetebilir
DROP POLICY IF EXISTS "Consultant can manage own events" ON events;
CREATE POLICY "Consultant can manage own events"
  ON events
  FOR ALL
  USING (
    (is_master_admin() OR
     (consultant_id = auth.uid() AND deleted_at IS NULL))
  )
  WITH CHECK (
    is_master_admin() OR consultant_id = auth.uid()
  );

-- Consultant kendi programlarındaki etkinlikleri görebilir
DROP POLICY IF EXISTS "Consultant can view own program events" ON events;
CREATE POLICY "Consultant can view own program events"
  ON events
  FOR SELECT
  USING (
    (is_master_admin() OR
     consultant_id = auth.uid() OR
     EXISTS (
       SELECT 1
       FROM user_programs up
       WHERE up.user_id = auth.uid()
         AND up.program_id = events.program_id
     )) AND deleted_at IS NULL
  );

-- Company users kendi programlarındaki etkinlikleri görebilir
DROP POLICY IF EXISTS "Company user can view own program events" ON events;
CREATE POLICY "Company user can view own program events"
  ON events
  FOR SELECT
  USING (
    (is_master_admin() OR
     EXISTS (
       SELECT 1
       FROM users u
       JOIN companies c ON c.id = u.company_id
       WHERE u.id = auth.uid()
         AND c.program_id = events.program_id
         AND events.is_public = true
     )) AND deleted_at IS NULL
  );

-- 11) RLS Policies - Event Attendances

-- Master admin tüm katılımları yönetebilir
DROP POLICY IF EXISTS "Master admin can manage all attendances" ON event_attendances;
CREATE POLICY "Master admin can manage all attendances"
  ON event_attendances
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Consultant kendi etkinliklerinin katılımlarını görebilir
DROP POLICY IF EXISTS "Consultant can view own event attendances" ON event_attendances;
CREATE POLICY "Consultant can view own event attendances"
  ON event_attendances
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM events e
      WHERE e.id = event_attendances.event_id
        AND e.consultant_id = auth.uid()
    )
  );

-- Company users kendi katılımlarını yönetebilir
DROP POLICY IF EXISTS "Company user can manage own attendances" ON event_attendances;
CREATE POLICY "Company user can manage own attendances"
  ON event_attendances
  FOR ALL
  USING (
    is_master_admin() OR
    user_id = auth.uid()
  )
  WITH CHECK (
    is_master_admin() OR
    user_id = auth.uid()
  );

-- Company users kendi firmalarının katılımlarını görebilir
DROP POLICY IF EXISTS "Company user can view own company attendances" ON event_attendances;
CREATE POLICY "Company user can view own company attendances"
  ON event_attendances
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
        AND u.company_id = event_attendances.company_id
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

