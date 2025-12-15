import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { TaskDependencyRepository } from '@/infrastructure/database/repositories/TaskDependencyRepository';
import { GetTaskUseCase, UpdateTaskUseCase, DeleteTaskUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const taskRepository = new TaskRepository();
const taskDependencyRepository = new TaskDependencyRepository();

/**
 * GET /api/tasks/[id]
 * Get task by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const getTaskUseCase = new GetTaskUseCase(taskRepository);
    const result = await getTaskUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    const task = result.value;

    // Fetch sub-project and project information
    const { createClient } = await import('@/infrastructure/database/supabase-server');
    const supabase = await createClient();

      const { data: subProject } = await supabase
      .from('sub_projects')
      .select('id, name, project_id')
      .eq('id', task.subProjectId)
      .single();

    let projectData = null;
    if (subProject?.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', subProject.project_id)
        .single();
      projectData = project;
    }

    // Return task with sub-project and project information
    return NextResponse.json({
      ...task,
      sub_project: subProject
        ? {
            id: subProject.id,
            name: subProject.name,
            project: projectData
              ? {
                  id: projectData.id,
                  name: projectData.name,
                }
              : subProject.project_id
                ? {
                    id: subProject.project_id,
                    name: null,
                  }
                : null,
          }
        : null,
    });
  } catch (error) {
    console.error('Error in GET /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/tasks/[id]
 * Update task
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, taskDependencyRepository);
    const result = await updateTaskUseCase.execute(id, {
      assignedTo: body.assignedTo,
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      orderIndex: body.orderIndex,
    });

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can delete tasks
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
    const result = await deleteTaskUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
