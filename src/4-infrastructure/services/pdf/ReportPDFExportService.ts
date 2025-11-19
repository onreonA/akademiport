/**
 * Report PDF Export Service
 *
 * Raporlar için PDF export servisi
 * jsPDF kullanarak rapor içeriğini PDF'e dönüştürür ve Supabase Storage'a yükler
 */

import jsPDF from 'jspdf';
import { ProgressReport, ReportType } from '@/3-domain/entities/ProgressReport';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';
import { Result } from '@/6-core/result/Result';

const STORAGE_BUCKET = 'reports';

export interface PDFExportResult {
  pdfUrl: string;
  pdfPath: string;
  fileSize: number;
}

export class ReportPDFExportService {
  /**
   * Raporu PDF'e dönüştür ve Supabase Storage'a yükle
   */
  static async exportReportToPDF(report: ProgressReport): Promise<Result<PDFExportResult>> {
    try {
      // PDF oluştur
      const pdfBlob = await this.generatePDF(report);

      // Supabase Storage'a yükle
      const uploadResult = await this.uploadToStorage(report.id, pdfBlob);

      if (uploadResult.isFailure) {
        return Result.fail(uploadResult.error || 'PDF yükleme başarısız');
      }

      return Result.ok(uploadResult.value);
    } catch (error) {
      logger.error('ReportPDFExportService.exportReportToPDF error:', error);
      return Result.fail(error instanceof Error ? error.message : 'PDF export başarısız');
    }
  }

  /**
   * PDF oluştur
   */
  private static async generatePDF(report: ProgressReport): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPos = 20;

    // Başlık
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(report.title, 105, yPos, { align: 'center' });
    yPos += 10;

    // Rapor bilgileri
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Rapor Tipi: ${this.formatReportType(report.reportType)}`, 20, yPos);
    yPos += 7;

    if (report.periodYear && report.periodMonth) {
      const monthNames = [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
      ];
      doc.text(`Dönem: ${monthNames[report.periodMonth - 1]} ${report.periodYear}`, 20, yPos);
      yPos += 7;
    }

    doc.text(`Oluşturulma Tarihi: ${this.formatDate(report.createdAt)}`, 20, yPos);
    yPos += 10;

    doc.setTextColor(0, 0, 0);

    // İçerik bölümü
    if (report.content && Object.keys(report.content).length > 0) {
      yPos = this.addContentSection(doc, 'Rapor İçeriği', report.content, yPos);
    }

    // AI Analizi bölümü
    if (report.aiAnalysis) {
      yPos = this.addAIAnalysisSection(doc, report.aiAnalysis, yPos);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Sayfa ${i} / ${pageCount}`, 105, doc.internal.pageSize.height - 10, {
        align: 'center',
      });
      doc.text(
        `Oluşturulma Tarihi: ${this.formatDate(new Date())}`,
        105,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
      doc.setTextColor(0, 0, 0);
    }

    return doc.output('blob');
  }

  /**
   * İçerik bölümü ekle
   */
  private static addContentSection(
    doc: jsPDF,
    title: string,
    content: Record<string, any>,
    startY: number
  ): number {
    let yPos = startY;

    // Yeni sayfa kontrolü
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // İçeriği formatla ve ekle
    for (const [key, value] of Object.entries(content)) {
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
      }

      const label = this.formatKey(key);
      const formattedValue = this.formatValue(value);

      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 25, yPos);
      doc.setFont('helvetica', 'normal');

      // Uzun metinleri satırlara böl
      const lines = doc.splitTextToSize(formattedValue, doc.internal.pageSize.width - 50);
      yPos += 7;
      lines.forEach((line: string) => {
        if (yPos > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 30, yPos);
        yPos += 6;
      });
      yPos += 3;
    }

    return yPos + 5;
  }

  /**
   * AI Analizi bölümü ekle
   */
  private static addAIAnalysisSection(
    doc: jsPDF,
    aiAnalysis: ProgressReport['aiAnalysis'],
    startY: number
  ): number {
    if (!aiAnalysis) return startY;

    let yPos = startY;

    // Yeni sayfa kontrolü
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Analizi', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Özet
    if (aiAnalysis.summary) {
      if (yPos > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Özet:', 25, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(
        aiAnalysis.summary,
        doc.internal.pageSize.width - 50
      );
      summaryLines.forEach((line: string) => {
        if (yPos > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 30, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Güçlü Yönler
    if (aiAnalysis.strengths && aiAnalysis.strengths.length > 0) {
      yPos = this.addListSection(doc, 'Güçlü Yönler', aiAnalysis.strengths, yPos);
    }

    // Zayıf Yönler
    if (aiAnalysis.weaknesses && aiAnalysis.weaknesses.length > 0) {
      yPos = this.addListSection(doc, 'Zayıf Yönler', aiAnalysis.weaknesses, yPos);
    }

    // Öneriler
    if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0) {
      yPos = this.addListSection(doc, 'Öneriler', aiAnalysis.recommendations, yPos);
    }

    // Risk Skoru ve Başarı Olasılığı
    if (yPos > doc.internal.pageSize.height - 30) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Metrikler:', 25, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Risk Skoru: ${aiAnalysis.riskScore}/100`, 30, yPos);
    yPos += 7;
    doc.text(`Başarı Olasılığı: %${aiAnalysis.successProbability}`, 30, yPos);
    yPos += 10;

    return yPos;
  }

  /**
   * Liste bölümü ekle
   */
  private static addListSection(
    doc: jsPDF,
    title: string,
    items: string[],
    startY: number
  ): number {
    let yPos = startY;

    if (yPos > doc.internal.pageSize.height - 30) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${title}:`, 25, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');

    items.forEach((item) => {
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
      }
      doc.text('•', 30, yPos);
      const lines = doc.splitTextToSize(item, doc.internal.pageSize.width - 45);
      lines.forEach((line: string, index: number) => {
        if (yPos > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 35, yPos);
        if (index < lines.length - 1) {
          yPos += 6;
        }
      });
      yPos += 7;
    });

    return yPos + 5;
  }

  /**
   * Supabase Storage'a yükle
   */
  private static async uploadToStorage(
    reportId: string,
    pdfBlob: Blob
  ): Promise<Result<PDFExportResult>> {
    try {
      const supabase = await createClient();

      // Dosya adı oluştur
      const fileName = `report-${reportId}-${Date.now()}.pdf`;
      const filePath = `reports/${fileName}`;

      // Blob'u ArrayBuffer'a dönüştür
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, uint8Array, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        logger.error('Supabase Storage upload error:', uploadError);
        return Result.fail(`PDF yükleme hatası: ${uploadError.message}`);
      }

      // Signed URL oluştur (1 yıl geçerlilik)
      const { data: urlData, error: urlError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 31536000); // 1 year

      if (urlError || !urlData) {
        logger.error('Supabase Storage signed URL error:', urlError);
        return Result.fail('PDF URL oluşturma hatası');
      }

      return Result.ok({
        pdfUrl: urlData.signedUrl,
        pdfPath: filePath,
        fileSize: pdfBlob.size,
      });
    } catch (error) {
      logger.error('ReportPDFExportService.uploadToStorage error:', error);
      return Result.fail(error instanceof Error ? error.message : 'PDF yükleme başarısız');
    }
  }

  /**
   * Rapor tipini formatla
   */
  private static formatReportType(type: ReportType): string {
    const types: Record<ReportType, string> = {
      interim: 'Ara Rapor',
      monthly: 'Aylık Rapor',
      program: 'Program Raporu',
      company: 'Firma Raporu',
      ministry: 'Bakanlık Raporu',
    };
    return types[type] || type;
  }

  /**
   * Tarihi formatla
   */
  private static formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Anahtarı formatla
   */
  private static formatKey(key: string): string {
    const labels: Record<string, string> = {
      projects: 'Projeler',
      tasks: 'Görevler',
      trainings: 'Eğitimler',
      events: 'Etkinlikler',
      metrics: 'Metrikler',
      summary: 'Özet',
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  /**
   * Değeri formatla
   */
  private static formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}
