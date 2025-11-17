/**
 * GET /api/reports/[id]/pdf
 *
 * Raporun PDF'ini indirir
 * TODO: PDF export servisi implementasyonu sonraya bırakıldı
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetReportUseCase } from '@/2-application/use-cases/report';
import { SupabaseProgressReportRepository } from '@/4-infrastructure/database/repositories/SupabaseProgressReportRepository';
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

    // Check if PDF exists
    if (!report.pdfUrl) {
      return NextResponse.json({ error: 'PDF henüz oluşturulmamış' }, { status: 404 });
    }

    // TODO: PDF export servisi implementasyonu sonraya bırakıldı
    // Şimdilik PDF URL'ini döndürüyoruz
    return NextResponse.json(
      {
        success: true,
        data: {
          pdfUrl: report.pdfUrl,
          message: 'PDF export servisi henüz implement edilmedi',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in GET /api/reports/[id]/pdf:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
