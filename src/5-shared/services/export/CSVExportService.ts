/**
 * CSV Export Service
 *
 * Dashboard ve raporlar için CSV export servisi
 */

import {
  DashboardStats,
  ConsultantDashboardStats,
  CompanyDashboardStats,
} from '@/3-domain/entities/DashboardStats';

export interface CSVExportOptions {
  title: string;
  data: DashboardStats | ConsultantDashboardStats | CompanyDashboardStats | any;
  includeSummary?: boolean;
}

export class CSVExportService {
  /**
   * Dashboard stats'ı CSV'ye export et
   */
  static exportDashboardStats(options: CSVExportOptions): string {
    const { title, data, includeSummary = true } = options;
    let csv = '';

    // Title
    csv += `${title}\n`;
    csv += `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}\n\n`;

    // Summary
    if (includeSummary) {
      csv += 'Özet İstatistikler\n';
      csv += 'Metrik,Değer\n';

      if ('totalPrograms' in data) {
        // Master Admin Dashboard
        csv += `Toplam Programlar,${data.totalPrograms}\n`;
        csv += `Aktif Firmalar,${data.activeCompanies}\n`;
        csv += `Toplam Kullanıcılar,${data.totalUsers}\n`;
        csv += `Tamamlanan Görevler,${data.completedTasks}\n`;
        csv += `Bekleyen Görevler,${data.pendingTasks}\n`;
        csv += `Aylık Büyüme,${data.monthlyGrowth.toFixed(2)}%\n`;
      } else if ('totalCompanies' in data) {
        // Consultant Dashboard
        csv += `Toplam Firmalar,${data.totalCompanies}\n`;
        csv += `Toplam Projeler,${data.totalProjects}\n`;
        csv += `Tamamlanan Projeler,${data.completedProjects}\n`;
        csv += `Aktif Projeler,${data.activeProjects}\n`;
        csv += `Toplam Eğitimler,${data.totalTrainings}\n`;
        csv += `Tamamlanan Eğitimler,${data.completedTrainings}\n`;
      } else if ('totalProjects' in data && 'totalTrainings' in data) {
        // Company Dashboard
        csv += `Toplam Projeler,${data.totalProjects}\n`;
        csv += `Tamamlanan Projeler,${data.completedProjects}\n`;
        csv += `Aktif Projeler,${data.activeProjects}\n`;
        csv += `Toplam Eğitimler,${data.totalTrainings}\n`;
        csv += `Tamamlanan Eğitimler,${data.completedTrainings}\n`;
      }

      csv += '\n';
    }

    // Chart data
    if ('userGrowth' in data && data.userGrowth.length > 0) {
      csv += this.arrayToCSV('Kullanıcı Büyümesi', data.userGrowth);
      csv += '\n';
    }

    if ('programActivity' in data && data.programActivity.length > 0) {
      csv += this.arrayToCSV('Program Aktivitesi', data.programActivity);
      csv += '\n';
    }

    if ('companyDistribution' in data && data.companyDistribution.length > 0) {
      csv += this.arrayToCSV('Firma Dağılımı', data.companyDistribution);
      csv += '\n';
    }

    if ('taskCompletion' in data && data.taskCompletion.length > 0) {
      csv += this.arrayToCSV('Görev Tamamlanma', data.taskCompletion);
      csv += '\n';
    }

    if ('companyPerformance' in data && data.companyPerformance.length > 0) {
      csv += this.arrayToCSV('Firma Performansı', data.companyPerformance);
      csv += '\n';
    }

    if ('projectProgress' in data && data.projectProgress.length > 0) {
      csv += this.arrayToCSV('Proje İlerlemesi', data.projectProgress);
      csv += '\n';
    }

    if ('trainingCompletion' in data && data.trainingCompletion.length > 0) {
      csv += this.arrayToCSV('Eğitim Tamamlanma', data.trainingCompletion);
      csv += '\n';
    }

    if ('ecommerceMetrics' in data && data.ecommerceMetrics.length > 0) {
      csv += this.arrayToCSV('E-Ticaret Metrikleri', data.ecommerceMetrics);
      csv += '\n';
    }

    return csv;
  }

  /**
   * Array'i CSV formatına çevir
   */
  private static arrayToCSV(title: string, data: any[]): string {
    if (data.length === 0) return '';

    let csv = `${title}\n`;
    const headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        // Escape commas and quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  /**
   * CSV'yi blob olarak döndür ve download için hazırla
   */
  static downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
