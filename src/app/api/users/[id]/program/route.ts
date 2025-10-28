/**
 * API Route: User Programs
 *
 * POST /api/users/[id]/program - Assign user to program
 * GET /api/users/[id]/program - Get user's programs
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { AssignProgramUseCase } from '@/application/use-cases/user';
import { UserRole } from '@/domain/enums/UserRole';

const userRepository = new UserRepository();
const programRepository = new ProgramRepository();
const assignProgramUseCase = new AssignProgramUseCase(userRepository, programRepository);

/**
 * POST /api/users/[id]/program
 * Assign a user to a program
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Get authenticated user from session (Sprint 5 - Faz H)
    const userId = 'mock-user-id';
    const userRole = UserRole.MASTER_ADMIN;

    // Execute use case
    const result = await assignProgramUseCase.execute({
      userId: id,
      programId: body.programId,
      roleInProgram: body.roleInProgram,
      isActive: body.isActive,
      assignedBy: userId,
      assignerRole: userRole,
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
        message: 'Kullanıcı programa başarıyla atandı',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assign program error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Program ataması yapılamadı',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[id]/program
 * Get user's programs
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get user's programs
    const result = await userRepository.getPrograms(id);

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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get programs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Programlar alınamadı',
      },
      { status: 500 }
    );
  }
}

