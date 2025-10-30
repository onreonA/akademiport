/**
 * API Route: Assign Role
 *
 * POST /api/users/[id]/role - Assign role to user
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { AssignRoleUseCase } from '@/application/use-cases/user';
import { UserRole } from '@/domain/enums/UserRole';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';

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
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

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
