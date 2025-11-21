import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import {
  CreateProjectUseCase,
  ListProjectsUseCase,
  GetProjectTemplatesUseCase,
  CreateProjectFromTemplateUseCase,
  BulkAssignSubProjectsToCompaniesUseCase,
} from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';
import { CompanyProjectAssignmentRepository } from '@/infrastructure/database/repositories/CompanyProjectAssignmentRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';

const projectRepository = new ProjectRepository();
const subProjectRepository = new SubProjectRepository();
const taskRepository = new TaskRepository();
const assignmentRepository = new CompanyProjectAssignmentRepository();
const companyRepository = new CompanyRepository();

/**
 * GET /api/projects
 * List all projects with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let companyId = searchParams.get('companyId') || undefined;
    let consultantId = searchParams.get('consultantId') || undefined;
    const status = searchParams.get('status') || undefined;
    const isTemplate = searchParams.get('isTemplate') === 'true' ? true : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Authorization: Company users can only see their own company's projects
    if (user.role === 'company_user' || user.role === 'company_admin') {
      if (!user.companyId) {
        return NextResponse.json({ error: 'Firma bilgisi bulunamadı' }, { status: 403 });
      }
      // Force filter by user's company ID
      companyId = user.companyId;
    }

    // Authorization: Consultants can only see their own projects
    if (user.role === 'consultant') {
      // Force filter by consultant's user ID
      consultantId = user.id;
    }

    // Get templates
    if (isTemplate === true) {
      const getTemplatesUseCase = new GetProjectTemplatesUseCase(projectRepository);
      const result = await getTemplatesUseCase.execute();

      if (result.isFailure) {
        const error =
          result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
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
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    // Return projects in format expected by frontend
    return NextResponse.json({
      projects: result.value.data,
      total: result.value.total,
      page: result.value.page,
      limit: result.value.limit,
    });
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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can create projects
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Support both single companyId and multiple companyIds
    const companyIds = Array.isArray(body.companyIds)
      ? body.companyIds
      : body.companyId
        ? [body.companyId]
        : [];
    const primaryCompanyId = companyIds.length > 0 ? companyIds[0] : body.companyId;

    if (companyIds.length === 0 && !body.companyId) {
      return NextResponse.json({ error: 'En az bir firma seçilmelidir' }, { status: 400 });
    }

    // Create from template
    if (body.templateId) {
      const createFromTemplateUseCase = new CreateProjectFromTemplateUseCase(
        projectRepository,
        subProjectRepository,
        taskRepository
      );

      const result = await createFromTemplateUseCase.execute({
        templateId: body.templateId,
        companyId: primaryCompanyId, // İlk firma primary olarak kullanılır
        consultantId: body.consultantId || user.id,
        name: body.name,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      });

      if (result.isFailure) {
        const error =
          result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }

      const projectId = result.value.id;

      // Otomatik atama: Seçilen tüm firmalara tüm alt projeleri ata
      if (companyIds.length > 0) {
        await autoAssignCompaniesToSubProjects(projectId, companyIds);
      }

      return NextResponse.json(result.value, { status: 201 });
    }

    // Create new project
    const createProjectUseCase = new CreateProjectUseCase(projectRepository);
    const result = await createProjectUseCase.execute({
      companyId: primaryCompanyId, // İlk firma primary olarak kullanılır
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
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    const projectId = result.value.id;

    // Otomatik atama: Seçilen tüm firmalara tüm alt projeleri ata
    if (companyIds.length > 0) {
      await autoAssignCompaniesToSubProjects(projectId, companyIds);
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Helper function: Otomatik olarak seçilen firmalara tüm alt projeleri atar
 */
async function autoAssignCompaniesToSubProjects(
  projectId: string,
  companyIds: string[]
): Promise<void> {
  try {
    // Projenin alt projelerini al
    const subProjects = await subProjectRepository.findByProjectId(projectId);
    if (subProjects.length === 0) {
      // Alt proje yoksa atama yapmaya gerek yok
      return;
    }

    // Bulk assignment use case'i kullanarak tüm firmalara tüm alt projeleri ata
    const bulkAssignUseCase = new BulkAssignSubProjectsToCompaniesUseCase(
      projectRepository,
      subProjectRepository,
      companyRepository,
      assignmentRepository
    );

    const assignments = companyIds.map((companyId) => ({
      companyId,
      subProjectIds: subProjects.map((sp) => sp.id),
    }));

    const result = await bulkAssignUseCase.execute({
      projectId,
      assignments,
    });

    if (result.isFailure) {
      console.error('[autoAssignCompaniesToSubProjects] Bulk assignment failed:', result.error);
      // Hata olsa bile proje oluşturulmuş olur, sadece atamalar yapılamaz
      // Kullanıcı daha sonra manuel olarak atama yapabilir
    }
  } catch (error) {
    console.error('[autoAssignCompaniesToSubProjects] Error:', error);
    // Hata olsa bile proje oluşturulmuş olur
  }
}
