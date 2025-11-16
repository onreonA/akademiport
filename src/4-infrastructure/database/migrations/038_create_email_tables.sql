-- =====================================================
-- MIGRATION: 038_create_email_tables
-- Description: Email System tables (templates, queue, logs, preferences)
-- Created: 2025-01-XX
-- Sprint: 24 - Email Sistemi
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Email Type Enum
DO $$ BEGIN
  CREATE TYPE email_type AS ENUM (
    'transactional',
    'marketing',
    'notification'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Email Status Enum
DO $$ BEGIN
  CREATE TYPE email_status AS ENUM (
    'pending',
    'queued',
    'sending',
    'sent',
    'failed',
    'bounced',
    'spam_reported',
    'unsubscribed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Email Priority Enum
DO $$ BEGIN
  CREATE TYPE email_priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template bilgileri
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  subject VARCHAR(500) NOT NULL,
  
  -- Template içeriği
  html_content TEXT NOT NULL,
  text_content TEXT,
  mjml_content TEXT, -- MJML kaynak kodu
  
  -- Template ayarları
  email_type email_type NOT NULL DEFAULT 'transactional',
  variables JSONB DEFAULT '{}'::jsonb, -- Template değişkenleri ve açıklamaları
  
  -- Versiyonlama
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(email_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_templates_created_at ON email_templates(created_at DESC);

-- =====================================================
-- EMAIL QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Alıcı bilgileri
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  cc_emails TEXT[], -- Array of emails
  bcc_emails TEXT[], -- Array of emails
  
  -- Email içeriği
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  
  -- Template referansı
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  template_name VARCHAR(255), -- Template name for reference
  template_variables JSONB DEFAULT '{}'::jsonb, -- Variables for template rendering
  
  -- Gönderim ayarları
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  reply_to VARCHAR(255),
  priority email_priority DEFAULT 'normal',
  status email_status DEFAULT 'pending',
  
  -- Zamanlama
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Tracking
  sendgrid_message_id VARCHAR(255),
  tracking_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON email_queue(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email ON email_queue(to_email);
CREATE INDEX IF NOT EXISTS idx_email_queue_template_id ON email_queue(template_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);

-- =====================================================
-- EMAIL LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Queue referansı
  queue_id UUID REFERENCES email_queue(id) ON DELETE SET NULL,
  
  -- Alıcı bilgileri
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  
  -- Gönderim bilgileri
  from_email VARCHAR(255),
  sendgrid_message_id VARCHAR(255),
  status email_status NOT NULL,
  
  -- Tracking bilgileri
  opened_at TIMESTAMP WITH TIME ZONE,
  opened_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMP WITH TIME ZONE,
  clicked_count INTEGER DEFAULT 0,
  clicked_links TEXT[], -- Array of clicked URLs
  
  -- Bounce/Spam bilgileri
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  spam_reported_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Hata bilgileri
  error_message TEXT,
  error_code VARCHAR(100),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_queue_id ON email_logs(queue_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sendgrid_message_id ON email_logs(sendgrid_message_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_opened_at ON email_logs(opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_logs_clicked_at ON email_logs(clicked_at) WHERE clicked_at IS NOT NULL;

-- =====================================================
-- EMAIL PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Kullanıcı referansı
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Email tercihleri
  receive_transactional BOOLEAN DEFAULT true, -- Şifre sıfırlama, kayıt vb.
  receive_marketing BOOLEAN DEFAULT true, -- Pazarlama email'leri
  receive_notifications BOOLEAN DEFAULT true, -- Bildirim email'leri
  
  -- Spesifik tercihler
  receive_appointment_reminders BOOLEAN DEFAULT true,
  receive_event_reminders BOOLEAN DEFAULT true,
  receive_task_reminders BOOLEAN DEFAULT true,
  receive_forum_notifications BOOLEAN DEFAULT true,
  receive_report_notifications BOOLEAN DEFAULT true,
  
  -- Unsubscribe
  unsubscribe_token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: bir kullanıcı için tek kayıt
  CONSTRAINT unique_user_email_preferences UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribe_token ON email_preferences(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribed ON email_preferences(unsubscribed_at) WHERE unsubscribed_at IS NOT NULL;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Email Templates RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_templates_select_all" ON email_templates
  FOR SELECT
  USING (true); -- Herkes okuyabilir

CREATE POLICY "email_templates_insert_admin" ON email_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'program_manager')
    )
  );

CREATE POLICY "email_templates_update_admin" ON email_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'program_manager')
    )
  );

CREATE POLICY "email_templates_delete_admin" ON email_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Email Queue RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_queue_select_admin" ON email_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'program_manager')
    )
  );

CREATE POLICY "email_queue_insert_authenticated" ON email_queue
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Email Logs RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_logs_select_admin" ON email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'program_manager')
    )
  );

-- Email Preferences RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_preferences_select_own" ON email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "email_preferences_insert_own" ON email_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "email_preferences_update_own" ON email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_tables_updated_at();

CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_tables_updated_at();

CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_tables_updated_at();

CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_tables_updated_at();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Default email templates (örnek - gerçek içerikler sonra eklenecek)
DO $$
BEGIN
  -- Kullanıcı Kayıt Template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'user-welcome') THEN
    INSERT INTO email_templates (name, description, subject, html_content, text_content, email_type, variables, is_active)
    VALUES (
      'user-welcome',
      'Yeni kullanıcı kayıt hoş geldin email''i',
      'Akademi Port''a Hoş Geldiniz!',
      '<h1>Hoş Geldiniz!</h1><p>Merhaba {{user_name}},</p><p>Akademi Port platformuna kaydınız başarıyla tamamlandı.</p>',
      'Hoş Geldiniz! Merhaba {{user_name}}, Akademi Port platformuna kaydınız başarıyla tamamlandı.',
      'transactional',
      '{"user_name": "Kullanıcı adı", "activation_link": "Aktivasyon linki"}'::jsonb,
      true
    );
  END IF;

  -- Şifre Sıfırlama Template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'password-reset') THEN
    INSERT INTO email_templates (name, description, subject, html_content, text_content, email_type, variables, is_active)
    VALUES (
      'password-reset',
      'Şifre sıfırlama email''i',
      'Şifre Sıfırlama Talebi',
      '<h1>Şifre Sıfırlama</h1><p>Merhaba {{user_name}},</p><p>Şifre sıfırlama talebiniz alındı. Aşağıdaki linke tıklayarak şifrenizi sıfırlayabilirsiniz:</p><p><a href="{{reset_link}}">Şifre Sıfırla</a></p>',
      'Şifre Sıfırlama - Merhaba {{user_name}}, Şifre sıfırlama linki: {{reset_link}}',
      'transactional',
      '{"user_name": "Kullanıcı adı", "reset_link": "Şifre sıfırlama linki"}'::jsonb,
      true
    );
  END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE email_templates IS 'Email şablonları ve versiyonlama';
COMMENT ON TABLE email_queue IS 'Email gönderim kuyruğu';
COMMENT ON TABLE email_logs IS 'Email gönderim logları, tracking ve analitik';
COMMENT ON TABLE email_preferences IS 'Kullanıcı email tercihleri ve unsubscribe';

COMMENT ON COLUMN email_templates.mjml_content IS 'MJML kaynak kodu (opsiyonel)';
COMMENT ON COLUMN email_templates.variables IS 'Template değişkenleri ve açıklamaları';
COMMENT ON COLUMN email_queue.template_variables IS 'Template rendering için değişkenler';
COMMENT ON COLUMN email_queue.scheduled_at IS 'Zamanlanmış email gönderim zamanı';
COMMENT ON COLUMN email_logs.clicked_links IS 'Tıklanan linklerin listesi';
COMMENT ON COLUMN email_preferences.unsubscribe_token IS 'Unsubscribe için unique token';

