-- Education Tables Check Script
-- Bu script Supabase SQL Editor'da çalıştırılacak

-- 1. Mevcut tabloları listele
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%education%' 
OR table_name LIKE '%video%' 
OR table_name LIKE '%document%'
OR table_name IN ('courses', 'user_progress')
ORDER BY table_name;

-- 2. Education_sets tablosu var mı kontrol et
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'education_sets'
) as education_sets_exists;

-- 3. Videos tablosu var mı kontrol et
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'videos'
) as videos_exists;

-- 4. Documents tablosu var mı kontrol et
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'documents'
) as documents_exists;

-- 5. Company_education_assignments tablosu var mı kontrol et
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'company_education_assignments'
) as company_education_assignments_exists;

-- 6. Video_watch_progress tablosu var mı kontrol et
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'video_watch_progress'
) as video_watch_progress_exists;

-- 7. Eğer education_sets varsa, sample data kontrol et
SELECT 
    COUNT(*) as total_sets,
    COUNT(CASE WHEN status = 'Aktif' THEN 1 END) as active_sets,
    COUNT(CASE WHEN status = 'Pasif' THEN 1 END) as inactive_sets
FROM education_sets
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'education_sets'
);

-- 8. Eğer videos varsa, sample data kontrol et
SELECT 
    COUNT(*) as total_videos,
    COUNT(CASE WHEN status = 'Aktif' THEN 1 END) as active_videos
FROM videos
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'videos'
);

-- 9. Eğer documents varsa, sample data kontrol et
SELECT 
    COUNT(*) as total_documents,
    COUNT(CASE WHEN status = 'Aktif' THEN 1 END) as active_documents
FROM documents
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'documents'
);
