/**
 * Company Dashboard Export API Route
 *
 * GET /api/company-dashboard/export?format=pdf|excel|csv
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetCompanyDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetCompanyDashboardStatsUseCase';
import { SupabaseProjectRepository } from '@/4-infrastructure/database/repositories/SupabaseProjectRepository';
import { SupabaseCompanyTrainingRepository } from '@/4-infrastructure/database/repositories/SupabaseCompanyTrainingRepository';
import { SupabaseTrainingRepository } from '@/4-infrastructure/database/repositories/SupabaseTrainingRepository';
import { SupabaseEventRepository } from '@/4-infrastructure/database/repositories/SupabaseEventRepository';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import { PDFExportService, ExcelExportService, CSVExportService } from '@/5-shared/services/export';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only company_admin and master_admin can export company dashboard
    if (user.role !== 'company_admin' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';
    const companyId = searchParams.get('companyId') || user.companyId;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    if (!['pdf', 'excel', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use pdf, excel, or csv' },
        { status: 400 }
      );
    }

    // Get company dashboard stats
    const projectRepository = new SupabaseProjectRepository();
    const companyTrainingRepository = new SupabaseCompanyTrainingRepository();
    const trainingRepository = new SupabaseTrainingRepository();
    const eventRepository = new SupabaseEventRepository();
    const ecommerceRepository = new SupabaseEcommerceRepository();

    const useCase = new GetCompanyDashboardStatsUseCase(
      projectRepository,
      companyTrainingRepository,
      trainingRepository,
      eventRepository,
      ecommerceRepository
    );

    const result = await useCase.execute(companyId);

    if (result.isFailure) {
      logger.error('Failed to get company dashboard stats:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Dashboard verileri alınamadı' },
        { status: 500 }
      );
    }

    const stats = result.value;
    const filename = `company-dashboard-${new Date().toISOString().split('T')[0]}`;

    // Export based on format
    if (format === 'pdf') {
      const blob = PDFExportService.exportDashboardStats({
        title: 'Company Dashboard Raporu',
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
        title: 'Company Dashboard Raporu',
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
        title: 'Company Dashboard Raporu',
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
    logger.error('Company dashboard export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
