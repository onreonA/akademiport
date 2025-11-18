/**
 * Custom Reports API Routes
 *
 * GET /api/custom-reports - List custom reports
 * POST /api/custom-reports - Create custom report
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import {
  CreateCustomReportUseCase,
  ListCustomReportsUseCase,
} from '@/2-application/use-cases/custom-report';
import { SupabaseCustomReportRepository } from '@/4-infrastructure/database/repositories/SupabaseCustomReportRepository';
import { CustomReportFilterDto, CreateCustomReportDto } from '@/3-domain/entities/CustomReport';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filter: CustomReportFilterDto = {
      userId: searchParams.get('userId') || undefined,
      programId: searchParams.get('programId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      reportType: (searchParams.get('reportType') as any) || undefined,
      status: (searchParams.get('status') as any) || undefined,
      isScheduled:
        searchParams.get('isScheduled') === 'true'
          ? true
          : searchParams.get('isScheduled') === 'false'
            ? false
            : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const repository = new SupabaseCustomReportRepository();
    const useCase = new ListCustomReportsUseCase(repository);
    const isAdmin = user.role === 'master_admin' || user.role === 'program_manager';

    const result = await useCase.execute(filter, user.id, isAdmin);

    if (result.isFailure) {
      logger.error('List custom reports failed:', result.error);
      return NextResponse.json(
        { error: result.error?.message || "Custom report'lar alınamadı" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error: any) {
    logger.error('List custom reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: result.error?.message || 'Custom report oluşturulamadı' },
        {
          status:
            result.error instanceof Error && 'statusCode' in result.error
              ? (result.error as any).statusCode
              : 500,
        }
      );
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error: any) {
    logger.error('Create custom report error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
