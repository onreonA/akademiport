/**
 * CustomReport Entity
 * Kullanıcıların oluşturduğu özel raporlar
 */

export type CustomReportStatus = 'draft' | 'saved' | 'scheduled' | 'archived';
export type CustomReportType = 'dashboard' | 'company' | 'program' | 'custom';
export type DateRangeType =
  | 'custom'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'last_year'
  | 'all_time';

export interface CustomReport {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  programId: string | null;
  companyId: string | null;
  reportType: CustomReportType;
  templateId: string | null;
  selectedMetrics: string[]; // Metrik ID'leri veya isimleri
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  dateRangeType: DateRangeType;
  filters: Record<string, any>; // Filtreler (programId, companyId, status, vb.)
  isScheduled: boolean;
  scheduleCron: string | null; // Cron expression
  scheduleTimezone: string;
  lastGeneratedAt: Date | null;
  nextGenerationAt: Date | null;
  status: CustomReportStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomReportDto {
  name: string;
  description?: string | null;
  programId?: string | null;
  companyId?: string | null;
  reportType: CustomReportType;
  templateId?: string | null;
  selectedMetrics: string[];
  dateRangeStart?: Date | null;
  dateRangeEnd?: Date | null;
  dateRangeType: DateRangeType;
  filters?: Record<string, any>;
  isScheduled?: boolean;
  scheduleCron?: string | null;
  scheduleTimezone?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCustomReportDto {
  name?: string;
  description?: string | null;
  programId?: string | null;
  companyId?: string | null;
  reportType?: CustomReportType;
  templateId?: string | null;
  selectedMetrics?: string[];
  dateRangeStart?: Date | null;
  dateRangeEnd?: Date | null;
  dateRangeType?: DateRangeType;
  filters?: Record<string, any>;
  isScheduled?: boolean;
  scheduleCron?: string | null;
  scheduleTimezone?: string;
  status?: CustomReportStatus;
  metadata?: Record<string, any>;
}

export interface CustomReportFilterDto {
  userId?: string;
  programId?: string;
  companyId?: string;
  reportType?: CustomReportType;
  status?: CustomReportStatus;
  isScheduled?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastGeneratedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * CustomReport Entity Class
 * Business logic ve validasyonlar
 */
export class CustomReportEntity implements CustomReport {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  programId: string | null;
  companyId: string | null;
  reportType: CustomReportType;
  templateId: string | null;
  selectedMetrics: string[];
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  dateRangeType: DateRangeType;
  filters: Record<string, any>;
  isScheduled: boolean;
  scheduleCron: string | null;
  scheduleTimezone: string;
  lastGeneratedAt: Date | null;
  nextGenerationAt: Date | null;
  status: CustomReportStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CustomReport) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.userId = data.userId;
    this.programId = data.programId;
    this.companyId = data.companyId;
    this.reportType = data.reportType;
    this.templateId = data.templateId;
    this.selectedMetrics = data.selectedMetrics;
    this.dateRangeStart = data.dateRangeStart;
    this.dateRangeEnd = data.dateRangeEnd;
    this.dateRangeType = data.dateRangeType;
    this.filters = data.filters;
    this.isScheduled = data.isScheduled;
    this.scheduleCron = data.scheduleCron;
    this.scheduleTimezone = data.scheduleTimezone;
    this.lastGeneratedAt = data.lastGeneratedAt;
    this.nextGenerationAt = data.nextGenerationAt;
    this.status = data.status;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Rapor taslak mı?
   */
  isDraft(): boolean {
    return this.status === 'draft';
  }

  /**
   * Rapor zamanlanmış mı?
   */
  isScheduledReport(): boolean {
    return this.isScheduled && this.status === 'scheduled';
  }

  /**
   * Rapor arşivlenmiş mi?
   */
  isArchived(): boolean {
    return this.status === 'archived';
  }

  /**
   * Tarih aralığını hesapla
   */
  calculateDateRange(): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (this.dateRangeType) {
      case 'last_7_days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_30_days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_90_days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last_year':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'all_time':
        start = new Date(0); // Epoch
        break;
      case 'custom':
      default:
        start = this.dateRangeStart || new Date(0);
        end = this.dateRangeEnd || now;
        break;
    }

    return { start, end };
  }

  /**
   * Raporu kaydet
   */
  save(): void {
    if (this.status === 'draft') {
      this.status = 'saved';
      this.touch();
    }
  }

  /**
   * Raporu zamanla
   */
  schedule(cron: string, timezone: string = 'Europe/Istanbul'): void {
    if (!this.isValidCron(cron)) {
      throw new Error('Geçersiz cron expression');
    }
    this.isScheduled = true;
    this.scheduleCron = cron;
    this.scheduleTimezone = timezone;
    this.status = 'scheduled';
    this.touch();
  }

  /**
   * Zamanlamayı iptal et
   */
  unschedule(): void {
    this.isScheduled = false;
    this.scheduleCron = null;
    this.nextGenerationAt = null;
    if (this.status === 'scheduled') {
      this.status = 'saved';
    }
    this.touch();
  }

  /**
   * Raporu arşivle
   */
  archive(): void {
    this.status = 'archived';
    this.unschedule();
    this.touch();
  }

  /**
   * Raporu geri yükle
   */
  restore(): void {
    if (this.status === 'archived') {
      this.status = 'saved';
      this.touch();
    }
  }

  /**
   * updatedAt'i güncelle
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Cron expression validation
   */
  private isValidCron(cron: string): boolean {
    // Basit cron validation (5 alan: dakika saat gün ay hafta)
    const cronRegex =
      /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    return cronRegex.test(cron);
  }

  /**
   * Validation
   */
  static validate(data: Partial<CustomReport>): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Rapor adı gereklidir');
    }

    if (data.name && data.name.length > 255) {
      errors.push('Rapor adı en fazla 255 karakter olabilir');
    }

    if (!data.reportType) {
      errors.push('Rapor tipi gereklidir');
    }

    if (data.selectedMetrics && data.selectedMetrics.length === 0) {
      errors.push('En az bir metrik seçilmelidir');
    }

    if (data.dateRangeType === 'custom') {
      if (!data.dateRangeStart || !data.dateRangeEnd) {
        errors.push('Özel tarih aralığı için başlangıç ve bitiş tarihi gereklidir');
      }
      if (data.dateRangeStart && data.dateRangeEnd && data.dateRangeStart > data.dateRangeEnd) {
        errors.push('Başlangıç tarihi bitiş tarihinden sonra olamaz');
      }
    }

    if (data.isScheduled && data.scheduleCron && !this.isValidCronStatic(data.scheduleCron)) {
      errors.push('Geçersiz cron expression');
    }

    return errors;
  }

  private static isValidCronStatic(cron: string): boolean {
    const cronRegex =
      /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    return cronRegex.test(cron);
  }
}
