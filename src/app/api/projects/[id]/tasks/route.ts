import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Get all sub-projects for this project first
    const { createClient } = await import('@/infrastructure/database/supabase-server');
    const supabase = await createClient();

    const { data: subProjects, error: subProjectsError } = await supabase
      .from('sub_projects')
      .select('id')
      .eq('project_id', projectId);

    if (subProjectsError) {
      return NextResponse.json({ error: 'Failed to fetch sub-projects' }, { status: 500 });
    }

    if (!subProjects || subProjects.length === 0) {
      return NextResponse.json({ tasks: [] }, { status: 200 });
    }

    // Get all tasks for these sub-projects
    const subProjectIds = subProjects.map((sp) => sp.id);

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('sub_project_id', subProjectIds)
      .order('created_at', { ascending: false });

    if (tasksError) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
