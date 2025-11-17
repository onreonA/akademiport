/**
 * GET /api/reports
 *
 * Raporları listeler ve filtreler
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetReportsUseCase } from '@/2-application/use-cases/report';
import { SupabaseProgressReportRepository } from '@/4-infrastructure/database/repositories/SupabaseProgressReportRepository';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest) {
  try {
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
