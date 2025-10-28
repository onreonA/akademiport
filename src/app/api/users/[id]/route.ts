/**
 * API Route: User by ID
 *
 * GET /api/users/[id] - Get user by ID
 * PATCH /api/users/[id] - Update user
 * DELETE /api/users/[id] - Delete user
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import {
  GetUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
} from '@/application/use-cases/user';
import { UserRole } from '@/domain/enums/UserRole';
import { requireAuth } from '@/infrastructure/api/helpers/auth';

const userRepository = new UserRepository();
const getUserUseCase = new GetUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);

/**
 * GET /api/users/[id]
 * Get a user by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // TODO: Get authenticated user from session (Sprint 5 - Faz H)
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Execute use case
    const result = await getUserUseCase.execute({
      id,
      userId,
      userRole,
    });

    if (result.isFailure) {
      const errorMessage = result.error?.message || result.error || 'Kullanıcı alınamadı';
      const isNotFound = typeof errorMessage === 'string' && errorMessage.includes('bulunamadı');
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
    console.error('Get user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanıcı alınamadı',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Update a user
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Get authenticated user from session (Sprint 5 - Faz H)
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Execute use case
    const result = await updateUserUseCase.execute({
      id,
      userId,
      userRole,
      ...body,
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
        message: 'Kullanıcı başarıyla güncellendi',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanıcı güncellenemedi',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Get authenticated user from session (Sprint 5 - Faz H)
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Execute use case
    const result = await deleteUserUseCase.execute({
      id,
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
        message: 'Kullanıcı başarıyla silindi',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanıcı silinemedi',
      },
      { status: 500 }
    );
  }
}

