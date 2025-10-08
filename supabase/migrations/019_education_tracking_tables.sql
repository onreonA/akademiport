-- Education Tracking Tables Migration
-- Company assignments, watch progress, document reads

-- 1. Company Education Assignments
CREATE TABLE IF NOT EXISTS company_education_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    set_id UUID REFERENCES education_sets(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pasif', 'Tamamlandı')),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    UNIQUE(company_id, set_id)
);

-- 2. Video Watch Progress
CREATE TABLE IF NOT EXISTS video_watch_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID,
    watch_progress INTEGER DEFAULT 0 CHECK (watch_progress >= 0 AND watch_progress <= 100),
    is_completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, video_id)
);

-- 3. Document Reads
CREATE TABLE IF NOT EXISTS document_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, document_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_education_assignments_company_id ON company_education_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_company_education_assignments_set_id ON company_education_assignments(set_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_progress_company_id ON video_watch_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_progress_video_id ON video_watch_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_document_reads_company_id ON document_reads(company_id);
CREATE INDEX IF NOT EXISTS idx_document_reads_document_id ON document_reads(document_id);

-- Triggers
CREATE TRIGGER update_video_watch_progress_updated_at 
    BEFORE UPDATE ON video_watch_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_reads_updated_at 
    BEFORE UPDATE ON document_reads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE company_education_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read for authenticated" ON company_education_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert for authenticated" ON company_education_assignments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated" ON company_education_assignments FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read for authenticated" ON video_watch_progress FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert for authenticated" ON video_watch_progress FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated" ON video_watch_progress FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read for authenticated" ON document_reads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert for authenticated" ON document_reads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated" ON document_reads FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Permissions
GRANT ALL ON company_education_assignments TO authenticated;
GRANT ALL ON video_watch_progress TO authenticated;
GRANT ALL ON document_reads TO authenticated;

-- Success message
SELECT 'Education tracking tables created successfully!' as message;
