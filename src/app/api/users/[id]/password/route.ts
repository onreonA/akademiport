/**
 * API Route: Change Password
 *
 * PATCH /api/users/[id]/password - Change user password
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { ChangePasswordUseCase } from '@/application/use-cases/user';
import { AuthService } from '@/application/services/auth.service';

const userRepository = new UserRepository();
const changePasswordUseCase = new ChangePasswordUseCase(userRepository);

/**
 * PATCH /api/users/[id]/password
 * Change user password
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Get authenticated user from session (Sprint 5 - Faz H)
    // For now, we'll use the id from params
    const userId = id;

    // Validate request using use case
    const validationResult = await changePasswordUseCase.execute({
      userId,
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
      confirmPassword: body.confirmPassword,
    });

    if (validationResult.isFailure) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
        },
        { status: 400 }
      );
    }

    // Update password through AuthService (Supabase Auth)
    const updateResult = await AuthService.updatePassword(body.newPassword);

    if (updateResult.isFailure) {
      return NextResponse.json(
        {
          success: false,
          error: updateResult.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Şifre başarıyla değiştirildi',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Şifre değiştirilemedi',
      },
      { status: 500 }
    );
  }
}

