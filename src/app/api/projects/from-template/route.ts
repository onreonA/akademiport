import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { CreateProjectFromTemplateUseCase } from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

/**
 * POST /api/projects/from-template
 * Create a project from a template
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    // Only consultants and admins can create projects
    if (
      user.role !== 'master_admin' &&
      user.role !== 'program_manager' &&
      user.role !== 'consultant'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { template_id, company_id, name, start_date, end_date } = body;

    if (!template_id || !company_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: template_id, company_id, name' },
        { status: 400 }
      );
    }

    const projectRepository = new ProjectRepository();
    const createFromTemplateUseCase = new CreateProjectFromTemplateUseCase(projectRepository);

    const result = await createFromTemplateUseCase.execute({
      template_id,
      company_id,
      consultant_id: user.role === 'consultant' ? user.id : undefined,
      name,
      start_date,
      end_date,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      project: result.data,
    });
  } catch (error) {
    console.error('Error in POST /api/projects/from-template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
