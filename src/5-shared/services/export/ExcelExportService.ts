/**
 * Excel Export Service
 *
 * Dashboard ve raporlar için Excel export servisi
 */

import * as XLSX from 'xlsx';
import {
  DashboardStats,
  ConsultantDashboardStats,
  CompanyDashboardStats,
} from '@/3-domain/entities/DashboardStats';

export interface ExcelExportOptions {
  title: string;
  data: DashboardStats | ConsultantDashboardStats | CompanyDashboardStats | any;
  sheets?: Array<{ name: string; data: any[] }>;
}

export class ExcelExportService {
  /**
   * Dashboard stats'ı Excel'e export et
   */
  static exportDashboardStats(options: ExcelExportOptions): Blob {
    const { title, data, sheets } = options;
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData: any[][] = [[title], [''], ['Özet İstatistikler'], ['']];

    if ('totalPrograms' in data) {
      // Master Admin Dashboard
      summaryData.push(['Toplam Programlar', data.totalPrograms]);
      summaryData.push(['Aktif Firmalar', data.activeCompanies]);
      summaryData.push(['Toplam Kullanıcılar', data.totalUsers]);
      summaryData.push(['Tamamlanan Görevler', data.completedTasks]);
      summaryData.push(['Bekleyen Görevler', data.pendingTasks]);
      summaryData.push(['Aylık Büyüme', `${data.monthlyGrowth.toFixed(2)}%`]);
    } else if ('totalCompanies' in data) {
      // Consultant Dashboard
      summaryData.push(['Toplam Firmalar', data.totalCompanies]);
      summaryData.push(['Toplam Projeler', data.totalProjects]);
      summaryData.push(['Tamamlanan Projeler', data.completedProjects]);
      summaryData.push(['Aktif Projeler', data.activeProjects]);
      summaryData.push(['Toplam Eğitimler', data.totalTrainings]);
      summaryData.push(['Tamamlanan Eğitimler', data.completedTrainings]);
    } else if ('totalProjects' in data && 'totalTrainings' in data) {
      // Company Dashboard
      summaryData.push(['Toplam Projeler', data.totalProjects]);
      summaryData.push(['Tamamlanan Projeler', data.completedProjects]);
      summaryData.push(['Aktif Projeler', data.activeProjects]);
      summaryData.push(['Toplam Eğitimler', data.totalTrainings]);
      summaryData.push(['Tamamlanan Eğitimler', data.completedTrainings]);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet');

    // Chart data sheets
    if ('userGrowth' in data && data.userGrowth.length > 0) {
      const userGrowthSheet = XLSX.utils.json_to_sheet(data.userGrowth);
      XLSX.utils.book_append_sheet(workbook, userGrowthSheet, 'Kullanıcı Büyümesi');
    }

    if ('programActivity' in data && data.programActivity.length > 0) {
      const programActivitySheet = XLSX.utils.json_to_sheet(data.programActivity);
      XLSX.utils.book_append_sheet(workbook, programActivitySheet, 'Program Aktivitesi');
    }

    if ('companyDistribution' in data && data.companyDistribution.length > 0) {
      const companyDistributionSheet = XLSX.utils.json_to_sheet(data.companyDistribution);
      XLSX.utils.book_append_sheet(workbook, companyDistributionSheet, 'Firma Dağılımı');
    }

    if ('taskCompletion' in data && data.taskCompletion.length > 0) {
      const taskCompletionSheet = XLSX.utils.json_to_sheet(data.taskCompletion);
      XLSX.utils.book_append_sheet(workbook, taskCompletionSheet, 'Görev Tamamlanma');
    }

    if ('companyPerformance' in data && data.companyPerformance.length > 0) {
      const companyPerformanceSheet = XLSX.utils.json_to_sheet(data.companyPerformance);
      XLSX.utils.book_append_sheet(workbook, companyPerformanceSheet, 'Firma Performansı');
    }

    if ('projectProgress' in data && data.projectProgress.length > 0) {
      const projectProgressSheet = XLSX.utils.json_to_sheet(data.projectProgress);
      XLSX.utils.book_append_sheet(workbook, projectProgressSheet, 'Proje İlerlemesi');
    }

    if ('trainingCompletion' in data && data.trainingCompletion.length > 0) {
      const trainingCompletionSheet = XLSX.utils.json_to_sheet(data.trainingCompletion);
      XLSX.utils.book_append_sheet(workbook, trainingCompletionSheet, 'Eğitim Tamamlanma');
    }

    if ('ecommerceMetrics' in data && data.ecommerceMetrics.length > 0) {
      const ecommerceMetricsSheet = XLSX.utils.json_to_sheet(data.ecommerceMetrics);
      XLSX.utils.book_append_sheet(workbook, ecommerceMetricsSheet, 'E-Ticaret Metrikleri');
    }

    // Custom sheets
    if (sheets) {
      sheets.forEach((sheet) => {
        const sheetData = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, sheetData, sheet.name);
      });
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  /**
   * Excel'i blob olarak döndür ve download için hazırla
   */
  static downloadExcel(blob: Blob, filename: string): void {
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
