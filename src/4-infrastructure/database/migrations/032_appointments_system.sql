-- ============================================================================
-- APPOINTMENTS SYSTEM
-- ============================================================================
-- Bu migration randevu yönetimi sistemi için gerekli tabloları oluşturur.
-- Sprint 11: Randevu Yönetimi
-- ============================================================================

-- 1) Appointment Status Enum
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'pending',      -- Beklemede (Company tarafından talep edildi, Consultant onayı bekleniyor)
    'approved',     -- Onaylandı (Consultant onayladı, Zoom meeting oluşturuldu)
    'rejected',     -- Reddedildi (Consultant reddetti)
    'completed',    -- Tamamlandı (Randevu gerçekleşti)
    'cancelled'     -- İptal edildi (Reschedule veya manuel iptal)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Appointments tablosu
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL, -- Optional: Program bazlı randevular için
  
  -- Randevu bilgileri
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status appointment_status NOT NULL DEFAULT 'pending',
  
  -- Tarih/Saat bilgileri
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'Europe/Istanbul',
  
  -- Talep bilgileri
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Company user ID
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Onay bilgileri
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Consultant ID
  
  -- Red bilgileri
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Consultant ID
  rejection_reason TEXT,
  
  -- Revize (Reschedule) bilgileri
  rescheduled_from UUID REFERENCES appointments(id) ON DELETE SET NULL, -- Eski appointment ID (reschedule chain)
  rescheduled_at TIMESTAMP WITH TIME ZONE,
  rescheduled_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Consultant veya Company user ID
  
  -- Zoom entegrasyonu
  zoom_meeting_id VARCHAR(255),
  zoom_join_url TEXT,
  zoom_start_url TEXT,
  zoom_password VARCHAR(100),
  
  -- Notlar
  notes TEXT, -- Consultant notları
  company_notes TEXT, -- Company notları
  
  -- Katılım takibi
  attended_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Validasyonlar
  CONSTRAINT appointments_start_before_end CHECK (start_time < end_time),
  CONSTRAINT appointments_min_duration CHECK ((end_time - start_time) >= INTERVAL '15 minutes')
);

-- 3) İndeksler
CREATE INDEX IF NOT EXISTS idx_appointments_consultant_id ON appointments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_program_id ON appointments(program_id) WHERE program_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_end_time ON appointments(end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_consultant_date ON appointments(consultant_id, start_time); -- Conflict detection için
CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_from ON appointments(rescheduled_from) WHERE rescheduled_from IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_requested_by ON appointments(requested_by);
CREATE INDEX IF NOT EXISTS idx_appointments_approved_by ON appointments(approved_by) WHERE approved_by IS NOT NULL;

-- 4) updated_at trigger'ı
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5) Row Level Security aktif et
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 6) RLS Policies - Appointments

-- Master admin tüm randevuları yönetebilir
DROP POLICY IF EXISTS "Master admin can manage all appointments" ON appointments;
CREATE POLICY "Master admin can manage all appointments"
  ON appointments
  FOR ALL
  USING (is_master_admin() AND deleted_at IS NULL)
  WITH CHECK (is_master_admin());

-- Program manager kendi programındaki randevuları görebilir
DROP POLICY IF EXISTS "Program manager can view program appointments" ON appointments;
CREATE POLICY "Program manager can view program appointments"
  ON appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'program_manager'
      AND appointments.program_id IN (
        SELECT id FROM programs WHERE program_manager_id = users.id
      )
      AND deleted_at IS NULL
    )
  );

-- Consultant kendi randevularını yönetebilir
DROP POLICY IF EXISTS "Consultants can manage own appointments" ON appointments;
CREATE POLICY "Consultants can manage own appointments"
  ON appointments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'consultant'
      AND appointments.consultant_id = users.id
      AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'consultant'
      AND consultant_id = users.id
    )
  );

-- Company admin ve user kendi firmalarının randevularını görebilir ve oluşturabilir
DROP POLICY IF EXISTS "Company users can manage own company appointments" ON appointments;
CREATE POLICY "Company users can manage own company appointments"
  ON appointments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('company_admin', 'company_user')
      AND users.company_id = appointments.company_id
      AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('company_admin', 'company_user')
      AND company_id = users.company_id
      AND requested_by = users.id
    )
  );

-- 7) Fonksiyon: Consultant'ın belirtilen tarih aralığında çakışan randevusu var mı?
CREATE OR REPLACE FUNCTION has_conflicting_appointment(
  p_consultant_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM appointments
    WHERE consultant_id = p_consultant_id
      AND status IN ('pending', 'approved')
      AND deleted_at IS NULL
      AND (
        (start_time <= p_start_time AND end_time > p_start_time)
        OR (start_time < p_end_time AND end_time >= p_end_time)
        OR (start_time >= p_start_time AND end_time <= p_end_time)
      )
      AND (p_exclude_id IS NULL OR id != p_exclude_id)
  );
END;
$$ LANGUAGE plpgsql;

-- 8) Constraint: Çakışan randevu kontrolü (opsiyonel, performans için trigger kullanılabilir)
-- Not: Bu constraint çok katı olabilir, conflict detection use case'de yapılacak

-- 9) View: Aktif randevular (pending + approved)
CREATE OR REPLACE VIEW active_appointments AS
SELECT *
FROM appointments
WHERE status IN ('pending', 'approved')
  AND deleted_at IS NULL;

-- 10) View: Yaklaşan randevular (24 saat içinde)
CREATE OR REPLACE VIEW upcoming_appointments AS
SELECT *
FROM appointments
WHERE status = 'approved'
  AND start_time BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
  AND deleted_at IS NULL;

-- 11) Comment'ler
COMMENT ON TABLE appointments IS 'Consultant-Company birebir randevular';
COMMENT ON COLUMN appointments.status IS 'Randevu durumu: pending (beklemede), approved (onaylandı), rejected (reddedildi), completed (tamamlandı), cancelled (iptal edildi)';
COMMENT ON COLUMN appointments.rescheduled_from IS 'Eğer bu randevu başka bir randevudan revize edildiyse, o randevunun ID''si';
COMMENT ON COLUMN appointments.notes IS 'Consultant notları (sadece consultant görebilir)';
COMMENT ON COLUMN appointments.company_notes IS 'Company notları (company ve consultant görebilir)';
COMMENT ON FUNCTION has_conflicting_appointment IS 'Consultant''ın belirtilen tarih aralığında çakışan randevusu var mı kontrol eder';

