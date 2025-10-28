/**
 * API Route: Remove User from Program
 *
 * DELETE /api/users/[id]/program/[programId] - Remove user from program
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { RemoveProgramUseCase } from '@/application/use-cases/user';
import { UserRole } from '@/domain/enums/UserRole';

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
    const userId = 'mock-user-id';
    const userRole = UserRole.MASTER_ADMIN;

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

