/**
 * Notification API Route
 *
 * DELETE /api/notifications/[id] - Delete notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { DeleteNotificationUseCase } from '@/2-application/use-cases/notification/DeleteNotificationUseCase';
import { SupabaseNotificationRepository } from '@/4-infrastructure/database/repositories/SupabaseNotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repository = new SupabaseNotificationRepository();
    const useCase = new DeleteNotificationUseCase(repository);
    const result = await useCase.execute(id, user.id);

    if (result.isFailure) {
      logger.error('Failed to delete notification', { error: result.error, id, userId: user.id });
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/notifications/[id] error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
