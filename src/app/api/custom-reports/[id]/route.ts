/**
 * Custom Report API Routes
 *
 * GET /api/custom-reports/[id] - Get custom report
 * PUT /api/custom-reports/[id] - Update custom report
 * DELETE /api/custom-reports/[id] - Delete custom report
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';
import type { UpdateCustomReportDto } from '@/3-domain/entities/CustomReport';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { GetCustomReportUseCase } = await import('@/2-application/use-cases/custom-report');
    const { SupabaseCustomReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseCustomReportRepository'
    );

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repository = new SupabaseCustomReportRepository();
    const useCase = new GetCustomReportUseCase(repository);
    const isAdmin = user.role === 'master_admin' || user.role === 'program_manager';

    const result = await useCase.execute(id, user.id, isAdmin);

    if (result.isFailure) {
      logger.error('Get custom report failed:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Custom report bulunamadı' },
        {
          status:
            result.error instanceof Error && 'statusCode' in result.error
              ? (result.error as any).statusCode
              : 404,
        }
      );
    }

    return NextResponse.json(result.value);
  } catch (error: any) {
    logger.error('Get custom report error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { UpdateCustomReportUseCase } = await import('@/2-application/use-cases/custom-report');
    const { SupabaseCustomReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseCustomReportRepository'
    );

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const dto: UpdateCustomReportDto = {
      name: body.name,
      description: body.description,
      programId: body.programId,
      companyId: body.companyId,
      reportType: body.reportType,
      templateId: body.templateId,
      selectedMetrics: body.selectedMetrics,
      dateRangeStart: body.dateRangeStart ? new Date(body.dateRangeStart) : undefined,
      dateRangeEnd: body.dateRangeEnd ? new Date(body.dateRangeEnd) : undefined,
      dateRangeType: body.dateRangeType,
      filters: body.filters,
      isScheduled: body.isScheduled,
      scheduleCron: body.scheduleCron,
      scheduleTimezone: body.scheduleTimezone,
      status: body.status,
      metadata: body.metadata,
    };

    const repository = new SupabaseCustomReportRepository();
    const useCase = new UpdateCustomReportUseCase(repository);

    const result = await useCase.execute(id, dto, user.id);

    if (result.isFailure) {
      logger.error('Update custom report failed:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Custom report güncellenemedi' },
        {
          status:
            result.error instanceof Error && 'statusCode' in result.error
              ? (result.error as any).statusCode
              : 500,
        }
      );
    }

    return NextResponse.json(result.value);
  } catch (error: any) {
    logger.error('Update custom report error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { DeleteCustomReportUseCase } = await import('@/2-application/use-cases/custom-report');
    const { SupabaseCustomReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseCustomReportRepository'
    );

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repository = new SupabaseCustomReportRepository();
    const useCase = new DeleteCustomReportUseCase(repository);

    const result = await useCase.execute(id, user.id);

    if (result.isFailure) {
      logger.error('Delete custom report failed:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Custom report silinemedi' },
        {
          status:
            result.error instanceof Error && 'statusCode' in result.error
              ? (result.error as any).statusCode
              : 500,
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Delete custom report error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
