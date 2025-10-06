-- Parça 1: Enum'ları düzelt
-- Önce mevcut enum'ları güncelle (Türkçe değerler için)

-- Projects tablosundaki status enum'unu güncelle
ALTER TABLE projects ALTER COLUMN status TYPE text USING status::text;
DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM ('Planlandı', 'Aktif', 'Tamamlandı', 'Duraklatıldı');
ALTER TABLE projects ALTER COLUMN status TYPE project_status USING 
    CASE 
        WHEN status = 'planning' THEN 'Planlandı'
        WHEN status = 'active' THEN 'Aktif'
        WHEN status = 'completed' THEN 'Tamamlandı'
        WHEN status = 'paused' THEN 'Duraklatıldı'
        ELSE 'Planlandı'
    END::project_status;
