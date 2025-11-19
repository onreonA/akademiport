/**
 * Report Export API Route
 *
 * GET /api/reports/[id]/export?format=pdf|excel|csv
 * Progress report'u export eder
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
    const { GetReportUseCase } = await import('@/2-application/use-cases/report');
    const { SupabaseProgressReportRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseProgressReportRepository'
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

    // Get report
    const reportRepository = new SupabaseProgressReportRepository();
    const useCase = new GetReportUseCase(reportRepository);

    const result = await useCase.execute(id);

    if (result.isFailure) {
      logger.error('Failed to get report:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Rapor bulunamadı' },
        { status: 404 }
      );
    }

    const report = result.value;
    const filename = `report-${report.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;

    // Prepare export data
    const exportData = {
      title: report.title,
      reportType: report.reportType,
      content: report.content,
      aiAnalysis: report.aiAnalysis,
      periodYear: report.periodYear,
      periodMonth: report.periodMonth,
    };

    // Export based on format
    if (format === 'pdf') {
      const blob = PDFExportService.exportDashboardStats({
        title: report.title,
        subtitle: `Rapor Tipi: ${report.reportType} | Oluşturulma: ${new Date(report.createdAt).toLocaleDateString('tr-TR')}`,
        data: exportData,
      });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      });
    } else if (format === 'excel') {
      const sheets = [{ name: 'Rapor İçeriği', data: [exportData] }];

      if (report.aiAnalysis) {
        sheets.push({
          name: 'AI Analizi',
          data: [
            {
              Özet: report.aiAnalysis.summary,
              'Risk Skoru': report.aiAnalysis.riskScore,
              'Başarı Olasılığı': report.aiAnalysis.successProbability,
              'Güçlü Yönler': report.aiAnalysis.strengths.join('; '),
              'Zayıf Yönler': report.aiAnalysis.weaknesses.join('; '),
              Öneriler: report.aiAnalysis.recommendations.join('; '),
            } as any,
          ],
        });
      }

      const blob = ExcelExportService.exportDashboardStats({
        title: report.title,
        data: exportData,
        sheets,
      });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    } else if (format === 'csv') {
      let csv = `${report.title}\n`;
      csv += `Rapor Tipi,${report.reportType}\n`;
      csv += `Oluşturulma Tarihi,${new Date(report.createdAt).toLocaleDateString('tr-TR')}\n\n`;

      if (report.aiAnalysis) {
        csv += 'AI Analizi\n';
        csv += `Özet,${report.aiAnalysis.summary}\n`;
        csv += `Risk Skoru,${report.aiAnalysis.riskScore}\n`;
        csv += `Başarı Olasılığı,${report.aiAnalysis.successProbability}%\n`;
        csv += `Güçlü Yönler,"${report.aiAnalysis.strengths.join('; ')}"\n`;
        csv += `Zayıf Yönler,"${report.aiAnalysis.weaknesses.join('; ')}"\n`;
        csv += `Öneriler,"${report.aiAnalysis.recommendations.join('; ')}"\n`;
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error: any) {
    logger.error('Report export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
