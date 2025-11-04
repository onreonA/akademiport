/**
 * Consultant Program Detail API Route
 *
 * GET /api/consultant/programs/[programId]
 * Get a single program assigned to the consultant
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/4-infrastructure/database/repositories/ProgramRepository';
import { GetProgramUseCase } from '@/application/use-cases/program';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';
import { ListConsultantProgramsUseCase } from '@/application/use-cases/consultant';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';

const programRepository = new ProgramRepository();
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const getProgramUseCase = new GetProgramUseCase(programRepository);
const listConsultantProgramsUseCase = new ListConsultantProgramsUseCase(
  userRepository,
  companyRepository
);

/**
 * GET /api/consultant/programs/[programId]
 * Get a program by ID (only if assigned to consultant)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Get program ID from params
    const { programId } = await params;

    // First, verify that the consultant has access to this program
    // by checking if it's in their assigned programs list
    const filter = {
      status: undefined,
      search: undefined,
      sortBy: 'assignedAt' as const,
      sortOrder: 'desc' as const,
      page: 1,
      limit: 100,
    };

    const programsResult = await listConsultantProgramsUseCase.execute(userId, userRole, filter);

    if (programsResult.isFailure) {
      return NextResponse.json(
        {
          success: false,
          error: 'Program bilgileri alınamadı',
        },
        { status: 403 }
      );
    }

    // Check if the requested program is in the consultant's assigned programs
    const assignedProgram = programsResult.value?.programs.find((p) => p.program.id === programId);

    if (!assignedProgram) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu programa erişim yetkiniz yok',
        },
        { status: 403 }
      );
    }

    // Get full program details
    const result = await getProgramUseCase.execute({ id: programId });

    if (result.isFailure) {
      const errorMessage = result.error?.message || 'Program alınamadı';
      const isNotFound = errorMessage.includes('bulunamadı');
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: isNotFound ? 404 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get consultant program error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Program alınamadı',
      },
      { status: 500 }
    );
  }
}
