import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';

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
      .order('order_index', { ascending: true });

    if (tasksError) {
      logger.error('❌ [Tasks API] Error fetching tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    logger.info('✅ [Tasks API] Fetched tasks:', {
      projectId,
      subProjectCount: subProjects.length,
      taskCount: tasks?.length || 0,
      tasks: tasks?.map((t) => ({ id: t.id, title: t.title, subProjectId: t.sub_project_id })),
    });

    return NextResponse.json({ tasks: tasks || [] }, { status: 200 });
  } catch (error) {
    logger.error('Error fetching project tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
