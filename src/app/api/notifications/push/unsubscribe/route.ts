/**
 * Unsubscribe From Push Notifications API Route
 *
 * DELETE /api/notifications/push/unsubscribe - Unsubscribe from push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { UnsubscribeFromPushNotificationsUseCase } from '@/2-application/use-cases/notification/UnsubscribeFromPushNotificationsUseCase';
import { SupabasePushSubscriptionRepository } from '@/4-infrastructure/database/repositories/SupabasePushSubscriptionRepository';
import { logger } from '@/5-shared/utils/logger';

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint') || undefined;

    const repository = new SupabasePushSubscriptionRepository();
    const useCase = new UnsubscribeFromPushNotificationsUseCase(repository);
    const result = await useCase.execute(user.id, endpoint);

    if (result.isFailure) {
      logger.error('Failed to unsubscribe from push notifications', {
        error: result.error,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Failed to unsubscribe from push notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/notifications/push/unsubscribe error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
