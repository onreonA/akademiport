-- Temporarily disable RLS for development
-- ALTER TABLE appointment_revise_requests DISABLE ROW LEVEL SECURITY;

-- Add development policies for testing
CREATE POLICY "dev_select_all" ON appointment_revise_requests
    FOR SELECT USING (true);

CREATE POLICY "dev_insert_all" ON appointment_revise_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "dev_update_all" ON appointment_revise_requests
    FOR UPDATE USING (true);
