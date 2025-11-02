import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { CreateProjectFromTemplateUseCase } from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

/**
 * POST /api/projects/from-template
 * Create a project from a template
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultants and admins can create projects
    if (
      user.role !== 'master_admin' &&
      user.role !== 'program_manager' &&
      user.role !== 'consultant'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { template_id, company_id, name, start_date, end_date, is_template } = body;

    // If is_template is true, company_id is not required (for template duplication)
    if (!template_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: template_id, name' },
        { status: 400 }
      );
    }

    if (!is_template && !company_id) {
      return NextResponse.json(
        {
          error:
            'Missing required field: company_id (required when creating project from template)',
        },
        { status: 400 }
      );
    }

    const projectRepository = new ProjectRepository();
    const subProjectRepository = new SubProjectRepository();
    const taskRepository = new TaskRepository();
    const createFromTemplateUseCase = new CreateProjectFromTemplateUseCase(
      projectRepository,
      subProjectRepository,
      taskRepository
    );

    const result = await createFromTemplateUseCase.execute({
      templateId: template_id,
      companyId: company_id || undefined, // Optional for template duplication
      consultantId: user.role === 'consultant' ? user.id : undefined,
      name,
      description: undefined,
      startDate: start_date ? new Date(start_date) : undefined,
      endDate: end_date ? new Date(end_date) : undefined,
    });

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      project: result.value,
    });
  } catch (error) {
    console.error('Error in POST /api/projects/from-template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
