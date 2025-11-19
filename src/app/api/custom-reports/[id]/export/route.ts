/**
 * Custom Report Export API Route
 *
 * GET /api/custom-reports/[id]/export?format=pdf|excel|csv
 * Custom report'u export eder
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

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
    const { GetDashboardStatsUseCase } = await import(
      '@/2-application/use-cases/analytics/GetDashboardStatsUseCase'
    );
    const { GetConsultantDashboardStatsUseCase } = await import(
      '@/2-application/use-cases/analytics/GetConsultantDashboardStatsUseCase'
    );
    const { GetCompanyDashboardStatsUseCase } = await import(
      '@/2-application/use-cases/analytics/GetCompanyDashboardStatsUseCase'
    );
    const { UserRepository } = await import(
      '@/4-infrastructure/database/repositories/UserRepository'
    );
    const { CompanyRepository } = await import(
      '@/4-infrastructure/database/repositories/CompanyRepository'
    );
    const { ProgramRepository } = await import(
      '@/4-infrastructure/database/repositories/ProgramRepository'
    );
    const { ProjectRepository } = await import(
      '@/4-infrastructure/database/repositories/ProjectRepository'
    );
    const { TaskRepository } = await import(
      '@/4-infrastructure/database/repositories/TaskRepository'
    );
    const { TrainingRepository } = await import(
      '@/4-infrastructure/database/repositories/TrainingRepository'
    );
    const { CompanyTrainingRepository } = await import(
      '@/4-infrastructure/database/repositories/CompanyTrainingRepository'
    );
    const { EventRepository } = await import(
      '@/4-infrastructure/database/repositories/EventRepository'
    );
    const { SupabaseEcommerceRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository'
    );
    const { PDFExportService, ExcelExportService, CSVExportService } = await import(
      '@/5-shared/services/export'
    );

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';

    if (!['pdf', 'excel', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use pdf, excel, or csv' },
        { status: 400 }
      );
    }

    // Get custom report
    const repository = new SupabaseCustomReportRepository();
    const useCase = new GetCustomReportUseCase(repository);
    const isAdmin = user.role === 'master_admin' || user.role === 'program_manager';

    const result = await useCase.execute(id, user.id, isAdmin);

    if (result.isFailure) {
      logger.error('Failed to get custom report:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Rapor bulunamadı' },
        { status: 404 }
      );
    }

    const customReport = result.value;

    // Get dashboard stats based on report type
    let stats: any;

    if (customReport.reportType === 'dashboard') {
      const userRepository = new UserRepository();
      const companyRepository = new CompanyRepository();
      const programRepository = new ProgramRepository();
      const projectRepository = new ProjectRepository();
      const taskRepository = new TaskRepository();

      const statsUseCase = new GetDashboardStatsUseCase(
        userRepository,
        companyRepository,
        programRepository,
        projectRepository,
        taskRepository
      );

      const statsResult = await statsUseCase.execute();
      if (statsResult.isFailure) {
        return NextResponse.json({ error: 'Dashboard verileri alınamadı' }, { status: 500 });
      }
      stats = statsResult.value;
    } else if (customReport.reportType === 'program' || customReport.reportType === 'custom') {
      const userRepository = new UserRepository();
      const companyRepository = new CompanyRepository();
      const projectRepository = new ProjectRepository();
      const trainingRepository = new TrainingRepository();
      const companyTrainingRepository = new CompanyTrainingRepository();
      const eventRepository = new EventRepository();

      const statsUseCase = new GetConsultantDashboardStatsUseCase(
        userRepository,
        companyRepository,
        projectRepository,
        trainingRepository,
        companyTrainingRepository,
        eventRepository
      );

      const statsResult = await statsUseCase.execute(user.id);
      if (statsResult.isFailure) {
        return NextResponse.json({ error: 'Dashboard verileri alınamadı' }, { status: 500 });
      }
      stats = statsResult.value;
    } else if (customReport.reportType === 'company') {
      const projectRepository = new ProjectRepository();
      const companyTrainingRepository = new CompanyTrainingRepository();
      const trainingRepository = new TrainingRepository();
      const eventRepository = new EventRepository();
      const ecommerceRepository = new SupabaseEcommerceRepository();

      const statsUseCase = new GetCompanyDashboardStatsUseCase(
        projectRepository,
        trainingRepository,
        companyTrainingRepository,
        eventRepository,
        ecommerceRepository
      );

      const statsResult = await statsUseCase.execute(
        customReport.companyId || user.companyId || ''
      );
      if (statsResult.isFailure) {
        return NextResponse.json({ error: 'Dashboard verileri alınamadı' }, { status: 500 });
      }
      stats = statsResult.value;
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    const filename = `custom-report-${customReport.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;

    // Filter stats based on selected metrics
    const filteredStats: any = {};
    customReport.selectedMetrics.forEach((metric) => {
      if (stats[metric] !== undefined) {
        filteredStats[metric] = stats[metric];
      }
    });

    // Export based on format
    if (format === 'pdf') {
      const blob = PDFExportService.exportDashboardStats({
        title: customReport.name,
        subtitle: customReport.description || undefined,
        data: filteredStats,
      });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      });
    } else if (format === 'excel') {
      const blob = ExcelExportService.exportDashboardStats({
        title: customReport.name,
        data: filteredStats,
      });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    } else if (format === 'csv') {
      const csv = CSVExportService.exportDashboardStats({
        title: customReport.name,
        data: filteredStats,
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error: any) {
    logger.error('Custom report export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
