-- Appointment Notes Table
-- Bu tablo randevu notlarını yönetmek için kullanılacak
-- Her not bir randevuya bağlı olacak ve kim tarafından eklendiği takip edilecek

-- Önce pgcrypto extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS appointment_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    note_type TEXT NOT NULL CHECK (note_type IN ('company', 'admin', 'consultant')),
    content TEXT NOT NULL,
    created_by TEXT NOT NULL, -- email adresi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_note_type ON appointment_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_created_at ON appointment_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_created_by ON appointment_notes(created_by);

-- RLS Policies
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;

-- Companies can view their own appointment notes
CREATE POLICY "Companies can view their own appointment notes" ON appointment_notes
    FOR SELECT USING (
        appointment_id IN (
            SELECT id FROM appointments WHERE company_id IN (
                SELECT company_id FROM company_users WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- Companies can create notes for their appointments
CREATE POLICY "Companies can create notes for their appointments" ON appointment_notes
    FOR INSERT WITH CHECK (
        appointment_id IN (
            SELECT id FROM appointments WHERE company_id IN (
                SELECT company_id FROM company_users WHERE email = auth.jwt() ->> 'email'
            )
        ) AND note_type = 'company'
    );

-- Companies can update their own notes
CREATE POLICY "Companies can update their own notes" ON appointment_notes
    FOR UPDATE USING (
        created_by = auth.jwt() ->> 'email' AND note_type = 'company'
    );

-- Admins can view all notes
CREATE POLICY "Admins can view all notes" ON appointment_notes
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'admin@ihracatakademi.com'
    );

-- Admins can create admin/consultant notes
CREATE POLICY "Admins can create admin/consultant notes" ON appointment_notes
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'email' = 'admin@ihracatakademi.com' AND 
        note_type IN ('admin', 'consultant')
    );

-- Admins can update all notes
CREATE POLICY "Admins can update all notes" ON appointment_notes
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'admin@ihracatakademi.com'
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointment_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_appointment_notes_updated_at
    BEFORE UPDATE ON appointment_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_notes_updated_at();

-- Migrate existing notes from appointments table
-- Bu kısım mevcut notları yeni tabloya taşımak için kullanılacak
INSERT INTO appointment_notes (appointment_id, note_type, content, created_by, created_at)
SELECT 
    id as appointment_id,
    'admin' as note_type,
    COALESCE(admin_notes, attendance_notes) as content,
    'admin@ihracatakademi.com' as created_by,
    updated_at as created_at
FROM appointments 
WHERE admin_notes IS NOT NULL OR attendance_notes IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE appointment_notes IS 'Randevu notları tablosu - firma, admin ve danışman notlarını içerir';
COMMENT ON COLUMN appointment_notes.note_type IS 'Not türü: company (firma), admin (admin), consultant (danışman)';
COMMENT ON COLUMN appointment_notes.content IS 'Not içeriği';
COMMENT ON COLUMN appointment_notes.created_by IS 'Notu ekleyen kullanıcının email adresi';

