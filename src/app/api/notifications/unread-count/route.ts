/**
 * Unread Notification Count API Route
 *
 * GET /api/notifications/unread-count - Get unread notification count
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetUnreadNotificationCountUseCase } from '@/2-application/use-cases/notification/GetUnreadNotificationCountUseCase';
import { SupabaseNotificationRepository } from '@/4-infrastructure/database/repositories/SupabaseNotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new SupabaseNotificationRepository();
    const useCase = new GetUnreadNotificationCountUseCase(repository);
    const result = await useCase.execute(user.id);

    if (result.isFailure) {
      logger.error('Failed to get unread count', { error: result.error, userId: user.id });
      return NextResponse.json({ error: 'Failed to get unread count' }, { status: 500 });
    }

    return NextResponse.json({ count: result.value });
  } catch (error) {
    logger.error('GET /api/notifications/unread-count error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
