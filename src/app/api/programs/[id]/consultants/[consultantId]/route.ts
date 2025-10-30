/**
 * API Route: Remove Consultant from Program
 *
 * DELETE /api/programs/[id]/consultants/[consultantId] - Remove consultant from program
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/4-infrastructure/database/repositories/ProgramRepository';
import { ManageConsultantsUseCase } from '@/application/use-cases/program';
import { UserRole } from '@/domain/enums/UserRole';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';

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

    // Get authenticated user
    
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

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

