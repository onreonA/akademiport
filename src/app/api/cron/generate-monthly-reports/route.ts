/**
 * POST /api/cron/generate-monthly-reports
 * Vercel Cron Job endpoint for generating monthly reports
 *
 * This endpoint should be called by Vercel Cron Jobs:
 * - Every month on the last day at 23:00: Generate monthly reports for all companies
 *
 * Authorization: Protected by Vercel Cron Secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { GenerateReportUseCase } from '@/2-application/use-cases/report';
import { SupabaseProgressReportRepository } from '@/4-infrastructure/database/repositories/SupabaseProgressReportRepository';
import { SupabaseReportTemplateRepository } from '@/4-infrastructure/database/repositories/SupabaseReportTemplateRepository';
import { ProjectRepository } from '@/4-infrastructure/database/repositories/ProjectRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { CompanyTrainingRepository } from '@/4-infrastructure/database/repositories/CompanyTrainingRepository';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { logger } from '@/5-shared/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Starting monthly reports generation cron job');

    // Get last month's period
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodYear = lastMonth.getFullYear();
    const periodMonth = lastMonth.getMonth() + 1; // 1-12

    logger.info(`Generating reports for period: ${periodYear}-${periodMonth}`);

    // Initialize repositories
    const reportRepository = new SupabaseProgressReportRepository();
    const templateRepository = new SupabaseReportTemplateRepository();
    const projectRepository = new ProjectRepository();
    const trainingRepository = new TrainingRepository();
    const companyTrainingRepository = new CompanyTrainingRepository();
    const ecommerceRepository = new SupabaseEcommerceRepository();
    const companyRepository = new CompanyRepository();

    // Initialize AI services
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
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

    // Get all active companies
    const companiesResult = await companyRepository.findWithFilters({
      isActive: true,
      page: 1,
      limit: 1000,
      sortBy: 'name',
      sortOrder: 'asc',
    });
    if (companiesResult.isFailure) {
      logger.error('Failed to get companies:', companiesResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get companies',
        },
        { status: 500 }
      );
    }

    const companies = companiesResult.value?.companies || [];
    logger.info(`Found ${companies.length} active companies`);

    const results = {
      total: companies.length,
      generated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ companyId: string; error: string }>,
    };

    // Generate report for each company
    for (const company of companies) {
      try {
        // Check if report already exists
        const existsResult = await reportRepository.existsMonthlyReport(
          company.id,
          company.programId,
          periodYear,
          periodMonth
        );

        if (existsResult.isSuccess && existsResult.value) {
          logger.info(`Report already exists for company ${company.id}, skipping`);
          results.skipped++;
          continue;
        }

        // Generate report
        const result = await generateReportUseCase.execute({
          reportType: 'monthly',
          companyId: company.id,
          programId: company.programId,
          periodYear,
          periodMonth,
          userId: undefined, // System generated
        });

        if (result.isFailure) {
          logger.error(`Failed to generate report for company ${company.id}:`, result.error);
          results.failed++;
          results.errors.push({
            companyId: company.id,
            error: result.error instanceof Error ? result.error.message : 'Unknown error',
          });
        } else {
          logger.info(`Successfully generated report for company ${company.id}`);
          results.generated++;
        }
      } catch (error) {
        logger.error(`Error generating report for company ${company.id}:`, error);
        results.failed++;
        results.errors.push({
          companyId: company.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info(
      `Monthly reports generation cron job completed: ${results.generated} generated, ${results.skipped} skipped, ${results.failed} failed`
    );

    return NextResponse.json({
      success: true,
      data: {
        period: { year: periodYear, month: periodMonth },
        ...results,
      },
    });
  } catch (error) {
    logger.error('Error in generate-monthly-reports cron job:', error);
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
