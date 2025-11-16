/**
 * Notifications API Route
 *
 * GET /api/notifications - Get user notifications
 * POST /api/notifications - Create notification (admin/internal)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetNotificationsUseCase } from '@/2-application/use-cases/notification/GetNotificationsUseCase';
import { CreateNotificationUseCase } from '@/2-application/use-cases/notification/CreateNotificationUseCase';
import { SupabaseNotificationRepository } from '@/4-infrastructure/database/repositories/SupabaseNotificationRepository';
import { SupabaseNotificationPreferencesRepository } from '@/4-infrastructure/database/repositories/SupabaseNotificationPreferencesRepository';
import { NotificationFilterDtoSchema } from '@/2-application/dtos/notification/NotificationFilterDto';
import { CreateNotificationDtoSchema } from '@/2-application/dtos/notification/CreateNotificationDto';
import { EmailService } from '@/5-shared/services/email/email.service';
import { PushNotificationService } from '@/5-shared/services/notification/push-notification.service';
import { SupabasePushSubscriptionRepository } from '@/4-infrastructure/database/repositories/SupabasePushSubscriptionRepository';
import { logger } from '@/5-shared/utils/logger';

/**
 * GET /api/notifications
 * Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = {
      userId: user.id,
      isRead:
        searchParams.get('isRead') === 'true'
          ? true
          : searchParams.get('isRead') === 'false'
            ? false
            : undefined,
      type: searchParams.get('type') || undefined,
      priority: searchParams.get('priority') || undefined,
      limit: parseInt(searchParams.get('limit') || '20', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
      orderBy: (searchParams.get('orderBy') || 'created_at') as 'created_at' | 'priority' | 'type',
      orderDirection: (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc',
    };

    // Validate filter
    const validationResult = NotificationFilterDtoSchema.safeParse(filter);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const repository = new SupabaseNotificationRepository();
    const useCase = new GetNotificationsUseCase(repository);
    const result = await useCase.execute(validationResult.data);

    if (result.isFailure) {
      logger.error('Failed to get notifications', { error: result.error, userId: user.id });
      return NextResponse.json({ error: 'Failed to get notifications' }, { status: 500 });
    }

    return NextResponse.json({ notifications: result.value });
  } catch (error) {
    logger.error('GET /api/notifications error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Create notification (admin/internal use)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can create notifications via API
    // For user-triggered notifications, use specific endpoints
    const body = await request.json();
    const validationResult = CreateNotificationDtoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid notification data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const notificationRepository = new SupabaseNotificationRepository();
    const preferencesRepository = new SupabaseNotificationPreferencesRepository();
    const emailService = new EmailService();
    const pushSubscriptionRepository = new SupabasePushSubscriptionRepository();
    const pushNotificationService = new PushNotificationService(pushSubscriptionRepository);

    const useCase = new CreateNotificationUseCase(
      notificationRepository,
      preferencesRepository,
      emailService,
      pushNotificationService
    );

    const result = await useCase.execute(validationResult.data);

    if (result.isFailure) {
      logger.error('Failed to create notification', {
        error: result.error,
        dto: validationResult.data,
      });
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json({ notification: result.value }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/notifications error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
