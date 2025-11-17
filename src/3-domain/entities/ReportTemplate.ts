/**
 * ReportTemplate Entity
 * Rapor şablonu entity'si - PDF ve AI analizi için template yapıları
 */

import { ReportType } from './ProgressReport';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  reportType: ReportType;
  templateContent: Record<string, any>; // PDF template yapısı
  sections: string[]; // Rapor bölümleri
  aiEnabled: boolean;
  aiUseCase: string; // ai_prompts.use_case ile eşleşir
  version: number;
  isActive: boolean;
  metadata: Record<string, any>;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportTemplateDto {
  name: string;
  description?: string | null;
  reportType: ReportType;
  templateContent?: Record<string, any>;
  sections?: string[];
  aiEnabled?: boolean;
  aiUseCase?: string;
  metadata?: Record<string, any>;
}

export interface UpdateReportTemplateDto {
  name?: string;
  description?: string | null;
  templateContent?: Record<string, any>;
  sections?: string[];
  aiEnabled?: boolean;
  aiUseCase?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

/**
 * ReportTemplate Entity Class
 * Business logic ve validasyonlar
 */
export class ReportTemplateEntity {
  constructor(private template: ReportTemplate) {}

  /**
   * Template aktif mi?
   */
  isActive(): boolean {
    return this.template.isActive;
  }

  /**
   * AI etkin mi?
   */
  isAIEnabled(): boolean {
    return this.template.aiEnabled;
  }

  /**
   * Template'i aktif et
   */
  activate(): void {
    this.template.isActive = true;
    this.template.updatedAt = new Date();
  }

  /**
   * Template'i pasif et
   */
  deactivate(): void {
    this.template.isActive = false;
    this.template.updatedAt = new Date();
  }

  /**
   * Versiyonu artır
   */
  incrementVersion(): void {
    this.template.version += 1;
    this.template.updatedAt = new Date();
  }

  /**
   * Template içeriğini güncelle
   */
  updateContent(content: Record<string, any>): void {
    this.template.templateContent = { ...this.template.templateContent, ...content };
    this.template.updatedAt = new Date();
  }

  /**
   * Bölümleri güncelle
   */
  updateSections(sections: string[]): void {
    this.template.sections = sections;
    this.template.updatedAt = new Date();
  }

  /**
   * Validasyon
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.template.name || this.template.name.trim() === '') {
      errors.push('Template adı zorunludur');
    }

    if (!this.template.templateContent || Object.keys(this.template.templateContent).length === 0) {
      errors.push('Template içeriği zorunludur');
    }

    if (!this.template.sections || this.template.sections.length === 0) {
      errors.push('En az bir bölüm tanımlanmalıdır');
    }

    if (this.template.aiEnabled && !this.template.aiUseCase) {
      errors.push('AI etkinse AI use case belirtilmelidir');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Entity'yi döndür
   */
  toEntity(): ReportTemplate {
    return { ...this.template };
  }
}
