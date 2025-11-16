/**
 * Mark All Notifications As Read API Route
 *
 * PATCH /api/notifications/read-all - Mark all notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { MarkAllNotificationsAsReadUseCase } from '@/2-application/use-cases/notification/MarkAllNotificationsAsReadUseCase';
import { SupabaseNotificationRepository } from '@/4-infrastructure/database/repositories/SupabaseNotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new SupabaseNotificationRepository();
    const useCase = new MarkAllNotificationsAsReadUseCase(repository);
    const result = await useCase.execute(user.id);

    if (result.isFailure) {
      logger.error('Failed to mark all notifications as read', {
        error: result.error,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: result.value });
  } catch (error) {
    logger.error('PATCH /api/notifications/read-all error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
