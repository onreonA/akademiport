import { NextRequest, NextResponse } from 'next/server';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { SendMonthlyEcommerceReminderUseCase } from '@/2-application/use-cases/ecommerce/SendMonthlyEcommerceReminderUseCase';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

/**
 * POST /api/cron/ecommerce-monthly-reminder
 * Vercel Cron Job endpoint for sending monthly e-commerce metrics reminders
 *
 * This endpoint should be called by Vercel Cron Jobs:
 * - Every month on the 1st at 09:00: Remind companies to enter last month's metrics
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

    logger.info('Starting monthly e-commerce metrics reminder cron job');

    const ecommerceRepository = new SupabaseEcommerceRepository();
    const companyRepository = new CompanyRepository();
    const userRepository = new UserRepository();

    const sendReminderUseCase = new SendMonthlyEcommerceReminderUseCase(
      ecommerceRepository,
      companyRepository,
      userRepository
    );

    const result = await sendReminderUseCase.execute();

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      logger.error('Failed to send monthly reminders:', error);
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
      `Monthly e-commerce reminder cron job completed: ${data.companiesNotified} notified, ${data.companiesSkipped} skipped, ${data.errors.length} errors`
    );

    return NextResponse.json({
      success: true,
      data: {
        companiesNotified: data.companiesNotified,
        companiesSkipped: data.companiesSkipped,
        errors: data.errors,
      },
    });
  } catch (error) {
    logger.error('Error in monthly e-commerce reminder cron job:', error);
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
