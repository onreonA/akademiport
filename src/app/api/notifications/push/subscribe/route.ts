/**
 * Subscribe To Push Notifications API Route
 *
 * POST /api/notifications/push/subscribe - Subscribe to push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { SubscribeToPushNotificationsUseCase } from '@/2-application/use-cases/notification/SubscribeToPushNotificationsUseCase';
import { SupabasePushSubscriptionRepository } from '@/4-infrastructure/database/repositories/SupabasePushSubscriptionRepository';
import { PushSubscriptionDtoSchema } from '@/2-application/dtos/notification/PushSubscriptionDto';
import { logger } from '@/5-shared/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = PushSubscriptionDtoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const repository = new SupabasePushSubscriptionRepository();
    const useCase = new SubscribeToPushNotificationsUseCase(repository);
    const result = await useCase.execute(user.id, validationResult.data);

    if (result.isFailure) {
      logger.error('Failed to subscribe to push notifications', {
        error: result.error,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Failed to subscribe to push notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ subscription: result.value }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/notifications/push/subscribe error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
