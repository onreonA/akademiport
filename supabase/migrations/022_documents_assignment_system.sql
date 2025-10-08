-- Documents Assignment System
-- Migration: 022_documents_assignment_system.sql

-- Create company document assignments table
CREATE TABLE IF NOT EXISTS company_document_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pasif', 'Tamamlandı')),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    downloaded_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0,
    UNIQUE(company_id, document_id)
);

-- Enable RLS
ALTER TABLE company_document_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read for all" ON company_document_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON company_document_assignments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated" ON company_document_assignments FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_document_assignments_company_id ON company_document_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_company_document_assignments_document_id ON company_document_assignments(document_id);
CREATE INDEX IF NOT EXISTS idx_company_document_assignments_status ON company_document_assignments(status);

-- Permissions
GRANT ALL ON company_document_assignments TO authenticated;
