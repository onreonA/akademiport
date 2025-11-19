/**
 * Consultant Dashboard Export API Route
 *
 * GET /api/consultant-dashboard/export?format=pdf|excel|csv
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetConsultantDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetConsultantDashboardStatsUseCase';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { ProjectRepository } from '@/4-infrastructure/database/repositories/ProjectRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { CompanyTrainingRepository } from '@/4-infrastructure/database/repositories/CompanyTrainingRepository';
import { EventRepository } from '@/4-infrastructure/database/repositories/EventRepository';
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

    // Only consultant and master_admin can export consultant dashboard
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';
    const programId = searchParams.get('programId');

    if (!['pdf', 'excel', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use pdf, excel, or csv' },
        { status: 400 }
      );
    }

    // Get consultant dashboard stats
    const userRepository = new UserRepository();
    const companyRepository = new CompanyRepository();
    const projectRepository = new ProjectRepository();
    const trainingRepository = new TrainingRepository();
    const companyTrainingRepository = new CompanyTrainingRepository();
    const eventRepository = new EventRepository();

    const useCase = new GetConsultantDashboardStatsUseCase(
      userRepository,
      companyRepository,
      projectRepository,
      trainingRepository,
      companyTrainingRepository,
      eventRepository
    );

    const result = await useCase.execute(user.id);

    if (result.isFailure) {
      logger.error('Failed to get consultant dashboard stats:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Dashboard verileri alınamadı' },
        { status: 500 }
      );
    }

    const stats = result.value;
    const filename = `consultant-dashboard-${new Date().toISOString().split('T')[0]}`;

    // Export based on format
    if (format === 'pdf') {
      const blob = PDFExportService.exportDashboardStats({
        title: 'Consultant Dashboard Raporu',
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
        title: 'Consultant Dashboard Raporu',
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
        title: 'Consultant Dashboard Raporu',
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
    logger.error('Consultant dashboard export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
