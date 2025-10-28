-- =====================================================
-- SEED: Sample Data
-- =====================================================
-- Test için örnek veriler

-- =====================================================
-- Sample Program
-- =====================================================
INSERT INTO programs (
  id,
  name,
  description,
  slug,
  city,
  region,
  program_type,
  start_date,
  end_date,
  duration_months,
  max_companies,
  status,
  sponsor
) VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  'Kayseri E-İhracat Dönüşüm Programı 2025',
  'Kayseri''deki firmaların e-ihracat kapasitesini artırmak için 12 aylık kapsamlı danışmanlık ve eğitim programı.',
  'kayseri-e-ihracat-2025',
  'Kayseri',
  'İç Anadolu',
  'E-İhracat',
  '2025-01-01',
  '2025-12-31',
  12,
  20,
  'active',
  'Ticaret Bakanlığı'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Sample Company
-- =====================================================
INSERT INTO companies (
  id,
  program_id,
  name,
  legal_name,
  slug,
  email,
  phone,
  city,
  sector,
  employee_count,
  foundation_year,
  is_active
) VALUES (
  '20000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  'Örnek Tekstil A.Ş.',
  'Örnek Tekstil Anonim Şirketi',
  'ornek-tekstil',
  'info@ornektekstil.com',
  '+90 352 123 45 67',
  'Kayseri',
  'Tekstil',
  50,
  2010,
  true
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Sample Consultant
-- =====================================================
-- NOT: Önce Supabase Auth'da oluşturulmalı
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  expertise_areas,
  is_active,
  is_email_verified
) VALUES (
  '30000000-0000-0000-0000-000000000001'::uuid,
  'consultant@akademiport.com',
  'Ahmet Danışman',
  'consultant',
  ARRAY['E-İhracat', 'Dijital Pazarlama', 'Pazaryeri Yönetimi'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Assign Consultant to Program
-- =====================================================
INSERT INTO user_programs (
  user_id,
  program_id,
  role_in_program,
  is_active
) VALUES (
  '30000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  'consultant',
  true
) ON CONFLICT (user_id, program_id) DO NOTHING;

-- =====================================================
-- Sample Company Admin
-- =====================================================
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  company_id,
  is_active,
  is_email_verified
) VALUES (
  '40000000-0000-0000-0000-000000000001'::uuid,
  'admin@ornektekstil.com',
  'Mehmet Yönetici',
  'company_admin',
  '20000000-0000-0000-0000-000000000001'::uuid,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

