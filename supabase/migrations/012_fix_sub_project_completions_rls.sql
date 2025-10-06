-- Fix RLS policies for sub_project_completions table
-- This allows admin users to insert completion records when approving tasks

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for admin users" ON sub_project_completions;
DROP POLICY IF EXISTS "Enable read for admin users" ON sub_project_completions;
DROP POLICY IF EXISTS "Enable read for company users" ON sub_project_completions;

-- Create new policies that properly handle admin access
CREATE POLICY "Enable insert for admin users" ON sub_project_completions
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'consultant')
        )
    );

CREATE POLICY "Enable read for admin users" ON sub_project_completions
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'consultant')
        )
    );

CREATE POLICY "Enable read for company users" ON sub_project_completions
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.user_id = auth.uid() 
            AND company_users.company_id = sub_project_completions.company_id
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON sub_project_completions TO authenticated;
GRANT ALL ON notifications TO authenticated;
