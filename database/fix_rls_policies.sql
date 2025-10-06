-- RLS Politikalarını Düzelt
-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Companies can view their own appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Companies can create notes for their appointments" ON appointment_notes;
DROP POLICY IF EXISTS "Companies can update their own notes" ON appointment_notes;
DROP POLICY IF EXISTS "Admins can view all notes" ON appointment_notes;
DROP POLICY IF EXISTS "Admins can create admin/consultant notes" ON appointment_notes;
DROP POLICY IF EXISTS "Admins can update all notes" ON appointment_notes;

-- Geçici olarak RLS'yi devre dışı bırak
ALTER TABLE appointment_notes DISABLE ROW LEVEL SECURITY;

-- Veya geliştirme politikaları ekle
CREATE POLICY "dev_select_all" ON appointment_notes
    FOR SELECT USING (true);

CREATE POLICY "dev_insert_all" ON appointment_notes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "dev_update_all" ON appointment_notes
    FOR UPDATE USING (true);

CREATE POLICY "dev_delete_all" ON appointment_notes
    FOR DELETE USING (true);
