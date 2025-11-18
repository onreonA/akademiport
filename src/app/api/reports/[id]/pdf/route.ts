/**
 * GET /api/reports/[id]/pdf
 *
 * Raporun PDF'ini oluşturur ve indirir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetReportUseCase } from '@/2-application/use-cases/report';
import { SupabaseProgressReportRepository } from '@/4-infrastructure/database/repositories/SupabaseProgressReportRepository';
import { ReportPDFExportService } from '@/4-infrastructure/services/pdf/ReportPDFExportService';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Initialize repository
    const reportRepository = new SupabaseProgressReportRepository();

    // Create use case
    const useCase = new GetReportUseCase(reportRepository);

    // Execute
    const result = await useCase.execute(id);

    if (result.isFailure) {
      logger.error('Failed to get report:', result.error);
      return NextResponse.json(
        {
          error: result.error instanceof AppError ? result.error.message : 'Failed to get report',
        },
        { status: result.error instanceof AppError ? result.error.statusCode : 500 }
      );
    }

    const report = result.value;

    // Check if report is completed
    if (report.status !== 'completed') {
      return NextResponse.json({ error: 'Rapor henüz tamamlanmadı' }, { status: 400 });
    }

    // Check if PDF already exists
    if (report.pdfUrl) {
      // PDF mevcut, URL'i döndür
      return NextResponse.json(
        {
          success: true,
          data: {
            pdfUrl: report.pdfUrl,
            pdfGeneratedAt: report.pdfGeneratedAt,
          },
        },
        { status: 200 }
      );
    }

    // PDF oluştur
    const pdfResult = await ReportPDFExportService.exportReportToPDF(report);

    if (pdfResult.isFailure) {
      logger.error('Failed to export PDF:', pdfResult.error);
      return NextResponse.json({ error: pdfResult.error || 'PDF oluşturulamadı' }, { status: 500 });
    }

    // PDF URL'ini rapor kaydına kaydet
    await reportRepository.update(id, {
      pdfUrl: pdfResult.value.pdfUrl,
      pdfGeneratedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          pdfUrl: pdfResult.value.pdfUrl,
          pdfGeneratedAt: new Date(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in GET /api/reports/[id]/pdf:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
