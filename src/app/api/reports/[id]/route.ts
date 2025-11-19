/**
 * GET /api/reports/[id]
 *
 * Tek bir raporu getirir
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';
import type { AppError } from '@/6-core/errors/AppError';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.json({ success: false, error: 'Skipped during build' }, { status: 200 });
    }

    // Lazy import to avoid build-time execution
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { GetReportUseCase } = await import('@/2-application/use-cases/report');
    const { SupabaseProgressReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseProgressReportRepository'
    );
    const { AppError } = await import('@/6-core/errors/AppError');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Initialize repository
    const reportRepository = new SupabaseProgressReportRepository();

    // Create use case
    const useCase = new GetReportUseCase(reportRepository);

    // Execute
    const result = await useCase.execute(id);

    if (result.isFailure) {
      logger.error('Failed to get report:', result.error);
      return NextResponse.json(
        {
          error: result.error instanceof AppError ? result.error.message : 'Failed to get report',
        },
        { status: result.error instanceof AppError ? result.error.statusCode : 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in GET /api/reports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
