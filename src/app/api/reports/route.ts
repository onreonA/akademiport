/**
 * GET /api/reports
 *
 * Raporları listeler ve filtreler
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';
import type { AppError } from '@/6-core/errors/AppError';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.json(
        { success: true, data: [], pagination: { total: 0, limit: 50, offset: 0 } },
        { status: 200 }
      );
    }

    // Lazy import to avoid build-time execution
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { GetReportsUseCase } = await import('@/2-application/use-cases/report');
    const { SupabaseProgressReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseProgressReportRepository'
    );
    const { AppError } = await import('@/6-core/errors/AppError');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const companyId = searchParams.get('companyId') || undefined;
    const programId = searchParams.get('programId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const subProjectId = searchParams.get('subProjectId') || undefined;
    const consultantId = searchParams.get('consultantId') || undefined;
    const reportType = searchParams.get('reportType') || undefined;
    const status = searchParams.get('status') || undefined;
    const periodYear = searchParams.get('periodYear')
      ? parseInt(searchParams.get('periodYear')!)
      : undefined;
    const periodMonth = searchParams.get('periodMonth')
      ? parseInt(searchParams.get('periodMonth')!)
      : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Initialize repository
    const reportRepository = new SupabaseProgressReportRepository();

    // Create use case
    const useCase = new GetReportsUseCase(reportRepository);

    // Execute
    const result = await useCase.execute({
      companyId,
      programId,
      projectId,
      subProjectId,
      consultantId: consultantId || (user.role === 'consultant' ? user.id : undefined),
      reportType: reportType as any,
      status: status as any,
      periodYear,
      periodMonth,
      limit,
      offset,
    });

    if (result.isFailure) {
      logger.error('Failed to get reports:', result.error);
      return NextResponse.json(
        {
          error: result.error instanceof AppError ? result.error.message : 'Failed to get reports',
        },
        { status: result.error instanceof AppError ? result.error.statusCode : 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value.reports,
        pagination: {
          total: result.value.total,
          limit,
          offset,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in GET /api/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
