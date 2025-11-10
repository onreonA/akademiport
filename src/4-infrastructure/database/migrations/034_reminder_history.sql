-- ============================================================================
-- REMINDER HISTORY SYSTEM
-- ============================================================================
-- Bu migration hatırlatma geçmişi sistemi için gerekli tabloları oluşturur.
-- Sprint 10-11: Reminder Geçmişi
-- ============================================================================

-- 1) Event Reminders tablosu
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Hatırlatma bilgileri
  reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('24hours', '1hour')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_to_email VARCHAR(255) NOT NULL,
  
  -- Durum
  status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Bir kullanıcıya aynı etkinlik için aynı tip hatırlatma sadece bir kez gönderilir
  UNIQUE (event_id, user_id, reminder_type)
);

-- 2) Appointment Reminders tablosu
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Hatırlatma bilgileri
  reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('24hours', '1hour')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_to_email VARCHAR(255) NOT NULL,
  
  -- Durum
  status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Bir kullanıcıya aynı randevu için aynı tip hatırlatma sadece bir kez gönderilir
  UNIQUE (appointment_id, user_id, reminder_type)
);

-- 3) İndeksler - Event Reminders
CREATE INDEX IF NOT EXISTS idx_event_reminders_event_id ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_user_id ON event_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_sent_at ON event_reminders(sent_at);
CREATE INDEX IF NOT EXISTS idx_event_reminders_status ON event_reminders(status);
CREATE INDEX IF NOT EXISTS idx_event_reminders_type ON event_reminders(reminder_type);

-- 4) İndeksler - Appointment Reminders
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment_id ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_user_id ON appointment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_sent_at ON appointment_reminders(sent_at);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_status ON appointment_reminders(status);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_type ON appointment_reminders(reminder_type);

-- 5) Comments
COMMENT ON TABLE event_reminders IS 'Etkinlik hatırlatmaları geçmişi - Duplicate kontrolü için kullanılır';
COMMENT ON TABLE appointment_reminders IS 'Randevu hatırlatmaları geçmişi - Duplicate kontrolü için kullanılır';
COMMENT ON COLUMN event_reminders.reminder_type IS 'Hatırlatma tipi: 24hours (24 saat önce) veya 1hour (1 saat önce)';
COMMENT ON COLUMN appointment_reminders.reminder_type IS 'Hatırlatma tipi: 24hours (24 saat önce) veya 1hour (1 saat önce)';



