/**
 * API Route: Remove User from Program
 *
 * DELETE /api/users/[id]/program/[programId] - Remove user from program
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { ProgramRepository } from '@/4-infrastructure/database/repositories/ProgramRepository';
import { RemoveProgramUseCase } from '@/application/use-cases/user';
import { UserRole } from '@/domain/enums/UserRole';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';

const userRepository = new UserRepository();
const programRepository = new ProgramRepository();
const removeProgramUseCase = new RemoveProgramUseCase(userRepository, programRepository);

/**
 * DELETE /api/users/[id]/program/[programId]
 * Remove a user from a program
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const { id, programId } = await params;

    // TODO: Get authenticated user from session (Sprint 5 - Faz H)
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Execute use case
    const result = await removeProgramUseCase.execute({
      userId: id,
      programId,
      removedBy: userId,
      removerRole: userRole,
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
        message: 'Kullanıcı programdan başarıyla çıkarıldı',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove program error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Program ataması kaldırılamadı',
      },
      { status: 500 }
    );
  }
}
