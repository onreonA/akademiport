import { NextRequest, NextResponse } from 'next/server';
import { EventRepository } from '@/infrastructure/database/repositories/EventRepository';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { ReminderRepository } from '@/infrastructure/database/repositories/ReminderRepository';
import { SendEventRemindersUseCase } from '@/application/use-cases/event/SendEventRemindersUseCase';
import { logger } from '@/shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

const eventRepository = new EventRepository();
const userRepository = new UserRepository();
const programRepository = new ProgramRepository();
const reminderRepository = new ReminderRepository();

/**
 * POST /api/cron/send-event-reminders
 * Vercel Cron Job endpoint for sending event reminders
 *
 * This endpoint should be called by Vercel Cron Jobs:
 * - Every hour: Check for events starting in 1 hour
 * - Every day at 09:00: Check for events starting in 24 hours
 *
 * Authorization: Protected by Vercel Cron Secret
 */

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get reminder type from query params or default to 1hour
    const { searchParams } = new URL(request.url);
    const reminderType = (searchParams.get('type') || '1hour') as '24hours' | '1hour';

    logger.info(`Starting event reminders cron job (type: ${reminderType})`);

    const sendRemindersUseCase = new SendEventRemindersUseCase(
      eventRepository,
      userRepository,
      programRepository,
      reminderRepository
    );

    const result = await sendRemindersUseCase.execute(reminderType);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      logger.error('Failed to send event reminders:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.statusCode }
      );
    }

    const data = result.value;

    logger.info(
      `Event reminders cron job completed: ${data.remindersSent} sent, ${data.remindersFailed} failed, ${data.eventsProcessed} events processed`
    );

    return NextResponse.json({
      success: true,
      data: {
        eventsProcessed: data.eventsProcessed,
        remindersSent: data.remindersSent,
        remindersFailed: data.remindersFailed,
        errors: data.errors,
      },
    });
  } catch (error) {
    logger.error('Error in send-event-reminders cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
