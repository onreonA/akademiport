-- Education Core Tables Migration
-- Education sets, videos, documents tabloları

-- 1. Education Sets Table
CREATE TABLE IF NOT EXISTS education_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pasif')),
    total_duration INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    document_count INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Videos Table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES education_sets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    youtube_url TEXT,
    duration INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pasif')),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES education_sets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size BIGINT,
    storage_path TEXT,
    order_index INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pasif')),
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_sets_category ON education_sets(category);
CREATE INDEX IF NOT EXISTS idx_education_sets_status ON education_sets(status);
CREATE INDEX IF NOT EXISTS idx_videos_set_id ON videos(set_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_documents_set_id ON documents(set_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Triggers
CREATE TRIGGER update_education_sets_updated_at 
    BEFORE UPDATE ON education_sets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE education_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read for all" ON education_sets FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON education_sets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated" ON education_sets FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read for all" ON videos FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON videos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated" ON videos FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read for all" ON documents FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated" ON documents FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Permissions
GRANT ALL ON education_sets TO authenticated;
GRANT ALL ON videos TO authenticated;
GRANT ALL ON documents TO authenticated;

-- Success message
SELECT 'Education core tables created successfully!' as message;
