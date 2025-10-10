-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT 'Akademi Port',
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Tam Zamanlı', 'Yarı Zamanlı', 'Staj', 'Freelance')),
    level TEXT NOT NULL CHECK (level IN ('Giriş', 'Orta', 'İleri', 'Uzman')),
    salary TEXT,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pasif', 'Dolu')),
    application_deadline TIMESTAMP WITH TIME ZONE,
    applications_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings(type);
CREATE INDEX IF NOT EXISTS idx_job_postings_level ON job_postings(level);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at);

-- Add some sample data
INSERT INTO job_postings (title, company, department, location, type, level, salary, description, requirements, benefits, status, application_deadline) VALUES
(
    'İhracat Uzmanı',
    'Akademi Port',
    'İhracat Geliştirme',
    'İstanbul, Türkiye',
    'Tam Zamanlı',
    'Orta',
    '15.000 - 25.000 TL',
    'İhracat süreçlerini yönetecek, firma danışmanlıkları yapacak ve pazarlama stratejileri geliştirecek deneyimli İhracat Uzmanı aranıyor.',
    ARRAY['Uluslararası Ticaret veya İktisat bölümü mezunu', 'En az 3 yıl ihracat deneyimi', 'İngilizce ileri düzey', 'İhracat mevzuatına hakim'],
    ARRAY['Sağlık sigortası', 'Yemek kartı', 'Esnek çalışma saatleri', 'Eğitim desteği'],
    'Aktif',
    '2024-12-31T23:59:59Z'
),
(
    'Dijital Pazarlama Specialistı',
    'Akademi Port',
    'Pazarlama',
    'İstanbul, Türkiye (Hibrit)',
    'Tam Zamanlı',
    'Giriş',
    '12.000 - 18.000 TL',
    'E-ticaret platformları ve dijital pazarlama kanallarını yöneterek firmaların online görünürlüğünü artıracak Dijital Pazarlama Uzmanı.',
    ARRAY['İşletme, Pazarlama veya İletişim bölümü mezunu', 'Google Ads ve Facebook Ads deneyimi', 'SEO/SEM bilgisi', 'Analitik düşünme yetisi'],
    ARRAY['Sağlık sigortası', 'Performans primi', 'Uzaktan çalışma imkanı', 'Sertifika programları'],
    'Aktif',
    '2024-12-31T23:59:59Z'
),
(
    'Yazılım Geliştirici (React/Node.js)',
    'Akademi Port',
    'Teknoloji',
    'İstanbul, Türkiye',
    'Tam Zamanlı',
    'Orta',
    '25.000 - 35.000 TL',
    'İhracat platformlarının geliştirilmesi ve sürdürülmesi için React ve Node.js teknolojilerinde deneyimli yazılım geliştirici aranıyor.',
    ARRAY['Bilgisayar Mühendisliği veya ilgili bölüm mezunu', 'React.js ve Node.js deneyimi', 'API geliştirme deneyimi', 'Git kullanımı'],
    ARRAY['Sağlık sigortası', 'Yüksek maaş', 'Teknoloji eğitimleri', 'Startup ortamı'],
    'Aktif',
    '2024-12-31T23:59:59Z'
);
