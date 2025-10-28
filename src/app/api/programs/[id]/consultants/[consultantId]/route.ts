/**
 * API Route: Remove Consultant from Program
 *
 * DELETE /api/programs/[id]/consultants/[consultantId] - Remove consultant from program
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { ManageConsultantsUseCase } from '@/application/use-cases/program';
import { UserRole } from '@/domain/enums/UserRole';

const programRepository = new ProgramRepository();
const manageConsultantsUseCase = new ManageConsultantsUseCase(programRepository);

/**
 * DELETE /api/programs/[id]/consultants/[consultantId]
 * Remove a consultant from a program
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; consultantId: string }> }
) {
  try {
    const { id: programId, consultantId } = await params;

    // TODO: Get authenticated user from session (Sprint 5)
    // For now, we'll use mock data
    const userId = 'mock-user-id';
    const userRole = UserRole.MASTER_ADMIN;

    // Execute use case
    const result = await manageConsultantsUseCase.removeConsultant({
      programId,
      consultantId,
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
        message: 'Danışman başarıyla çıkarıldı',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove consultant error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Danışman çıkarılırken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

