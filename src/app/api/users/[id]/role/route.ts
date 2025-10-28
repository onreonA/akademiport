/**
 * API Route: Assign Role
 *
 * POST /api/users/[id]/role - Assign role to user
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { AssignRoleUseCase } from '@/application/use-cases/user';
import { UserRole } from '@/domain/enums/UserRole';

const userRepository = new UserRepository();
const assignRoleUseCase = new AssignRoleUseCase(userRepository);

/**
 * POST /api/users/[id]/role
 * Assign a role to a user
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Get authenticated user from session (Sprint 5 - Faz H)
    const userId = 'mock-user-id';
    const userRole = UserRole.MASTER_ADMIN;

    // Execute use case
    const result = await assignRoleUseCase.execute({
      userId: id,
      newRole: body.newRole,
      reason: body.reason,
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
        data: result.value,
        message: 'Rol başarıyla atandı',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assign role error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Rol ataması yapılamadı',
      },
      { status: 500 }
    );
  }
}

