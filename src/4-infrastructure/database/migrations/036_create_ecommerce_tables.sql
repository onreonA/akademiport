-- =====================================================
-- MIGRATION: 036_create_ecommerce_tables
-- Description: E-commerce metrics and performance tracking system
-- Created: 2025-01-XX
-- Sprint: 15 - E-ticaret Metrikleri & Dashboard
-- =====================================================

-- =====================================================
-- ECOMMERCE METRICS TABLE (Aylık metrikler)
-- =====================================================
CREATE TABLE ecommerce_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,

  -- Dönem bilgisi
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),

  -- Platform tipi
  platform_type VARCHAR(50) NOT NULL CHECK (platform_type IN ('alibaba', 'amazon', 'etsy', 'trendyol', 'hepsiburada', 'n11', 'gitti-gidiyor', 'other')),

  -- Alibaba (B2B) Metrikleri
  alibaba_visitors INTEGER DEFAULT 0,
  alibaba_products INTEGER DEFAULT 0,
  alibaba_rfq_count INTEGER DEFAULT 0,
  alibaba_orders INTEGER DEFAULT 0,
  alibaba_revenue DECIMAL(15, 2) DEFAULT 0,

  -- B2C Platform Metrikleri (Amazon, Etsy, vb.)
  b2c_visitors INTEGER DEFAULT 0,
  b2c_products INTEGER DEFAULT 0,
  b2c_orders INTEGER DEFAULT 0,
  b2c_revenue DECIMAL(15, 2) DEFAULT 0,

  -- Genel Metrikler (Tüm platformlar için toplam)
  total_visitors INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,

  -- Ek bilgiler
  notes TEXT,
  metadata JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Bir firma için aynı dönem ve platform için tek kayıt
  UNIQUE(company_id, program_id, period_year, period_month, platform_type),

  -- Validasyonlar
  CONSTRAINT valid_year CHECK (period_year >= 2020 AND period_year <= 2100),
  CONSTRAINT valid_visitors CHECK (alibaba_visitors >= 0 AND b2c_visitors >= 0 AND total_visitors >= 0),
  CONSTRAINT valid_products CHECK (alibaba_products >= 0 AND b2c_products >= 0 AND total_products >= 0),
  CONSTRAINT valid_orders CHECK (alibaba_orders >= 0 AND b2c_orders >= 0 AND total_orders >= 0),
  CONSTRAINT valid_revenue CHECK (alibaba_revenue >= 0 AND b2c_revenue >= 0 AND total_revenue >= 0)
);

-- =====================================================
-- ECOMMERCE PERFORMANCE (Materialized View)
-- =====================================================
CREATE MATERIALIZED VIEW ecommerce_performance AS
SELECT
  c.id AS company_id,
  c.name AS company_name,
  c.program_id,
  p.name AS program_name,

  -- Toplam metrikler (tüm zamanlar)
  COALESCE(SUM(em.total_visitors), 0) AS total_visitors_all_time,
  COALESCE(SUM(em.total_products), 0) AS total_products_all_time,
  COALESCE(SUM(em.total_orders), 0) AS total_orders_all_time,
  COALESCE(SUM(em.total_revenue), 0) AS total_revenue_all_time,

  -- Son 3 ay metrikleri
  COALESCE(SUM(CASE 
    WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
    AND em.period_month >= EXTRACT(MONTH FROM CURRENT_DATE) - 2
    THEN em.total_visitors ELSE 0 
  END), 0) AS visitors_last_3_months,
  COALESCE(SUM(CASE 
    WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
    AND em.period_month >= EXTRACT(MONTH FROM CURRENT_DATE) - 2
    THEN em.total_orders ELSE 0 
  END), 0) AS orders_last_3_months,
  COALESCE(SUM(CASE 
    WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
    AND em.period_month >= EXTRACT(MONTH FROM CURRENT_DATE) - 2
    THEN em.total_revenue ELSE 0 
  END), 0) AS revenue_last_3_months,

  -- Son ay metrikleri
  COALESCE(SUM(CASE 
    WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
    AND em.period_month = EXTRACT(MONTH FROM CURRENT_DATE)
    THEN em.total_visitors ELSE 0 
  END), 0) AS visitors_last_month,
  COALESCE(SUM(CASE 
    WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
    AND em.period_month = EXTRACT(MONTH FROM CURRENT_DATE)
    THEN em.total_orders ELSE 0 
  END), 0) AS orders_last_month,
  COALESCE(SUM(CASE 
    WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
    AND em.period_month = EXTRACT(MONTH FROM CURRENT_DATE)
    THEN em.total_revenue ELSE 0 
  END), 0) AS revenue_last_month,

  -- Platform bazlı toplamlar
  COALESCE(SUM(CASE WHEN em.platform_type = 'alibaba' THEN em.alibaba_revenue ELSE 0 END), 0) AS alibaba_revenue_total,
  COALESCE(SUM(CASE WHEN em.platform_type IN ('amazon', 'etsy', 'trendyol', 'hepsiburada', 'n11', 'gitti-gidiyor', 'other') THEN em.b2c_revenue ELSE 0 END), 0) AS b2c_revenue_total,

  -- Ortalama metrikler
  CASE 
    WHEN COUNT(DISTINCT em.period_year || '-' || em.period_month) > 0 
    THEN COALESCE(SUM(em.total_revenue), 0) / COUNT(DISTINCT em.period_year || '-' || em.period_month)
    ELSE 0 
  END AS avg_monthly_revenue,

  -- Trend (son ay / önceki ay)
  CASE 
    WHEN COALESCE(SUM(CASE 
      WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
      AND em.period_month = EXTRACT(MONTH FROM CURRENT_DATE) - 1
      THEN em.total_revenue ELSE 0 
    END), 0) > 0
    THEN (
      COALESCE(SUM(CASE 
        WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
        AND em.period_month = EXTRACT(MONTH FROM CURRENT_DATE)
        THEN em.total_revenue ELSE 0 
      END), 0) - 
      COALESCE(SUM(CASE 
        WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
        AND em.period_month = EXTRACT(MONTH FROM CURRENT_DATE) - 1
        THEN em.total_revenue ELSE 0 
      END), 0)
    ) / COALESCE(SUM(CASE 
      WHEN em.period_year = EXTRACT(YEAR FROM CURRENT_DATE) 
      AND em.period_month = EXTRACT(MONTH FROM CURRENT_DATE) - 1
      THEN em.total_revenue ELSE 0 
    END), 1) * 100
    ELSE 0
  END AS revenue_growth_percentage,

  -- Son güncelleme
  MAX(em.updated_at) AS last_updated_at,
  MAX(em.period_year || '-' || LPAD(em.period_month::text, 2, '0')) AS last_period

FROM companies c
LEFT JOIN programs p ON c.program_id = p.id
LEFT JOIN ecommerce_metrics em ON c.id = em.company_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.program_id, p.name;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_ecommerce_performance_company ON ecommerce_performance(company_id);

-- =====================================================
-- INDEXES
-- =====================================================

-- Metrics indexes
CREATE INDEX idx_ecommerce_metrics_company ON ecommerce_metrics(company_id);
CREATE INDEX idx_ecommerce_metrics_program ON ecommerce_metrics(program_id);
CREATE INDEX idx_ecommerce_metrics_period ON ecommerce_metrics(period_year, period_month);
CREATE INDEX idx_ecommerce_metrics_platform ON ecommerce_metrics(platform_type);
CREATE INDEX idx_ecommerce_metrics_created ON ecommerce_metrics(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_ecommerce_metrics_company_period ON ecommerce_metrics(company_id, period_year DESC, period_month DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Refresh ecommerce performance view
CREATE OR REPLACE FUNCTION refresh_ecommerce_performance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ecommerce_performance;
END;
$$ LANGUAGE plpgsql;

-- Calculate total metrics automatically
CREATE OR REPLACE FUNCTION calculate_ecommerce_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate totals based on platform type
  IF NEW.platform_type = 'alibaba' THEN
    NEW.total_visitors := NEW.alibaba_visitors;
    NEW.total_products := NEW.alibaba_products;
    NEW.total_orders := NEW.alibaba_orders;
    NEW.total_revenue := NEW.alibaba_revenue;
  ELSE
    NEW.total_visitors := NEW.b2c_visitors;
    NEW.total_products := NEW.b2c_products;
    NEW.total_orders := NEW.b2c_orders;
    NEW.total_revenue := NEW.b2c_revenue;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate totals
CREATE TRIGGER trigger_calculate_ecommerce_totals
  BEFORE INSERT OR UPDATE ON ecommerce_metrics
  FOR EACH ROW
  EXECUTE FUNCTION calculate_ecommerce_totals();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ecommerce_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ecommerce_metrics_updated_at
  BEFORE UPDATE ON ecommerce_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_ecommerce_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE ecommerce_metrics ENABLE ROW LEVEL SECURITY;

-- Companies can view and manage their own metrics
CREATE POLICY "Companies can view their own metrics"
  ON ecommerce_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.id = ecommerce_metrics.company_id
    )
  );

CREATE POLICY "Companies can insert their own metrics"
  ON ecommerce_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.id = ecommerce_metrics.company_id
    )
  );

CREATE POLICY "Companies can update their own metrics"
  ON ecommerce_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.id = ecommerce_metrics.company_id
    )
  );

-- Admin and Consultant can view all metrics
CREATE POLICY "Admin and Consultant can view all metrics"
  ON ecommerce_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

-- Admin can manage all metrics
CREATE POLICY "Admin can manage all metrics"
  ON ecommerce_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- No seed data needed - companies will enter their own metrics

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE ecommerce_metrics IS 'Aylık e-ticaret metrikleri - Firmalar her ay verilerini girer';
COMMENT ON MATERIALIZED VIEW ecommerce_performance IS 'E-ticaret performans özeti - Tüm firmaların performans karşılaştırması için';
COMMENT ON COLUMN ecommerce_metrics.platform_type IS 'Platform tipi: alibaba (B2B) veya diğer B2C platformlar';
COMMENT ON COLUMN ecommerce_metrics.period_year IS 'Metrik yılı (örn: 2025)';
COMMENT ON COLUMN ecommerce_metrics.period_month IS 'Metrik ayı (1-12)';

