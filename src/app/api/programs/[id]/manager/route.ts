/**
 * API Route: Assign Program Manager
 *
 * POST /api/programs/[id]/manager - Assign a manager to a program
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { AssignManagerUseCase } from '@/application/use-cases/program';
import { UserRole } from '@/domain/enums/UserRole';

const programRepository = new ProgramRepository();
const assignManagerUseCase = new AssignManagerUseCase(programRepository);

/**
 * POST /api/programs/[id]/manager
 * Assign a manager to a program
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params;
    const body = await request.json();

    // TODO: Get authenticated user from session (Sprint 5)
    // For now, we'll use mock data
    const userId = 'mock-user-id';
    const userRole = UserRole.MASTER_ADMIN;

    // Validate request body
    if (!body.managerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Yönetici ID zorunludur',
        },
        { status: 400 }
      );
    }

    // Execute use case
    const result = await assignManagerUseCase.execute({
      programId,
      managerId: body.managerId,
      userId,
      userRole,
    });

    if (result.isFailure) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
        message: 'Yönetici başarıyla atandı',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assign manager error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Yönetici atanırken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

