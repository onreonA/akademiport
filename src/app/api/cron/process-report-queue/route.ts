/**
 * POST /api/cron/process-report-queue
 * Vercel Cron Job endpoint for processing report generation queue
 *
 * This endpoint should be called by Vercel Cron Jobs:
 * - Every 5 minutes: Process pending report generation requests
 *
 * Authorization: Protected by Vercel Cron Secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.json({ message: 'Skipped during build' }, { status: 200 });
    }

    // Verify cron secret (Vercel sets this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Starting report generation queue processing cron job');

    // Lazy import to avoid build-time execution
    const { createClient } = await import('@/4-infrastructure/database/supabase-server');
    const { GenerateReportUseCase } = await import('@/2-application/use-cases/report');
    const { SupabaseProgressReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseProgressReportRepository'
    );
    const { SupabaseReportTemplateRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseReportTemplateRepository'
    );
    const { ProjectRepository } = await import(
      '@/4-infrastructure/database/repositories/ProjectRepository'
    );
    const { TrainingRepository } = await import(
      '@/4-infrastructure/database/repositories/TrainingRepository'
    );
    const { CompanyTrainingRepository } = await import(
      '@/4-infrastructure/database/repositories/CompanyTrainingRepository'
    );
    const { SupabaseEcommerceRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository'
    );
    const { AIRouterService } = await import('@/5-shared/services/ai/ai-router.service');
    const { PromptManagerService } = await import('@/5-shared/services/ai/prompt-manager.service');
    const { TokenTrackerService } = await import('@/5-shared/services/ai/token-tracker.service');

    const supabase = await createClient();

    // Get pending reports (limit 10 per run to avoid timeout)
    const { data: queueItems, error: queueError } = await supabase
      .from('report_generation_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (queueError) {
      logger.error('Failed to get queue items:', queueError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get queue items',
        },
        { status: 500 }
      );
    }

    if (!queueItems || queueItems.length === 0) {
      logger.info('No pending reports in queue');
      return NextResponse.json({
        success: true,
        data: {
          processed: 0,
          skipped: 0,
          failed: 0,
        },
      });
    }

    logger.info(`Found ${queueItems.length} pending reports in queue`);

    // Initialize repositories and services
    const reportRepository = new SupabaseProgressReportRepository();
    const templateRepository = new SupabaseReportTemplateRepository();
    const projectRepository = new ProjectRepository();
    const trainingRepository = new TrainingRepository();
    const companyTrainingRepository = new CompanyTrainingRepository();
    const ecommerceRepository = new SupabaseEcommerceRepository();

    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    const generateReportUseCase = new GenerateReportUseCase(
      reportRepository,
      templateRepository,
      projectRepository,
      trainingRepository,
      companyTrainingRepository,
      ecommerceRepository,
      aiRouter,
      promptManager,
      tokenTracker
    );

    const results = {
      processed: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ queueId: string; error: string }>,
    };

    // Process each queue item
    for (const item of queueItems) {
      try {
        // Mark as processing
        await supabase
          .from('report_generation_queue')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        // Generate report
        const result = await generateReportUseCase.execute({
          reportType: item.report_type,
          companyId: item.company_id,
          programId: item.program_id,
          projectId: item.project_id,
          subProjectId: item.sub_project_id,
          consultantId: item.consultant_id,
          periodYear: item.period_year,
          periodMonth: item.period_month,
          userId: undefined, // System generated
        });

        if (result.isFailure) {
          logger.error(`Failed to generate report for queue item ${item.id}:`, result.error);

          // Update queue item with error
          await supabase
            .from('report_generation_queue')
            .update({
              status: 'failed',
              error_message: result.error instanceof Error ? result.error.message : 'Unknown error',
              retry_count: (item.retry_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id);

          results.failed++;
          results.errors.push({
            queueId: item.id,
            error: result.error instanceof Error ? result.error.message : 'Unknown error',
          });
        } else {
          // Mark as completed
          await supabase
            .from('report_generation_queue')
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id);

          logger.info(`Successfully generated report for queue item ${item.id}`);
          results.processed++;
        }
      } catch (error) {
        logger.error(`Error processing queue item ${item.id}:`, error);

        // Update queue item with error
        await supabase
          .from('report_generation_queue')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            retry_count: (item.retry_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        results.failed++;
        results.errors.push({
          queueId: item.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info(
      `Report generation queue processing completed: ${results.processed} processed, ${results.skipped} skipped, ${results.failed} failed`
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('Error in process-report-queue cron job:', error);
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
