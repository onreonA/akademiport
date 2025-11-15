import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { CompanyProjectAssignmentRepository } from '@/infrastructure/database/repositories/CompanyProjectAssignmentRepository';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { GetAssignmentMatrixUseCase } from '@/application/use-cases/project';
import { UserRole } from '@/domain/enums/UserRole';
import { logger } from '@/shared/utils/logger';

const projectRepository = new ProjectRepository();
const subProjectRepository = new SubProjectRepository();
const companyRepository = new CompanyRepository();
const assignmentRepository = new CompanyProjectAssignmentRepository();
const userRepository = new UserRepository();

/**
 * GET /api/projects/[id]/assignment-matrix
 * Firma x Alt Proje matris verisini döner
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Viewer roller (consultant, master_admin, company_admin) matrisi görebilir
    if (
      user.role !== UserRole.MASTER_ADMIN &&
      user.role !== UserRole.CONSULTANT &&
      user.role !== UserRole.COMPANY_ADMIN
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const useCase = new GetAssignmentMatrixUseCase(
      projectRepository,
      subProjectRepository,
      companyRepository,
      assignmentRepository,
      userRepository
    );

    const result = await useCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error", code: (result.error as any)?.code },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    logger.error('Error in GET /api/projects/[id]/assignment-matrix:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
