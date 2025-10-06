-- Firma Detay Verileri Tabloları
-- Bu tablolar firma detay sayfasındaki tüm tab'ların verilerini saklar

-- Genel Bilgiler Tab'ı
CREATE TABLE IF NOT EXISTS company_general_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  authorized_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  sector VARCHAR(255),
  city VARCHAR(255),
  address TEXT,
  website VARCHAR(255),
  founded_year VARCHAR(10),
  employee_count VARCHAR(50),
  tax_number VARCHAR(50),
  legal_structure VARCHAR(255),
  capital VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mevcut & Hedef Pazarlar Tab'ı
CREATE TABLE IF NOT EXISTS company_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  current_markets TEXT[], -- Array of strings
  target_markets TEXT[],
  export_experience TEXT,
  export_countries TEXT[],
  market_research TEXT,
  competitor_analysis TEXT,
  market_entry TEXT[], -- Array of strings
  distribution_channels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ürün Bilgileri Tab'ı
CREATE TABLE IF NOT EXISTS company_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  main_products TEXT,
  product_categories TEXT[],
  production_capacity VARCHAR(255),
  quality_certificates TEXT[],
  product_catalog TEXT,
  price_strategy VARCHAR(255),
  seasonality TEXT,
  customization VARCHAR(50),
  dropshipping VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rakip ve Referans Firma Algısı Tab'ı
CREATE TABLE IF NOT EXISTS company_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  reference_companies TEXT[],
  direct_competitors TEXT[],
  target_position VARCHAR(255),
  competitive_advantages TEXT,
  price_competition VARCHAR(50),
  quality_competition VARCHAR(50),
  market_share_target TEXT,
  competitive_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Üretim ve Lojistik Altyapı Tab'ı
CREATE TABLE IF NOT EXISTS company_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  production_facilities TEXT,
  production_capacity VARCHAR(255),
  quality_control TEXT,
  certifications TEXT[],
  supply_chain TEXT,
  logistics TEXT,
  warehousing VARCHAR(255),
  delivery_time VARCHAR(100),
  production_technologies TEXT,
  environmental_friendly VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E-Ticaret ve Dijital Varlıklar Tab'ı
CREATE TABLE IF NOT EXISTS company_digital (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  current_platforms TEXT[],
  website_status VARCHAR(100),
  ecommerce_experience TEXT,
  digital_marketing TEXT[],
  social_media TEXT[],
  online_payment TEXT[],
  digital_tools TEXT[],
  tech_support VARCHAR(100),
  digital_transformation_goals TEXT,
  digital_marketing_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Satış & Müşteri Yönetimi Tab'ı
CREATE TABLE IF NOT EXISTS company_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  sales_channels TEXT[],
  customer_segments TEXT,
  customer_retention VARCHAR(100),
  sales_process TEXT,
  crm VARCHAR(100),
  customer_service TEXT,
  sales_team VARCHAR(100),
  sales_targets TEXT,
  sales_performance_tracking VARCHAR(100),
  customer_satisfaction_measurement VARCHAR(100),
  sales_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İçerik ve Marka Sunumu Tab'ı
CREATE TABLE IF NOT EXISTS company_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  brand_identity TEXT,
  content_strategy TEXT,
  visual_identity VARCHAR(100),
  marketing_materials TEXT[],
  language_support TEXT[],
  brand_positioning VARCHAR(255),
  communication_channels TEXT[],
  content_calendar VARCHAR(100),
  content_quality VARCHAR(50),
  target_audience_analysis TEXT,
  brand_story TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DYS ve Birlik Bilgileri Tab'ı
CREATE TABLE IF NOT EXISTS company_certification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  quality_management VARCHAR(100),
  environmental_cert VARCHAR(100),
  occupational_safety VARCHAR(100),
  industry_associations TEXT[],
  chambers TEXT[],
  export_unions TEXT[],
  government_support TEXT[],
  consulting_services TEXT[],
  other_certifications TEXT,
  certification_renewal_dates TEXT,
  certification_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İşlem Geçmişi Tab'ı
CREATE TABLE IF NOT EXISTS company_activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'create', 'update', 'delete', 'note'
  title VARCHAR(255),
  description TEXT,
  details TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_general_info_company_id ON company_general_info(company_id);
CREATE INDEX IF NOT EXISTS idx_company_markets_company_id ON company_markets(company_id);
CREATE INDEX IF NOT EXISTS idx_company_products_company_id ON company_products(company_id);
CREATE INDEX IF NOT EXISTS idx_company_competitors_company_id ON company_competitors(company_id);
CREATE INDEX IF NOT EXISTS idx_company_production_company_id ON company_production(company_id);
CREATE INDEX IF NOT EXISTS idx_company_digital_company_id ON company_digital(company_id);
CREATE INDEX IF NOT EXISTS idx_company_sales_company_id ON company_sales(company_id);
CREATE INDEX IF NOT EXISTS idx_company_content_company_id ON company_content(company_id);
CREATE INDEX IF NOT EXISTS idx_company_certification_company_id ON company_certification(company_id);
CREATE INDEX IF NOT EXISTS idx_company_activity_history_company_id ON company_activity_history(company_id);
CREATE INDEX IF NOT EXISTS idx_company_activity_history_created_at ON company_activity_history(created_at DESC);

-- V1.7: Şifre Yönetimi Sistemi
-- Companies tablosuna password alanı ekleme
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Şifre sıfırlama token'ları için tablo
CREATE TABLE IF NOT EXISTS company_password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for password reset tokens
CREATE INDEX IF NOT EXISTS idx_company_password_reset_tokens_company_id ON company_password_reset_tokens(company_id);
CREATE INDEX IF NOT EXISTS idx_company_password_reset_tokens_token ON company_password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_company_password_reset_tokens_expires_at ON company_password_reset_tokens(expires_at);

-- Şifre geçmişi için tablo (opsiyonel güvenlik)
CREATE TABLE IF NOT EXISTS company_password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for password history
CREATE INDEX IF NOT EXISTS idx_company_password_history_company_id ON company_password_history(company_id);
CREATE INDEX IF NOT EXISTS idx_company_password_history_created_at ON company_password_history(created_at);

-- V2.0: Test Firma Kullanıcısı Oluşturma
-- Test firma için kullanıcı oluştur
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'firma@test.com',
    crypt('Firma123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Test firma kullanıcısını users tablosuna ekle
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    au.email,
    'Test Firma Kullanıcısı',
    'user',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'firma@test.com'
ON CONFLICT (email) DO NOTHING;

-- V2.0: Mevcut Test Firması için Kullanıcı Oluşturma
-- "1. firma test-55" firması için kullanıcı oluştur
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'test@firma.com',
    crypt('Test123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Test firma kullanıcısını users tablosuna ekle
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    au.email,
    'Test Firma Kullanıcısı',
    'user',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'test@firma.com'
ON CONFLICT (email) DO NOTHING;

-- V2.0: Basit Test Kullanıcısı Oluşturma
-- Daha basit bir test kullanıcısı oluştur
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    'firma@test.com',
    crypt('Firma123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Basit test kullanıcısını users tablosuna ekle
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    au.email,
    'Test Firma Kullanıcısı',
    'user',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'firma@test.com'
ON CONFLICT (email) DO NOTHING;

-- V2.0: Companies Tablosuna Email Alanı Ekleme
-- Companies tablosuna email alanı ekle
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Mevcut firmalara varsayılan email değeri ata
UPDATE companies SET email = 'Belirtilmemiş' WHERE email IS NULL;

-- Email alanını nullable yapma (opsiyonel)
-- ALTER TABLE companies ALTER COLUMN email DROP NOT NULL;
