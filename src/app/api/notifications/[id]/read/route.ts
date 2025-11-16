/**
 * Mark Notification As Read API Route
 *
 * PATCH /api/notifications/[id]/read - Mark notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { MarkNotificationAsReadUseCase } from '@/2-application/use-cases/notification/MarkNotificationAsReadUseCase';
import { SupabaseNotificationRepository } from '@/4-infrastructure/database/repositories/SupabaseNotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repository = new SupabaseNotificationRepository();
    const useCase = new MarkNotificationAsReadUseCase(repository);
    const result = await useCase.execute(id, user.id);

    if (result.isFailure) {
      logger.error('Failed to mark notification as read', {
        error: result.error,
        id,
        userId: user.id,
      });
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    }

    return NextResponse.json({ notification: result.value });
  } catch (error) {
    logger.error('PATCH /api/notifications/[id]/read error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
