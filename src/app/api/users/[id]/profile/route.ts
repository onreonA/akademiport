/**
 * API Route: Update Profile
 *
 * PATCH /api/users/[id]/profile - Update user profile (self-service)
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { UpdateProfileUseCase } from '@/application/use-cases/user';

const userRepository = new UserRepository();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

/**
 * PATCH /api/users/[id]/profile
 * Update user profile (self-service)
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

    // Execute use case
    const result = await updateProfileUseCase.execute({
      userId,
      fullName: body.fullName,
      phone: body.phone,
      avatarUrl: body.avatarUrl,
      bio: body.bio,
      expertiseAreas: body.expertiseAreas,
      socialLinks: body.socialLinks,
      settings: body.settings,
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
        message: 'Profil başarıyla güncellendi',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Profil güncellenemedi',
      },
      { status: 500 }
    );
  }
}

