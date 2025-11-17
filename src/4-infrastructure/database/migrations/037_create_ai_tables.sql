-- =====================================================
-- MIGRATION: 037_create_ai_tables
-- Description: AI infrastructure tables for OpenAI and Claude integration
-- Created: 2025-11-15
-- Sprint: 17 - AI Altyapısı
-- =====================================================

-- =====================================================
-- AI PROVIDER ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE ai_provider_type AS ENUM ('openai', 'claude');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- AI USE CASE ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE ai_use_case_type AS ENUM (
    'task_description',
    'report_generation',
    'news_rewrite',
    'forum_moderation',
    'cv_analysis',
    'document_summary',
    'chatbot',
    'risk_analysis',
    'success_prediction',
    'trend_analysis',
    'content_generation',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- AI MODEL ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE ai_model_type AS ENUM (
    -- OpenAI Models
    'gpt-4',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    -- Claude Models
    'claude-opus',
    'claude-sonnet',
    'claude-haiku'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- AI PROMPTS TABLE (Prompt şablonları ve versiyonlama)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Prompt bilgileri
  name VARCHAR(255) NOT NULL,
  description TEXT,
  use_case ai_use_case_type NOT NULL,
  
  -- Prompt içeriği
  template TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb, -- Template değişkenleri
  
  -- Versiyonlama
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Provider ve model bilgisi
  provider ai_provider_type NOT NULL,
  model ai_model_type NOT NULL,
  
  -- Ayarlar
  temperature DECIMAL(3, 2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens > 0),
  top_p DECIMAL(3, 2) DEFAULT 1.0 CHECK (top_p >= 0 AND top_p <= 1),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_prompts_use_case ON ai_prompts(use_case);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_provider ON ai_prompts(provider);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active ON ai_prompts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_prompts_created_at ON ai_prompts(created_at DESC);

-- Partial unique index: aynı use case için aktif prompt tek olmalı
-- ON CONFLICT ile çalışabilmesi için deferrable olmayan unique index kullanıyoruz
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_prompts_unique_active_per_use_case 
  ON ai_prompts(use_case) 
  WHERE is_active = true;

-- =====================================================
-- AI USAGE LOGS TABLE (Kullanım logları ve token tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- İlişkiler
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  
  -- Provider ve model bilgisi
  provider ai_provider_type NOT NULL,
  model ai_model_type NOT NULL,
  use_case ai_use_case_type NOT NULL,
  
  -- Prompt bilgisi
  prompt_id UUID REFERENCES ai_prompts(id) ON DELETE SET NULL,
  prompt_version INTEGER,
  
  -- Request/Response bilgileri
  request_text TEXT,
  response_text TEXT,
  request_tokens INTEGER DEFAULT 0 CHECK (request_tokens >= 0),
  response_tokens INTEGER DEFAULT 0 CHECK (response_tokens >= 0),
  total_tokens INTEGER DEFAULT 0 CHECK (total_tokens >= 0),
  
  -- Maliyet bilgisi
  cost_usd DECIMAL(10, 6) DEFAULT 0 CHECK (cost_usd >= 0),
  
  -- Durum bilgisi
  status VARCHAR(50) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')),
  error_message TEXT,
  error_code VARCHAR(100),
  
  -- Timing bilgisi
  duration_ms INTEGER CHECK (duration_ms >= 0),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_company_id ON ai_usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_program_id ON ai_usage_logs(program_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON ai_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_use_case ON ai_usage_logs(use_case);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_status ON ai_usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_prompt_id ON ai_usage_logs(prompt_id);

-- Composite index for cost analysis
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_cost_analysis ON ai_usage_logs(provider, use_case, created_at DESC);

-- =====================================================
-- AI PROVIDER CONFIGS TABLE (Provider ayarları)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_provider_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Provider bilgisi
  provider ai_provider_type NOT NULL UNIQUE,
  
  -- Rate limiting ayarları
  rate_limit_per_minute INTEGER DEFAULT 60 CHECK (rate_limit_per_minute > 0),
  rate_limit_per_hour INTEGER DEFAULT 1000 CHECK (rate_limit_per_hour > 0),
  rate_limit_per_day INTEGER DEFAULT 10000 CHECK (rate_limit_per_day > 0),
  
  -- Timeout ayarları
  timeout_ms INTEGER DEFAULT 30000 CHECK (timeout_ms > 0),
  max_retries INTEGER DEFAULT 3 CHECK (max_retries >= 0),
  
  -- Default model
  default_model ai_model_type NOT NULL,
  
  -- Aktiflik durumu
  is_active BOOLEAN DEFAULT true,
  is_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_provider_configs_provider ON ai_provider_configs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_provider_configs_active ON ai_provider_configs(is_active) WHERE is_active = true;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at trigger for ai_prompts
CREATE OR REPLACE FUNCTION update_ai_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ai_prompts_updated_at ON ai_prompts;
CREATE TRIGGER trigger_update_ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_prompts_updated_at();

-- Updated_at trigger for ai_provider_configs
CREATE OR REPLACE FUNCTION update_ai_provider_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ai_provider_configs_updated_at ON ai_provider_configs;
CREATE TRIGGER trigger_update_ai_provider_configs_updated_at
  BEFORE UPDATE ON ai_provider_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_provider_configs_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;

-- ai_prompts policies
-- Herkes okuyabilir, sadece admin yazabilir
DROP POLICY IF EXISTS "ai_prompts_select" ON ai_prompts;
CREATE POLICY "ai_prompts_select" ON ai_prompts
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "ai_prompts_insert" ON ai_prompts;
CREATE POLICY "ai_prompts_insert" ON ai_prompts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'program_manager')
    )
  );

DROP POLICY IF EXISTS "ai_prompts_update" ON ai_prompts;
CREATE POLICY "ai_prompts_update" ON ai_prompts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'program_manager')
    )
  );

DROP POLICY IF EXISTS "ai_prompts_delete" ON ai_prompts;
CREATE POLICY "ai_prompts_delete" ON ai_prompts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- ai_usage_logs policies
-- Herkes kendi loglarını görebilir, admin tümünü görebilir
DROP POLICY IF EXISTS "ai_usage_logs_select_own" ON ai_usage_logs;
CREATE POLICY "ai_usage_logs_select_own" ON ai_usage_logs
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'program_manager')
    )
  );

DROP POLICY IF EXISTS "ai_usage_logs_insert" ON ai_usage_logs;
CREATE POLICY "ai_usage_logs_insert" ON ai_usage_logs
  FOR INSERT
  WITH CHECK (true); -- System can insert logs

DROP POLICY IF EXISTS "ai_usage_logs_delete" ON ai_usage_logs;
CREATE POLICY "ai_usage_logs_delete" ON ai_usage_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- ai_provider_configs policies
-- Herkes okuyabilir, sadece admin yazabilir
DROP POLICY IF EXISTS "ai_provider_configs_select" ON ai_provider_configs;
CREATE POLICY "ai_provider_configs_select" ON ai_provider_configs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "ai_provider_configs_insert" ON ai_provider_configs;
CREATE POLICY "ai_provider_configs_insert" ON ai_provider_configs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

DROP POLICY IF EXISTS "ai_provider_configs_update" ON ai_provider_configs;
CREATE POLICY "ai_provider_configs_update" ON ai_provider_configs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- =====================================================
-- SEED DATA
-- =====================================================

-- Default provider configs
INSERT INTO ai_provider_configs (provider, rate_limit_per_minute, rate_limit_per_hour, rate_limit_per_day, timeout_ms, max_retries, default_model)
VALUES
  ('openai', 60, 1000, 10000, 30000, 3, 'gpt-4'),
  ('claude', 50, 800, 8000, 60000, 3, 'claude-sonnet')
ON CONFLICT (provider) DO NOTHING;

-- Default prompts (örnek)
-- Not: Partial unique index kullandığımız için ON CONFLICT kullanamıyoruz
-- Bu yüzden önce kontrol edip sonra insert yapıyoruz
DO $$
BEGIN
  -- Sadece eğer aktif prompt yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM ai_prompts 
    WHERE use_case = 'task_description' AND is_active = true
  ) THEN
    INSERT INTO ai_prompts (name, description, use_case, template, provider, model, version, is_active, temperature, max_tokens, top_p)
    VALUES (
      'Görev Açıklaması Üretimi',
      'Görev başlığından detaylı açıklama ve adımlar üretir',
      'task_description',
      'Aşağıdaki görev başlığı için detaylı bir açıklama ve adım adım plan oluştur:\n\nGörev: {{task_title}}\nProgram: {{program_name}}\nFirma: {{company_name}}\nProje: {{project_name}}\nAlt Proje: {{sub_project_name}}\n\nLütfen şu formatta JSON yanıt ver:\n{\n  "description": "Görevin detaylı açıklaması",\n  "subTasks": [\n    {\n      "title": "Alt görev başlığı",\n      "description": "Alt görev açıklaması"\n    }\n  ],\n  "keyPoints": ["Anahtar nokta 1", "Anahtar nokta 2", ...],\n  "estimatedDuration": "Tahmini süre (opsiyonel)"\n}',
      'openai',
      'gpt-4',
      1,
      true,
      0.7,
      2000,
      1.0
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM ai_prompts 
    WHERE use_case = 'report_generation' AND is_active = true
  ) THEN
    INSERT INTO ai_prompts (name, description, use_case, template, provider, model, version, is_active, temperature, max_tokens, top_p)
    VALUES (
      'Rapor Üretimi',
      'Firma ilerleme raporu için AI analizi',
      'report_generation',
      'Aşağıdaki firma verilerine göre detaylı bir ilerleme raporu oluştur:\n\nFirma: {{company_name}}\nProgram: {{program_name}}\nDönem: {{period}}\n\nVeriler:\n{{data}}\n\nLütfen şunları içeren bir rapor oluştur:\n1. Özet\n2. Güçlü yönler\n3. Zayıf yönler\n4. Öneriler\n5. Risk skoru (0-100)\n6. Başarı olasılığı (0-100)',
      'claude',
      'claude-opus',
      1,
      true,
      0.7,
      4000,
      1.0
    );
  END IF;

  -- Document Summary (Training Summary)
  IF NOT EXISTS (
    SELECT 1 FROM ai_prompts 
    WHERE use_case = 'document_summary' AND is_active = true
  ) THEN
    INSERT INTO ai_prompts (name, description, use_case, template, provider, model, version, is_active, temperature, max_tokens, top_p)
    VALUES (
      'Eğitim Özeti',
      'Eğitim içeriğinden özet ve anahtar kelimeler çıkarır',
      'document_summary',
      'Aşağıdaki eğitim içeriğini analiz edip detaylı bir özet oluştur:\n\nEğitim Adı: {{training_name}}\nEğitim Açıklaması: {{training_description}}\n\nİçerik:\n{{content_context}}\n\nVideo Sayısı: {{video_count}}\nDöküman Sayısı: {{document_count}}\n\nLütfen şu formatta JSON yanıt ver:\n{\n  "summary": "Eğitimin kapsamlı özeti",\n  "keyPoints": ["Anahtar nokta 1", "Anahtar nokta 2", ...],\n  "learningOutcomes": ["Öğrenme çıktısı 1", "Öğrenme çıktısı 2", ...],\n  "prerequisites": ["Ön koşul 1", "Ön koşul 2", ...],\n  "estimatedDuration": "Tahmini süre",\n  "difficulty": "beginner|intermediate|advanced"\n}',
      'claude',
      'claude-haiku',
      1,
      true,
      0.5,
      2000,
      1.0
    );
  END IF;

  -- Risk Analysis
  IF NOT EXISTS (
    SELECT 1 FROM ai_prompts 
    WHERE use_case = 'risk_analysis' AND is_active = true
  ) THEN
    INSERT INTO ai_prompts (name, description, use_case, template, provider, model, version, is_active, temperature, max_tokens, top_p)
    VALUES (
      'Firma Risk Analizi',
      'Firma verilerine göre risk analizi yapar',
      'risk_analysis',
      'Aşağıdaki firma verilerini analiz edip risk analizi yap:\n\nFirma: {{company_name}}\nE-posta: {{company_email}}\n\nProje Verileri:\n{{project_data}}\n\nEğitim Verileri:\n{{training_data}}\n\nEtkinlik Verileri:\n{{event_data}}\n\nGenel İstatistikler:\n{{overall_stats}}\n\nLütfen şu formatta JSON yanıt ver:\n{\n  "riskScore": 0-100 arası risk skoru,\n  "riskLevel": "low|medium|high|critical",\n  "analysis": "Detaylı analiz metni",\n  "factors": [\n    {\n      "name": "Faktör adı",\n      "impact": "positive|negative|neutral",\n      "description": "Açıklama",\n      "score": 0-100 arası skor\n    }\n  ],\n  "recommendations": ["Öneri 1", "Öneri 2", ...]\n}',
      'claude',
      'claude-opus',
      1,
      true,
      0.6,
      3000,
      1.0
    );
  END IF;

  -- Success Prediction
  IF NOT EXISTS (
    SELECT 1 FROM ai_prompts 
    WHERE use_case = 'success_prediction' AND is_active = true
  ) THEN
    INSERT INTO ai_prompts (name, description, use_case, template, provider, model, version, is_active, temperature, max_tokens, top_p)
    VALUES (
      'Başarı Tahmini',
      'Firma verilerine göre başarı olasılığı tahmin eder',
      'success_prediction',
      'Aşağıdaki firma verilerini analiz edip başarı tahmini yap:\n\nFirma: {{company_name}}\nE-posta: {{company_email}}\n\nProje Verileri:\n{{project_data}}\n\nEğitim Verileri:\n{{training_data}}\n\nEtkinlik Verileri:\n{{event_data}}\n\nGenel İstatistikler:\n{{overall_stats}}\n\nLütfen şu formatta JSON yanıt ver:\n{\n  "successProbability": 0-100 arası başarı olasılığı,\n  "successLevel": "low|medium|high|very_high",\n  "prediction": "Tahmin metni",\n  "factors": [\n    {\n      "name": "Faktör adı",\n      "impact": "positive|negative|neutral",\n      "description": "Açıklama",\n      "weight": 0-1 arası ağırlık\n    }\n  ],\n  "recommendations": ["Öneri 1", "Öneri 2", ...],\n  "historicalComparison": {\n    "averageSuccessRate": 0-100,\n    "percentile": 0-100\n  }\n}',
      'claude',
      'claude-opus',
      1,
      true,
      0.6,
      3000,
      1.0
    );
  END IF;

  -- Trend Analysis
  IF NOT EXISTS (
    SELECT 1 FROM ai_prompts 
    WHERE use_case = 'trend_analysis' AND is_active = true
  ) THEN
    INSERT INTO ai_prompts (name, description, use_case, template, provider, model, version, is_active, temperature, max_tokens, top_p)
    VALUES (
      'Trend Analizi',
      'Firma performans trendlerini analiz eder',
      'trend_analysis',
      'Aşağıdaki firma trend verilerini analiz edip trend analizi yap:\n\nFirma: {{company_name}}\nDönem: {{period}}\n\nTrend Verileri:\n{{trend_data}}\n\nLütfen şu formatta JSON yanıt ver:\n{\n  "trends": [\n    {\n      "category": "Kategori adı (örn: Proje İlerlemesi)",\n      "trend": "increasing|decreasing|stable",\n      "description": "Trend açıklaması",\n      "changePercentage": Değişim yüzdesi,\n      "dataPoints": [\n        {"date": "YYYY-MM-DD", "value": sayısal değer}\n      ]\n    }\n  ],\n  "insights": ["İçgörü 1", "İçgörü 2", ...],\n  "predictions": [\n    {\n      "metric": "Metrik adı",\n      "predictedValue": Tahmin edilen değer,\n      "confidence": 0-100 arası güven,\n      "timeframe": "Zaman çerçevesi"\n    }\n  ],\n  "recommendations": ["Öneri 1", "Öneri 2", ...]\n}',
      'claude',
      'claude-sonnet',
      1,
      true,
      0.5,
      3000,
      1.0
    );
  END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE ai_prompts IS 'AI prompt şablonları ve versiyonlama';
COMMENT ON TABLE ai_usage_logs IS 'AI kullanım logları, token tracking ve maliyet takibi';
COMMENT ON TABLE ai_provider_configs IS 'AI provider ayarları ve rate limiting';

COMMENT ON COLUMN ai_prompts.template IS 'Prompt şablonu, {{variable}} formatında değişkenler içerebilir';
COMMENT ON COLUMN ai_prompts.variables IS 'Template değişkenlerinin açıklamaları ve varsayılan değerleri';
COMMENT ON COLUMN ai_usage_logs.cost_usd IS 'USD cinsinden maliyet';
COMMENT ON COLUMN ai_usage_logs.duration_ms IS 'Request süresi (milisaniye)';

