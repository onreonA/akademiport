/**
 * PDF Export Service
 *
 * Dashboard ve raporlar için PDF export servisi
 */

import jsPDF from 'jspdf';
import {
  DashboardStats,
  ConsultantDashboardStats,
  CompanyDashboardStats,
} from '@/3-domain/entities/DashboardStats';

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  data: DashboardStats | ConsultantDashboardStats | CompanyDashboardStats | any;
  includeCharts?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export class PDFExportService {
  /**
   * Dashboard stats'ı PDF'e export et
   */
  static exportDashboardStats(options: PDFExportOptions): Blob {
    const { title, subtitle, data, orientation = 'portrait' } = options;
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    // Title
    doc.setFontSize(20);
    doc.text(title, 105, 20, { align: 'center' });

    // Subtitle
    if (subtitle) {
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, 105, 30, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }

    let yPos = 45;

    // Summary Stats
    doc.setFontSize(16);
    doc.text('Özet İstatistikler', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    if ('totalPrograms' in data) {
      // Master Admin Dashboard
      doc.text(`Toplam Programlar: ${data.totalPrograms}`, 25, yPos);
      yPos += 7;
      doc.text(`Aktif Firmalar: ${data.activeCompanies}`, 25, yPos);
      yPos += 7;
      doc.text(`Toplam Kullanıcılar: ${data.totalUsers}`, 25, yPos);
      yPos += 7;
      doc.text(`Tamamlanan Görevler: ${data.completedTasks}`, 25, yPos);
      yPos += 7;
      doc.text(`Bekleyen Görevler: ${data.pendingTasks}`, 25, yPos);
      yPos += 7;
      doc.text(`Aylık Büyüme: %${data.monthlyGrowth.toFixed(2)}`, 25, yPos);
      yPos += 10;
    } else if ('totalCompanies' in data) {
      // Consultant Dashboard
      doc.text(`Toplam Firmalar: ${data.totalCompanies}`, 25, yPos);
      yPos += 7;
      doc.text(`Toplam Projeler: ${data.totalProjects}`, 25, yPos);
      yPos += 7;
      doc.text(`Tamamlanan Projeler: ${data.completedProjects}`, 25, yPos);
      yPos += 7;
      doc.text(`Aktif Projeler: ${data.activeProjects}`, 25, yPos);
      yPos += 7;
      doc.text(`Toplam Eğitimler: ${data.totalTrainings}`, 25, yPos);
      yPos += 7;
      doc.text(`Tamamlanan Eğitimler: ${data.completedTrainings}`, 25, yPos);
      yPos += 10;
    } else if ('totalProjects' in data && 'totalTrainings' in data) {
      // Company Dashboard
      doc.text(`Toplam Projeler: ${data.totalProjects}`, 25, yPos);
      yPos += 7;
      doc.text(`Tamamlanan Projeler: ${data.completedProjects}`, 25, yPos);
      yPos += 7;
      doc.text(`Aktif Projeler: ${data.activeProjects}`, 25, yPos);
      yPos += 7;
      doc.text(`Toplam Eğitimler: ${data.totalTrainings}`, 25, yPos);
      yPos += 7;
      doc.text(`Tamamlanan Eğitimler: ${data.completedTrainings}`, 25, yPos);
      yPos += 10;
    }

    // Chart Data Tables
    if ('userGrowth' in data && data.userGrowth.length > 0) {
      yPos = this.addTable(
        doc,
        'Kullanıcı Büyümesi',
        data.userGrowth,
        ['month', 'users', 'growth'],
        yPos
      );
    }

    if ('programActivity' in data && data.programActivity.length > 0) {
      yPos = this.addTable(
        doc,
        'Program Aktivitesi',
        data.programActivity,
        ['programName', 'companies', 'projects', 'users'],
        yPos
      );
    }

    if ('companyDistribution' in data && data.companyDistribution.length > 0) {
      yPos = this.addTable(
        doc,
        'Firma Dağılımı',
        data.companyDistribution,
        ['name', 'value'],
        yPos
      );
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Sayfa ${i} / ${pageCount}`, 105, doc.internal.pageSize.height - 10, {
        align: 'center',
      });
      doc.text(
        `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
        105,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
      doc.setTextColor(0, 0, 0);
    }

    return doc.output('blob');
  }

  /**
   * Tablo ekle
   */
  private static addTable(
    doc: jsPDF,
    title: string,
    data: any[],
    columns: string[],
    startY: number
  ): number {
    let yPos = startY;

    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(title, 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const colWidths = this.calculateColumnWidths(columns.length, doc.internal.pageSize.width - 40);
    const rowHeight = 7;

    // Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 5, doc.internal.pageSize.width - 40, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    let xPos = 25;
    columns.forEach((col, index) => {
      doc.text(this.formatColumnName(col), xPos, yPos);
      xPos += colWidths[index];
    });
    yPos += rowHeight;

    // Rows
    doc.setFont('helvetica', 'normal');
    data.slice(0, 20).forEach((row) => {
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
      }
      xPos = 25;
      columns.forEach((col, index) => {
        const value = row[col] !== undefined ? String(row[col]) : '-';
        doc.text(value.substring(0, 20), xPos, yPos);
        xPos += colWidths[index];
      });
      yPos += rowHeight;
    });

    return yPos + 5;
  }

  /**
   * Kolon genişliklerini hesapla
   */
  private static calculateColumnWidths(columnCount: number, totalWidth: number): number[] {
    const width = totalWidth / columnCount;
    return Array(columnCount).fill(width);
  }

  /**
   * Kolon adını formatla
   */
  private static formatColumnName(name: string): string {
    const labels: Record<string, string> = {
      month: 'Ay',
      users: 'Kullanıcı',
      growth: 'Büyüme %',
      programName: 'Program',
      companies: 'Firmalar',
      projects: 'Projeler',
      name: 'İsim',
      value: 'Değer',
    };
    return labels[name] || name;
  }

  /**
   * PDF'i blob olarak döndür ve download için hazırla
   */
  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
