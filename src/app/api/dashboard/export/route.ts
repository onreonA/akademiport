/**
 * Dashboard Export API Route
 *
 * GET /api/dashboard/export?format=pdf|excel|csv
 * Dashboard verilerini export eder
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetDashboardStatsUseCase';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { ProgramRepository } from '@/4-infrastructure/database/repositories/ProgramRepository';
import { ProjectRepository } from '@/4-infrastructure/database/repositories/ProjectRepository';
import { TaskRepository } from '@/4-infrastructure/database/repositories/TaskRepository';
import { PDFExportService, ExcelExportService, CSVExportService } from '@/5-shared/services/export';
import { logger } from '@/5-shared/utils/logger';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can export dashboard
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';

    if (!['pdf', 'excel', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use pdf, excel, or csv' },
        { status: 400 }
      );
    }

    // Get dashboard stats
    const userRepository = new UserRepository();
    const companyRepository = new CompanyRepository();
    const programRepository = new ProgramRepository();
    const projectRepository = new ProjectRepository();
    const taskRepository = new TaskRepository();

    const useCase = new GetDashboardStatsUseCase(
      userRepository,
      companyRepository,
      programRepository,
      projectRepository,
      taskRepository
    );

    const result = await useCase.execute();

    if (result.isFailure) {
      logger.error('Failed to get dashboard stats:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Dashboard verileri alınamadı' },
        { status: 500 }
      );
    }

    const stats = result.value;
    const filename = `dashboard-${new Date().toISOString().split('T')[0]}`;

    // Export based on format
    if (format === 'pdf') {
      const blob = PDFExportService.exportDashboardStats({
        title: 'Master Admin Dashboard Raporu',
        subtitle: `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
        data: stats,
      });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      });
    } else if (format === 'excel') {
      const blob = ExcelExportService.exportDashboardStats({
        title: 'Master Admin Dashboard Raporu',
        data: stats,
      });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    } else if (format === 'csv') {
      const csv = CSVExportService.exportDashboardStats({
        title: 'Master Admin Dashboard Raporu',
        data: stats,
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
    logger.error('Dashboard export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
