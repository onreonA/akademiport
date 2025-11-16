/**
 * Email Queue Processor Cron Job
 *
 * GET /api/cron/email-queue-processor
 * Processes pending and scheduled emails in the queue
 * Should be called every minute via Vercel Cron or external scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailQueueService } from '@/5-shared/services/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (if using Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queueService = new EmailQueueService();

    // Process pending emails
    const pendingResult = await queueService.processQueue();
    const pendingProcessed = pendingResult.isSuccess ? pendingResult.value : 0;

    // Process scheduled emails
    const scheduledResult = await queueService.processScheduled();
    const scheduledProcessed = scheduledResult.isSuccess ? scheduledResult.value : 0;

    // Retry failed emails
    const retryResult = await queueService.retryFailed();
    const retried = retryResult.isSuccess ? retryResult.value : 0;

    return NextResponse.json({
      success: true,
      processed: {
        pending: pendingProcessed,
        scheduled: scheduledProcessed,
        retried,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Email queue processor error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
