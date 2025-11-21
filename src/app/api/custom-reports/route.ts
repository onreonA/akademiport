/**
 * Custom Reports API Routes
 *
 * GET /api/custom-reports - List custom reports
 * POST /api/custom-reports - Create custom report
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';
import type {
  CustomReportFilterDto,
  CreateCustomReportDto,
  CustomReportType,
  CustomReportStatus,
} from '@/3-domain/entities/CustomReport';
import { AppError } from '@/6-core/errors/AppError';

export async function GET(request: NextRequest) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.json({ reports: [], total: 0, page: 1, limit: 10 }, { status: 200 });
    }

    // Lazy import to avoid build-time execution
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { ListCustomReportsUseCase } = await import('@/2-application/use-cases/custom-report');
    const { SupabaseCustomReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseCustomReportRepository'
    );

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reportTypeParam = searchParams.get('reportType');
    const statusParam = searchParams.get('status');
    const sortByParam = searchParams.get('sortBy');

    const validReportTypes: CustomReportType[] = ['dashboard', 'company', 'program', 'custom'];
    const validStatuses: CustomReportStatus[] = ['draft', 'saved', 'scheduled', 'archived'];
    const validSortBy: Array<CustomReportFilterDto['sortBy']> = [
      'name',
      'createdAt',
      'updatedAt',
      'lastGeneratedAt',
    ];

    const filter: CustomReportFilterDto = {
      userId: searchParams.get('userId') || undefined,
      programId: searchParams.get('programId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      reportType:
        reportTypeParam && validReportTypes.includes(reportTypeParam as CustomReportType)
          ? (reportTypeParam as CustomReportType)
          : undefined,
      status:
        statusParam && validStatuses.includes(statusParam as CustomReportStatus)
          ? (statusParam as CustomReportStatus)
          : undefined,
      isScheduled:
        searchParams.get('isScheduled') === 'true'
          ? true
          : searchParams.get('isScheduled') === 'false'
            ? false
            : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy:
        sortByParam && validSortBy.includes(sortByParam as CustomReportFilterDto['sortBy'])
          ? (sortByParam as CustomReportFilterDto['sortBy'])
          : 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const repository = new SupabaseCustomReportRepository();
    const useCase = new ListCustomReportsUseCase(repository);
    const isAdmin = user.role === 'master_admin' || user.role === 'program_manager';

    const result = await useCase.execute(filter, user.id, isAdmin);

    if (result.isFailure) {
      logger.error('List custom reports failed:', result.error);
      const error =
        result.error instanceof AppError
          ? result.error
          : new AppError("Custom report'lar alınamadı", 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    logger.error('List custom reports error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

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
    const { CreateCustomReportUseCase } = await import('@/2-application/use-cases/custom-report');
    const { SupabaseCustomReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseCustomReportRepository'
    );

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'name is required and must be a string' }, { status: 400 });
    }

    if (!body.reportType || typeof body.reportType !== 'string') {
      return NextResponse.json(
        { error: 'reportType is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.selectedMetrics || !Array.isArray(body.selectedMetrics)) {
      return NextResponse.json(
        { error: 'selectedMetrics is required and must be an array' },
        { status: 400 }
      );
    }

    if (!body.dateRangeType || typeof body.dateRangeType !== 'string') {
      return NextResponse.json(
        { error: 'dateRangeType is required and must be a string' },
        { status: 400 }
      );
    }

    const dto: CreateCustomReportDto = {
      name: body.name,
      description: body.description || null,
      programId: body.programId || null,
      companyId: body.companyId || null,
      reportType: body.reportType,
      templateId: body.templateId || null,
      selectedMetrics: body.selectedMetrics,
      dateRangeStart: body.dateRangeStart ? new Date(body.dateRangeStart) : null,
      dateRangeEnd: body.dateRangeEnd ? new Date(body.dateRangeEnd) : null,
      dateRangeType: body.dateRangeType,
      filters: body.filters || {},
      isScheduled: body.isScheduled || false,
      scheduleCron: body.scheduleCron || null,
      scheduleTimezone: body.scheduleTimezone || 'Europe/Istanbul',
      metadata: body.metadata || {},
    };

    const repository = new SupabaseCustomReportRepository();
    const useCase = new CreateCustomReportUseCase(repository);

    const result = await useCase.execute(dto, user.id);

    if (result.isFailure) {
      logger.error('Create custom report failed:', result.error);
      const error =
        result.error instanceof AppError
          ? result.error
          : new AppError('Custom report oluşturulamadı', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    logger.error('Create custom report error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
