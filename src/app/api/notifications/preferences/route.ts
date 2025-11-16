/**
 * Notification Preferences API Route
 *
 * GET /api/notifications/preferences - Get user preferences
 * PATCH /api/notifications/preferences - Update user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { UpdateNotificationPreferencesUseCase } from '@/2-application/use-cases/notification/UpdateNotificationPreferencesUseCase';
import { SupabaseNotificationPreferencesRepository } from '@/4-infrastructure/database/repositories/SupabaseNotificationPreferencesRepository';
import { UpdateNotificationPreferencesDtoSchema } from '@/2-application/dtos/notification/UpdateNotificationPreferencesDto';
import { logger } from '@/5-shared/utils/logger';

/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new SupabaseNotificationPreferencesRepository();
    const result = await repository.findByUserId(user.id);

    if (result.isFailure) {
      logger.error('Failed to get notification preferences', {
        error: result.error,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Failed to get notification preferences' },
        { status: 500 }
      );
    }

    // Return default preferences if not found
    if (!result.value) {
      const { createDefaultNotificationPreferences } = await import(
        '@/3-domain/entities/NotificationPreferences'
      );
      return NextResponse.json({ preferences: createDefaultNotificationPreferences(user.id) });
    }

    return NextResponse.json({ preferences: result.value });
  } catch (error) {
    logger.error('GET /api/notifications/preferences error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications/preferences
 * Update user notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = UpdateNotificationPreferencesDtoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const repository = new SupabaseNotificationPreferencesRepository();
    const useCase = new UpdateNotificationPreferencesUseCase(repository);
    const result = await useCase.execute(user.id, validationResult.data);

    if (result.isFailure) {
      logger.error('Failed to update notification preferences', {
        error: result.error,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Failed to update notification preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ preferences: result.value });
  } catch (error) {
    logger.error('PATCH /api/notifications/preferences error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
