/**
 * Custom Report Export API Route
 *
 * GET /api/custom-reports/[id]/export?format=pdf|excel|csv
 * Custom report'u export eder
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetCustomReportUseCase } from '@/2-application/use-cases/custom-report';
import { SupabaseCustomReportRepository } from '@/4-infrastructure/database/repositories/SupabaseCustomReportRepository';
import { GetDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetDashboardStatsUseCase';
import { GetConsultantDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetConsultantDashboardStatsUseCase';
import { GetCompanyDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetCompanyDashboardStatsUseCase';
import { SupabaseUserRepository } from '@/4-infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseCompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { SupabaseProgramRepository } from '@/4-infrastructure/database/repositories/SupabaseProgramRepository';
import { SupabaseProjectRepository } from '@/4-infrastructure/database/repositories/SupabaseProjectRepository';
import { SupabaseTaskRepository } from '@/4-infrastructure/database/repositories/SupabaseTaskRepository';
import { SupabaseTrainingRepository } from '@/4-infrastructure/database/repositories/SupabaseTrainingRepository';
import { SupabaseCompanyTrainingRepository } from '@/4-infrastructure/database/repositories/SupabaseCompanyTrainingRepository';
import { SupabaseEventRepository } from '@/4-infrastructure/database/repositories/SupabaseEventRepository';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import { PDFExportService, ExcelExportService, CSVExportService } from '@/5-shared/services/export';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const result = await useCase.execute(params.id, user.id, isAdmin);

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
      const userRepository = new SupabaseUserRepository();
      const companyRepository = new SupabaseCompanyRepository();
      const programRepository = new SupabaseProgramRepository();
      const projectRepository = new SupabaseProjectRepository();
      const taskRepository = new SupabaseTaskRepository();

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
      const userRepository = new SupabaseUserRepository();
      const companyRepository = new SupabaseCompanyRepository();
      const projectRepository = new SupabaseProjectRepository();
      const taskRepository = new SupabaseTaskRepository();
      const trainingRepository = new SupabaseTrainingRepository();
      const companyTrainingRepository = new SupabaseCompanyTrainingRepository();
      const eventRepository = new SupabaseEventRepository();

      const statsUseCase = new GetConsultantDashboardStatsUseCase(
        userRepository,
        companyRepository,
        projectRepository,
        taskRepository,
        trainingRepository,
        companyTrainingRepository,
        eventRepository
      );

      const statsResult = await statsUseCase.execute(user.id, customReport.programId || undefined);
      if (statsResult.isFailure) {
        return NextResponse.json({ error: 'Dashboard verileri alınamadı' }, { status: 500 });
      }
      stats = statsResult.value;
    } else if (customReport.reportType === 'company') {
      const projectRepository = new SupabaseProjectRepository();
      const companyTrainingRepository = new SupabaseCompanyTrainingRepository();
      const trainingRepository = new SupabaseTrainingRepository();
      const eventRepository = new SupabaseEventRepository();
      const ecommerceRepository = new SupabaseEcommerceRepository();

      const statsUseCase = new GetCompanyDashboardStatsUseCase(
        projectRepository,
        companyTrainingRepository,
        trainingRepository,
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
