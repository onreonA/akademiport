/**
 * POST /api/reports/generate
 *
 * AI destekli rapor oluşturur
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';
import type { AppError } from '@/6-core/errors/AppError';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.json({ error: 'Skipped during build' }, { status: 200 });
    }

    // Lazy import to avoid build-time execution
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
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
    const { AppError } = await import('@/6-core/errors/AppError');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant, program_manager, and master_admin can generate reports
    if (
      user.role !== 'consultant' &&
      user.role !== 'program_manager' &&
      user.role !== 'master_admin'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.reportType || typeof body.reportType !== 'string') {
      return NextResponse.json(
        { error: 'reportType is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate monthly report period
    if (body.reportType === 'monthly') {
      if (!body.periodYear || !body.periodMonth) {
        return NextResponse.json(
          { error: 'periodYear and periodMonth are required for monthly reports' },
          { status: 400 }
        );
      }
    }

    // Initialize repositories
    const reportRepository = new SupabaseProgressReportRepository();
    const templateRepository = new SupabaseReportTemplateRepository();
    const projectRepository = new ProjectRepository();
    const trainingRepository = new TrainingRepository();
    const companyTrainingRepository = new CompanyTrainingRepository();
    const ecommerceRepository = new SupabaseEcommerceRepository();

    // Initialize AI services
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new GenerateReportUseCase(
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

    // Execute
    const result = await useCase.execute({
      reportType: body.reportType,
      companyId: body.companyId,
      programId: body.programId,
      projectId: body.projectId,
      subProjectId: body.subProjectId,
      consultantId: body.consultantId || user.id,
      periodYear: body.periodYear,
      periodMonth: body.periodMonth,
      templateId: body.templateId,
      userId: user.id,
    });

    if (result.isFailure) {
      logger.error('Failed to generate report:', result.error);
      return NextResponse.json(
        {
          error:
            result.error instanceof AppError ? result.error.message : 'Failed to generate report',
        },
        { status: result.error instanceof AppError ? result.error.statusCode : 500 }
      );
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in POST /api/reports/generate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
