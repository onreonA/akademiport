import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/core/errors';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { CompanyProjectAssignmentRepository } from '@/infrastructure/database/repositories/CompanyProjectAssignmentRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { BulkAssignSubProjectsToCompaniesUseCase } from '@/application/use-cases/project';
import { UserRole } from '@/domain/enums/UserRole';
import { logger } from '@/shared/utils/logger';

const projectRepository = new ProjectRepository();
const subProjectRepository = new SubProjectRepository();
const companyRepository = new CompanyRepository();
const assignmentRepository = new CompanyProjectAssignmentRepository();

/**
 * POST /api/projects/[id]/assignments/bulk
 * Matris tabanlı alt proje atamalarını topluca günceller
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== UserRole.MASTER_ADMIN && user.role !== UserRole.CONSULTANT) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const assignments = Array.isArray(body.assignments) ? body.assignments : [];

    const useCase = new BulkAssignSubProjectsToCompaniesUseCase(
      projectRepository,
      subProjectRepository,
      companyRepository,
      assignmentRepository
    );

    const result = await useCase.execute({
      projectId: id,
      assignments,
    });

    if (result.isFailure && result.error instanceof AppError) {
      return NextResponse.json(
        {
          error: (result.error as any)?.message || "Unknown error",
          code: result.error.code,
          errors: Array.isArray(result.error.details) ? result.error.details : undefined,
        },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    if (result.isFailure) {
      return NextResponse.json(
        { error: 'Alt proje atamaları gerçekleştirilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    logger.error('Error in POST /api/projects/[id]/assignments/bulk:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
