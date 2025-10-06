-- Test verisi ekle
INSERT INTO companies (id, name, phone, address, city, industry, size, status) VALUES
(gen_random_uuid(), 'Test Firma 1', '+90 555 123 4567', 'Test Adres 1', 'İstanbul', 'Teknoloji', 'medium', 'active'),
(gen_random_uuid(), 'Test Firma 2', '+90 555 234 5678', 'Test Adres 2', 'Ankara', 'İmalat', 'large', 'active');

-- Test projeleri ekle
INSERT INTO projects (id, company_id, name, description, status, start_date, end_date, progress, admin_note) 
SELECT 
  gen_random_uuid(),
  c.id,
  'E-ticaret Platformu Geliştirme',
  'Modern e-ticaret platformu geliştirme projesi',
  'Aktif',
  '2024-01-01',
  '2024-12-31',
  25,
  'Bu proje e-ticaret platformu geliştirme için oluşturulmuştur.'
FROM companies c 
WHERE c.name = 'Test Firma 1'
LIMIT 1;

INSERT INTO projects (id, company_id, name, description, status, start_date, end_date, progress, admin_note) 
SELECT 
  gen_random_uuid(),
  c.id,
  'Mobil Uygulama Projesi',
  'iOS ve Android mobil uygulama geliştirme',
  'Planlandı',
  '2024-02-01',
  '2024-11-30',
  0,
  'Mobil uygulama geliştirme projesi.'
FROM companies c 
WHERE c.name = 'Test Firma 2'
LIMIT 1;

-- Test alt projeleri ekle
INSERT INTO sub_projects (id, project_id, name, description, status, start_date, end_date, progress)
SELECT 
  gen_random_uuid(),
  p.id,
  'Frontend Geliştirme',
  'React.js ile frontend geliştirme',
  'Aktif',
  '2024-01-15',
  '2024-06-30',
  40
FROM projects p 
WHERE p.name = 'E-ticaret Platformu Geliştirme'
LIMIT 1;

INSERT INTO sub_projects (id, project_id, name, description, status, start_date, end_date, progress)
SELECT 
  gen_random_uuid(),
  p.id,
  'Backend Geliştirme',
  'Node.js ile backend API geliştirme',
  'Planlandı',
  '2024-02-01',
  '2024-08-31',
  10
FROM projects p 
WHERE p.name = 'E-ticaret Platformu Geliştirme'
LIMIT 1;

-- Test görevleri ekle
INSERT INTO tasks (id, project_id, sub_project_id, title, description, status, priority, start_date, end_date, progress)
SELECT 
  gen_random_uuid(),
  p.id,
  sp.id,
  'Ana Sayfa Tasarımı',
  'E-ticaret sitesi ana sayfa tasarımı ve geliştirme',
  'Bekliyor',
  'Yüksek',
  '2024-01-20',
  '2024-02-15',
  0
FROM projects p 
JOIN sub_projects sp ON sp.project_id = p.id
WHERE p.name = 'E-ticaret Platformu Geliştirme' 
AND sp.name = 'Frontend Geliştirme'
LIMIT 1;

INSERT INTO tasks (id, project_id, sub_project_id, title, description, status, priority, start_date, end_date, progress)
SELECT 
  gen_random_uuid(),
  p.id,
  sp.id,
  'Ürün Listesi Sayfası',
  'Ürün listeleme ve filtreleme sayfası',
  'Bekliyor',
  'Orta',
  '2024-02-01',
  '2024-02-28',
  0
FROM projects p 
JOIN sub_projects sp ON sp.project_id = p.id
WHERE p.name = 'E-ticaret Platformu Geliştirme' 
AND sp.name = 'Frontend Geliştirme'
LIMIT 1;
