-- Temporarily disable the sub_project_completions trigger
-- This will prevent RLS errors during task approval

-- Drop the trigger
DROP TRIGGER IF EXISTS check_sub_project_completion_trigger ON company_task_statuses;

-- The trigger function remains but won't be called
-- This prevents RLS errors when approving tasks
