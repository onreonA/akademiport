import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import {
  CreateProjectUseCase,
  ListProjectsUseCase,
  GetProjectTemplatesUseCase,
  CreateProjectFromTemplateUseCase,
} from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const projectRepository = new ProjectRepository();
const subProjectRepository = new SubProjectRepository();
const taskRepository = new TaskRepository();

/**
 * GET /api/projects
 * List all projects with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || undefined;
    const consultantId = searchParams.get('consultantId') || undefined;
    const status = searchParams.get('status') || undefined;
    const isTemplate = searchParams.get('isTemplate') === 'true' ? true : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get templates
    if (isTemplate === true) {
      const getTemplatesUseCase = new GetProjectTemplatesUseCase(projectRepository);
      const result = await getTemplatesUseCase.execute();

      if (result.isFailure) {
        return NextResponse.json(
          { error: result.error.message },
          { status: result.error.statusCode }
        );
      }

      return NextResponse.json({ data: result.value });
    }

    // List projects
    const listProjectsUseCase = new ListProjectsUseCase(projectRepository);
    const result = await listProjectsUseCase.execute({
      companyId,
      consultantId,
      status,
      isTemplate,
      page,
      limit,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Create a new project or create from template
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can create projects
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Create from template
    if (body.templateId) {
      const createFromTemplateUseCase = new CreateProjectFromTemplateUseCase(
        projectRepository,
        subProjectRepository,
        taskRepository
      );

      const result = await createFromTemplateUseCase.execute({
        templateId: body.templateId,
        companyId: body.companyId,
        consultantId: body.consultantId || user.id,
        name: body.name,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      });

      if (result.isFailure) {
        return NextResponse.json(
          { error: result.error.message },
          { status: result.error.statusCode }
        );
      }

      return NextResponse.json(result.value, { status: 201 });
    }

    // Create new project
    const createProjectUseCase = new CreateProjectUseCase(projectRepository);
    const result = await createProjectUseCase.execute({
      companyId: body.companyId,
      consultantId: body.consultantId || user.id,
      name: body.name,
      description: body.description,
      status: body.status,
      priority: body.priority,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isTemplate: body.isTemplate || false,
      templateId: body.templateId,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
