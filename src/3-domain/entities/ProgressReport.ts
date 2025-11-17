/**
 * ProgressReport Entity
 * İlerleme raporu entity'si - AI destekli otomatik rapor üretimi
 */

export type ReportType = 'interim' | 'monthly' | 'program' | 'company' | 'ministry';
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskScore: number; // 0-100
  successProbability: number; // 0-100
}

export interface ProgressReport {
  id: string;
  companyId: string | null;
  programId: string | null;
  projectId: string | null;
  subProjectId: string | null;
  consultantId: string | null;
  reportType: ReportType;
  status: ReportStatus;
  title: string;
  periodYear: number | null;
  periodMonth: number | null; // 1-12
  templateId: string | null;
  content: Record<string, any>; // Rapor verileri (projeler, metrikler, vb.)
  aiAnalysis: AIAnalysis | null;
  pdfUrl: string | null;
  pdfGeneratedAt: Date | null;
  emailSent: boolean;
  emailSentAt: Date | null;
  emailRecipients: string[]; // Email alıcıları
  errorMessage: string | null;
  errorDetails: Record<string, any> | null;
  metadata: Record<string, any>;
  generatedBy: string | null; // NULL ise otomatik
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProgressReportDto {
  companyId?: string | null;
  programId?: string | null;
  projectId?: string | null;
  subProjectId?: string | null;
  consultantId?: string | null;
  reportType: ReportType;
  title: string;
  periodYear?: number | null;
  periodMonth?: number | null;
  templateId?: string | null;
  content?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateProgressReportDto {
  status?: ReportStatus;
  title?: string;
  content?: Record<string, any>;
  aiAnalysis?: AIAnalysis | null;
  pdfUrl?: string | null;
  pdfGeneratedAt?: Date | null;
  emailSent?: boolean;
  emailSentAt?: Date | null;
  emailRecipients?: string[];
  errorMessage?: string | null;
  errorDetails?: Record<string, any> | null;
  metadata?: Record<string, any>;
}

/**
 * ProgressReport Entity Class
 * Business logic ve validasyonlar
 */
export class ProgressReportEntity {
  constructor(private report: ProgressReport) {}

  /**
   * Rapor tamamlandı mı?
   */
  isCompleted(): boolean {
    return this.report.status === 'completed';
  }

  /**
   * Rapor başarısız mı?
   */
  isFailed(): boolean {
    return this.report.status === 'failed';
  }

  /**
   * Rapor oluşturuluyor mu?
   */
  isGenerating(): boolean {
    return this.report.status === 'generating';
  }

  /**
   * PDF oluşturulmuş mu?
   */
  hasPdf(): boolean {
    return this.report.pdfUrl !== null && this.report.pdfUrl !== '';
  }

  /**
   * Email gönderilmiş mi?
   */
  isEmailSent(): boolean {
    return this.report.emailSent && this.report.emailSentAt !== null;
  }

  /**
   * AI analizi var mı?
   */
  hasAIAnalysis(): boolean {
    return this.report.aiAnalysis !== null;
  }

  /**
   * Rapor durumunu güncelle
   */
  updateStatus(status: ReportStatus): void {
    this.report.status = status;
    this.report.updatedAt = new Date();
  }

  /**
   * AI analizini ekle
   */
  setAIAnalysis(analysis: AIAnalysis): void {
    this.report.aiAnalysis = analysis;
    this.report.updatedAt = new Date();
  }

  /**
   * PDF bilgilerini güncelle
   */
  setPdf(url: string): void {
    this.report.pdfUrl = url;
    this.report.pdfGeneratedAt = new Date();
    this.report.updatedAt = new Date();
  }

  /**
   * Email gönderim bilgilerini güncelle
   */
  markEmailSent(recipients: string[]): void {
    this.report.emailSent = true;
    this.report.emailSentAt = new Date();
    this.report.emailRecipients = recipients;
    this.report.updatedAt = new Date();
  }

  /**
   * Hata bilgilerini kaydet
   */
  setError(message: string, details?: Record<string, any>): void {
    this.report.status = 'failed';
    this.report.errorMessage = message;
    this.report.errorDetails = details || null;
    this.report.updatedAt = new Date();
  }

  /**
   * Rapor içeriğini güncelle
   */
  updateContent(content: Record<string, any>): void {
    this.report.content = { ...this.report.content, ...content };
    this.report.updatedAt = new Date();
  }

  /**
   * Validasyon
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Aylık raporlar için period kontrolü
    if (this.report.reportType === 'monthly') {
      if (this.report.periodYear === null || this.report.periodMonth === null) {
        errors.push('Aylık raporlar için dönem bilgisi zorunludur');
      }
      if (
        this.report.periodMonth !== null &&
        (this.report.periodMonth < 1 || this.report.periodMonth > 12)
      ) {
        errors.push('Ay bilgisi 1-12 arasında olmalıdır');
      }
    }

    // Risk skoru kontrolü
    if (this.report.aiAnalysis) {
      if (this.report.aiAnalysis.riskScore < 0 || this.report.aiAnalysis.riskScore > 100) {
        errors.push('Risk skoru 0-100 arasında olmalıdır');
      }
      if (
        this.report.aiAnalysis.successProbability < 0 ||
        this.report.aiAnalysis.successProbability > 100
      ) {
        errors.push('Başarı olasılığı 0-100 arasında olmalıdır');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Entity'yi döndür
   */
  toEntity(): ProgressReport {
    return { ...this.report };
  }
}
