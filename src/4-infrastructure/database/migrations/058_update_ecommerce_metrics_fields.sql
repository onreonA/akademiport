-- =====================================================
-- MIGRATION: 058_update_ecommerce_metrics_fields
-- Description: Add new fields to ecommerce_metrics table and update platform types
-- Created: 2025-12-15
-- =====================================================

-- =====================================================
-- ADD NEW COLUMNS TO ECOMMERCE_METRICS TABLE
-- =====================================================

-- Add new Alibaba-specific metric fields
ALTER TABLE ecommerce_metrics
ADD COLUMN IF NOT EXISTS alibaba_visitor_sector_avg INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS alibaba_message_sector_avg INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS alibaba_serious_buyer_count INTEGER DEFAULT 0;

-- Add constraints for new fields
ALTER TABLE ecommerce_metrics
ADD CONSTRAINT valid_visitor_sector_avg CHECK (alibaba_visitor_sector_avg >= 0),
ADD CONSTRAINT valid_message_sector_avg CHECK (alibaba_message_sector_avg >= 0),
ADD CONSTRAINT valid_serious_buyer_count CHECK (alibaba_serious_buyer_count >= 0);

-- =====================================================
-- UPDATE PLATFORM TYPE CHECK CONSTRAINT
-- =====================================================

-- Drop old constraint
ALTER TABLE ecommerce_metrics
DROP CONSTRAINT IF EXISTS ecommerce_metrics_platform_type_check;

-- Add new constraint with updated platform types (removed hepsiburada, n11, gitti-gidiyor, added ozon)
ALTER TABLE ecommerce_metrics
ADD CONSTRAINT ecommerce_metrics_platform_type_check 
CHECK (platform_type IN ('alibaba', 'amazon', 'etsy', 'trendyol', 'ozon', 'other'));

-- =====================================================
-- UPDATE MATERIALIZED VIEW
-- =====================================================

-- Drop and recreate the materialized view to include new platform types
DROP MATERIALIZED VIEW IF EXISTS ecommerce_performance;

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

  -- Platform bazlı toplamlar (updated platform types)
  COALESCE(SUM(CASE WHEN em.platform_type = 'alibaba' THEN em.alibaba_revenue ELSE 0 END), 0) AS alibaba_revenue_total,
  COALESCE(SUM(CASE WHEN em.platform_type IN ('amazon', 'etsy', 'trendyol', 'ozon', 'other') THEN em.b2c_revenue ELSE 0 END), 0) AS b2c_revenue_total,

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

-- Recreate unique index
CREATE UNIQUE INDEX idx_ecommerce_performance_company ON ecommerce_performance(company_id);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN ecommerce_metrics.alibaba_visitor_sector_avg IS 'Sektör ortalaması ziyaretçi sayısı - Firmaların kendi ziyaretçi sayısını sektör ortalaması ile karşılaştırması için';
COMMENT ON COLUMN ecommerce_metrics.alibaba_message_sector_avg IS 'Mesaj sektör ortalaması - Alibaba platformunda mesaj sayısının sektör ortalaması';
COMMENT ON COLUMN ecommerce_metrics.alibaba_serious_buyer_count IS 'Ciddi alıcı sayısı (L3-L4) - Alibaba platformunda ciddi alıcı sayısı';
