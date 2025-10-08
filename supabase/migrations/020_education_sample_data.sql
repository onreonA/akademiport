-- Education Sample Data Migration
-- Test için örnek eğitim seti, videolar ve dokümanlar

-- Sample education set
INSERT INTO education_sets (id, name, description, category, status, total_duration, video_count, document_count, created_by) 
VALUES
(gen_random_uuid(), 'E-İhracat Temelleri', 'E-ihracatın temel kavramları ve başlangıç seviyesi eğitimleri', 'Temel Eğitim', 'Aktif', 120, 5, 3, NULL)
ON CONFLICT DO NOTHING;

-- Sample videos
INSERT INTO videos (id, set_id, title, description, youtube_url, duration, order_index, status, created_by)
SELECT 
    gen_random_uuid(),
    es.id,
    'E-İhracat Nedir?',
    'E-ihracatın tanımı ve önemi hakkında temel bilgiler',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    25,
    1,
    'Aktif',
    NULL
FROM education_sets es WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

INSERT INTO videos (id, set_id, title, description, youtube_url, duration, order_index, status, created_by)
SELECT 
    gen_random_uuid(),
    es.id,
    'Online Pazaryerleri',
    'Amazon, eBay, Alibaba gibi pazaryerlerinde satış yapma',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    30,
    2,
    'Aktif',
    NULL
FROM education_sets es WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

INSERT INTO videos (id, set_id, title, description, youtube_url, duration, order_index, status, created_by)
SELECT 
    gen_random_uuid(),
    es.id,
    'Lojistik ve Kargo',
    'Uluslararası kargo seçenekleri ve lojistik süreçleri',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    20,
    3,
    'Aktif',
    NULL
FROM education_sets es WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

INSERT INTO videos (id, set_id, title, description, youtube_url, duration, order_index, status, created_by)
SELECT 
    gen_random_uuid(),
    es.id,
    'Ödeme Yöntemleri',
    'Uluslararası ödeme sistemleri ve güvenli ödeme',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    25,
    4,
    'Aktif',
    NULL
FROM education_sets es WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

INSERT INTO videos (id, set_id, title, description, youtube_url, duration, order_index, status, created_by)
SELECT 
    gen_random_uuid(),
    es.id,
    'Müşteri Hizmetleri',
    'Uluslararası müşteri hizmetleri ve iletişim',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    20,
    5,
    'Aktif',
    NULL
FROM education_sets es WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

-- Sample documents
INSERT INTO documents (id, set_id, title, description, file_url, file_type, file_size, order_index, status, uploaded_by)
SELECT 
    gen_random_uuid(),
    es.id,
    'E-İhracat Rehberi',
    'Kapsamlı e-ihracat başlangıç rehberi',
    'https://example.com/e-ihracat-rehberi.pdf',
    'pdf',
    2048000,
    1,
    'Aktif',
    NULL
FROM education_sets es WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

INSERT INTO documents (id, set_id, title, description, file_url, file_type, file_size, order_index, status, uploaded_by)
SELECT 
    gen_random_uuid(),
    es.id,
    'Pazaryeri Karşılaştırması',
    'Farklı pazaryerlerinin karşılaştırmalı analizi',
    'https://example.com/pazaryeri-karsilastirmasi.pdf',
    'pdf',
    1536000,
    2,
    'Aktif',
    NULL
FROM education_sets es WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

INSERT INTO documents (id, set_id, title, description, file_url, file_type, file_size, order_index, status, uploaded_by)
SELECT 
    gen_random_uuid(),
    es.id,
    'Kargo Hesaplayıcı',
    'Uluslararası kargo maliyetlerini hesaplama aracı',
    'https://example.com/kargo-hesaplayici.xlsx',
    'xlsx',
    512000,
    3,
    'Aktif',
    NULL
FROM education_sets es WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

-- Assign to all companies
INSERT INTO company_education_assignments (id, company_id, set_id, assigned_by, assigned_at, status, progress)
SELECT 
    gen_random_uuid(),
    c.id,
    es.id,
    NULL,
    NOW(),
    'Aktif',
    0
FROM companies c
CROSS JOIN education_sets es 
WHERE es.name = 'E-İhracat Temelleri'
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Education sample data created successfully!' as message;
