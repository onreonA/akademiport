import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/infrastructure/database/repositories/AppointmentRepository';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { ReminderRepository } from '@/infrastructure/database/repositories/ReminderRepository';
import { SendAppointmentRemindersUseCase } from '@/application/use-cases/appointment/SendAppointmentRemindersUseCase';
import { logger } from '@/shared/utils/logger';

const appointmentRepository = new AppointmentRepository();
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const reminderRepository = new ReminderRepository();

/**
 * POST /api/cron/send-appointment-reminders
 * Vercel Cron Job endpoint for sending appointment reminders
 *
 * This endpoint should be called by Vercel Cron Jobs:
 * - Every hour: Check for appointments starting in 1 hour
 * - Every day at 09:00: Check for appointments starting in 24 hours
 *
 * Authorization: Protected by Vercel Cron Secret
 */
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

    logger.info(`Starting appointment reminders cron job (type: ${reminderType})`);

    const sendRemindersUseCase = new SendAppointmentRemindersUseCase(
      appointmentRepository,
      userRepository,
      companyRepository,
      reminderRepository
    );

    const result = await sendRemindersUseCase.execute(reminderType);

    if (result.isFailure) {
      logger.error('Failed to send appointment reminders:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: (result.error as any)?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    const data = result.value;

    logger.info(
      `Appointment reminders cron job completed: ${data.remindersSent} sent, ${data.remindersFailed} failed, ${data.appointmentsProcessed} appointments processed`
    );

    return NextResponse.json({
      success: true,
      data: {
        appointmentsProcessed: data.appointmentsProcessed,
        remindersSent: data.remindersSent,
        remindersFailed: data.remindersFailed,
        errors: data.errors,
      },
    });
  } catch (error) {
    logger.error('Error in send-appointment-reminders cron job:', error);
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
